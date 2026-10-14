import Link from 'next/link';

export const metadata = {
  title: 'Plans | Soul',
  description: 'Choose a monthly Soul plan for AI companion chat and creative media.',
};

const plans = [
  { name: 'Starter', price: 20, description: 'For getting to know your favorite companions.', features: ['AI companion chat', 'Create and save characters', 'Standard image allowance', 'Basic voice features'] },
  { name: 'Pro', price: 40, description: 'For deeper stories and more creative freedom.', features: ['Everything in Starter', 'Higher chat and image allowances', 'Enhanced character memory', 'Premium voice options'], featured: true },
  { name: 'Ultimate', price: 70, description: 'For the full companion and media experience.', features: ['Everything in Pro', 'Highest usage allowance', 'Video generation access', 'Priority media processing'] },
];

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', padding: '28px clamp(16px,4vw,54px)', color: '#fff', background: 'radial-gradient(ellipse at top, #39244e 0%, #191422 48%, #100e17 100%)', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  header: { maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  link: { color: '#fff', textDecoration: 'none', border: '1px solid #ffffff2b', borderRadius: 999, padding: '10px 16px', fontSize: 13 },
  hero: { maxWidth: 780, margin: '0 auto', padding: '76px 0 48px', textAlign: 'center' },
  eyebrow: { display: 'inline-block', border: '1px solid #e7a7f344', background: '#e879f911', color: '#efb9ff', borderRadius: 999, padding: '8px 13px', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' },
  h1: { fontSize: 'clamp(38px,6vw,66px)', lineHeight: 1.03, letterSpacing: '-2.5px', margin: '22px 0 16px', fontWeight: 900 },
  sub: { maxWidth: 600, margin: '0 auto', color: '#c5bacd', lineHeight: 1.8, fontSize: 16 },
  grid: { maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,270px),1fr))', gap: 18, alignItems: 'stretch' },
  footnote: { maxWidth: 850, margin: '24px auto 0', padding: 20, border: '1px solid #ffffff20', borderRadius: 18, background: '#00000020', color: '#bdb2c7', fontSize: 12, lineHeight: 1.8 },
};

export default function PricingPage() {
  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 22, fontWeight: 950, letterSpacing: '-.7px' }}>✦ Soul<span style={{ color: '#e8a3f5' }}>.</span></Link>
        <Link href="/" style={styles.link}>Back to companions</Link>
      </header>
      <section style={styles.hero}>
        <span style={styles.eyebrow}>Memberships · billed monthly</span>
        <h1 style={styles.h1}>More room for your imagination.</h1>
        <p style={styles.sub}>Choose a monthly plan for companion conversations and creative tools. Clear limits, no surprise paid AI calls.</p>
        <p style={{ color: '#94869f', fontSize: 12, marginTop: 16 }}>Prices in USD · Monthly billing</p>
      </section>
      <section style={styles.grid}>
        {plans.map((plan) => (
          <article key={plan.name} style={{ position: 'relative', display: 'flex', flexDirection: 'column', border: plan.featured ? '1px solid #e5a1f4' : '1px solid #ffffff20', borderRadius: 25, padding: 26, background: plan.featured ? 'linear-gradient(155deg,#472653aa,#ffffff0b)' : '#ffffff08', boxShadow: plan.featured ? '0 0 55px #d946ef16' : 'none' }}>
            {plan.featured && <span style={{ position: 'absolute', top: -12, left: 24, borderRadius: 999, background: '#efb5fb', color: '#28132d', padding: '6px 11px', fontSize: 10, fontWeight: 900 }}>MOST POPULAR</span>}
            <h2 style={{ margin: 0, fontSize: 18 }}>{plan.name}</h2>
            <p style={{ minHeight: 44, margin: '10px 0 0', color: '#bdb1c6', fontSize: 13, lineHeight: 1.7 }}>{plan.description}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 22 }}><span style={{ fontSize: 51, fontWeight: 950, letterSpacing: -2 }}>${plan.price}</span><span style={{ color: '#a99cb2', fontSize: 13 }}>/ month</span></div>
            <div style={{ height: 1, background: '#ffffff18', margin: '24px 0' }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'grid', gap: 15, color: '#e6dfe9', fontSize: 13 }}>
              {plan.features.map((feature) => <li key={feature} style={{ display: 'flex', gap: 10 }}><span style={{ color: '#e8a3f5', fontWeight: 900 }}>✓</span><span>{feature}</span></li>)}
            </ul>
            <Link href="/" style={{ display: 'block', marginTop: 28, textAlign: 'center', textDecoration: 'none', borderRadius: 12, padding: '13px 16px', fontSize: 13, fontWeight: 900, color: plan.featured ? '#24142c' : '#fff', background: plan.featured ? '#efb5fb' : '#ffffff0e', border: plan.featured ? '0' : '1px solid #ffffff25' }}>Explore Soul</Link>
          </article>
        ))}
      </section>
      <section style={styles.footnote}>
        <strong style={{ display: 'block', color: '#fff', marginBottom: 5 }}>Transparent launch status</strong>
        Subscription checkout is not connected yet. These cards show the intended monthly packages; they do not charge you or start a subscription. Generation limits will be published after model costs are measured. No paid AI provider or payment service is activated by this page.
      </section>
      <footer style={{ maxWidth: 1120, margin: '38px auto 0', textAlign: 'center', color: '#7f7388', fontSize: 11 }}>Soul · Built for imagination, with clear usage limits.</footer>
    </main>
  );
}
