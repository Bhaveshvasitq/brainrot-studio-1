import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soul Studio After Dark — Adult Discovery',
  description: 'An 18+ directory for discovering adult video platforms, hentai, mature manga, and creator publishers through external links.',
};

export default function RootLayout({children}:{readonly children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
