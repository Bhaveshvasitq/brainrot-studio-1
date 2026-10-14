"use client";

import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$20",
    description: "For getting to know your Souls.",
    features: ["Companion chat", "Character discovery and creation", "Browser voice playback", "Monthly credit allowance to be finalized"],
  },
  {
    name: "Plus",
    price: "$40",
    description: "For a more creative companion experience.",
    features: ["Everything in Starter", "Higher planned chat allowance", "Expanded image-generation allowance when available", "Monthly credit allowance to be finalized"],
    featured: true,
  },
  {
    name: "Ultimate",
    price: "$70",
    description: "For frequent creators and storytellers.",
    features: ["Everything in Plus", "Highest planned usage allowance", "Priority access to eligible features", "Monthly credit allowance to be finalized"],
  },
];

const page: React.CSSProperties = {
  minHeight: "100vh",
  padding: "32px clamp(16px, 4vw, 48px)",
  color: "#f7f4ff",
  background: "radial-gradient(ellipse at top left, #28204b 0%, #11101b 44%, #0a0a12 100%)",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const panel: React.CSSProperties = {
  background: "rgba(255,255,255,.055)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 20,
  padding: 22,
};

export default function PricingPage() {
  return (
    <main style={page}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#c5b6ff", textDecoration: "none" }}>← Back to Soul</Link>
        <header style={{ textAlign: "center", padding: "48px 0 30px" }}>
          <div style={{ color: "#c5b6ff", letterSpacing: 3, fontSize: 11 }}>SIMPLE MONTHLY PLANS</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", margin: "12px 0" }}>Choose your Soul plan</h1>
          <p style={{ color: "#c4bfd5", maxWidth: 660, margin: "0 auto", lineHeight: 1.7 }}>
            Three planned tiers for chat and creative features. We will publish exact credit allowances after free-tier testing and cost checks.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
          {plans.map((plan) => (
            <article key={plan.name} style={{ ...panel, borderColor: plan.featured ? "#9b83ee" : "rgba(255,255,255,.12)", display: "flex", flexDirection: "column", gap: 12 }}>
              {plan.featured && <div style={{ color: "#d8ccff", fontSize: 11, letterSpacing: 2 }}>MOST POPULAR</div>}
              <h2 style={{ margin: 0, fontSize: 22 }}>{plan.name}</h2>
              <div><strong style={{ fontSize: 42 }}>{plan.price}</strong><span style={{ color: "#bdb5cf" }}> / month</span></div>
              <p style={{ color: "#c4bfd5", margin: 0, minHeight: 44, lineHeight: 1.6 }}>{plan.description}</p>
              <ul style={{ color: "#d8d2e5", lineHeight: 1.9, paddingLeft: 20, flex: 1 }}>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div style={{ borderRadius: 12, padding: 12, background: "rgba(255,193,139,.08)", color: "#f0d2a7", fontSize: 12, lineHeight: 1.6 }}>
                Planned tier · Checkout not connected · No payment will be taken
              </div>
              <Link href="/" style={{ textAlign: "center", padding: "11px 14px", borderRadius: 12, background: plan.featured ? "#7961c9" : "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", color: "#fff", textDecoration: "none" }}>
                Explore Soul
              </Link>
            </article>
          ))}
        </section>

        <section style={{ ...panel, marginTop: 20, color: "#c4bfd5", lineHeight: 1.75 }}>
          <h2 style={{ color: "#f7f4ff", marginTop: 0 }}>A transparent, milestone-first launch</h2>
          <p style={{ marginBottom: 8 }}>These prices are the planned monthly subscription prices: $20, $40 and $70. The payment system, credit deductions and paid AI providers are not enabled.</p>
          <p style={{ marginBottom: 0 }}>We will only connect a payment provider or activate a paid API after you approve the specific service and cost. Exact usage limits will be set after the first milestone passes testing.</p>
        </section>
      </div>
    </main>
  );
}
