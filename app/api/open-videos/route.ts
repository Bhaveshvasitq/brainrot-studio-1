import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PeerTubeVideo = {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  url?: string;
  embedPath?: string;
  thumbnailPath?: string;
  duration?: number;
  views?: number;
  licence?: { id?: number; label?: string };
  channel?: { name?: string; host?: string };
};

const allowedLicenceIds = new Set([1, 2, 3, 7]);
// PeerTube licence IDs: CC BY, CC BY-SA, CC BY-ND, and CC0/public domain.
// These allow reuse subject to each licence's conditions. We do not download
// or rehost files; results link/embed the original provider's video.

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 160) {
    return NextResponse.json({ error: "Enter a search term of 1–160 characters." }, { status: 400 });
  }

  const configuredHost = process.env.PEERTUBE_INSTANCE_URL || "https://peertube.tv";
  let base: URL;
  try {
    base = new URL(configuredHost);
  } catch {
    return NextResponse.json({ error: "PEERTUBE_INSTANCE_URL is invalid." }, { status: 500 });
  }
  if (base.protocol !== "https:" || base.username || base.password) {
    return NextResponse.json({ error: "PeerTube instance must be an HTTPS URL without credentials." }, { status: 500 });
  }

  const endpoint = new URL("/api/v1/search/videos", base);
  endpoint.searchParams.set("search", query);
  endpoint.searchParams.set("count", "20");
  endpoint.searchParams.set("nsfw", "false");
  endpoint.searchParams.set("licenceOneOf", [...allowedLicenceIds].join(","));
  endpoint.searchParams.set("sort", "-publishedAt");

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return NextResponse.json({
        results: [],
        error: "The PeerTube search service is temporarily unavailable. Try again later.",
      }, { status: 502 });
    }

    const payload = await response.json() as { data?: PeerTubeVideo[] };
    const results = (Array.isArray(payload.data) ? payload.data : [])
      .filter((video) => video && typeof video.name === "string" && allowedLicenceIds.has(Number(video.licence?.id)))
      .map((video) => ({
        id: video.uuid || String(video.id),
        title: video.name,
        description: (video.description || "").slice(0, 360),
        url: video.url || (video.uuid ? new URL(`/videos/watch/${video.uuid}`, base).toString() : base.toString()),
        embedUrl: video.embedPath ? new URL(video.embedPath, base).toString() : null,
        thumbnailUrl: video.thumbnailPath ? new URL(video.thumbnailPath, base).toString() : null,
        duration: video.duration ?? null,
        views: video.views ?? null,
        licence: video.licence?.label || "Open licence (verify source details)",
        channel: video.channel?.name || "PeerTube creator",
      }));

    return NextResponse.json({ provider: "PeerTube", query, count: results.length, results });
  } catch {
    return NextResponse.json({
      results: [],
      error: "Could not reach the PeerTube search service. Please try again later.",
    }, { status: 502 });
  }
}
