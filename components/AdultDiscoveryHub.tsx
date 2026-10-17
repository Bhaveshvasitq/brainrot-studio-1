"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

type Kind = "all" | "video" | "hentai" | "manga" | "creator";
type Source = { name: string; kind: Exclude<Kind, "all">; description: string; url: string; tags: string[] };
type OpenVideo = { id: string; title: string; description: string; url: string; embedUrl: string | null; thumbnailUrl: string | null; duration: number | null; views: number | null; licence: string; channel: string };

const sources: Source[] = [
  { name: "Pornhub", kind: "video", description: "Adult video platform. Browse on the source site.", url: "https://www.pornhub.com/", tags: ["video", "adult", "clips"] },
  { name: "XVideos", kind: "video", description: "Adult video search and categories on the source site.", url: "https://www.xvideos.com/", tags: ["video", "adult", "clips"] },
  { name: "xHamster", kind: "video", description: "Adult video platform and creator pages.", url: "https://xhamster.com/", tags: ["video", "adult", "creators"] },
  { name: "RedTube", kind: "video", description: "Adult video platform with categories and clips.", url: "https://www.redtube.com/", tags: ["video", "adult", "clips", "categories"] },
  { name: "YouPorn", kind: "video", description: "Adult video platform and clip catalogue.", url: "https://www.youporn.com/", tags: ["video", "adult", "clips"] },
  { name: "Eporner", kind: "video", description: "Adult video search and category browsing on the provider site.", url: "https://www.eporner.com/", tags: ["video", "adult", "search", "clips"] },
  { name: "ManyVids", kind: "creator", description: "Creator marketplace for adult videos and digital content.", url: "https://www.manyvids.com/", tags: ["creator", "marketplace", "videos"] },
  { name: "FAKKU", kind: "manga", description: "Licensed adult manga and doujinshi; availability varies by region.", url: "https://www.fakku.net/", tags: ["licensed", "manga", "doujinshi"] },
  { name: "DLsite", kind: "hentai", description: "Digital marketplace for manga, games, audio, and indie works.", url: "https://www.dlsite.com/", tags: ["digital", "doujin", "games", "manga"] },
  { name: "Irodori Comics", kind: "manga", description: "Official English releases of independently published manga.", url: "https://irodoricomics.com/", tags: ["licensed", "english", "manga"] },
  { name: "JAST USA", kind: "hentai", description: "Publisher of adult visual novels and related digital titles.", url: "https://jastusa.com/", tags: ["publisher", "visual novels", "games"] },
  { name: "BOOK☆WALKER", kind: "manga", description: "Digital manga and light-novel store; catalogue and age restrictions vary.", url: "https://global.bookwalker.jp/", tags: ["store", "manga", "ebooks"] },
  { name: "OnlyFans", kind: "creator", description: "Subscription platform where creators publish and sell content.", url: "https://onlyfans.com/", tags: ["creator", "subscriptions", "official"] },
  { name: "Fansly", kind: "creator", description: "Creator subscription platform with creator-controlled access.", url: "https://fansly.com/", tags: ["creator", "subscriptions", "official"] },
  { name: "JustFor.fans", kind: "creator", description: "Creator platform for subscription and paid media.", url: "https://justfor.fans/", tags: ["creator", "subscriptions", "paid content"] },
  { name: "Clips4Sale", kind: "creator", description: "Marketplace for creator-published clips and digital media.", url: "https://www.clips4sale.com/", tags: ["creator", "marketplace", "clips"] },
  { name: "Adulttime", kind: "video", description: "Subscription adult video service; access and catalogue depend on region.", url: "https://www.adulttime.com/", tags: ["video", "subscription", "studio"] },
  { name: "Brazzers", kind: "video", description: "Adult video studio and subscription catalogue.", url: "https://www.brazzers.com/", tags: ["video", "studio", "subscription"] },
  { name: "Reality Kings", kind: "video", description: "Adult video studio catalogue and subscription service.", url: "https://www.realitykings.com/", tags: ["video", "studio", "subscription"] },
  { name: "BangBros", kind: "video", description: "Adult video studio network; availability may vary.", url: "https://www.bangbros.com/", tags: ["video", "studio", "clips"] },
  { name: "MangaGamer", kind: "hentai", description: "Publisher and store for visual novels, including mature titles.", url: "https://www.mangagamer.com/", tags: ["publisher", "visual novels", "games"] },
  { name: "Denpasoft", kind: "hentai", description: "Official digital store for visual novels and adult games.", url: "https://denpasoft.com/", tags: ["publisher", "visual novels", "games"] },
  { name: "MangaPlaza", kind: "manga", description: "Official digital manga platform; titles and age access vary.", url: "https://mangaplaza.com/", tags: ["licensed", "manga", "ebooks"] },
];

const categories: { id: Kind; label: string; description: string }[] = [
  { id: "all", label: "Everything", description: "Search across the directory" },
  { id: "video", label: "Adult video", description: "Video platforms" },
  { id: "hentai", label: "Hentai", description: "Anime-style adult works" },
  { id: "manga", label: "Hentai manga", description: "Digital manga and doujinshi" },
  { id: "creator", label: "Creators", description: "Creator and publisher platforms" },
];

export default function AdultDiscoveryHub() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [category, setCategory] = useState<Kind>("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [embedInput, setEmbedInput] = useState("");
  const [activeEmbed, setActiveEmbed] = useState("");
  const [openVideos, setOpenVideos] = useState<OpenVideo[]>([]);
  const [searching, setSearching] = useState(false);

  // Keep provider cards visible while a title/creator query is entered.
  // This directory has no provider catalogue API yet, so a title query must not
  // incorrectly hide every source card.
  const visibleSources = useMemo(() => {
    return sources.filter((source) => {
      if (category === "all") return true;
      if (category === "creator") return source.kind === "creator" || source.tags.includes("creator");
      return source.kind === category;
    });
  }, [category]);

  function searchWeb(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setNotice("Enter a title, genre, creator, or provider name to filter the catalogue.");
      return;
    }
    setSearching(true);
    setOpenVideos([]);
    fetch(`/api/open-videos?q=${encodeURIComponent(query.trim())}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Open video search failed.");
        return payload;
      })
      .then((payload) => {
        setOpenVideos(payload.results || []);
        setNotice(`Found ${(payload.results || []).length} open-licensed videos. Review each video's licence and creator attribution before reuse.`);
      })
      .catch((error: unknown) => {
        setNotice(error instanceof Error ? error.message : "Open video search failed.");
      })
      .finally(() => setSearching(false));
  }

  function loadOfficialEmbed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const parsed = new URL(embedInput.trim());
      const hostOk = parsed.hostname === "www.pornhub.com" || parsed.hostname === "pornhub.com";
      const id = parsed.pathname.slice(7).replace(/\/$/, "");
      const idOk = /^[A-Za-z0-9_-]+$/.test(id);
      if (parsed.protocol !== "https:" || !hostOk || !parsed.pathname.startsWith("/embed/") || !idOk) {
        setNotice("Paste an official HTTPS Pornhub embed URL, not a regular watch-page link.");
        return;
      }
      setActiveEmbed("https://www.pornhub.com/embed/" + id);
      setNotice("Embed loaded. Playback and availability are controlled by the provider.");
    } catch {
      setNotice("That URL is invalid. Paste the official embed URL supplied by the provider.");
    }
  }

  if (!ageConfirmed) {
    return <main className="adult-hub adult-gate">
      <div className="adult-gate-card">
        <div className="adult-brand-mark">18+</div>
        <p className="adult-kicker">SOUL STUDIO · AFTER DARK</p>
        <h1>Adult content, <em>one directory.</em></h1>
        <p className="adult-lead">This directory links to third-party adult websites and mature manga platforms. It does not host or verify their media.</p>
        <div className="adult-warning"><strong>Adults only.</strong> You must be at least 18 years old (or the age of majority where you live) to continue. Only access legal, consensual content featuring adults.</div>
        <button className="adult-primary" onClick={() => setAgeConfirmed(true)}>I confirm I’m 18 or older <span>→</span></button>
        <p className="adult-fine">This is an age confirmation, not identity verification. Third-party websites have their own terms and regional restrictions.</p>
      </div>
    </main>;
  }

  return <main className="adult-hub">
    <header className="adult-header">
      <a className="adult-wordmark" href="#" onClick={(e) => { e.preventDefault(); setCategory("all"); setQuery(""); }}><span className="adult-brand-mark">18+</span><span>SOUL STUDIO <i>AFTER DARK</i></span></a>
      <span className="adult-header-note">ADULT DISCOVERY DIRECTORY</span>
    </header>

    <section className="adult-hero">
      <p className="adult-kicker">ONE SEARCH · MULTIPLE SOURCES</p>
      <h1>Find your next <em>rabbit hole.</em></h1>
      <p className="adult-lead">Search the source directory, or play a video here when its provider supplies an official embeddable link.</p>
      <form className="adult-search" onSubmit={searchWeb}>
        <span className="adult-search-icon">⌕</span>
        <input aria-label="Search adult content" value={query} onChange={(e) => { setQuery(e.target.value); setNotice(""); }} placeholder="Search title, genre, creator, or keyword…" maxLength={160} />
        <button type="submit">{searching ? "Searching…" : "Search open videos ↗"}</button>
      </form>
      <p className="adult-search-note">Search all video topics through PeerTube. Results are filtered to open licences; licence terms still apply.</p>
      <section className="adult-embed-panel"><p className="adult-kicker">IN-SITE PLAYER</p><h2>Play an official embed</h2><p>Paste an official Pornhub embed URL. Only HTTPS embed URLs from Pornhub are accepted.</p><form className="adult-search adult-embed-form" onSubmit={loadOfficialEmbed}><input aria-label="Official video embed URL" value={embedInput} onChange={(e) => setEmbedInput(e.target.value)} placeholder="https://www.pornhub.com/embed/VIDEO_ID" maxLength={500} /><button type="submit">Load player ↗</button></form>{activeEmbed && <div className="adult-player-wrap"><iframe title="Official embedded video" src={activeEmbed} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><p>Provider restrictions, regional availability, and embed settings still apply.</p></div>}</section>
      <div className="adult-category-row">{categories.map((item) => <button key={item.id} className={category === item.id ? "adult-category active" : "adult-category"} onClick={() => { setCategory(item.id); setQuery(""); setNotice(""); }}><strong>{item.label}</strong><small>{item.description}</small></button>)}</div>
    </section>

    {openVideos.length > 0 && <section className="adult-directory">
      <div className="adult-section-heading"><div><p className="adult-kicker">OPEN-LICENCE RESULTS</p><h2>Videos matching “{query}”</h2><p>Results are hosted by PeerTube creators, not Soul Studio. Reuse only according to each video's licence.</p></div><span className="adult-count">{openVideos.length} VIDEOS</span></div>
      <div className="adult-source-grid">{openVideos.map((video) => <article className="adult-source-card" key={video.id}>
        {video.thumbnailUrl && <a href={video.url} target="_blank" rel="noopener noreferrer"><img src={video.thumbnailUrl} alt="" loading="lazy" style={{width:"100%",aspectRatio:"16 / 9",objectFit:"cover",borderRadius:12}} /></a>}
        <h3>{video.title}</h3><p>{video.description || "No description supplied."}</p><div className="adult-tags"><span>{video.licence}</span><span>{video.channel}</span></div>
        <a href={video.url} target="_blank" rel="noopener noreferrer">Watch at source <span>↗</span></a>
        {video.embedUrl && <button className="adult-primary" type="button" onClick={() => { setActiveEmbed(video.embedUrl || ""); setNotice("Video loaded from its original PeerTube host."); }}>Play in Soul Studio</button>}
      </article>)}</div>
    </section>}
    <section className="adult-directory">
      <div className="adult-section-heading"><div><p className="adult-kicker">CURATED DIRECTORY</p><h2>{category === "all" ? "Explore sources" : categories.find((item) => item.id === category)?.label}</h2><p>Official destination links. Check each provider’s rules, age restrictions, and regional availability.</p></div><span className="adult-count">{visibleSources.length} SOURCES</span></div>
      {visibleSources.length ? <div className="adult-source-grid">{visibleSources.map((source) => <article className="adult-source-card" key={source.name}><div className="adult-source-top"><span className="adult-source-symbol">{source.kind === "video" ? "▶" : source.kind === "manga" ? "▤" : source.kind === "hentai" ? "✧" : "◎"}</span><span className="adult-source-kind">{source.kind === "video" ? "VIDEO" : source.kind === "manga" ? "MANGA" : source.kind === "hentai" ? "HENTAI" : "CREATORS"}</span></div><h3>{source.name}</h3><p>{source.description}</p><div className="adult-tags">{source.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><a href={source.url} target="_blank" rel="noopener noreferrer">Visit official site <span>↗</span></a></article>)}</div> : <div className="adult-empty"><h3>No directory matches</h3><p>Try a broader keyword or choose another category. Results are filtered locally on Soul Studio.</p></div>}
    </section>

    <section className="adult-disclaimer"><strong>Use responsibly.</strong> Soul Studio currently provides an in-site source catalogue, not a universal video feed. Open video search uses PeerTube’s API and shows videos with reuse-friendly licences; check the individual licence and attribution requirements. Other media sources still require authorized provider APIs, feeds, or embeds. Do not seek or share content involving minors, non-consensual acts, hidden-camera material, or copyright infringement. Report broken or inappropriate links to the site owner.</section>
    {notice && <p className="adult-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></p>}
    <footer className="adult-footer"><span>SOUL STUDIO AFTER DARK</span><span>18+ · External links · No media hosted here</span><button onClick={() => setAgeConfirmed(false)}>Exit adult section</button></footer>
  </main>;
}
