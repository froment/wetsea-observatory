import type { Env } from "./env";

const kitPath = (videoId: string) => `data/packaging/${videoId}.json`;

function ghHeaders(env: Env): HeadersInit {
  return {
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "user-agent": "wetsea-packaging",
    "x-github-api-version": "2022-11-28",
  };
}

// UTF-8 safe base64 for the Contents API.
function toBase64(s: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(s)));
}

/** True if a kit for this video is already committed (used by cron discovery). */
export async function kitExists(env: Env, videoId: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${env.SITE_REPO}/contents/${kitPath(videoId)}?ref=main`;
  const res = await fetch(url, { headers: ghHeaders(env) });
  return res.ok;
}

/** Commit (create or update) the packaging kit to the site repo. Returns the commit sha. */
export async function commitKit(env: Env, videoId: string, kit: unknown): Promise<string> {
  const url = `https://api.github.com/repos/${env.SITE_REPO}/contents/${kitPath(videoId)}`;

  let sha: string | undefined;
  const cur = await fetch(`${url}?ref=main`, { headers: ghHeaders(env) });
  if (cur.ok) sha = ((await cur.json()) as { sha: string }).sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...ghHeaders(env), "content-type": "application/json" },
    body: JSON.stringify({
      message: `chore(packaging): kit for ${videoId}`,
      content: toBase64(JSON.stringify(kit, null, 2) + "\n"),
      branch: "main",
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new Error(`GitHub commit failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { commit: { sha: string } }).commit.sha;
}
