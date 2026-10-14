import Link from 'next/link';

export const metadata = {
  title: 'Plans | Soul',
  description: 'Choose a monthly Soul plan for AI companion chat and creative media.',
};

const plans = [
  {
    name: 'Starter',
    price: 20,
    description: 'For getting to know your favorite companions.',
    features: ['AI companion chat', 'Create and save characters', 'Standard image allowance', 'Basic voice features'],
  },
  {
    name: 'Pro',
    price: 40,
    description: 'For deeper stories and more creative freedom.',
    features: ['Everything in Starter', 'Higher chat and image allowances', 'Enhanced character memory', 'Premium voice options'],
    featured: true,
  },
  {
    name: 'Ultimate',
    price: 70,
    description: 'For the full companion and media experience.',
    features: ['Everything in Pro', 'Highest usage allowance', 'Video generation access', 'Priority media processing'],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#31214a_0%,_#171323_45%,_#100e18_100%)] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-tight">✦ Soul<span className="text-fuchsia-300">.</span></Link>
          <Link href="/" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">Back to companions</Link>
        </header>

        <section className="mx-auto max-w-3xl py-16 text-center sm:py-20">
          <p className="mb-4 inline-flex rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">Memberships</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">More room for your imagination.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg">Choose a monthly plan for companion conversations and creative tools. Clear limits, no surprise paid AI calls.</p>
          <p className="mt-4 text-sm text-white/45">All prices are in USD and billed monthly.</p>
        </section>

        <section className="grid gap-5 pb-10 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative flex flex-col rounded-3xl border p-6 sm:p-7 ${plan.featured ? 'border-fuchsia-300/70 bg-fuchsia-300/[0.09] shadow-[0_0_55px_rgba(217,70,239,0.12)]' : 'border-white/10 bg-white/[0.04]'}`}>
              {plan.featured && <span className="absolute -top-3 left-6 rounded-full bg-fuchsia-300 px-3 py-1 text-xs font-bold text-[#20132a]">Most popular</span>}
              <h2 className="text-lg font-bold">{plan.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-white/60">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-2"><span className="text-5xl font-black tracking-tight">${plan.price}</span><span className="text-sm text-white/55">/ month</span></div>
              <div className="my-6 h-px bg-white/10" />
              <ul className="flex-1 space-y-3 text-sm text-white/80">
                {plan.features.map((feature) => <li key={feature} className="flex gap-3"><span className="text-fuchsia-300">✓</span><span>{feature}</span></li>)}
              </ul>
              <Link href="/" className={`mt-8 block rounded-xl px-4 py-3 text-center text-sm font-bold transition ${plan.featured ? 'bg-fuchsia-300 text-[#20132a] hover:bg-fuchsia-200' : 'border border-white/15 bg-white/[0.06] hover:bg-white/10'}`}>Explore Soul</Link>
            </article>
          ))}
        </section>

        <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/60 sm:p-6">
          <h2 className="mb-2 font-bold text-white">Transparent launch status</h2>
          Subscription checkout is not connected yet. These cards show the intended monthly packages; they do not charge you or start a subscription. Generation limits will be published after model costs are measured. No paid AI provider or payment service is activated by this page.
        </section>
        <footer className="py-10 text-center text-xs text-white/35">Soul · Built for imagination, with clear usage limits.</footer>
      </div>
    </main>
  );
}
