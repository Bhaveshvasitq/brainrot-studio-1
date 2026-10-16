import Link from "next/link";

const references = [
  {
    name: "OurDream AI",
    url: "https://ourdream.ai/",
    focus: "Character creation, companion chat, images, voice and short video",
    note: "Primary product reference for a unified multimodal companion experience.",
  },
  {
    name: "OurDream — character creator",
    url: "https://main.ourdream.ai/create",
    focus: "Character appearance, personality, voice and relationship setup",
    note: "Useful reference for the character creation flow.",
  },
  {
    name: "GPTGirlfriend",
    url: "https://www.gptgirlfriend.org/",
    focus: "Custom AI characters and chat",
    note: "Reference for a quick character-to-chat journey.",
  },
  {
    name: "GPTGirlfriend — create",
    url: "https://www.gptgirlfriend.org/create",
    focus: "Character builder with name, personality, description and greeting",
    note: "Useful reference for a simple creator form.",
  },
  {
    name: "GPT Girlfriend",
    url: "https://www.gptgirlfriend.art/",
    focus: "AI companion personas, chat and multimodal positioning",
    note: "Independent site with a similar category and feature positioning.",
  },
  {
    name: "GirlfriendGPT",
    url: "https://www.girlfriendsgpt.com/",
    focus: "AI companion discovery, chat and custom companions",
    note: "Reference for browsing and onboarding.",
  },
  {
    name: "GirlfriendGPT Online",
    url: "https://www.gptgirlfriend.online/",
    focus: "AI companion chat and roleplay",
    note: "Another service in the broader AI companion category.",
  },
  {
    name: "OurDream AI — video and character examples",
    url: "https://land.ourdream.ai/",
    focus: "Character consistency, image generation and video concepts",
    note: "Useful for understanding how image and video features are presented together.",
  },
];

const panel: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(255,255,255,.055)",
  borderRadius: 18,
  padding: 20,
};

export default function InspirationPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px clamp(16px,4vw,48px)", color: "#f7f4ff", background: "radial-gradient(ellipse at top left, #28204b 0%, #11101b 44%, #0a0a12 100%)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#c5b6ff", textDecoration: "none" }}>← Back to Soul</Link>
        <header style={{ padding: "38px 0 24px" }}>
          <div style={{ color: "#c5b6ff", letterSpacing: 3, fontSize: 11 }}>PRODUCT RESEARCH</div>
          <h1 style={{ fontSize: "clamp(30px,5vw,46px)", margin: "12px 0" }}>AI companion platforms</h1>
          <p style={{ color: "#c4bfd5", lineHeight: 1.75, maxWidth: 760 }}>
            A curated list of public websites in the AI companion category for product research. These are independent services, not Soul partners or integrations. Links open their own websites.
          </p>
        </header>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 14 }}>
          {references.map((item) => (
            <article key={item.url} style={{ ...panel, display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{item.name}</h2>
              <div style={{ color: "#d9d1ec", fontSize: 14 }}>{item.focus}</div>
              <p style={{ margin: 0, color: "#aaa3bd", fontSize: 13, lineHeight: 1.65 }}>{item.note}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#d4c7ff", overflowWrap: "anywhere" }}>{item.url} ↗</a>
            </article>
          ))}
        </section>
        <section style={{ ...panel, marginTop: 18, color: "#c4bfd5", lineHeight: 1.75 }}>
          <h2 style={{ color: "#f7f4ff", marginTop: 0 }}>How we use these references</h2>
          <p style={{ marginBottom: 0 }}>We can learn from public feature flows and pricing presentation, but Soul should keep its own design, code, branding and original characters. These links are not endorsements. Check each site's current terms, privacy policy and age requirements before using it.</p>
        </section>
      </div>
    </main>
  );
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Tool = {
  name: string;
  url: string;
  description: string;
  features: string[];
  access: string;
  kind: 'Hosted site' | 'Open source';
};

const tools: Tool[] = [
  { name: 'OurDream AI', url: 'https://ourdream.ai/', description: 'AI companion discovery, character creation and creative media.', features: ['Chat', 'Characters', 'Images', 'Creative media'], access: 'Check current free credits and plan limits', kind: 'Hosted site' },
  { name: 'OurDream character creator', url: 'https://main.ourdream.ai/create', description: 'Direct entry to character setup and personalization.', features: ['Characters', 'Personality setup'], access: 'Uses OurDream account and current plan limits', kind: 'Hosted site' },
  { name: 'GPTGirlfriend.org', url: 'https://www.gptgirlfriend.org/', description: 'Custom companion personas and chat.', features: ['Chat', 'Characters', 'Roleplay'], access: 'Limited access may be available; verify current terms', kind: 'Hosted site' },
  { name: 'GPTGirlfriend creator', url: 'https://www.gptgirlfriend.org/create', description: 'Direct entry to character creation and greeting setup.', features: ['Characters', 'Personality setup'], access: 'Check current account and plan limits', kind: 'Hosted site' },
  { name: 'GPT Girlfriend', url: 'https://www.gptgirlfriend.art/', description: 'AI companion personas and creative chat.', features: ['Chat', 'Characters'], access: 'Check current free allowance', kind: 'Hosted site' },
  { name: 'GPT Girlfriend image generator', url: 'https://gpt-girlfriend.art/image-generator/', description: 'Image-generation entry point; availability and credits can change.', features: ['Images'], access: 'Check current starter credits and generation limits', kind: 'Hosted site' },
  { name: 'GirlfriendGPT', url: 'https://www.girlfriendsgpt.com/', description: 'Companion discovery and personalized conversation.', features: ['Chat', 'Characters', 'Roleplay'], access: 'Check current free tier and plan limits', kind: 'Hosted site' },
  { name: 'GPTGirlfriend Online', url: 'https://www.gptgirlfriend.online/', description: 'AI companion chat and roleplay.', features: ['Chat', 'Roleplay'], access: 'Check current free tier and plan limits', kind: 'Hosted site' },
  { name: 'Character.AI', url: 'https://character.ai/', description: 'Character-based conversations and community-created personas.', features: ['Chat', 'Characters', 'Roleplay'], access: 'Free-to-start; content and feature rules apply', kind: 'Hosted site' },
  { name: 'Nomi AI', url: 'https://nomi.ai/', description: 'Personal AI companion conversations and relationship-style interactions.', features: ['Chat', 'Memory'], access: 'Check current free message allowance', kind: 'Hosted site' },
  { name: 'Kindroid', url: 'https://kindroid.ai/', description: 'Custom AI companions with personalization and memory features.', features: ['Chat', 'Characters', 'Memory', 'Voice'], access: 'Check current free allowance and feature limits', kind: 'Hosted site' },
  { name: 'CrushOn AI', url: 'https://crushon.ai/', description: 'Character chat and roleplay with plan-dependent limits.', features: ['Chat', 'Characters', 'Roleplay'], access: 'Free-to-start may be limited; check current terms', kind: 'Hosted site' },
  { name: 'Replika', url: 'https://replika.com/', description: 'AI companion chat and selected relationship or wellness features.', features: ['Chat', 'Memory', 'Voice'], access: 'Basic features may be free; some features require a subscription', kind: 'Hosted site' },
  { name: 'SpicyChat AI', url: 'https://spicychat.ai/', description: 'Character-based roleplay and community personas.', features: ['Chat', 'Characters', 'Roleplay'], access: 'Free-to-start with possible usage limits', kind: 'Hosted site' },
  { name: 'Talkie AI', url: 'https://www.talkie-ai.com/', description: 'Character discovery and interactive conversations.', features: ['Chat', 'Characters', 'Images'], access: 'Free-to-start; credits and features may vary', kind: 'Hosted site' },
  { name: 'SillyTavern', url: 'https://github.com/SillyTavern/SillyTavern', description: 'Free open-source chat interface that can connect to compatible local models or providers. Setup is more technical and model access may have separate costs.', features: ['Chat', 'Characters', 'Roleplay', 'Open source', 'Local models'], access: 'Free software; model or hosting costs depend on your setup', kind: 'Open source' },
];

const filters = ['All features', 'Chat', 'Characters', 'Images', 'Voice', 'Video', 'Memory', 'Roleplay', 'Open source'];

export default function InspirationPage() {
  const [query, setQuery] = useState('');
  const [feature, setFeature] = useState('All features');
  const visibleTools = useMemo(() => tools.filter((tool) => {
    const matchesQuery = (tool.name + ' ' + tool.description + ' ' + tool.features.join(' ')).toLowerCase().includes(query.toLowerCase());
    const matchesFeature = feature === 'All features' || tool.features.includes(feature);
    return matchesQuery && matchesFeature;
  }), [query, feature]);

  const inputStyle = { width: '100%', boxSizing: 'border-box' as const, padding: '13px 15px', border: '1px solid #eadfec', borderRadius: 13, background: '#fff', color: '#35263a', font: 'inherit' };
  const muted = { color: '#806e85', lineHeight: 1.65 };

  return <main style={{ minHeight: '100vh', padding: '28px clamp(16px,4vw,48px)', color: '#35263a', background: '#fff9ff', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <Link href="/" style={{ color: '#a366b7', textDecoration: 'none' }}>← Back to Soul</Link>
      <header style={{ padding: '34px 0 24px' }}>
        <div style={{ color: '#a366b7', letterSpacing: 3, fontSize: 11, fontWeight: 800 }}>SOUL TOOL DIRECTORY</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,46px)', letterSpacing: '-1.5px', margin: '12px 0' }}>Explore AI companion tools</h1>
        <p style={{ ...muted, maxWidth: 790 }}>Explore 16 companion sites and tools in one place. Search by feature, compare the options, and open each service in a new tab. These are independent third-party services, not built-in Soul integrations.</p>
      </header>

      <section aria-label="Search and filter tools" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))', gap: 12, marginBottom: 18 }}>
        <input aria-label="Search tools" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chat, image, voice, memory..." style={inputStyle} />
        <select aria-label="Filter by feature" value={feature} onChange={(event) => setFeature(event.target.value)} style={inputStyle}>
          {filters.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </section>

      <div style={{ ...muted, fontSize: 13, marginBottom: 14 }}>{visibleTools.length} of {tools.length} tools · Choose a feature filter to narrow the list.</div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,285px),1fr))', gap: 14 }}>
        {visibleTools.map((tool) => <article key={tool.url} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid #eee2f1', background: '#fff', borderRadius: 18, padding: 20, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{ borderRadius: 999, padding: '5px 9px', background: tool.kind === 'Open source' ? '#e5f7ed' : '#f5e8fb', color: tool.kind === 'Open source' ? '#28734b' : '#9255a4', fontSize: 11, fontWeight: 750 }}>{tool.kind}</span>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 19 }}>{tool.name}</h2>
          <p style={{ ...muted, fontSize: 14, margin: '0 0 12px' }}>{tool.description}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {tool.features.map((item) => <span key={item} style={{ border: '1px solid #eee2f1', borderRadius: 999, padding: '4px 8px', fontSize: 11, color: '#735e79', background: '#fffaff' }}>{item}</span>)}
          </div>
          <p style={{ color: '#8b6d49', background: '#fff8e9', borderRadius: 10, padding: 10, fontSize: 12, lineHeight: 1.55, margin: 'auto 0 14px', width: '100%', boxSizing: 'border-box' }}>{tool.access}</p>
          <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff', background: 'linear-gradient(100deg,#a779dd,#d88bc1)', borderRadius: 11, padding: '10px 13px', textDecoration: 'none', fontWeight: 750, fontSize: 13 }}>Visit official site ↗</a>
        </article>)}
      </section>

      {visibleTools.length === 0 && <p style={{ ...muted, background: '#fff', border: '1px solid #eee2f1', borderRadius: 16, padding: 22 }}>No tools match that search. Try another keyword or choose “All features”.</p>}

      <section style={{ border: '1px solid #eee2f1', background: '#fff', borderRadius: 18, padding: 20, marginTop: 20, ...muted }}>
        <h2 style={{ color: '#35263a', marginTop: 0, fontSize: 19 }}>Free access and feature notes</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Free plans, trials, credits and feature limits are controlled by each provider and may change. Check its current pricing and terms before creating an account.</li>
          <li>Opening a provider from Soul does not sign you in, create an account, grant premium access, or share your Soul account.</li>
          <li>Voice, video and image features are shown only where they are commonly associated with the service; this directory does not mean every tool includes every feature.</li>
          <li>For a no-subscription route, SillyTavern is open-source software. Running a local model still requires compatible hardware and setup, and third-party model APIs can cost money.</li>
          <li>Use these services in line with their age requirements, privacy policies and content rules. Soul is not affiliated with the listed services.</li>
        </ul>
      </section>
    </div>
  </main>;
}
