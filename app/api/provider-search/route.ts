import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProviderKey = "pornhub" | "dlsite";

const providerConfig: Record<ProviderKey, { url?: string; apiKey?: string }> = {
  pornhub: {
    url: process.env.PORNHUB_SEARCH_URL,
    apiKey: process.env.PORNHUB_API_KEY,
  },
  dlsite: {
    url: process.env.DLSITE_SEARCH_URL,
    apiKey: process.env.DLSITE_API_KEY,
  },
};

function safeProvider(value: string | null): ProviderKey | null {
  return value === "pornhub" || value === "dlsite" ? value : null;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const provider = safeProvider(request.nextUrl.searchParams.get("provider"));

  if (!provider) {
    return NextResponse.json({ error: "Choose provider= porn hub or dlsite.".replace(" ", "") }, { status: 400 });
  }
  if (!query || query.length > 160) {
    return NextResponse.json({ error: "Enter a search term of 1–160 characters." }, { status: 400 });
  }

  const config = providerConfig[provider];
  if (!config.url) {
    return NextResponse.json({
      provider,
      configured: false,
      results: [],
      message: "Provider search is not connected. Add the approved provider search URL in server-side environment variables after obtaining permission and documentation.",
    }, { status: 503 });
  }

  let endpoint: URL;
  try {
    endpoint = new URL(config.url);
  } catch {
    return NextResponse.json({ error: "The configured provider URL is invalid." }, { status: 500 });
  }

  if (endpoint.protocol !== "https:") {
    return NextResponse.json({ error: "Provider search endpoints must use HTTPS." }, { status: 500 });
  }

  // The provider-specific endpoint and authentication scheme must come from
  // approved provider documentation; this scaffold does not guess either.
  endpoint.searchParams.set("q", query);

  try {
    const headers = new Headers({ Accept: "application/json" });
    if (config.apiKey) headers.set("Authorization", `Bearer ${config.apiKey}`);
    const response = await fetch(endpoint, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({
        provider,
        configured: true,
        results: [],
        message: `Provider search returned HTTP ${response.status}. Check its approved endpoint and authentication format.`,
      }, { status: 502 });
    }

    const data: unknown = await response.json();
    return NextResponse.json({ provider, configured: true, data });
  } catch {
    return NextResponse.json({
      provider,
      configured: true,
      results: [],
      message: "Provider search could not be reached. Check the approved endpoint and try again.",
    }, { status: 502 });
  }
}
