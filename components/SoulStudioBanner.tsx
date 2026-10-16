'use client';

import Link from 'next/link';

export default function SoulStudioBanner() {
  return (
    <aside className="soul-studio-entry" aria-label="Soul Studio character creator">
      <div>
        <span className="soul-studio-kicker">NEW · SOUL STUDIO</span>
        <strong>Bring your character to life</strong>
        <span className="soul-studio-copy">Shape their look, personality and story in one place.</span>
      </div>
      <Link href="/character-creator" className="soul-studio-link">Open creator <span aria-hidden="true">↗</span></Link>
      <style jsx>{`
        .soul-studio-entry{position:relative;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:12px clamp(14px,4vw,36px);background:linear-gradient(100deg,#17111f,#241329 58%,#35162d);border-bottom:1px solid #6f2b69;color:#fff}
        .soul-studio-entry>div{display:grid;gap:3px}
        .soul-studio-kicker{font-size:10px;font-weight:800;letter-spacing:1.8px;color:#f0a1e5}
        .soul-studio-entry strong{font-size:14px;letter-spacing:-.2px}
        .soul-studio-copy{font-size:12px;color:#c9b8d0}
        .soul-studio-link{display:inline-flex;align-items:center;gap:10px;border:1px solid #d76bd0;border-radius:999px;padding:9px 14px;color:#fff;background:linear-gradient(100deg,#9b3d9b,#d64d9f);text-decoration:none;font-size:12px;font-weight:750;white-space:nowrap}
        .soul-studio-link:hover{filter:brightness(1.12)}
        @media(max-width:480px){.soul-studio-entry{gap:10px}.soul-studio-copy{max-width:250px}.soul-studio-link{padding:8px 12px}}
      `}</style>
    </aside>
  );
}
