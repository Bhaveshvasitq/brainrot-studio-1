'use client';

import { useEffect, useMemo, useState } from 'react';

type Character = {
  id: string; name: string; tagline: string; personality: string; bio: string; emoji: string; color: string;
};
type Message = { role: 'user' | 'assistant'; content: string };

const starters: Character[] = [
  { id: 'luna', name: 'Luna', tagline: 'Dreamy confidant', personality: 'gentle, witty, curious, emotionally attentive', bio: 'A calm, moonlit companion for late-night thoughts, music and meaningful conversations.', emoji: '🌙', color: '#c7b5ff' },
  { id: 'mika', name: 'Mika', tagline: 'Playful best friend', personality: 'playful, energetic, loyal, teasing', bio: 'Bright energy, terrible jokes and unlimited encouragement.', emoji: '🌸', color: '#ffb9d1' },
  { id: 'kai', name: 'Kai', tagline: 'Cyberpunk guide', personality: 'calm, clever, protective, dry humor', bio: 'A sharp companion from a neon city who loves strategy and futuristic stories.', emoji: '🌌', color: '#8fc7ff' },
  { id: 'ember', name: 'Ember', tagline: 'Confident romantic', personality: 'confident, affectionate, witty, passionate', bio: 'Bold, warm and playful, with a talent for memorable moments.', emoji: '🔥', color: '#ffc18b' },
];

const initialMessage = (c: Character): Message[] => [{ role: 'assistant', content: `Hi, I'm ${c.name}. ${c.bio} What would you like to talk about?` }];

export default function CompanionHub() {
  const [characters, setCharacters] = useState<Character[]>(starters);
  const [activeId, setActiveId] = useState('luna');
  const [messages, setMessages] = useState<Message[]>(initialMessage(starters[0]));
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'discover' | 'chat' | 'create' | 'studio'>('discover');
  const [filter, setFilter] = useState('');
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPersonality, setNewPersonality] = useState('warm, curious, playful');
  const [notice, setNotice] = useState('');
  const active = characters.find(c => c.id === activeId) ?? characters[0];
  const filtered = useMemo(() => characters.filter(c => (c.name + ' ' + c.tagline + ' ' + c.personality).toLowerCase().includes(filter.toLowerCase())), [characters, filter]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dreamlight-characters-v1');
      if (saved) {
        const parsed = JSON.parse(saved) as Character[];
        if (Array.isArray(parsed) && parsed.length) setCharacters(parsed);
      }
      const savedMessages = localStorage.getItem('dreamlight-chat-' + activeId);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    } catch {}
  }, []);

  function openChat(c: Character) {
    setActiveId(c.id);
    setTab('chat');
    try {
      const saved = localStorage.getItem('dreamlight-chat-' + c.id);
      setMessages(saved ? JSON.parse(saved) : initialMessage(c));
    } catch { setMessages(initialMessage(c)); }
    setNotice('');
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
      if (!response.ok) throw new Error(data.error || 'Chat provider is not configured yet.');
      const finished = [...next, { role: 'assistant' as const, content: String(data.reply || 'Tell me more.') }];
      setMessages(finished);
      localStorage.setItem('dreamlight-chat-' + active.id, JSON.stringify(finished));
    } catch (e) {
      const fallback = { role: 'assistant' as const, content: `I'm here with you. (Demo mode: connect a supported chat API in server environment settings to enable live AI.)` };
      const finished = [...next, fallback]; setMessages(finished);
      localStorage.setItem('dreamlight-chat-' + active.id, JSON.stringify(finished));
      setNotice(e instanceof Error ? e.message : 'Using demo reply.');
    } finally { setBusy(false); }
  }

  function createCharacter() {
    const name = newName.trim();
    if (!name) { setNotice('Enter a character name first.'); return; }
    const c: Character = { id: 'custom-' + Date.now(), name, tagline: 'Original character', personality: newPersonality.trim() || 'warm, curious, playful', bio: newBio.trim() || 'A companion created by you.', emoji: '✨', color: '#b9f3df' };
    const next = [c, ...characters]; setCharacters(next); localStorage.setItem('dreamlight-characters-v1', JSON.stringify(next));
    setNewName(''); setNewBio(''); setActiveId(c.id); setMessages(initialMessage(c)); setTab('chat'); setNotice('Character created and saved in this browser.');
  }

  const page: React.CSSProperties = { minHeight: '100vh', color: '#f7f4ff', background: 'radial-gradient(ellipse at top left, #28204b 0%, #11101b 44%, #0a0a12 100%)', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', padding: '24px clamp(14px, 4vw, 48px)' };
  const panel: React.CSSProperties = { background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.11)', borderRadius: 20, padding: 18 };
  const button: React.CSSProperties = { border: '1px solid rgba(255,255,255,.14)', borderRadius: 12, padding: '10px 14px', color: '#fff', background: 'rgba(255,255,255,.08)', cursor: 'pointer' };
  const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', color: '#fff', background: 'rgba(0,0,0,.22)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 12, padding: 12, outline: 'none' };

  return <main style={page}>
    <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', maxWidth:1280, margin:'0 auto 28px'}}>
      <div style={{display:'flex', gap:12, alignItems:'center'}}><div style={{fontSize:28, background:'linear-gradient(135deg,#bca8ff,#ffb9d1)', borderRadius:14, padding:'8px 12px'}}>✦</div><div><div style={{fontSize:11, letterSpacing:3, color:'#c5b6ff'}}>OwnDream.ai</div><h1 style={{fontSize:26, margin:'3px 0'}}>Imagine anyone. Create your world.</h1></div></div>
      <nav style={{display:'flex', gap:8, flexWrap:'wrap'}}>{(['discover','chat','create','studio'] as const).map(t=><button key={t} style={{...button, background:tab===t?'#7961c9':'rgba(255,255,255,.06)'}} onClick={()=>setTab(t)}>{({discover:'Discover',chat:'Messages',create:'Create character',studio:'Create media'})[t]}</button>)}</nav>
    </header>
    <div style={{maxWidth:1280, margin:'0 auto'}}>
      <section style={{...panel, marginBottom:18, padding:24, background:'linear-gradient(115deg,rgba(132,103,211,.23),rgba(255,185,209,.07))'}}>
        <div style={{fontSize:11, letterSpacing:2, color:'#d3c8ff'}}>OWNDREAM.AI · AI CHARACTERS & CREATION</div>
        <h2 style={{fontSize:'clamp(26px,4vw,42px)', lineHeight:1.12, margin:'10px 0'}}>Discover characters.<br/>Bring your imagination to life.</h2>
        <p style={{color:'#c4bfd5', maxWidth:650, lineHeight:1.7, marginBottom:18}}>Discover original characters, build your own personalities, chat naturally, and create stories. Your creative studio is designed for free-tier-first integrations.</p>
        <button style={{...button, background:'#b9a5ff', color:'#171024', fontWeight:700}} onClick={()=>setTab('discover')}>Explore characters ↗</button>
      </section>

      {tab==='discover' && <section>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:14}}><div><h2 style={{margin:'0 0 4px'}}>Explore the universe</h2><div style={{color:'#aaa3bd', fontSize:14}}>Find your next character, story, or conversation.</div></div><input aria-label="Search characters" style={{...input, maxWidth:300}} placeholder="Search characters…" value={filter} onChange={e=>setFilter(e.target.value)}/></div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,235px),1fr))', gap:14}}>{filtered.map(c=><article key={c.id} style={{...panel, padding:0, overflow:'hidden'}}><div style={{height:150, display:'grid', placeItems:'center', background:`radial-gradient(circle at 50% 35%, ${c.color}77, transparent 65%),linear-gradient(135deg,#29223d,#171522)`, fontSize:64}}>{c.emoji}</div><div style={{padding:16}}><div style={{fontSize:11, color:'#c5b6ff', letterSpacing:1.5}}>{c.tagline.toUpperCase()}</div><h3 style={{margin:'6px 0'}}>{c.name}</h3><p style={{fontSize:13, color:'#bbb4ca', lineHeight:1.6, minHeight:62}}>{c.bio}</p><button style={{...button, width:'100%', background:'#7961c9'}} onClick={()=>openChat(c)}>Chat with {c.name}</button></div></article>)}</div>
      </section>}

      {tab==='chat' && <section style={{display:'grid', gridTemplateColumns:'minmax(0,1fr)', gap:14}}>
        <div style={{...panel, display:'flex', alignItems:'center', gap:12}}><div style={{fontSize:34, background:active.color+'33', borderRadius:14, padding:8}}>{active.emoji}</div><div style={{flex:1}}><h2 style={{margin:'0 0 4px'}}>{active.name}</h2><div style={{fontSize:13,color:'#bdb5cf'}}>{active.tagline} · memory saved in this browser</div></div><button style={button} onClick={()=>setTab('discover')}>Change character</button></div>
        <div style={{...panel, minHeight:320, display:'flex', flexDirection:'column', gap:12}}><div style={{flex:1, display:'flex', flexDirection:'column', gap:10}}>{messages.map((m,i)=><div key={i} style={{alignSelf:m.role==='user'?'flex-end':'flex-start', maxWidth:'85%', padding:'11px 14px', borderRadius:16, lineHeight:1.55, background:m.role==='user'?'#6f58ba':'rgba(255,255,255,.09)', whiteSpace:'pre-wrap'}}>{m.content}</div>)}{busy&&<div style={{color:'#c5b6ff'}}>Thinking…</div>}</div>
          {notice&&<div style={{fontSize:12,color:'#e8cfa3'}}>{notice}</div>}
          <form onSubmit={e=>{e.preventDefault();void sendMessage();}} style={{display:'flex', gap:8}}><input style={input} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={`Message ${active.name}…`} /><button disabled={busy} style={{...button, background:'#7961c9', opacity: busy ? 0.65 : 1}}>Send</button></form>
        </div>
      </section>}

      {tab==='create' && <section style={{...panel, maxWidth:680, margin:'0 auto'}}><div style={{fontSize:11,letterSpacing:2,color:'#c5b6ff'}}>OWNDREAM CHARACTER LAB</div><h2>Create your own character</h2><p style={{color:'#bdb5cf', lineHeight:1.6}}>Give your fictional character a name, a personality and a backstory. This first version saves custom characters in this browser.</p><form onSubmit={e=>{e.preventDefault();createCharacter();}} style={{display:'grid',gap:14}}><label style={{fontSize:13}}>Character name<input style={{...input,marginTop:6}} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Aria" maxLength={40}/></label><label style={{fontSize:13}}>Personality<input style={{...input,marginTop:6}} value={newPersonality} onChange={e=>setNewPersonality(e.target.value)} maxLength={160}/></label><label style={{fontSize:13}}>Backstory<textarea style={{...input,marginTop:6,minHeight:110,resize:'vertical'}} value={newBio} onChange={e=>setNewBio(e.target.value)} placeholder="What makes your character unique?" maxLength={600}/></label><button style={{...button,background:'#7961c9'}} type="submit">Create character</button>{notice&&<div style={{fontSize:13,color:'#c5b6ff'}}>{notice}</div>}</form></section>}

      {tab==='studio' && <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',gap:14}}>
        <div style={panel}><div style={{fontSize:34}}>🎨</div><h2>Image studio</h2><p style={{color:'#bdb5cf',lineHeight:1.6}}>Design prompts for character portraits, avatars, scenes, and anime-inspired artwork. Live image generation needs a configured provider with a free quota.</p><div style={{fontSize:12,color:'#e8cfa3',padding:'10px 12px',background:'rgba(255,193,139,.08)',borderRadius:10}}>Provider not connected · no charges enabled</div></div>
        <div style={panel}><div style={{fontSize:34}}>🎬</div><h2>Video studio</h2><p style={{color:'#bdb5cf',lineHeight:1.6}}>Prepare text-to-video and image-to-video concepts, then track jobs and generated media once a free provider is configured.</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><span style={{...button,cursor:'default'}}>Text → video</span><span style={{...button,cursor:'default'}}>Image → video</span></div><div style={{marginTop:12,fontSize:12,color:'#e8cfa3',padding:'10px 12px',background:'rgba(255,193,139,.08)',borderRadius:10}}>Provider not connected · video generation disabled until a genuinely free quota is configured</div></div>
        <div style={{...panel,gridColumn:'1 / -1'}}><h3>Free-tier safeguards</h3><ul style={{color:'#bdb5cf',lineHeight:1.8}}><li>No paid provider is called by this interface.</li><li>Chat uses the existing server endpoint and may fall back to demo replies when no API key is configured.</li><li>Conversation history and custom characters are stored in this browser in this prototype.</li><li>Before public launch, connect authentication and database policies so each user's data stays private.</li></ul></div>
      </section>}
      <footer style={{marginTop:28, padding:'16px 0', borderTop:'1px solid rgba(255,255,255,.1)', color:'#8f879f', fontSize:12, display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}><span>OwnDream.ai · Your AI character universe</span><span>Free-tier-first · Paid services disabled by default</span></footer>
    </div>
  </main>;
}
