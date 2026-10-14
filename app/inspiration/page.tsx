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
}
