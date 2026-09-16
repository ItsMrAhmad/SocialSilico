import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Copy, Send, Check, RefreshCw, Hash,
  Zap, Lightbulb, MessageSquare, ArrowRight, Clock,
  Bot, User as UserIcon, Trash2, HelpCircle, Flame,
  Briefcase, Coffee, GraduationCap, Target, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../store/authStore';

const TONES = [
  { id: 'viral', label: 'Viral & Engaging 🔥', icon: Flame, desc: 'Punchy hooks, high retention, designed for shares' },
  { id: 'professional', label: 'Professional & Authority 👔', icon: Briefcase, desc: 'Polished, authoritative, ideal for LinkedIn' },
  { id: 'casual', label: 'Casual & Friendly ☕', icon: Coffee, desc: 'Conversational, authentic, behind-the-scenes' },
  { id: 'witty', label: 'Witty & Playful ⚡', icon: Zap, desc: 'Humorous, clever banter, relatable commentary' },
  { id: 'promotional', label: 'Promotional & Sales 🎯', icon: Target, desc: 'Clear benefit-driven copy with compelling CTA' },
  { id: 'educational', label: 'Educational & Value 📚', icon: GraduationCap, desc: 'Thread-ready frameworks and step-by-step takeaways' },
];

const PLATFORMS = [
  { id: 'twitter', name: 'X / Twitter', limit: 280, icon: '𝕏', color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', limit: 3000, icon: 'in', color: '#0A66C2' },
  { id: 'instagram', name: 'Instagram', limit: 2200, icon: '📷', color: '#E1306C' },
  { id: 'facebook', name: 'Facebook', limit: 63206, icon: 'f', color: '#1877F2' },
];

const GOALS = [
  { id: 'engagement', label: 'Drive Comments & Shares' },
  { id: 'clicks', label: 'Traffic & Link Clicks' },
  { id: 'awareness', label: 'Brand Awareness & Reach' },
  { id: 'leads', label: 'Lead Generation & Sales' },
];

const QUICK_PROMPTS = [
  { label: '🚀 Product Launch Announcement', prompt: 'Announcing our new feature release that saves creators 5+ hours every week with automated scheduling.' },
  { label: '💡 3 Lessons About Scaling', prompt: '3 counter-intuitive lessons I learned about scaling a business that most founders ignore.' },
  { label: '❓ High-Engagement Question', prompt: 'What is the #1 tool in your daily productivity stack that you can not live without?' },
  { label: '📈 30-Day Growth Case Study', prompt: 'How we helped a creator double their organic reach in 30 days without spending a single dollar on ads.' },
  { label: '🧵 Step-by-Step Blueprint', prompt: 'A simple 4-step framework to repurpose 1 piece of long-form content across Twitter, LinkedIn, and Instagram.' }
];

const CHAT_STARTERS = [
  '📅 Create a 7-day content calendar for my brand',
  '🎣 Give me 10 viral hooks for Twitter & LinkedIn',
  '🔄 Repurpose a single idea across all 4 platforms',
  '💡 5 trending content angles for this week',
  '🎯 Write a high-converting product launch sequence'
];

export default function AIStudio() {
  const navigate = useNavigate();

  // Active Tab: 'generator' | 'chatbot'
  const [activeTab, setActiveTab] = useState('generator');

  // Provider status state
  const [providerInfo, setProviderInfo] = useState({
    provider: 'Built-in Engine',
    hasApiKey: false
  });

  // ─── Post Generator State ──────────────────────────────────────────────────
  const [topic, setTopic] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [selectedTone, setSelectedTone] = useState('viral');
  const [selectedGoal, setSelectedGoal] = useState('engagement');
  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [bestTime, setBestTime] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedAllTags, setCopiedAllTags] = useState(false);

  // ─── Brainstorm Chatbot State ──────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome to your AI Social Media Strategist!**\n\nI can help you:\n* **Brainstorm** viral hooks & post angles\n* **Design** 7-day or 30-day content calendars\n* **Repurpose** articles into threads & carousels\n* **Critique & refine** your existing post drafts\n\nPick a quick prompt below or type your question to start!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Fetch AI provider status on mount
  useEffect(() => {
    fetchProviderStatus();
  }, []);

  const fetchProviderStatus = async () => {
    try {
      const res = await api.get('/ai/status');
      if (res.data) {
        setProviderInfo({
          provider: res.data.provider || 'Built-in Engine',
          hasApiKey: !!res.data.hasApiKey
        });
      }
    } catch {
      // Fallback to default
    }
  };

  // Scroll chatbot to bottom
  useEffect(() => {
    if (activeTab === 'chatbot') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // ─── Generator Actions ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or select a prompt idea');
      return;
    }

    setGenerating(true);
    setVariations([]);
    setHashtags([]);
    setBestTime('');

    try {
      const res = await api.post('/ai/generate', {
        topic: topic.trim(),
        platform: selectedPlatform,
        tone: selectedTone,
        goal: selectedGoal
      });

      if (res.data?.success) {
        setVariations(res.data.variations || []);
        setHashtags(res.data.hashtags || []);
        setBestTime(res.data.bestTime || '');
        toast.success(`Generated 3 variations with ${res.data.source === 'gemini' ? 'Google Gemini' : 'AI Engine'}! ✨`);
      } else {
        throw new Error(res.data?.error || 'Failed to generate');
      }
    } catch (err) {
      console.warn('Backend generate fallback:', err.message);
      // Client fallback simulation if backend is unreachable
      const fallback = getClientSideFallback(topic, selectedPlatform, selectedTone);
      setVariations(fallback.variations);
      setHashtags(fallback.hashtags);
      setBestTime(fallback.bestTime);
      toast.success('Generated variations using Smart Engine! ✨');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = (text, idx = null) => {
    navigator.clipboard.writeText(text);
    if (idx !== null) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  const handleCopyAllHashtags = () => {
    if (!hashtags.length) return;
    const tagString = hashtags.join(' ');
    navigator.clipboard.writeText(tagString);
    setCopiedAllTags(true);
    toast.success('All hashtags copied!');
    setTimeout(() => setCopiedAllTags(false), 2000);
  };

  const handleSendToComposer = (content) => {
    navigate('/compose', {
      state: {
        initialContent: content,
        initialPlatforms: [selectedPlatform]
      }
    });
  };

  // ─── Chatbot Actions ───────────────────────────────────────────────────────
  const handleSendChatMessage = async (overrideText = null) => {
    const textToSend = (overrideText || chatInput).trim();
    if (!textToSend || chatLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      // Send conversation context to backend
      const apiPayload = updatedMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/ai/chat', { messages: apiPayload });

      if (res.data?.reply) {
        setChatMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: res.data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('No reply from AI');
      }
    } catch (err) {
      console.warn('Chat error fallback:', err.message);
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here is a strategy framework for: **"${textToSend}"**:\n\n* **Hook**: Capture curiosity in the first 8 words.\n* **Body**: Deliver 3 actionable takeaways with clean spacing.\n* **Call to Action**: Ask a specific open-ended question to spark replies.\n\n💡 *Tip: Click "Send to Composer" to turn this into a live post!*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Conversation cleared. What would you like to brainstorm next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to render markdown-like text smoothly
  const renderFormattedText = (raw) => {
    if (!raw) return null;
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Heading
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ margin: '12px 0 6px', color: 'var(--silico-violet)', fontSize: '1rem', fontWeight: 700 }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} style={{ margin: '14px 0 8px', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>{line.replace('## ', '')}</h3>;
      }
      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <div key={idx} style={{
            borderLeft: '3px solid var(--silico-violet)', paddingLeft: 12, margin: '6px 0',
            color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(124, 58, 237, 0.05)',
            padding: '6px 12px', borderRadius: '0 6px 6px 0'
          }}>
            {line.replace('> ', '')}
          </div>
        );
      }
      // Bullet point
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.slice(2);
        return (
          <div key={idx} style={{ display: 'flex', gap: 8, margin: '3px 0' }}>
            <span style={{ color: 'var(--silico-violet)', fontWeight: 'bold' }}>•</span>
            <span>{parseBold(content)}</span>
          </div>
        );
      }
      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} style={{ display: 'flex', gap: 8, margin: '4px 0' }}>
            <span style={{ color: 'var(--silico-violet)', fontWeight: 700, minWidth: 20 }}>{numMatch[1]}.</span>
            <span>{parseBold(numMatch[2])}</span>
          </div>
        );
      }
      // Blank line
      if (!line.trim()) {
        return <div key={idx} style={{ height: 6 }} />;
      }
      // Normal line
      return <p key={idx} style={{ margin: '2px 0' }}>{parseBold(line)}</p>;
    });
  };

  const parseBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="main-content" style={{ maxWidth: 1150, margin: '0 auto' }}>
      {/* Top Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)'
            }}>
              <Sparkles size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 className="page-title" style={{ margin: 0 }}>SocialSilico AI Studio</h1>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  PRO
                </span>
              </div>
              <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
                Generate viral hooks, high-converting posts, and brainstorm content strategy with AI
              </p>
            </div>
          </div>

          {/* AI Engine Status Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 999,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            fontSize: '0.82rem', color: 'var(--text-secondary)'
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: providerInfo.hasApiKey ? '#10B981' : '#7C3AED',
              boxShadow: providerInfo.hasApiKey ? '0 0 8px #10B981' : '0 0 6px #7C3AED'
            }} />
            <span>
              Engine: <strong style={{ color: 'var(--text-primary)' }}>{providerInfo.provider}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div style={{
        display: 'flex', gap: 8, padding: 4,
        background: 'var(--bg-elevated)', borderRadius: 12,
        border: '1px solid var(--border)', marginBottom: 24, width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('generator')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 8,
            border: 'none',
            background: activeTab === 'generator' ? 'var(--gradient-brand)' : 'transparent',
            color: activeTab === 'generator' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'generator' ? '0 2px 8px rgba(124, 58, 237, 0.3)' : 'none'
          }}
        >
          <Sparkles size={16} /> Post & Caption Generator
        </button>

        <button
          onClick={() => setActiveTab('chatbot')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 8,
            border: 'none',
            background: activeTab === 'chatbot' ? 'var(--gradient-brand)' : 'transparent',
            color: activeTab === 'chatbot' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'chatbot' ? '0 2px 8px rgba(124, 58, 237, 0.3)' : 'none'
          }}
        >
          <Bot size={16} /> AI Social Strategist (Chatbot)
          <span style={{
            fontSize: '0.68rem', padding: '1px 6px', borderRadius: 10,
            background: activeTab === 'chatbot' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(124, 58, 237, 0.15)',
            color: activeTab === 'chatbot' ? '#fff' : 'var(--silico-violet)'
          }}>
            New
          </span>
        </button>
      </div>

      {/* ─── TAB 1: POST GENERATOR ────────────────────────────────────────── */}
      {activeTab === 'generator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: 24, alignItems: 'start' }}>
          {/* Left: Input Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Platform Selection */}
            <div className="card">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>
                1. Target Platform
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {PLATFORMS.map(p => {
                  const isSelected = selectedPlatform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 10,
                        border: `2px solid ${isSelected ? p.color : 'var(--border)'}`,
                        background: isSelected ? `${p.color}15` : 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem', color: p.color }}>{p.icon}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="card">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>
                2. Tone of Voice
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
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        {t.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal Selector */}
            <div className="card">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
                3. Primary Goal
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {GOALS.map(g => {
                  const isSelected = selectedGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGoal(g.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${isSelected ? 'var(--silico-violet)' : 'var(--border)'}`,
                        background: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-elevated)',
                        color: isSelected ? 'var(--silico-violet)' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt / Topic Input */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  4. What would you like to post about?
                </label>
                {topic && (
                  <button
                    onClick={() => setTopic('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <textarea
                className="form-input"
                rows={4}
                placeholder="e.g. Announcing our new feature that cuts workflow time by half, or 3 actionable tips for growing an audience..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ resize: 'vertical', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 14 }}
              />

              {/* Quick Prompts */}
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                  💡 Or select a quick idea starter:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {QUICK_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setTopic(p.prompt)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s'
                      }}
                      className="hover-bright"
                    >
                      <span>{p.label}</span>
                      <ChevronRight size={14} style={{ opacity: 0.5 }} />
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', gap: 8, justifyContent: 'center' }}
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Generating Best Ideas...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Generate Variations with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Results Output */}
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
                  width: 64, height: 64, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--silico-violet)', marginBottom: 16
                }}>
                  <Lightbulb size={30} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 8 }}>Ready to Create</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.5 }}>
                  Choose your platform, tone, and enter a prompt on the left. SocialSilico AI will craft 3 tailored variations with optimized hashtags and best times.
                </p>
              </div>
            ) : (
              <>
                {/* Variations Cards */}
                {variations.map((v, idx) => {
                  const plat = PLATFORMS.find(p => p.id === selectedPlatform);
                  const isOverLimit = plat && v.content.length > plat.limit;

                  return (
                    <div key={v.id || idx} className="card" style={{ position: 'relative', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--silico-violet)' }}>
                          {v.title || `Option ${idx + 1}`}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: '0.72rem',
                            color: isOverLimit ? 'var(--danger)' : 'var(--text-muted)',
                            fontWeight: isOverLimit ? 700 : 400
                          }}>
                            {v.content.length} {plat ? `/ ${plat.limit}` : ''} chars
                          </span>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleCopyText(v.content, idx)}
                            style={{ padding: '4px 8px' }}
                            title="Copy to clipboard"
                          >
                            {copiedIdx === idx ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
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
                          onClick={() => handleCopyText(v.content, idx)}
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
                  );
                })}

                {/* Hashtags & Timing Recommendation Card */}
                {(hashtags.length > 0 || bestTime) && (
                  <div className="card" style={{ background: 'rgba(124, 58, 237, 0.04)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                    {bestTime && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Clock size={16} style={{ color: 'var(--silico-violet)' }} />
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Optimal Timing: <strong style={{ color: 'var(--text-primary)' }}>{bestTime}</strong>
                        </span>
                      </div>
                    )}

                    {hashtags.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Hash size={14} /> Recommended Hashtags:
                          </span>
                          <button
                            onClick={handleCopyAllHashtags}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                          >
                            {copiedAllTags ? <Check size={12} style={{ color: '#10B981' }} /> : <Copy size={12} />} Copy All
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {hashtags.map((tag, i) => (
                            <span
                              key={i}
                              onClick={() => handleCopyText(tag)}
                              style={{
                                fontSize: '0.76rem',
                                padding: '4px 8px',
                                borderRadius: 6,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                color: 'var(--silico-violet)',
                                cursor: 'pointer'
                              }}
                              title="Click to copy"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: AI SOCIAL STRATEGIST (CHATBOT) ────────────────────────── */}
      {activeTab === 'chatbot' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 720 }}>
          {/* Chat Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'var(--gradient-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>
                <Bot size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>AI Social Strategist</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Interactive brainstorming, content calendars & viral hooks
                </p>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}
              title="Clear conversation"
            >
              <Trash2 size={14} /> Clear Chat
            </button>
          </div>

          {/* Chat Messages Container */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: 16,
            background: 'var(--bg-base)'
          }}>
            {chatMessages.map(msg => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '85%'
                  }}
                >
                  {isAssistant && (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(124, 58, 237, 0.15)',
                      color: 'var(--silico-violet)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 2
                    }}>
                      <Bot size={18} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: isAssistant ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                      background: isAssistant ? 'var(--bg-card)' : 'var(--gradient-brand)',
                      color: isAssistant ? 'var(--text-primary)' : '#fff',
                      border: isAssistant ? '1px solid var(--border)' : 'none',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                    }}>
                      {renderFormattedText(msg.content)}
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      justifyContent: isAssistant ? 'flex-start' : 'flex-end',
                      paddingLeft: 4, paddingRight: 4
                    }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>

                      {isAssistant && msg.id !== 'welcome' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleCopyText(msg.content)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--text-muted)',
                              cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4
                            }}
                            className="hover-bright"
                          >
                            <Copy size={12} /> Copy
                          </button>
                          <button
                            onClick={() => handleSendToComposer(msg.content)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--silico-violet)',
                              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                            }}
                            className="hover-bright"
                          >
                            <Send size={12} /> Send to Composer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 2
                    }}>
                      <UserIcon size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {chatLoading && (
              <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(124, 58, 237, 0.15)',
                  color: 'var(--silico-violet)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} />
                </div>
                <div style={{
                  padding: '12px 18px', borderRadius: '14px 14px 14px 4px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem'
                }}>
                  <RefreshCw size={15} className="animate-spin" style={{ color: 'var(--silico-violet)' }} />
                  Strategizing ideas...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Starter Chips */}
          <div style={{
            padding: '10px 20px',
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap'
          }}>
            {CHAT_STARTERS.map((starter, i) => (
              <button
                key={i}
                onClick={() => handleSendChatMessage(starter)}
                disabled={chatLoading}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s'
                }}
                className="hover-bright"
              >
                {starter}
              </button>
            ))}
          </div>

          {/* Chat Input Box */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-card)'
          }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              style={{ display: 'flex', gap: 10, alignItems: 'center' }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Ask SocialSilico AI anything (e.g. 'Write 5 hooks for LinkedIn about founder productivity')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                style={{ flex: 1, padding: '12px 16px', fontSize: '0.9rem' }}
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!chatInput.trim() || chatLoading}
                style={{ padding: '12px 20px', gap: 8, flexShrink: 0 }}
              >
                {chatLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Local Fallback Generator ────────────────────────────────────────────────
function getClientSideFallback(topic, platform, tone) {
  const isX = platform === 'twitter';
  let v1 = '', v2 = '', v3 = '';

  if (tone === 'viral') {
    v1 = `Most people get this completely wrong:\n\n${topic}\n\nHere is the exact playbook:\n1. Focus on signal over vanity metrics\n2. Iterate in public\n3. Protect consistency\n\nAgree or disagree? 🧵`;
    v2 = `Stop making ${topic.toLowerCase().slice(0, 32)} harder than it needs to be.\n\nThe real cheat code is simpler than you think.\n\nSave this for your next workflow check 👇`;
    v3 = `Unpopular opinion:\n\n"${topic}" is 10x more valuable than people realize.\n\nDrop your perspective below.`;
  } else if (tone === 'professional') {
    v1 = `In modern operations, clarity drives momentum.\n\n${topic}\n\nKey strategic pillars:\n• Clarify outcomes before scaling resources\n• Automate administrative friction\n• Measure high-signal milestones\n\nHow is your team approaching this quarter?`;
    v2 = `Reflecting on recent industry shifts around "${topic}":\n\nOrganizations that execute with scalable tooling capture exponential leverage.\n\nThoughts from my network? #Leadership #Strategy`;
    v3 = `Efficiency is not about more hours—it is about removing points of friction.\n\n${topic}\n\nPleased to see teams adopting smarter workflows. #SocialSilico`;
  } else {
    v1 = `Excited to highlight: ${topic}!\n\nCheck out the full breakdown and explore the details.\n\n👉 Discover more: https://socialsilico.pages.dev`;
    v2 = `Community spotlight:\n\nHow are you currently approaching "${topic}"?\n\nLeave your perspective below—we are reading every reply! 💬`;
    v3 = `Daily reminder:\n\n${topic}.\n\nSmall incremental progress compounds into massive results. #KeepBuilding`;
  }

  if (isX) {
    if (v1.length > 275) v1 = v1.slice(0, 270) + '...';
    if (v2.length > 275) v2 = v2.slice(0, 270) + '...';
    if (v3.length > 275) v3 = v3.slice(0, 270) + '...';
  }

  return {
    variations: [
      { id: 1, title: 'Option 1: The Hook & Framework', content: v1 },
      { id: 2, title: 'Option 2: The Direct & Actionable', content: v2 },
      { id: 3, title: 'Option 3: Conversation Starter', content: v3 },
    ],
    hashtags: ['#SocialSilico', '#GrowthStrategy', '#ContentMarketing', '#AudienceBuilding'],
    bestTime: 'Tuesday or Thursday between 9:00 AM and 11:30 AM'
  };
}
