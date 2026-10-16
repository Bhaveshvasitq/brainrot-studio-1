import CompanionHub from '@/components/CompanionHub';

export const dynamic = 'force-dynamic';

// OwnDream.ai production entrypoint. Keep provider-dependent features optional.
export default function Home() {
  return <CompanionHub />;
}
