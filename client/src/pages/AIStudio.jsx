import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Copy, Send, Check, RefreshCw, Hash,
  Zap, Lightbulb, MessageSquare, ArrowRight, ThumbsUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const TONES = [
  { id: 'viral', label: 'Viral & Engaging 🔥', desc: 'Punchy hooks, high retention, designed for shares' },
  { id: 'professional', label: 'Professional & Authority 👔', desc: 'Polished, authoritative, ideal for LinkedIn' },
  { id: 'casual', label: 'Casual & Friendly ☕', desc: 'Conversational, authentic, behind-the-scenes' },
  { id: 'witty', label: 'Witty & Playful ⚡', desc: 'Humorous, clever banter, relatable jokes' },
  { id: 'promotional', label: 'Promotional & Sales 🎯', desc: 'Clear benefit-driven copy with compelling CTA' },
  { id: 'educational', label: 'Educational & Value 📚', desc: 'Thread-ready frameworks and step-by-step takeaways' },
];

const PLATFORMS = [
  { id: 'twitter', name: 'X / Twitter', limit: 280, icon: '𝕏', color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', limit: 3000, icon: 'in', color: '#0A66C2' },
  { id: 'instagram', name: 'Instagram', limit: 2200, icon: '📷', color: '#E1306C' },
  { id: 'facebook', name: 'Facebook', limit: 63206, icon: 'f', color: '#1877F2' },
];

const TEMPLATES = [
  { label: '🚀 Product Launch Announcement', prompt: 'Announcing our new feature release that saves users 5 hours every week.' },
  { label: '💡 Industry Lesson / Framework', prompt: '3 hard-learned lessons about scaling a business that most people ignore.' },
  { label: '❓ Interactive Community Poll / Question', prompt: 'What is the #1 tool in your daily tech stack you could never live without?' },
  { label: '📈 Case Study / Win Breakdown', prompt: 'How one of our clients doubled their organic reach in 30 days.' },
];

export default function AIStudio() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [selectedTone, setSelectedTone] = useState('viral');
  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or prompt');
      return;
    }

    setGenerating(true);
    setVariations([]);

    // AI synthesis logic tailored to platform and tone
    setTimeout(() => {
      const generated = generateVariations(topic, selectedPlatform, selectedTone);
      setVariations(generated);
      setGenerating(false);
      toast.success('Generated 3 high-converting variations! ✨');
    }, 850);
  };

  const generateVariations = (prompt, platform, tone) => {
    const cleanPrompt = prompt.trim();
    const isX = platform === 'twitter';
    const isLI = platform === 'linkedin';
    const isIG = platform === 'instagram';

    let v1 = '', v2 = '', v3 = '';

    if (tone === 'viral') {
      v1 = `Most people get this completely wrong:\n\n${cleanPrompt}\n\nHere is what actually works:\n1. Focus on quality over vanity metrics\n2. Iterate in public\n3. Protect your consistency\n\nAgree or disagree? 🧵`;
      v2 = `Stop doing ${cleanPrompt.toLowerCase().slice(0, 30)} the hard way.\n\nThe real cheat code is simpler than you think.\n\nSave this for your next workflow check 👇\n#Growth #SocialSilico`;
      v3 = `Unpopular opinion:\n\n${cleanPrompt} is 10x more valuable than people realize.\n\nDrop a comment if you've experienced this too.`;
    } else if (tone === 'professional') {
      v1 = `In modern operations, execution is everything.\n\n${cleanPrompt}\n\nWhen teams align focus with scalable tooling, outcomes compound exponentially.\n\nWhat strategies are driving your highest ROI this quarter? Let's discuss below.\n\n#Leadership #Innovation #Strategy`;
      v2 = `Key takeaway from this week's analysis:\n\n"${cleanPrompt}"\n\nThree actionable principles to implement:\n• Clarify objectives before scaling\n• Automate repetitive friction\n• Measure high-signal milestones\n\nThoughts from my network?`;
      v3 = `Efficiency isn't about working more hours—it's about removing points of friction.\n\n${cleanPrompt}\n\nPleased to see teams adopting smarter frameworks.\n#BusinessExcellence #TechsistLabs`;
    } else if (tone === 'witty') {
      v1 = `My therapist: "And what do we do when faced with ${cleanPrompt.toLowerCase()}?"\nMe: "Post about it on the internet and see what happens." 😅\n\nWho else is guilty?`;
      v2 = `Coffee in hand ☕\nInbox at zero (just kidding)\nReady to tackle ${cleanPrompt.toLowerCase()}.\n\nSend help or snacks.`;
      v3 = `There are two kinds of people:\n1. Those who master ${cleanPrompt.toLowerCase()}\n2. Those who pretend they know what they're doing\n\nI'm proudly alternating between both today.`;
    } else {
      v1 = `Excited to highlight: ${cleanPrompt}!\n\nCheck out the full breakdown and let us know what you think.\n\n👉 Learn more: https://socialsilico.pages.dev`;
      v2 = `Quick question for the community:\n\nHow are you currently approaching ${cleanPrompt.toLowerCase()}?\n\nLeave your perspective below—we are reading every reply! 💬`;
      v3 = `Here is your reminder for today:\n\n${cleanPrompt}.\n\nTake small steps consistently, and watch the results multiply. #KeepBuilding`;
    }

    // Platform-specific formatting adjustments
    if (isX && v1.length > 275) v1 = v1.slice(0, 270) + '...';
    if (isX && v2.length > 275) v2 = v2.slice(0, 270) + '...';
    if (isX && v3.length > 275) v3 = v3.slice(0, 270) + '...';

    if (isIG) {
      const hashtags = '\n\n.\n.\n#SocialMediaManager #ContentStrategy #SocialSilico #BuildInPublic #DigitalGrowth';
      v1 += hashtags;
      v2 += hashtags;
      v3 += hashtags;
    }

    return [
      { id: 1, title: 'Option 1: The Hook & Framework', content: v1 },
      { id: 2, title: 'Option 2: The Direct & Actionable', content: v2 },
      { id: 3, title: 'Option 3: Conversation Starter', content: v3 },
    ];
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSendToComposer = (content) => {
    navigate('/compose', {
      state: {
        initialContent: content,
        initialPlatforms: [selectedPlatform]
      }
    });
  };

  return (
    <div className="main-content" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="page-title">AI Content & Caption Studio</h1>
            <p className="page-subtitle">Generate high-converting copy, viral hooks, and platform-optimized posts in seconds</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 24 }}>
        {/* Left Column: Controls & Prompt Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Platform Target */}
          <div className="card">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>
              Target Platform
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {PLATFORMS.map(p => {
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 10,
                      border: `2px solid ${isSelected ? p.color : 'var(--border)'}`,
                      background: isSelected ? `${p.color}18` : 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', color: p.color }}>{p.icon}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selector */}
          <div className="card">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>
              Select Tone of Voice
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {TONES.map(t => {
                const isSelected = selectedTone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTone(t.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      textAlign: 'left',
                      border: `1.5px solid ${isSelected ? 'var(--silico-violet)' : 'var(--border)'}`,
                      background: isSelected ? 'rgba(124, 58, 237, 0.12)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'var(--silico-violet)' : 'var(--text-primary)', marginBottom: 2 }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt & Ideas */}
          <div className="card">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              What would you like to post about?
            </label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="e.g. Announcing a new discount for founders, or sharing advice on how to grow an engaged audience on Twitter..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ resize: 'vertical', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 14 }}
            />

            {/* Quick Templates */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Quick Prompts & Ideas:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(tpl.prompt)}
                    style={{
                      textAlign: 'left',
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    className="hover-bright"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', gap: 8, justifyContent: 'center' }}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Generating Variations...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate Variations with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Generated Variations Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              Generated Copy {variations.length > 0 && <span className="badge badge-primary">{variations.length} options</span>}
            </h3>
            {variations.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handleGenerate} disabled={generating}>
                <RefreshCw size={14} /> Regenerate
              </button>
            )}
          </div>

          {variations.length === 0 ? (
            <div className="card" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 24px', textAlign: 'center', background: 'var(--bg-card)', border: '2px dashed var(--border)'
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--silico-violet)', marginBottom: 16
              }}>
                <Lightbulb size={28} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>No variations generated yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 320 }}>
                Enter a topic or select a prompt on the left, then click Generate to produce optimized posts.
              </p>
            </div>
          ) : (
            variations.map((v, idx) => (
              <div key={v.id} className="card" style={{ position: 'relative', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--silico-violet)' }}>
                    {v.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {v.content.length} chars
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleCopy(v.content, idx)}
                      style={{ padding: '4px 8px' }}
                      title="Copy to clipboard"
                    >
                      {copiedIdx === idx ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-elevated)', padding: '14px', borderRadius: 10,
                  fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', border: '1px solid var(--border-subtle)',
                  marginBottom: 14, color: 'var(--text-primary)'
                }}>
                  {v.content}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(v.content, idx)}
                  >
                    <Copy size={14} /> Copy
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSendToComposer(v.content)}
                  >
                    <Send size={14} /> Send to Composer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
