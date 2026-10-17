"use client";

import { FormEvent, useMemo, useState } from "react";

type Kind = "all" | "video" | "hentai" | "manga" | "creator";
type Source = { name: string; kind: Exclude<Kind, "all">; description: string; url: string; tags: string[] };

const sources: Source[] = [
  { name: "Pornhub", kind: "video", description: "Adult video platform. Browse on the source site.", url: "https://www.pornhub.com/", tags: ["video", "adult", "clips"] },
  { name: "XVideos", kind: "video", description: "Adult video search and categories on the source site.", url: "https://www.xvideos.com/", tags: ["video", "adult", "clips"] },
  { name: "xHamster", kind: "video", description: "Adult video platform and creator pages.", url: "https://xhamster.com/", tags: ["video", "adult", "creators"] },
  { name: "FAKKU", kind: "manga", description: "Licensed adult manga and doujinshi; availability varies by region.", url: "https://www.fakku.net/", tags: ["licensed", "manga", "doujinshi"] },
  { name: "DLsite", kind: "hentai", description: "Digital marketplace for manga, games, audio, and indie works.", url: "https://www.dlsite.com/", tags: ["digital", "doujin", "games", "manga"] },
  { name: "Irodori Comics", kind: "manga", description: "Official English releases of independently published manga.", url: "https://irodoricomics.com/", tags: ["licensed", "english", "manga"] },
  { name: "JAST USA", kind: "hentai", description: "Publisher of adult visual novels and related digital titles.", url: "https://jastusa.com/", tags: ["publisher", "visual novels", "games"] },
  { name: "BOOK☆WALKER", kind: "manga", description: "Digital manga and light-novel store; catalogue and age restrictions vary.", url: "https://global.bookwalker.jp/", tags: ["store", "manga", "ebooks"] },
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
  const [searchEngine, setSearchEngine] = useState<"google" | "bing">("google");
  const [notice, setNotice] = useState("");

  const visibleSources = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((source) => {
      const matchesKind = category === "all" || source.kind === category || (category === "creator" && ["video", "hentai", "manga"].includes(source.kind));
      const matchesQuery = !q || [source.name, source.description, ...source.tags].join(" ").toLowerCase().includes(q);
      return matchesKind && matchesQuery;
    });
  }, [category, query]);

  function searchWeb(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      setNotice("Enter a title, genre, creator, or keyword to search.");
      return;
    }
    const typeLabel = category === "all" ? "adult content" : category === "video" ? "adult video" : category === "hentai" ? "hentai" : category === "manga" ? "adult manga" : "adult creators";
    const url = searchEngine === "google"
      ? "https://www.google.com/search?q=" + encodeURIComponent(term + " " + typeLabel)
      : "https://www.bing.com/search?q=" + encodeURIComponent(term + " " + typeLabel);
    window.open(url, "_blank", "noopener,noreferrer");
    setNotice("Opened an external web search. Results and access depend on the search provider and your region.");
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
      <p className="adult-lead">Explore adult video platforms, hentai, mature manga, and creator publishers from one simple directory.</p>
      <form className="adult-search" onSubmit={searchWeb}>
        <span className="adult-search-icon">⌕</span>
        <input aria-label="Search adult content" value={query} onChange={(e) => { setQuery(e.target.value); setNotice(""); }} placeholder="Search title, genre, creator, or keyword…" maxLength={160} />
        <select aria-label="Search engine" value={searchEngine} onChange={(e) => setSearchEngine(e.target.value as "google" | "bing")}><option value="google">Google</option><option value="bing">Bing</option></select>
        <button type="submit">Search ↗</button>
      </form>
      <p className="adult-search-note">Search opens an external search engine; Soul Studio does not scrape or store third-party media.</p>
      <div className="adult-category-row">{categories.map((item) => <button key={item.id} className={category === item.id ? "adult-category active" : "adult-category"} onClick={() => setCategory(item.id)}><strong>{item.label}</strong><small>{item.description}</small></button>)}</div>
    </section>

    <section className="adult-directory">
      <div className="adult-section-heading"><div><p className="adult-kicker">CURATED DIRECTORY</p><h2>{category === "all" ? "Explore sources" : categories.find((item) => item.id === category)?.label}</h2><p>Official destination links. Check each provider’s rules, age restrictions, and regional availability.</p></div><span className="adult-count">{visibleSources.length} SOURCES</span></div>
      {visibleSources.length ? <div className="adult-source-grid">{visibleSources.map((source) => <article className="adult-source-card" key={source.name}><div className="adult-source-top"><span className="adult-source-symbol">{source.kind === "video" ? "▶" : source.kind === "manga" ? "▤" : source.kind === "hentai" ? "✧" : "◎"}</span><span className="adult-source-kind">{source.kind === "video" ? "VIDEO" : source.kind === "manga" ? "MANGA" : source.kind === "hentai" ? "HENTAI" : "CREATORS"}</span></div><h3>{source.name}</h3><p>{source.description}</p><div className="adult-tags">{source.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><a href={source.url} target="_blank" rel="noopener noreferrer">Visit official site <span>↗</span></a></article>)}</div> : <div className="adult-empty"><h3>No directory matches</h3><p>Try a broader keyword or choose another category. Use Search to search the wider web.</p></div>}
    </section>

    <section className="adult-disclaimer"><strong>Use responsibly.</strong> Soul Studio is a link directory, not a host or endorsement of third-party content. Do not seek or share content involving minors, non-consensual acts, hidden-camera material, or copyright infringement. Report broken or inappropriate links to the site owner.</section>
    {notice && <p className="adult-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></p>}
    <footer className="adult-footer"><span>SOUL STUDIO AFTER DARK</span><span>18+ · External links · No media hosted here</span><button onClick={() => setAgeConfirmed(false)}>Exit adult section</button></footer>
  </main>;
}
