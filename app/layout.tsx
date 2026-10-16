import './globals.css';
import type { Metadata } from 'next';
import SoulStudioBanner from '@/components/SoulStudioBanner';

export const metadata: Metadata = {
  title: 'Soul — AI Companions',
  description: 'Discover, create and chat with original AI companions.',
};

export default function RootLayout({children}:{readonly children:React.ReactNode}){
  return <html lang="en"><body><SoulStudioBanner />{children}</body></html>;
}
