import Link from 'next/link';

const sites = [
  { name: 'OurDream AI', url: 'https://ourdream.ai/', focus: 'AI companions, character creation and creative media' },
  { name: 'OurDream character creator', url: 'https://main.ourdream.ai/create', focus: 'Character setup and personalization' },
  { name: 'GPTGirlfriend', url: 'https://www.gptgirlfriend.org/', focus: 'Custom AI characters and chat' },
  { name: 'GPTGirlfriend creator', url: 'https://www.gptgirlfriend.org/create', focus: 'Character name, personality and greeting setup' },
  { name: 'GPT Girlfriend', url: 'https://www.gptgirlfriend.art/', focus: 'AI companion personas and chat' },
  { name: 'GirlfriendGPT', url: 'https://www.girlfriendsgpt.com/', focus: 'Companion discovery and personalized chat' },
  { name: 'GPTGirlfriend Online', url: 'https://www.gptgirlfriend.online/', focus: 'AI companion chat and roleplay' },
];

export default function InspirationPage() {
  return <main style={{ minHeight: '100vh', padding: '28px clamp(16px,4vw,48px)', color: '#35263a', background: '#fff9ff', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <Link href="/" style={{ color: '#a366b7', textDecoration: 'none' }}>← Back to Soul</Link>
      <header style={{ padding: '34px 0 24px' }}>
        <div style={{ color: '#a366b7', letterSpacing: 3, fontSize: 11 }}>PRODUCT RESEARCH</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,46px)', margin: '12px 0' }}>AI companion platforms</h1>
        <p style={{ color: '#806e85', lineHeight: 1.75, maxWidth: 760 }}>Public websites in the AI companion category for product research. These are independent services, not Soul partners or integrations.</p>
      </header>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 14 }}>
        {sites.map(site => <article key={site.url} style={{ border: '1px solid #eee2f1', background: '#fff', borderRadius: 18, padding: 20 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 20 }}>{site.name}</h2>
          <p style={{ color: '#806e85', fontSize: 14, lineHeight: 1.6 }}>{site.focus}</p>
          <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: '#a366b7', overflowWrap: 'anywhere' }}>{site.url} ↗</a>
        </article>)}
      </section>
      <section style={{ border: '1px solid #eee2f1', background: '#fff', borderRadius: 18, padding: 20, marginTop: 18, color: '#806e85', lineHeight: 1.75 }}>
        <h2 style={{ color: '#35263a', marginTop: 0 }}>Research responsibly</h2>
        <p style={{ marginBottom: 0 }}>Use these sites to compare public feature flows and pricing. Soul should keep its own design, code, branding and original characters. Verify each site's current terms, privacy policy and age requirements before use.</p>
      </section>
    </div>
  </main>;
}
