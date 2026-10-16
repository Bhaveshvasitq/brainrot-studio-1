"use client";

import { useMemo, useState } from "react";

type Character = { id: string; name: string; age: number; tagline: string; bio: string; style: string; image: string };
const starters: Character[] = [
  { id: "luna", name: "Luna", age: 22, tagline: "Dreamy anime companion", bio: "A moonlit, thoughtful adult character who loves music and meaningful conversations.", style: "Anime", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85" },
  { id: "mika", name: "Mika", age: 25, tagline: "Playful creative spirit", bio: "An adult cosplayer with bright energy, a playful sense of humor, and creative ideas.", style: "Cosplay", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85" },
  { id: "aria", name: "Aria", age: 42, tagline: "Elegant mature companion", bio: "A confident adult character who enjoys books, art, and warm conversation.", style: "Elegant", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85" },
  { id: "yuki", name: "Yuki", age: 21, tagline: "Gamer and anime fan", bio: "An adult gamer who loves co-op adventures, anime, and friendly competition.", style: "Gamer", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85" },
];

export default function CompanionHub() {
  const [characters, setCharacters] = useState<Character[]>(starters);
  const [active, setActive] = useState<Character>(starters[0]);
  const [tab, setTab] = useState<"discover" | "create" | "studio" | "chat">("discover");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("18");
  const [style, setStyle] = useState("Anime");
  const [bio, setBio] = useState("");
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const visible = useMemo(() => characters.filter(c => (c.name + " " + c.tagline + " " + c.style).toLowerCase().includes(search.toLowerCase())), [characters, search]);

  function createCharacter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const years = Number(age);
    if (!name.trim()) { setNotice("Please enter a character name."); return; }
    if (!Number.isInteger(years) || years < 18) { setNotice("Characters must be 18 or older. Under-18 character image generation is not allowed."); return; }
    const character: Character = { id: crypto.randomUUID(), name: name.trim(), age: years, tagline: "Your original adult character", bio: bio.trim() || "An original fictional adult character created by you.", style, image: starters[(characters.length + 1) % starters.length].image };
    setCharacters(previous => [character, ...previous]); setActive(character); setTab("chat"); setMessages([ "Your character is ready. Image generation is a preview feature and is not connected yet." ]); setName(""); setBio(""); setNotice("");
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages(previous => [...previous, "You: " + draft.trim()]);
    setDraft("");
  }

  function checkPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = prompt.toLowerCase();
    if (/\\b(minor|underage|child|teen|schoolgirl|schoolboy|loli|shota)\\b/.test(value)) {
      setNotice("Blocked: prompts involving minors or youth-coded characters are not allowed.");
      return;
    }
    if (/\\b(explicit|nude|nsfw|sexual)\\b/.test(value) && active.age < 18) {
      setNotice("Blocked: explicit content is only allowed for clearly adult characters aged 18+.");
      return;
    }
    setNotice("Prompt safety check passed. Image generation is not connected yet, so no image was generated.");
  }

  const panel: React.CSSProperties = { background: "rgba(255,255,255,.78)", border: "1px solid #f0e4f2", borderRadius: 22, boxShadow: "0 10px 34px #56345c0d" };
  const button: React.CSSProperties = { border: "1px solid #eaddec", borderRadius: 12, padding: "10px 14px", background: "#fff", color: "#4b3652", cursor: "pointer", fontWeight: 700 };
  const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #eaddec", borderRadius: 12, padding: "12px 14px", background: "#fff", color: "#38283f", font: "inherit" };

  return <main style={{ minHeight: "100vh", padding: "20px 16px 100px", color: "#38283f", background: "linear-gradient(155deg,#fff9fc 0%,#f8f5ff 46%,#fff8f1 100%)", fontFamily: "Inter,ui-sans-serif,system-ui,sans-serif" }}>
    <header style={{ maxWidth: 1120, margin: "0 auto 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 15, color: "#fff", fontSize: 23, background: "linear-gradient(140deg,#b18ae8,#f4a6c5)" }}>✦</span><div><strong style={{ fontSize: 22 }}>Soul Studio</strong><div style={{ fontSize: 10, letterSpacing: 1.5, color: "#9b839e" }}>CREATE YOUR OWN WORLD</div></div></div>
      <nav style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{(["discover", "chat", "create", "studio"] as const).map(item => <button key={item} onClick={() => { setTab(item); setNotice(""); }} style={{ ...button, background: tab === item ? "#f3e5fb" : "#fff", color: tab === item ? "#9857ad" : "#6f5a75", textTransform: "capitalize" }}>{item === "chat" ? "Messages" : item}</button>)}</nav>
    </header>
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {tab === "discover" && <><section style={{ textAlign: "center", padding: "22px 0 28px" }}><div style={{ color: "#a66bb7", fontSize: 12, letterSpacing: 2, fontWeight: 800 }}>YOUR STORY STARTS HERE</div><h1 style={{ fontSize: "clamp(34px,6vw,58px)", lineHeight: 1.06, margin: "12px 0", letterSpacing: -2 }}>Meet your next <span style={{ color: "#b17bd0" }}>favorite soul.</span></h1><p style={{ color: "#8e7d93", maxWidth: 600, margin: "0 auto 20px", lineHeight: 1.7 }}>Discover original fictional adult characters and create your own. Character image generation is currently in preview.</p><input aria-label="Search characters" style={{ ...input, maxWidth: 600, borderRadius: 18, padding: 15 }} placeholder="Search characters or styles..." value={search} onChange={e => setSearch(e.target.value)} /></section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 16 }}>{visible.map(c => <article key={c.id} style={{ ...panel, overflow: "hidden" }}><div style={{ height: 285, position: "relative", background: "#f1e4f7" }}><img src={c.image} alt={"Portrait of fictional adult character " + c.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /><span style={{ position: "absolute", left: 12, top: 12, padding: "6px 10px", borderRadius: 999, background: "#ffffffdf", color: "#8c54a3", fontSize: 11, fontWeight: 800 }}>{c.style} · {c.age}+</span></div><div style={{ padding: 16 }}><h2 style={{ margin: "0 0 4px", fontSize: 20 }}>{c.name}</h2><div style={{ color: "#a276af", fontSize: 12, marginBottom: 8 }}>{c.tagline}</div><p style={{ color: "#786b80", fontSize: 13, lineHeight: 1.6, minHeight: 60 }}>{c.bio}</p><button onClick={() => { setActive(c); setMessages([]); setTab("chat"); }} style={{ ...button, width: "100%", background: "linear-gradient(100deg,#b18ae8,#f0a5c6)", color: "#fff", border: 0 }}>Meet {c.name} ↗</button></div></article>)}</section></>}
      {tab === "create" && <section style={{ ...panel, maxWidth: 680, margin: "28px auto", padding: 22 }}><h2 style={{ marginTop: 0 }}>Create an adult character</h2><p style={{ color: "#806e85", lineHeight: 1.65 }}>Characters must be 18+. Under-18 character images are prohibited. Image generation is not connected yet.</p><form onSubmit={createCharacter} style={{ display: "grid", gap: 14 }}><label>Name<input required value={name} onChange={e => setName(e.target.value)} maxLength={40} style={{ ...input, marginTop: 6 }} placeholder="Character name" /></label><label>Age (18 or older)<input required type="number" min={18} max={100} value={age} onChange={e => setAge(e.target.value)} style={{ ...input, marginTop: 6 }} /></label><label>Visual style<select value={style} onChange={e => setStyle(e.target.value)} style={{ ...input, marginTop: 6 }}>{["Anime", "Realistic", "Cosplay", "Gamer", "Fantasy", "Elegant", "Goth"].map(s => <option key={s}>{s}</option>)}</select></label><label>Bio<textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500} style={{ ...input, marginTop: 6, minHeight: 100 }} placeholder="Personality, interests and background" /></label><button type="submit" style={{ ...button, color: "#fff", border: 0, background: "linear-gradient(100deg,#a779dd,#d88bc1)" }}>Create character</button></form></section>}
      {tab === "chat" && <section style={{ ...panel, maxWidth: 760, margin: "28px auto", padding: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}><img src={active.image} alt={"Portrait of adult character " + active.name} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 18 }} /><div><h2 style={{ margin: 0 }}>{active.name}</h2><span style={{ color: "#8e7d93", fontSize: 12 }}>Fictional adult character · age {active.age}</span></div></div><p style={{ color: "#786b80" }}>{active.bio}</p><div style={{ minHeight: 100, display: "grid", gap: 8, marginBottom: 14 }}>{messages.map((m, i) => <p key={i} style={{ margin: 0, background: "#f7eff9", padding: 12, borderRadius: 12 }}>{m}</p>)}</div><form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}><input value={draft} onChange={e => setDraft(e.target.value)} style={input} placeholder={"Message " + active.name + "..."} /><button type="submit" style={button}>Send</button></form></section>}
      {tab === "studio" && <section style={{ ...panel, maxWidth: 760, margin: "28px auto", padding: 22 }}><h2 style={{ marginTop: 0 }}>Image studio</h2><p style={{ color: "#806e85", lineHeight: 1.65 }}>Safety rules: never depict minors or youth-coded characters. Any explicit-content prompt must specify a clearly adult character aged 18 or older. No image-generation provider is connected yet.</p><div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}><img src={active.image} alt={"Current adult character " + active.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 14 }} /><div><strong>{active.name}</strong><div style={{ fontSize: 12, color: "#806e85" }}>Age {active.age} · {active.style}</div></div></div><form onSubmit={checkPrompt} style={{ display: "grid", gap: 12 }}><textarea required value={prompt} onChange={e => setPrompt(e.target.value)} style={{ ...input, minHeight: 120 }} placeholder="Describe an adult character, outfit, setting, lighting and art style..." /><button type="submit" style={button}>Check prompt safety</button></form></section>}
      {notice && <p role="status" style={{ textAlign: "center", padding: 12, color: "#9857ad" }}>{notice}</p>}
    </div>
    <footer style={{ maxWidth: 1120, margin: "28px auto 0", borderTop: "1px solid #eee3f0", paddingTop: 18, color: "#a694ab", fontSize: 12 }}>Soul Studio · Adult fictional characters only · Under-18 image creation prohibited · Payments off</footer>
  </main>;
}
