import Link from "next/link";

const references = [
  { name: "OurDream AI", url: "https://ourdream.ai/", focus: "Character creation, companion chat and creative media" },
  { name: "Character.AI", url: "https://character.ai/", focus: "Character-based conversations and community personas" },
  { name: "Nomi AI", url: "https://nomi.ai/", focus: "Personal AI companion conversations" },
  { name: "Kindroid", url: "https://kindroid.ai/", focus: "Custom companions and personalization" },
  { name: "SillyTavern", url: "https://github.com/SillyTavern/SillyTavern", focus: "Open-source chat interface for compatible models" },
];

export default function InspirationPage() {
  return <main style={{ minHeight: "100vh", padding: "28px clamp(16px,4vw,48px)", color: "#f7f4ff", background: "radial-gradient(ellipse at top left,#28204b 0%,#11101b 44%,#0a0a12 100%)", fontFamily: "Inter,ui-sans-serif,system-ui,sans-serif" }}>
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <Link href="/" style={{ color: "#c5b6ff", textDecoration: "none" }}>← Back to Soul</Link>
      <header style={{ padding: "38px 0 24px" }}><div style={{ color: "#c5b6ff", letterSpacing: 3, fontSize: 11 }}>PRODUCT RESEARCH</div><h1 style={{ fontSize: "clamp(30px,5vw,46px)", margin: "12px 0" }}>AI companion platforms</h1><p style={{ color: "#c4bfd5", lineHeight: 1.75, maxWidth: 760 }}>Independent public services for product research. These are not Soul integrations or endorsements.</p></header>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 14 }}>
        {references.map(item => <article key={item.url} style={{ border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.055)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{item.name}</h2><p style={{ color: "#c4bfd5", lineHeight: 1.6, margin: 0 }}>{item.focus}</p><a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#d4c7ff", overflowWrap: "anywhere" }}>Visit official site ↗</a>
        </article>)}
      </section>
    </div>
  </main>;
}
