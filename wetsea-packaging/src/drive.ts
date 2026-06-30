import type { Env } from "./env";

// A curated golden source, as authored in /WetSea/<videoId>/sources.json.
export interface SourceEntry {
  document: string; // exact title — also the key facts reference via source_ref
  auteur?: string;
  date?: string;
  claim: string;
  fait_label?: "OBSERVED" | "INFERRED" | "HYPOTHETICAL";
  url?: string;
}

export interface VideoInputs {
  briefMd: string;
  sources: SourceEntry[];
}

// ---- base64url helpers (Workers Web Crypto) ----
function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// Mint a short-lived Google access token from a service-account key (JWT-bearer grant).
async function getAccessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: env.GCP_SA_EMAIL,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc(claim)}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(env.GCP_SA_PRIVATE_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${b64url(new Uint8Array(sig))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function driveJson(token: string, url: string): Promise<any> {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function driveDownload(token: string, fileId: string): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Drive download ${fileId} ${res.status}: ${await res.text()}`);
  return res.text();
}

async function listChildren(token: string, folderId: string) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url =
    `https://www.googleapis.com/drive/v3/files?q=${q}` +
    `&fields=files(id,name,mimeType)&includeItemsFromAllDrives=true&supportsAllDrives=true`;
  const data = await driveJson(token, url);
  return (data.files ?? []) as { id: string; name: string; mimeType: string }[];
}

/** Subfolders directly under the WetSea root — used by the cron discovery pass. */
export async function listSubfolders(env: Env, rootId: string) {
  const token = await getAccessToken(env);
  const children = await listChildren(token, rootId);
  return children.filter((c) => c.mimeType === "application/vnd.google-apps.folder");
}

/** Read brief.md + sources.json for one video folder. */
export async function readVideoInputs(env: Env, folderId: string): Promise<VideoInputs> {
  const token = await getAccessToken(env);
  const files = await listChildren(token, folderId);
  const brief = files.find((f) => f.name === "brief.md");
  const sources = files.find((f) => f.name === "sources.json");
  if (!brief) throw new Error(`brief.md not found in folder ${folderId}`);
  if (!sources) throw new Error(`sources.json not found in folder ${folderId}`);

  const briefMd = await driveDownload(token, brief.id);
  const sourcesRaw = await driveDownload(token, sources.id);
  let parsed: SourceEntry[];
  try {
    parsed = JSON.parse(sourcesRaw);
  } catch (e) {
    throw new Error(`sources.json is not valid JSON: ${(e as Error).message}`);
  }
  if (!Array.isArray(parsed) || parsed.length === 0)
    throw new Error("sources.json must be a non-empty array of golden sources");

  return { briefMd, sources: parsed };
}
