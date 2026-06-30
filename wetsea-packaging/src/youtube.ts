import type { Env } from "./env";
import type { EditorialKit } from "./schema";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos";

/**
 * Build the YouTube description from the kit. The chapter block doubles as
 * YouTube's auto-chapters source: first timestamp 00:00, >=3 timestamps,
 * >=10s apart — which validateKit already guarantees.
 */
export function composeDescription(kit: EditorialKit): string {
  const chapters = kit.chapitrage_youtube
    .map((c) => `${c.timestamp} ${c.titre}`)
    .join("\n");
  const sources = kit.sources_or
    .map((s) => `• ${s.document} — ${s.auteur} (${s.date})`)
    .join("\n");
  return [
    kit.hook_intro,
    "",
    "⏱️ Chapitres",
    chapters,
    "",
    "📚 Sources",
    sources,
    "",
    kit.ecran_de_fin_cta,
  ]
    .join("\n")
    .slice(0, 5000); // YouTube description hard limit
}

async function getAccessToken(env: Env): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: env.YT_CLIENT_ID,
      client_secret: env.YT_CLIENT_SECRET,
      refresh_token: env.YT_REFRESH_TOKEN,
    }),
  });
  if (!res.ok) throw new Error(`YouTube token refresh failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export interface YouTubeResult {
  videoId: string;
  applied: boolean; // false => dry-run (YT_PUBLISH !== "true")
  title: string;
  description: string;
}

/**
 * Update a video's title + description (chapters live in the description).
 *
 * Auth: OAuth as the channel owner (refresh token) — a service account cannot
 * manage a personal YouTube channel. Set scope youtube.force-ssl when minting.
 *
 * Safety: opt-in. With YT_PUBLISH !== "true" this returns the composed payload
 * without touching YouTube (dry-run).
 *
 * Correctness: videos.update REPLACES the entire `snippet` part, so we fetch
 * the current snippet and merge — preserving categoryId (required), tags, etc.
 */
export async function publishToYouTube(
  env: Env,
  videoId: string,
  kit: EditorialKit,
): Promise<YouTubeResult> {
  const title = kit.titre.replace(/[<>]/g, "").slice(0, 100); // YT title limit + no < >
  const description = composeDescription(kit);

  if (env.YT_PUBLISH !== "true") {
    return { videoId, applied: false, title, description };
  }

  const token = await getAccessToken(env);

  const listRes = await fetch(
    `${VIDEOS_API}?part=snippet&id=${encodeURIComponent(videoId)}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!listRes.ok) throw new Error(`videos.list ${listRes.status}: ${await listRes.text()}`);
  const list = (await listRes.json()) as { items?: { snippet: Record<string, unknown> }[] };
  if (!list.items?.length) throw new Error(`video ${videoId} not found or not owned by this channel`);

  // Merge: override only title + description, keep categoryId/tags/defaultLanguage.
  const merged = { ...list.items[0].snippet, title, description };

  const upRes = await fetch(`${VIDEOS_API}?part=snippet`, {
    method: "PUT",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ id: videoId, snippet: merged }),
  });
  if (!upRes.ok) throw new Error(`videos.update ${upRes.status}: ${await upRes.text()}`);

  return { videoId, applied: true, title, description };
}
