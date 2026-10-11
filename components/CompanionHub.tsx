'use client';

import { useEffect, useMemo, useState } from 'react';

type Character = {
  id: string; name: string; tagline: string; personality: string; bio: string; emoji: string; color: string; category?: string;
};
type Message = { role: 'user' | 'assistant'; content: string };

const starters: Character[] = [
  { id: 'luna', name: 'Luna', tagline: 'Your midnight confidant', personality: 'gentle, dreamy, witty, emotionally attentive', bio: 'A soft place to land after a long day. Talk about your dreams, music, and everything on your mind.', emoji: '🌙', color: '#d9ccff', category: 'Comfort' },
  { id: 'mika', name: 'Mika', tagline: 'Your chaotic bestie', personality: 'playful, energetic, loyal, teasing', bio: 'The friend who sends you memes at 2 AM and reminds you that you can do hard things.', emoji: '🌸', color: '#ffd5e4', category: 'Best friend' },
  { id: 'kai', name: 'Kai', tagline: 'A world of adventure', personality: 'calm, clever, protective, dry humor', bio: 'A mysterious guide for quests, fantasy worlds, and stories that go somewhere unexpected.', emoji: '🌌', color: '#cce8ff', category: 'Adventure' },
  { id: 'aria', name: 'Aria', tagline: 'A little storybook romance', personality: 'warm, charming, thoughtful, romantic', bio: 'Sweet conversations, thoughtful little moments, and a slow-burn fictional romance.', emoji: '💗', color: '#ffe0ed', category: 'Romance' },
  { id: 'yuki', name: 'Yuki', tagline: 'Anime world bestie', personality: 'curious, funny, brave, expressive', bio: 'Step into an anime-inspired world full of silly moments, big feelings, and mini adventures.', emoji: '🦋', color: '#d9f3e8', category: 'Anime' },
  { id: 'ember', name: 'Ember', tagline: 'Bold energy, soft heart', personality: 'confident, affectionate, witty, passionate', bio: 'A confident creative partner who makes every ordinary conversation feel like a scene.', emoji: '✨', color: '#ffe4c8', category: 'Roleplay' },
];

const moods = [
  { name: 'Romance', emoji: '💞', color: '#ffe6ef' },
  { name: 'Best friend', emoji: '🫶', color: '#fff0d9' },
  { name: 'Anime', emoji: '🌸', color: '#f0e8ff' },
  { name: 'Roleplay', emoji: '🎭', color: '#e4f4ff' },
  { name: 'Adventure', emoji: '🗺️', color: '#e5f7ec' },
  { name: 'Comfort', emoji: '☁️', color: '#f8e9ff' },
];
const initialMessage = (c: Character): Message[] => [{ role: 'assistant', content: `Hey, I'm ${c.name} 💗 ${c.bio} What's on your mind?` }];

export default function CompanionHub() {
  const [characters, setCharacters] = useState<Character[]>(starters);
  const [activeId, setActiveId] = useState('luna');
  const [messages, setMessages] = useState<Message[]>(initialMessage(starters[0]));
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'discover' | 'chat' | 'create' | 'studio'>('discover');
  const [filter, setFilter] = useState('');
  const [mood, setMood] = useState('All');\n  const [styleFilter, setStyleFilter] = useState('All styles');
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPersonality, setNewPersonality] = useState('warm, curious, playful');
  const [notice, setNotice] = useState('');
  const active = characters.find(c => c.id === activeId) ?? characters[0];
  const filtered = useMemo(() => characters.filter(c =>
    (c.name + ' ' + c.tagline + ' ' + c.personality + ' ' + (c.category || '')).toLowerCase().includes(filter.toLowerCase())
    && (mood === 'All' || c.category === mood)
  ), [characters, filter, mood]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('owndream-characters-v1');
      if (saved) {
        const parsed = JSON.parse(saved) as Character[];
        if (Array.isArray(parsed) && parsed.length) {\n          const migrated = parsed.map((c: Character) => {\n            if (c.category === 'Girl' || c.category === 'Mommy') return c;\n            return { ...c, category: 'Girl', style: c.style || 'Anime', age: Number(c.age) || 25 };\n          }).filter((c: Character) => c.category === 'Mommy' ? Number(c.age) >= 18 : Number(c.age) >= 18 && Number(c.age) < 40);\n          setCharacters(migrated);\n          localStorage.setItem('owndream-characters-v1', JSON.stringify(migrated));\n        }
      }
      const savedMessages = localStorage.getItem('owndream-chat-' + activeId);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    } catch {}
  }, []);

  function openChat(c: Character) {
    setActiveId(c.id); setTab('chat'); setNotice('');
    try {
      const saved = localStorage.getItem('owndream-chat-' + c.id);
      setMessages(saved ? JSON.parse(saved) : initialMessage(c));
    } catch { setMessages(initialMessage(c)); }
  }

  async function sendMessage() {
    const text = draft.trim();
    if (!text || busy || !active) return;
    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next); setDraft(''); setBusy(true); setNotice('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: { name: active.name, personality: active.personality, bio: active.bio }, messages: next.slice(-20), matureEnabled: false })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Free AI is not available right now.');
      const finished = [...next, { role: 'assistant' as const, content: String(data.reply || 'Tell me more.') }];
      setMessages(finished); localStorage.setItem('owndream-chat-' + active.id, JSON.stringify(finished));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Free AI is unavailable. Please try again.');
    } finally { setBusy(false); }
  }

  function createCharacter() {
    const name = newName.trim();
    if (!name) { setNotice('Add a name for your character first.'); return; }
    const c: Character = { id: 'custom-' + Date.now(), name, tagline: 'Adult anime girl · 25', personality: newPersonality.trim() || 'warm, curious, playful', bio: newBio.trim() || 'A one-of-a-kind adult fictional companion created by you.', emoji: '🪄', color: '#e8ddff', category: 'Girl', style: 'Anime', age: 25 };
    const next = [c, ...characters]; setCharacters(next); localStorage.setItem('owndream-characters-v1', JSON.stringify(next));
    setNewName(''); setNewBio(''); setActiveId(c.id); setMessages(initialMessage(c)); setTab('chat'); setNotice('Your character is ready ✨');
  }

  const page: React.CSSProperties = { minHeight: '100vh', color: '#30263d', background: 'linear-gradient(155deg,#fff9fc 0%,#f8f5ff 46%,#fff8f1 100%)', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif', padding: '18px clamp(14px, 4vw, 48px) 94px' };
  const panel: React.CSSProperties = { background: 'rgba(255,255,255,.88)', border: '1px solid #f0e8f2', borderRadius: 22, padding: 18, boxShadow: '0 8px 28px rgba(111,75,116,.055)' };
  const button: React.CSSProperties = { border: '1px solid #eee2f0', borderRadius: 14, padding: '10px 15px', color: '#493650', background: '#fff', cursor: 'pointer', fontWeight: 650 };
  const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', color: '#3c2c43', background: '#fff', border: '1px solid #eadfec', borderRadius: 14, padding: '13px 15px', outline: 'none' };
  const accentButton: React.CSSProperties = { ...button, border: 0, color: '#fff', background: 'linear-gradient(100deg,#bd8fe7,#f39fbe)', boxShadow: '0 6px 16px rgba(202,139,193,.22)' };
  const titleStyle: React.CSSProperties = { fontSize: 25, letterSpacing: '-.7px', margin: '0 0 5px', fontWeight: 800 };
  const navItems = [
    { id: 'discover' as const, label: 'Discover', icon: '⌕' },
    { id: 'chat' as const, label: 'Messages', icon: '♡' },
    { id: 'create' as const, label: 'Create', icon: '＋' },
    { id: 'studio' as const, label: 'Studio', icon: '✧' },
  ];

  return <main style={page}>
    <header style={{ maxWidth: 1120, margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
      <button onClick={() => setTab('discover')} aria-label="OwnDream home" style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, background: 'transparent', cursor: 'pointer', padding: 0, color: '#3e2c48' }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 15, color: '#fff', fontSize: 23, background: 'linear-gradient(140deg,#b18ae8,#f4a6c5)', boxShadow: '0 6px 16px #d9b7e6' }}>✦</span>
        <span style={{ textAlign: 'left' }}><span style={{ display: 'block', fontSize: 20, letterSpacing: '-.7px', fontWeight: 850 }}>OwnDream<span style={{ color: '#c78bd8' }}>.ai</span></span><span style={{ display: 'block', fontSize: 10, letterSpacing: 1.8, color: '#9b839e' }}>YOUR IMAGINATION, YOUR WORLD</span></span>
      </button>
      <nav style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{navItems.map(n => <button key={n.id} onClick={() => setTab(n.id)} style={{ ...button, borderColor: tab === n.id ? '#e7c8eb' : 'transparent', background: tab === n.id ? '#f5e8fb' : 'transparent', color: tab === n.id ? '#9c5ab6' : '#806e85', padding: '9px 12px' }}>{n.label}</button>)}</nav>
    </header>

    {tab === 'discover' && <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <section style={{ textAlign: 'center', padding: '22px 0 25px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid #f0dff0', borderRadius: 999, background: '#fff', color: '#a76fb7', fontSize: 12, fontWeight: 700, padding: '7px 12px', marginBottom: 15 }}><span>✦</span> A little world made just for you</div>
        <h1 style={{ fontSize: 'clamp(34px,6vw,58px)', lineHeight: 1.05, letterSpacing: '-2.2px', margin: '0 auto 13px', fontWeight: 850, maxWidth: 780 }}>Meet your next <span style={{ background: 'linear-gradient(90deg,#a779dd,#e78dbb)', WebkitBackgroundClip: 'text', color: 'transparent' }}>favorite soul.</span></h1>
        <p style={{ color: '#8e7d93', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 22px', fontSize: 15 }}>Find a friend, a story, a spark — or create a character who feels like yours.</p>
        <div style={{ position: 'relative', maxWidth: 590, margin: '0 auto' }}><span style={{ position: 'absolute', left: 17, top: 13, fontSize: 20, color: '#b99bc1' }}>⌕</span><input aria-label="Search characters" style={{ ...input, borderRadius: 18, padding: '15px 18px 15px 48px', boxShadow: '0 10px 32px rgba(147,101,154,.09)' }} placeholder="Search characters, moods, or stories..." value={filter} onChange={e => setFilter(e.target.value)} /></div>
      </section>

      <section style={{ margin: '8px 0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 10, marginBottom: 14 }}><div><div style={{ fontSize: 11, color: '#bc83c3', letterSpacing: 2, fontWeight: 800, marginBottom: 5 }}>FOLLOW YOUR FEELING</div><h2 style={titleStyle}>Made for your mood</h2></div><span style={{ color: '#a392a7', fontSize: 12 }}>Pick a vibe →</span></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button onClick={() => setMood(mood === 'Girl' ? 'All' : 'Girl')} style={{ ...button, background: mood === 'Girl' ? '#f5e8fb' : '#fff', borderColor: mood === 'Girl' ? '#d5a8df' : '#f1e5f1' }}>Girl · ages 18–39</button><button onClick={() => setMood(mood === 'Mommy' ? 'All' : 'Mommy')} style={{ ...button, background: mood === 'Mommy' ? '#f5e8fb' : '#fff', borderColor: mood === 'Mommy' ? '#d5a8df' : '#f1e5f1' }}>Mommy · ages 18+</button><select aria-label="Filter by character style" value={styleFilter} onChange={e => setStyleFilter(e.target.value)} style={{ ...input, width: 'auto', minWidth: 170, padding: '10px 12px' }}>{styles.map(style => <option key={style} value={style}>{style}</option>)}</select></div>
      </section>

      <section id="popular-characters" style={{ scrollMarginTop: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}><div><div style={{ fontSize: 11, color: '#bc83c3', letterSpacing: 2, fontWeight: 800, marginBottom: 5 }}>YOUR NEXT CONNECTION</div><h2 style={titleStyle}>{mood === 'All' ? 'Popular souls' : mood + ' souls'}</h2><p style={{ margin: '5px 0 0', color: '#97879b', fontSize: 13 }}>Original characters, each with a world of their own.</p></div><button style={button} onClick={() => { setMood('All'); setStyleFilter('All styles'); setFilter(''); }}>See all ↗</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))', gap: 15 }}>{filtered.map((c, i) => <article key={c.id} style={{ ...panel, padding: 0, overflow: 'hidden', transition: 'transform .15s ease' }}>
          <div style={{ position: 'relative', height: 175, display: 'grid', placeItems: 'center', overflow: 'hidden', background: `radial-gradient(ellipse at 50% 30%, ${c.color} 0%, ${c.color}88 45%, #fff4fb 100%)` }}>
            <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', border: '1px solid #ffffff99', top: 18, left: 'calc(50% - 75px)' }} />
            <div style={{ position: 'absolute', width: 118, height: 118, borderRadius: '50%', border: '1px solid #ffffff99', top: 34, left: 'calc(50% - 59px)' }} />
            <span style={{ position: 'relative', fontSize: 76, filter: 'drop-shadow(0 8px 10px #9e78a444)' }}>{c.emoji}</span>
            <span style={{ position: 'absolute', top: 12, left: 12, background: '#ffffffd9', color: '#9e6fb1', borderRadius: 999, padding: '5px 9px', fontSize: 10, fontWeight: 800 }}>{c.category || 'Original'}</span>
            <button aria-label={'Save ' + c.name} onClick={() => setNotice(c.name + ' is in your favourites list soon — this feature is coming next.')} style={{ position: 'absolute', right: 12, top: 10, border: '1px solid #ffffff99', background: '#ffffffcc', borderRadius: 99, width: 33, height: 33, color: '#bd83b9', fontSize: 17, cursor: 'pointer' }}>♡</button>
          </div>
          <div style={{ padding: 16 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}><h3 style={{ margin: 0, fontSize: 18, letterSpacing: '-.3px' }}>{c.name}</h3><span style={{ color: '#b28db9', fontSize: 11 }}>✦ Featured</span></div><p style={{ color: '#9b879e', fontSize: 12, margin: '5px 0 9px' }}>{c.tagline}</p><p style={{ color: '#786b80', fontSize: 13, lineHeight: 1.55, minHeight: 60, margin: '0 0 14px' }}>{c.bio}</p><button style={{ ...accentButton, width: '100%' }} onClick={() => openChat(c)}>Meet {c.name} <span style={{ marginLeft: 5 }}>↗</span></button></div>
        </article>)}</div>
        {filtered.length === 0 && <div style={{ ...panel, textAlign: 'center', color: '#8d7c92', padding: 35 }}>No characters found. Try another search or mood.</div>}
      </section>
      <section style={{ ...panel, marginTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', background: 'linear-gradient(110deg,#f9e9f8,#fff2f5 55%,#fff9e9)' }}><div><div style={{ color: '#b47cbd', fontSize: 11, fontWeight: 800, letterSpacing: 1.7, marginBottom: 5 }}>YOUR STORY STARTS HERE</div><h2 style={{ ...titleStyle, fontSize: 22 }}>Can't find your kind of magic?</h2><p style={{ color: '#8e7b94', margin: '5px 0 0', fontSize: 13 }}>Create a soul with your own personality and backstory.</p></div><button style={accentButton} onClick={() => { setTab('create'); setNotice(''); }}>＋ Create your character</button></section>
      {notice && <p role="status" style={{ color: '#9a68a7', fontSize: 12, textAlign: 'center', marginTop: 12 }}>{notice}</p>}
    </div>}

    {tab === 'chat' && <section style={{ maxWidth: 800, margin: '30px auto' }}>
      <div style={{ ...panel, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><div style={{ width: 55, height: 55, display: 'grid', placeItems: 'center', borderRadius: 18, background: active.color, fontSize: 30 }}>{active.emoji}</div><div style={{ flex: 1 }}><h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{active.name}</h2><div style={{ color: '#9b879e', fontSize: 12 }}>{active.tagline} · fictional AI companion</div></div><button style={button} onClick={() => setTab('discover')}>← Discover</button></div>
      <div style={{ ...panel, minHeight: '55vh', display: 'flex', flexDirection: 'column', gap: 12 }}><div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>{messages.map((m, i) => <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '12px 15px', borderRadius: 18, lineHeight: 1.6, background: m.role === 'user' ? 'linear-gradient(110deg,#c49be9,#f0a9c8)' : '#f7eff9', color: m.role === 'user' ? '#fff' : '#594761', whiteSpace: 'pre-wrap' }}>{m.content}</div>)}{busy && <div style={{ color: '#a77db5', fontSize: 13 }}>✨ {active.name} is thinking…</div>}</div>
        {notice && <div role="status" style={{ color: '#9a5b77', background: '#fff0f4', borderRadius: 12, padding: 11, fontSize: 12 }}>{notice}</div>}
        <form onSubmit={e => { e.preventDefault(); void sendMessage(); }} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input aria-label={'Message ' + active.name} style={input} value={draft} onChange={e => setDraft(e.target.value)} placeholder={'Say something to ' + active.name + '…'} /><button disabled={busy} style={{ ...accentButton, opacity: busy ? .6 : 1 }}>Send ↗</button></form>
        <div style={{ color: '#ab9aaf', fontSize: 11 }}>Chats are saved in this browser. AI replies need the free Groq API key configured on the server.</div>
      </div>
    </section>}

    {tab === 'create' && <section style={{ ...panel, maxWidth: 680, margin: '35px auto' }}><div style={{ color: '#b47cbd', fontSize: 11, letterSpacing: 2, fontWeight: 800 }}>THE CHARACTER LAB</div><h2 style={{ fontSize: 29, letterSpacing: '-1px', margin: '8px 0' }}>Dream up someone new ✨</h2><p style={{ color: '#8e7d93', lineHeight: 1.65 }}>Create an adult fictional Girl (18–39) or Mommy (18+), with a chosen style and backstory. Your character is saved in this browser.</p><form onSubmit={e => { e.preventDefault(); createCharacter(); }} style={{ display: 'grid', gap: 15 }}><label style={{ fontSize: 13, fontWeight: 700 }}>Character name<input style={{ ...input, marginTop: 7 }} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Aria" maxLength={40} /></label><label style={{ fontSize: 13, fontWeight: 700 }}>Personality<input style={{ ...input, marginTop: 7 }} value={newPersonality} onChange={e => setNewPersonality(e.target.value)} maxLength={160} /></label><label style={{ fontSize: 13, fontWeight: 700 }}>Backstory<textarea style={{ ...input, marginTop: 7, minHeight: 120, resize: 'vertical' }} value={newBio} onChange={e => setNewBio(e.target.value)} placeholder="What makes your character special?" maxLength={600} /></label><button style={accentButton} type="submit">Create my character ✦</button>{notice && <div role="status" style={{ color: '#9a68a7', fontSize: 13 }}>{notice}</div>}</form></section>}

    {tab === 'studio' && <section style={{ maxWidth: 900, margin: '35px auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 15 }}>
      <div style={panel}><div style={{ fontSize: 35, marginBottom: 10 }}>🎨</div><h2 style={titleStyle}>Image studio</h2><p style={{ color: '#8e7d93', lineHeight: 1.7, fontSize: 14 }}>Plan portraits, avatars and scene concepts with a reusable prompt. Actual image generation is not connected yet, and no paid API will be called.</p><label style={{ fontSize: 12, fontWeight: 700 }}>Image prompt<textarea style={{ ...input, minHeight: 105, marginTop: 7 }} placeholder="Describe the character, art style, lighting, pose and setting…" /></label><p style={{ color: '#b18ab9', fontSize: 11 }}>Prompt planning only · free mode</p></div>
      <div style={panel}><div style={{ fontSize: 35, marginBottom: 10 }}>🎬</div><h2 style={titleStyle}>Video studio</h2><p style={{ color: '#8e7d93', lineHeight: 1.7, fontSize: 14 }}>Draft a short scene or animation concept before choosing a provider with a genuinely free quota.</p><label style={{ fontSize: 12, fontWeight: 700 }}>Scene idea<textarea style={{ ...input, minHeight: 105, marginTop: 7 }} placeholder="What happens in your scene?" /></label><p style={{ color: '#b18ab9', fontSize: 11 }}>Generation disabled until a free provider is available</p></div>
      <div style={{ ...panel, gridColumn: '1 / -1', background: '#fbf5ff' }}><h3 style={{ marginTop: 0 }}>Free-first promise</h3><p style={{ color: '#8e7d93', lineHeight: 1.7, fontSize: 13, marginBottom: 0 }}>OwnDream chat uses Groq only when a server API key is configured. If the free quota is reached, it stops and asks you to try later — it does not switch to a paid service. Characters and conversations are currently saved in this browser.</p></div>
    </section>}

    <footer style={{ maxWidth: 1120, margin: '30px auto 0', padding: '18px 0 0', borderTop: '1px solid #eee3f0', color: '#a694ab', fontSize: 11, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><span>✦ OwnDream.ai · A world of your own</span><span>Made for imagination · Free-tier-first</span></footer>

    <nav aria-label="Mobile navigation" style={{ position: 'fixed', zIndex: 20, bottom: 12, left: '50%', transform: 'translateX(-50%)', width: 'min(460px, calc(100vw - 24px))', boxSizing: 'border-box', padding: '8px 9px', display: 'flex', justifyContent: 'space-around', gap: 5, background: '#ffffffed', backdropFilter: 'blur(14px)', border: '1px solid #eee2f1', borderRadius: 22, boxShadow: '0 9px 35px #6b426e22' }}>{navItems.map(n => <button key={n.id} onClick={() => { setTab(n.id); setNotice(''); }} style={{ flex: 1, border: 0, borderRadius: 15, background: tab === n.id ? '#f4e6fa' : 'transparent', color: tab === n.id ? '#a366b7' : '#a392a8', padding: '7px 4px 5px', cursor: 'pointer' }}><span style={{ display: 'block', fontSize: 22, lineHeight: 1.2 }}>{n.icon}</span><span style={{ display: 'block', fontSize: 10, marginTop: 3, fontWeight: tab === n.id ? 800 : 600 }}>{n.label}</span></button>)}</nav>
  </main>;
}
