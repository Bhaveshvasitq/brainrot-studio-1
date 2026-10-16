"use client";

import { useEffect, useMemo, useState } from "react";

type Character = { id: string; name: string; age: number; tagline: string; bio: string; style: string; image: string; hair?: string; eyes?: string; build?: string; traits?: string[] };
const starters: Character[] = [
  { id: "luna", name: "Luna", age: 22, tagline: "Dreamy anime companion", bio: "A moonlit, thoughtful adult character who loves music and meaningful conversations.", style: "Anime", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85", hair: "Silver", eyes: "Violet", build: "Elegant", traits: ["Gentle", "Dreamy"] },
  { id: "mika", name: "Mika", age: 25, tagline: "Playful creative spirit", bio: "An adult cosplayer with bright energy, a playful sense of humor, and creative ideas.", style: "Realistic", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85", hair: "Blonde", eyes: "Hazel", build: "Athletic", traits: ["Witty", "Playful"] },
  { id: "aria", name: "Aria", age: 42, tagline: "Elegant mature companion", bio: "A confident adult character who enjoys books, art, and warm conversation.", style: "Realistic", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85", hair: "Brunette", eyes: "Brown", build: "Elegant", traits: ["Confident", "Warm"] },
  { id: "yuki", name: "Yuki", age: 21, tagline: "Gamer and anime fan", bio: "An adult gamer who loves co-op adventures, anime, and friendly competition.", style: "Anime", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85", hair: "Black", eyes: "Hazel", build: "Athletic", traits: ["Curious", "Witty"] },
];
const traits = ["Gentle", "Witty", "Confident", "Playful", "Shy", "Adventurous", "Dreamy", "Warm"];
const styles = [
  { name: "Realistic", sub: "Photographic portrait", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85" },
  { name: "Anime", sub: "Illustrated character", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85" },
];
const hairOptions = ["Midnight black", "Silver", "Blonde", "Brunette", "Rose pink", "Blue"];
const eyeOptions = ["Hazel eyes", "Violet eyes", "Blue eyes", "Brown eyes", "Green eyes"];
const buildOptions = ["Athletic", "Elegant", "Petite", "Curvy", "Tall"];

export default function CompanionHub() {
  const [characters, setCharacters] = useState<Character[]>(starters);
  const [active, setActive] = useState<Character>(starters[0]);
  const [tab, setTab] = useState<"discover" | "chat" | "create" | "studio" | "mine">("create");
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Your Soul");
  const [age, setAge] = useState("25");
  const [style, setStyle] = useState("Anime");
  const [hair, setHair] = useState("Midnight black");
  const [eyes, setEyes] = useState("Hazel eyes");
  const [build, setBuild] = useState("Athletic");
  const [selectedTraits, setSelectedTraits] = useState<string[]>(["Gentle", "Witty"]);
  const [bio, setBio] = useState("A warm, curious soul who makes every conversation feel special.");
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const visible = useMemo(() => characters.filter(c => (c.name + " " + c.tagline + " " + c.style).toLowerCase().includes(search.toLowerCase())), [characters, search]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("soul-studio-characters-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as Character[];
        if (Array.isArray(parsed) && parsed.length) setCharacters([...parsed, ...starters.filter(s => !parsed.some(p => p.id === s.id))]);
      }
    } catch {}
  }, []);

  function saveCharacters(next: Character[]) {
    setCharacters(next);
    try { localStorage.setItem("soul-studio-characters-v1", JSON.stringify(next)); } catch {}
  }

  function startCreate() {
    setStep(1); setNotice(""); setTab("create");
  }

  function createCharacter() {
    const years = Number(age);
    if (!Number.isInteger(years) || years < 18 || years > 100) { setNotice("Please choose an age from 18 to 100. Characters must be adults."); return; }
    const character: Character = {
      id: crypto.randomUUID(), name: name.trim() || "Your Soul", age: years, tagline: "Your original adult character",
      bio: bio.trim() || "An original fictional adult character created by you.", style,
      image: styles.find(s => s.name === style)?.image || starters[0].image, hair, eyes, build, traits: selectedTraits,
    };
    const next = [character, ...characters.filter(c => c.id !== character.id)];
    saveCharacters(next); setActive(character); setTab("mine"); setNotice("Your character draft is saved on this device."); setStep(4);
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages(previous => [...previous, "You: " + draft.trim()]);
    setDraft("");
  }

  async function checkPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(""); setGeneratedImage(""); setGenerating(true);
    try {
      const response = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, age: active.age, style }) });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Image generation failed.");
      if (typeof result.imageUrl !== "string" || !result.imageUrl.startsWith("https://")) throw new Error("The provider returned an invalid image URL.");
      setGeneratedImage(result.imageUrl); setNotice("Portrait generated. Provider moderation and usage limits apply.");
      const updated = { ...active, image: result.imageUrl };
      setActive(updated); saveCharacters(characters.map(c => c.id === updated.id ? updated : c));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Image generation failed. Please try again.");
    } finally { setGenerating(false); }
  }

  const toggleTrait = (trait: string) => setSelectedTraits(old => old.includes(trait) ? old.filter(t => t !== trait) : old.length < 4 ? [...old, trait] : old);
  const navItems = [
    { id: "discover" as const, icon: "◉", label: "Explore" },
    { id: "chat" as const, icon: "◌", label: "Chat" },
    { id: "create" as const, icon: "＋", label: "Create" },
    { id: "studio" as const, icon: "✧", label: "Generate" },
    { id: "mine" as const, icon: "▢", label: "My AI" },
  ];

  return <main className="soul-app">
    <header className="mobile-topbar">
      <button className="menu-button" aria-label="Open menu" onClick={() => setTab("discover")}>☰</button>
      <button className="brand" onClick={() => setTab("discover")}><span className="brand-mark">✦</span><span>SOUL STUDIO</span></button>
      <button className="upgrade-button" onClick={() => setNotice("Payments and subscriptions are not enabled yet.")}>✦ <span>Upgrade</span></button>
      <button className="bell-button" aria-label="Notifications" onClick={() => setNotice("You're all caught up.")}>♧</button>
    </header>

    <div className="desktop-layout">
      <aside className="side-rail">
        <div className="rail-label">YOUR SPACE</div>
        {navItems.map(item => <button key={item.id} className={tab === item.id ? "rail-link active" : "rail-link"} onClick={() => { setTab(item.id); setNotice(""); }}><span>{item.icon}</span>{item.label}</button>)}
        <div className="rail-bottom"><span className="brand-mark">✦</span><div><b>Soul Studio</b><small>Original characters, your world.</small></div></div>
      </aside>

      <div className="main-content">
        {tab === "create" && <section className="create-page">
          <div className="create-kicker">YOUR IMAGINATION, BROUGHT TO LIFE</div>
          <h1>Create your <em>perfect soul.</em></h1>
          <p className="lead">Shape a character with their own look, energy and personality. Make someone entirely your own, one detail at a time.</p>
          <div className="stepper" aria-label={"Step " + step + " of 4"}>
            {[["01","Style"],["02","Appearance"],["03","Personality"],["04","Review"]].map(([num,label],i) => <button key={num} onClick={() => setStep(i+1)} className={step === i+1 ? "step active" : step > i+1 ? "step complete" : "step"}><span>{step > i+1 ? "✓" : num}</span><b>{label}</b></button>)}
          </div>

          {step === 1 && <div className="creator-panel">
            <div className="panel-heading"><span className="eyebrow">STEP 01 · CHOOSE YOUR STYLE</span><h2>What world are they from?</h2><p>Choose the visual style for your original adult character.</p></div>
            <div className="style-grid">{styles.map(s => <button key={s.name} className={"style-card " + (style === s.name ? "selected" : "")} onClick={() => setStyle(s.name)}><img src={s.image} alt={s.name + " style example"} /><span className="style-shade" /><span className="style-check">{style === s.name ? "✓" : ""}</span><span className="style-copy"><b>{s.name}</b><small>{s.sub}</small></span></button>)}</div>
            <div className="creator-actions"><span>Step 1 of 4</span><button className="pink-button" onClick={() => setStep(2)}>Continue <b>→</b></button></div>
          </div>}

          {step === 2 && <div className="creator-panel">
            <div className="panel-heading"><span className="eyebrow">STEP 02 · APPEARANCE</span><h2>Give them their signature look.</h2><p>Every detail helps make your character feel unique.</p></div>
            <label className="field-label">Character name<input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="Give your character a name" /></label>
            <label className="field-label">Age (18–100)<input type="number" min={18} max={100} value={age} onChange={e => setAge(e.target.value)} /></label>
            <div className="option-section"><b>Hair color</b><div className="chips">{hairOptions.map(v => <button key={v} className={hair === v ? "chip selected" : "chip"} onClick={() => setHair(v)}>{v}</button>)}</div></div>
            <div className="option-section"><b>Eyes</b><div className="chips">{eyeOptions.map(v => <button key={v} className={eyes === v ? "chip selected" : "chip"} onClick={() => setEyes(v)}>{v}</button>)}</div></div>
            <div className="option-section"><b>Build</b><div className="chips">{buildOptions.map(v => <button key={v} className={build === v ? "chip selected" : "chip"} onClick={() => setBuild(v)}>{v}</button>)}</div></div>
            <div className="creator-actions"><button className="quiet-button" onClick={() => setStep(1)}>← Back</button><span>Step 2 of 4</span><button className="pink-button" onClick={() => setStep(3)}>Continue <b>→</b></button></div>
          </div>}

          {step === 3 && <div className="creator-panel">
            <div className="panel-heading"><span className="eyebrow">STEP 03 · PERSONALITY</span><h2>What makes them, them?</h2><p>Pick up to four traits and add a short description.</p></div>
            <div className="option-section"><b>Personality traits <small>{selectedTraits.length}/4 selected</small></b><div className="chips trait-chips">{traits.map(v => <button key={v} className={selectedTraits.includes(v) ? "chip selected" : "chip"} onClick={() => toggleTrait(v)}>{selectedTraits.includes(v) ? "✓ " : "+ "}{v}</button>)}</div></div>
            <label className="field-label">Character description<textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={4} placeholder="A little about their personality, interests and world..." /></label>
            <div className="creator-actions"><button className="quiet-button" onClick={() => setStep(2)}>← Back</button><span>Step 3 of 4</span><button className="pink-button" onClick={() => setStep(4)}>Review <b>→</b></button></div>
          </div>}

          {step === 4 && <div className="creator-panel review-panel">
            <div className="panel-heading"><span className="eyebrow">STEP 04 · REVIEW</span><h2>Meet your new soul</h2><p>Review your character profile before saving.</p></div>
            <div className="review-preview"><div className="preview-avatar"><span>✧</span></div><h3>{name.trim() || "Your Soul"}</h3><p className="preview-subtitle">{style} · Female · Age {age || "25"}</p><p className="preview-bio">{bio || "A warm, curious soul who makes every conversation feel special."}</p><div className="chips centered-chips"><span className="chip">{hair}</span><span className="chip">{eyes}</span><span className="chip">{build}</span></div><div className="review-divider" /><b className="review-label">PERSONALITY</b><div className="chips centered-chips">{selectedTraits.map(t => <span className="chip" key={t}>{t}</span>)}</div></div>
            <div className="local-note">Drafts are saved on this device only. AI portrait generation uses the connected provider and is subject to moderation and availability.</div>
            <div className="creator-actions"><button className="quiet-button" onClick={() => setStep(3)}>← Back</button><span>Step 4 of 4</span><button className="pink-button" onClick={createCharacter}>Save draft ✦</button></div>
          </div>}
        </section>}

        {tab === "discover" && <section className="browse-page"><div className="create-kicker">YOUR STORY STARTS HERE</div><h1>Meet your next <em>favorite soul.</em></h1><p className="lead">Discover original fictional adult characters, or create someone entirely your own.</p><input className="search-field" aria-label="Search characters" value={search} onChange={e => setSearch(e.target.value)} placeholder="⌕  Search characters or styles..." /><div className="section-title"><div><h2>Discover souls</h2><p>Find a new personality to explore.</p></div><button onClick={startCreate}>Create yours +</button></div><div className="character-grid">{visible.map(c => <article className="character-card" key={c.id}><div className="character-image"><img src={c.image} alt={"Portrait of adult character " + c.name} /><span>{c.style} · {c.age}+</span></div><div className="character-info"><h3>{c.name}</h3><small>{c.tagline}</small><p>{c.bio}</p><button className="soft-button" onClick={() => { setActive(c); setMessages([]); setTab("chat"); }}>Meet {c.name} ↗</button></div></article>)}</div></section>}

        {tab === "studio" && <section className="studio-page"><div className="create-kicker">IMAGE STUDIO</div><h1>Bring your soul <em>to life.</em></h1><p className="lead">Create an original portrait of a clearly adult fictional character.</p><div className="studio-panel"><div className="studio-character"><img src={active.image} alt={"Current character " + active.name} /><div><b>{active.name}</b><small>Age {active.age} · {active.style}</small><button className="quiet-button" onClick={() => setTab("mine")}>Choose another</button></div></div><form onSubmit={checkPrompt}><label className="field-label">Describe your portrait<textarea required value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={1200} rows={5} placeholder="Example: Adult anime woman, age 25, elegant outfit, moonlit fantasy garden, detailed illustration..." /></label><button className="pink-button full-button" type="submit" disabled={generating}>{generating ? "Generating your portrait…" : "✧ Generate portrait"}</button></form>{generatedImage && <div className="generated-result"><img src={generatedImage} alt={"Generated portrait of " + active.name} /><a href={generatedImage} target="_blank" rel="noreferrer">Open full image ↗</a></div>}<p className="fine-print">Adult fictional characters only. Non-explicit portraits and scenes. Provider moderation and usage limits apply.</p></div></section>}

        {tab === "chat" && <section className="chat-page"><div className="create-kicker">YOUR CONVERSATION</div><h1>Say hello to <em>{active.name}.</em></h1><div className="studio-panel chat-panel"><div className="studio-character"><img src={active.image} alt={active.name} /><div><b>{active.name}</b><small>Fictional adult character · age {active.age}</small></div></div><div className="chat-history">{messages.length ? messages.map((m,i)=><p key={i} className="chat-message">{m}</p>) : <p className="chat-welcome">Start a conversation with {active.name}. Chat replies are not connected to an AI service yet.</p>}</div><form className="chat-form" onSubmit={sendMessage}><input value={draft} onChange={e => setDraft(e.target.value)} placeholder={"Message " + active.name + "..."} /><button className="pink-button" type="submit">Send</button></form></div></section>}

        {tab === "mine" && <section className="browse-page"><div className="create-kicker">YOUR COLLECTION</div><h1>My <em>souls.</em></h1><p className="lead">Your saved character drafts on this device.</p><div className="section-title"><div><h2>Saved characters</h2><p>{characters.length} characters in your collection</p></div><button onClick={startCreate}>Create new +</button></div><div className="character-grid">{characters.map(c => <article className="character-card" key={c.id}><div className="character-image"><img src={c.image} alt={"Portrait of " + c.name} /><span>{c.style} · {c.age}+</span></div><div className="character-info"><h3>{c.name}</h3><small>{c.tagline}</small><p>{c.bio}</p><button className="soft-button" onClick={() => { setActive(c); setTab("studio"); }}>Generate portrait ↗</button></div></article>)}</div></section>}
        {notice && <div role="status" className="notice">{notice}<button aria-label="Dismiss" onClick={() => setNotice("")}>×</button></div>}
      </div>
    </div>

    <nav className="bottom-nav" aria-label="Main navigation">{navItems.map(item => <button key={item.id} className={tab === item.id ? "bottom-link active" : "bottom-link"} onClick={() => { setTab(item.id); setNotice(""); }}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>
    <div className="mobile-safe-space" />
  </main>;
}
