import Link from "next/link";

export const metadata = {
  title: "Plans | Soul Studio",
  description: "Preview planned Soul Studio membership tiers.",
};

const plans = [
  { name: "Starter", price: "$20", description: "For getting to know your Souls.", features: ["Companion discovery", "Character creation preview", "Browser voice playback"] },
  { name: "Plus", price: "$40", description: "For a more creative companion experience.", features: ["Everything in Starter", "Expanded planned usage", "Creative tools when available"], featured: true },
  { name: "Ultimate", price: "$70", description: "For frequent creators and storytellers.", features: ["Everything in Plus", "Highest planned usage", "Priority access when available"] },
];

const panel: React.CSSProperties = { background: "rgba(255,255,255,.055)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, padding: 22 };

export default function PricingPage() {
  return <main style={{ minHeight: "100vh", padding: "32px clamp(16px,4vw,48px)", color: "#f7f4ff", background: "radial-gradient(ellipse at top left,#28204b 0%,#11101b 44%,#0a0a12 100%)", fontFamily: "Inter,ui-sans-serif,system-ui,sans-serif" }}>
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <Link href="/" style={{ color: "#c5b6ff", textDecoration: "none" }}>← Back to Soul</Link>
      <header style={{ textAlign: "center", padding: "48px 0 30px" }}>
        <div style={{ color: "#c5b6ff", letterSpacing: 3, fontSize: 11 }}>PLANNED MEMBERSHIPS · PAYMENTS OFF</div>
        <h1 style={{ fontSize: "clamp(32px,5vw,52px)", margin: "12px 0" }}>Choose your Soul plan</h1>
        <p style={{ color: "#c4bfd5", maxWidth: 660, margin: "0 auto", lineHeight: 1.7 }}>These are preview tiers only. Checkout and subscriptions are not enabled.</p>
      </header>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 16 }}>
        {plans.map(plan => <article key={plan.name} style={{ ...panel, borderColor: plan.featured ? "#9b83ee" : "rgba(255,255,255,.12)", display: "flex", flexDirection: "column", gap: 12 }}>
          {plan.featured && <div style={{ color: "#d8ccff", fontSize: 11, letterSpacing: 2 }}>MOST POPULAR</div>}
          <h2 style={{ margin: 0, fontSize: 22 }}>{plan.name}</h2>
          <div><strong style={{ fontSize: 42 }}>{plan.price}</strong><span style={{ color: "#bdb5cf" }}> / planned month</span></div>
          <p style={{ color: "#c4bfd5", margin: 0, lineHeight: 1.6 }}>{plan.description}</p>
          <ul style={{ color: "#d8d2e5", lineHeight: 1.9, paddingLeft: 20 }}>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
          <span style={{ color: "#d8ccff", fontSize: 13 }}>Preview only — no payment button</span>
        </article>)}
      </section>
    </div>
  </main>;
}
