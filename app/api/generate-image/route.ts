import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const YOUTH_TERMS = /\b(minor|underage|child|children|kid|kids|teen|teenager|schoolgirl|schoolboy|school uniform|loli|shota|young-looking|childlike|preteen|under 18)\b/i;
const EXPLICIT_TERMS = /\b(porn|pornographic|explicit sex|sexual intercourse|penetration|sex act|genitals|cumshot|masturbat(?:e|ion)|rape|nonconsensual|non-consensual|bestiality)\b/i;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.RUNWAY_API_KEY || process.env.RUNWAYML_API_SECRET;
  if (!apiKey) {
    return error("Image generation is not configured yet. Add RUNWAY_API_KEY in Vercel Environment Variables, then redeploy.", 503);
  }

  let body: { prompt?: unknown; age?: unknown; style?: unknown; ratio?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("Please send a valid JSON request.", 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const age = Number(body.age);
  const style = typeof body.style === "string" ? body.style.trim() : "Anime";
  const ratio = typeof body.ratio === "string" && ["1024:1024", "1360:768", "768:1360"].includes(body.ratio)
    ? body.ratio
    : "1024:1024";

  if (!prompt || prompt.length > 1200) return error("Prompt must be between 1 and 1200 characters.", 400);
  if (!Number.isInteger(age) || age < 18 || age > 100) {
    return error("Only clearly adult characters aged 18 or older can be generated.", 400);
  }
  if (YOUTH_TERMS.test(prompt)) {
    return error("This prompt contains underage or youth-coded terms. Only clearly adult characters are allowed.", 400);
  }
  if (EXPLICIT_TERMS.test(prompt)) {
    return error("Explicit sexual content is not supported. Try an adult, non-explicit anime portrait or romantic scene.", 400);
  }

  const promptText = `Original fictional adult character, age ${age}, clearly mature adult appearance. ${style} art style. ${prompt}. Non-explicit, non-sexualized, no nudity, no minors, no youth-coded features. Original character only; do not depict existing copyrighted characters.`;

  try {
    const createResponse = await fetch("https://api.dev.runwayml.com/v1/text_to_image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({ model: "gen4_image", promptText, ratio }),
      signal: AbortSignal.timeout(20000),
    });

    if (!createResponse.ok) {
      const detail = await createResponse.text().catch(() => "");
      console.error("Runway image task creation failed", createResponse.status, detail.slice(0, 500));
      if (createResponse.status === 401 || createResponse.status === 403) {
        return error("The image provider rejected the API key. Check the Runway key in Vercel.", 502);
      }
      return error("The image provider could not start generation. Check your Runway account, credits, and provider moderation rules.", 502);
    }

    const task = (await createResponse.json()) as { id?: string; status?: string; output?: string[] };
    if (!task.id && !task.output?.[0]) return error("The image provider returned an unexpected response.", 502);

    if (task.output?.[0]) return NextResponse.json({ imageUrl: task.output[0], status: "SUCCEEDED" });
    if (!task.id) return error("The image task did not return a task ID.", 502);

    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(task.id!)}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Runway-Version": "2024-11-06",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!statusResponse.ok) continue;
      const status = (await statusResponse.json()) as { status?: string; output?: string[]; failure?: string };
      if (status.status === "SUCCEEDED" && status.output?.[0]) {
        return NextResponse.json({ imageUrl: status.output[0], status: "SUCCEEDED" });
      }
      if (status.status === "FAILED" || status.status === "CANCELED") {
        return error("The provider rejected or failed this generation. Try a different, non-explicit prompt.", 422);
      }
    }

    return error("Image generation is taking longer than expected. Please try again.", 504);
  } catch (cause) {
    console.error("Image generation request failed", cause);
    return error("Could not reach the image provider. Please try again shortly.", 502);
  }
}
