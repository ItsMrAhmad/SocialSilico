const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect } = require('../middleware/auth');

/**
 * Check AI provider status (public)
 */
router.get('/status', (req, res) => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  res.json({
    enabled: true,
    provider: hasGemini ? 'Google Gemini' : hasOpenAI ? 'OpenAI' : 'Built-in Engine',
    hasApiKey: hasGemini || hasOpenAI
  });
});

/**
 * Generate 3 high-converting post variations + hashtags
 * POST /api/ai/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { topic, platform = 'twitter', tone = 'viral', goal = 'engagement' } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic or prompt is required' });
    }

    const cleanTopic = topic.trim();

    // 1. If Google Gemini API key is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiResult = await callGeminiGenerate(cleanTopic, platform, tone, goal);
        if (geminiResult) {
          return res.json({ success: true, source: 'gemini', ...geminiResult });
        }
      } catch (err) {
        console.error('[AI] Gemini generate error, falling back:', err.response?.data?.error?.message || err.message);
      }
    }

    // 2. If OpenAI API key is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const openAIResult = await callOpenAIGenerate(cleanTopic, platform, tone, goal);
        if (openAIResult) {
          return res.json({ success: true, source: 'openai', ...openAIResult });
        }
      } catch (err) {
        console.error('[AI] OpenAI generate error, falling back:', err.response?.data?.error?.message || err.message);
      }
    }

    // 3. Fallback to smart heuristic generator
    const fallbackResult = generateSmartFallback(cleanTopic, platform, tone);
    res.json({ success: true, source: 'smart_engine', ...fallbackResult });
  } catch (err) {
    console.error('[AI] Generation route error:', err);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

/**
 * Interactive Chatbot for brainstorming ideas & strategies
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages = [] } = req.body;

    if (!messages.length) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // If Gemini is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const reply = await callGeminiChat(messages);
        if (reply) {
          return res.json({ success: true, source: 'gemini', reply });
        }
      } catch (err) {
        console.error('[AI] Gemini chat error, falling back:', err.response?.data?.error?.message || err.message);
      }
    }

    // Fallback response generator
    const reply = generateChatFallback(lastMessage);
    res.json({ success: true, source: 'smart_engine', reply });
  } catch (err) {
    console.error('[AI] Chat route error:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// ─── Gemini REST Helpers ────────────────────────────────────────────────────────
async function callGeminiGenerate(topic, platform, tone, goal) {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = ['gemini-1.5-flash', 'gemini-2.5-flash'];

  const platformLimits = {
    twitter: '280 characters max per tweet',
    linkedin: '1500-3000 characters, professional line breaks, bullet points',
    instagram: '1000-2000 characters, aesthetic spacing, emojis, closing hashtag block',
    facebook: 'engaging question, friendly hook, conversational',
  };

  const prompt = `You are a world-class social media strategist and viral copywriter.
Create 3 high-converting post variations for the topic below:

Topic: "${topic}"
Target Platform: ${platform.toUpperCase()} (${platformLimits[platform] || 'platform optimized'})
Tone of Voice: ${tone}
Goal: ${goal}

Respond strictly in valid JSON with this exact schema (no surrounding markdown code blocks, just raw JSON):
{
  "variations": [
    { "id": 1, "title": "The Hook & Framework", "content": "..." },
    { "id": 2, "title": "The Story & Lesson", "content": "..." },
    { "id": 3, "title": "The High-Engagement Question", "content": "..." }
  ],
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5", "#Tag6"],
  "bestTime": "Recommended posting time with day of week"
}`;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: 'application/json'
        }
      }, { timeout: 15000 });

      const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      try {
        return JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn(`[AI] Gemini ${model} generate attempt failed:`, e.message);
    }
  }
  return null;
}

async function callGeminiChat(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = ['gemini-1.5-flash', 'gemini-2.5-flash'];

  const systemInstruction = `You are SocialSilico AI, an elite social media manager and growth strategist.
You help creators, founders, and brands grow on Twitter/X, LinkedIn, Instagram, and Facebook.
Give punchy, actionable advice, viral hooks, content calendars, and ready-to-publish posts. Format responses clearly with markdown bullet points and emojis.`;

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(url, {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.7 }
      }, { timeout: 15000 });

      const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;
    } catch (e) {
      console.warn(`[AI] Gemini ${model} chat attempt failed:`, e.message);
    }
  }
  return null;
}

// ─── OpenAI REST Helper ────────────────────────────────────────────────────────
async function callOpenAIGenerate(topic, platform, tone, goal) {
  const apiKey = process.env.OPENAI_API_KEY;
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a viral social media strategist. Respond strictly in valid JSON with: variations (array of 3 objects with id, title, content), hashtags (array of 6 strings), bestTime (string).'
      },
      {
        role: 'user',
        content: `Topic: "${topic}", Platform: ${platform}, Tone: ${tone}, Goal: ${goal}`
      }
    ],
    response_format: { type: 'json_object' }
  }, {
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 15000
  });

  const content = response.data?.choices?.[0]?.message?.content;
  return JSON.parse(content);
}

// ─── Smart Heuristic Engine (Fallback) ──────────────────────────────────────────
function generateSmartFallback(topic, platform, tone) {
  const isX = platform === 'twitter';
  const isLI = platform === 'linkedin';
  const isIG = platform === 'instagram';

  let v1 = '', v2 = '', v3 = '';

  if (tone === 'viral') {
    v1 = `Most people approach this completely wrong:\n\n${topic}\n\nHere are 3 principles that actually scale:\n1. Prioritize consistency over perfection\n2. Share the lessons, not just the wins\n3. Engage 15 mins before and after posting\n\nSave this for your next check 👇`;
    v2 = `Stop making ${topic.toLowerCase().slice(0, 32)} harder than it needs to be.\n\nThe real differentiator is focus.\n\nWho else needed to hear this today?`;
    v3 = `Unpopular opinion:\n\n"${topic}" is the highest-leverage asset you can build this year.\n\nAgree or disagree? Drop your take below 🧵`;
  } else if (tone === 'professional') {
    v1 = `In modern operations, clarity drives momentum.\n\n${topic}\n\nKey strategic pillars:\n• Clarify outcomes before scaling resources\n• Automate administrative friction\n• Measure high-signal milestones\n\nHow is your leadership team executing this quarter?`;
    v2 = `Reflecting on recent industry trends regarding "${topic}":\n\nOrganizations that adapt systematically capture exponential value compared to those waiting for consensus.\n\nInsightful dialogue welcomed below. #Strategy #Leadership`;
    v3 = `Efficiency isn't about working more hours—it's about removing friction.\n\n${topic}\n\nExcited to see modern teams implement this approach. #SocialSilico #Innovation`;
  } else if (tone === 'witty') {
    v1 = `My brain at 3 AM: "You know what would be a great idea?"\nMe: "${topic}"\n\nAnd honestly? It actually was. ☕😅`;
    v2 = `There are two types of people:\n1. Those who embrace ${topic.toLowerCase()}\n2. Those who pretend they know what they're doing\n\nI'm proudly alternating between both today.`;
    v3 = `Current status: 90% coffee, 10% figuring out how to master ${topic.toLowerCase()}.\n\nSend help or snacks.`;
  } else {
    v1 = `Excited to announce: ${topic}!\n\nCheck out the full breakdown and explore the details.\n\n👉 Discover more: https://socialsilico.pages.dev`;
    v2 = `Community spotlight:\n\nHow are you currently approaching "${topic}"?\n\nLeave your perspective below—we are reading every reply! 💬`;
    v3 = `Daily reminder:\n\n${topic}.\n\nSmall incremental progress compounds into massive results. #KeepBuilding`;
  }

  if (isX) {
    if (v1.length > 275) v1 = v1.slice(0, 270) + '...';
    if (v2.length > 275) v2 = v2.slice(0, 270) + '...';
    if (v3.length > 275) v3 = v3.slice(0, 270) + '...';
  }

  const hashtags = [
    '#SocialSilico',
    '#ContentStrategy',
    `#${platform === 'twitter' ? 'BuildInPublic' : platform === 'linkedin' ? 'Leadership' : 'CreativeGrowth'}`,
    '#DigitalMarketing',
    '#AudienceGrowth',
    '#CreatorEconomy'
  ];

  if (isIG) {
    const igTags = '\n\n.\n.\n' + hashtags.join(' ');
    v1 += igTags;
    v2 += igTags;
    v3 += igTags;
  }

  const bestTimes = {
    twitter: 'Tuesday or Thursday at 9:00 AM - 11:00 AM',
    linkedin: 'Tuesday, Wednesday, or Thursday at 8:30 AM',
    instagram: 'Wednesday or Friday at 11:00 AM - 1:00 PM',
    facebook: 'Monday, Wednesday, or Friday at 1:00 PM - 3:00 PM',
  };

  return {
    variations: [
      { id: 1, title: 'Option 1: The Hook & Framework', content: v1 },
      { id: 2, title: 'Option 2: The Direct & Actionable', content: v2 },
      { id: 3, title: 'Option 3: High-Engagement Conversation Starter', content: v3 },
    ],
    hashtags,
    bestTime: bestTimes[platform] || 'Weekdays between 9:00 AM and 12:00 PM'
  };
}

function generateChatFallback(message) {
  const lower = message.toLowerCase();

  if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('plan')) {
    return `### 📅 7-Day High-Impact Content Framework

Here is a proven weekly cadence designed for maximum reach and community engagement:

* **Monday (Motivation & Direction)**: Share a high-energy insight or principle to kickstart the week.
* **Tuesday (Framework / How-To)**: A step-by-step breakdown or actionable guide (great for LinkedIn carousels or Twitter threads).
* **Wednesday (Contrarian / Hot Take)**: Challenge an outdated industry norm to spark discussions in the comments.
* **Thursday (Case Study / Win)**: Highlight real metrics, client achievements, or milestones.
* **Friday (Relatable Story / Behind-the-Scenes)**: Build personal connection and authentic trust.
* **Weekend (Community Question / Poll)**: Ask an open question to boost weekend engagement rates.

💡 *Tip: You can take any of these prompts straight to the **Post Generator** tab or Composer!*`;
  }

  if (lower.includes('hook') || lower.includes('viral')) {
    return `### 🎣 Top 5 High-Converting Hook Formats

1. **The Counter-Intuitive Truth**:
   > *"Most people think [common belief]. Here is why that's keeping you stuck:"*
2. **The Time-Saving Cheat Code**:
   > *"I spent 100+ hours learning [topic] so you can master it in 3 minutes:"*
3. **The Harsh Reality Check**:
   > *"If you are still doing [task] manually in 2026, you're losing 10 hours a week."*
4. **The Unpopular Observation**:
   > *"Unpopular opinion: [Niche practice] is overrated. Do this instead 👇"*
5. **The Framework Reveal**:
   > *"3 micro-habits that doubled our engagement in 30 days (steals these):"*

👉 Click on any hook to copy or send directly into your Composer!`;
  }

  return `### 💡 Strategy Suggestion

For your request regarding **"${message.slice(0, 40)}..."**:

1. **Lead with a strong 1-sentence hook** that speaks to a specific pain point or curiosity.
2. **Use visual line breaks** to keep scan-ability high on mobile devices.
3. **Include a single, clear Call-to-Action (CTA)** (e.g. asking a targeted question rather than asking for 3 different things).

Would you like me to draft 3 variations of this for Twitter, LinkedIn, or Instagram?`;
}

module.exports = router;
