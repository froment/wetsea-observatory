#!/usr/bin/env node
/**
 * One-off helper: mint a YouTube OAuth refresh token for YT_REFRESH_TOKEN.
 *
 * Prereqs (Google Cloud Console, once):
 *   1. Enable "YouTube Data API v3".
 *   2. Create an OAuth client of type "Desktop app" (loopback redirect needs no
 *      registration). If you use a "Web application" client instead, add
 *      http://127.0.0.1:53682/oauth2callback to its Authorized redirect URIs.
 *   3. On the OAuth consent screen, add the scope youtube.force-ssl. If the app
 *      is in "Testing", add the channel-owner account as a Test user.
 *
 * Run (Node 18+, no dependencies):
 *   YT_CLIENT_ID=xxx YT_CLIENT_SECRET=yyy node scripts/get-youtube-refresh-token.mjs
 *
 * Authorize with the GOOGLE ACCOUNT THAT OWNS the YouTube channel. The script
 * prints the refresh token; store it with `wrangler secret put YT_REFRESH_TOKEN`.
 */
import http from "node:http";
import { randomBytes } from "node:crypto";
import { exec } from "node:child_process";

const CLIENT_ID = process.env.YT_CLIENT_ID;
const CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
const SCOPE = "https://www.googleapis.com/auth/youtube.force-ssl";
const PORT = Number(process.env.PORT || 53682);
const REDIRECT = `http://127.0.0.1:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("✗ Set YT_CLIENT_ID and YT_CLIENT_SECRET (from your Desktop-app OAuth client).");
  process.exit(1);
}

const state = randomBytes(16).toString("hex");
const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.search = new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT,
  response_type: "code",
  scope: SCOPE,
  access_type: "offline", // ask for a refresh token
  prompt: "consent",      // force it to be returned every run
  state,
}).toString();

function fail(res, httpMsg, logMsg) {
  if (res) res.end(httpMsg);
  console.error("✗", logMsg ?? httpMsg);
  server.close();
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.url.startsWith("/oauth2callback")) {
    res.writeHead(404);
    res.end();
    return;
  }
  const url = new URL(req.url, REDIRECT);
  const error = url.searchParams.get("error");
  if (error) return fail(res, `OAuth error: ${error}`, `OAuth error: ${error}`);
  if (url.searchParams.get("state") !== state) return fail(res, "State mismatch.", "State mismatch (possible CSRF).");
  const code = url.searchParams.get("code");
  if (!code) return fail(res, "No code in callback.", "No authorization code returned.");

  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT,
        grant_type: "authorization_code",
      }),
    });
    const tok = await r.json();
    if (!r.ok) return fail(res, `Token exchange failed (${r.status}).`, `Token exchange ${r.status}: ${JSON.stringify(tok)}`);
    if (!tok.refresh_token) {
      return fail(
        res,
        "No refresh_token returned. Revoke the app's prior access at myaccount.google.com/permissions and retry.",
        "No refresh_token (already granted? prompt=consent should force it).",
      );
    }
    res.end("✅ Refresh token obtained. You can close this tab and return to the terminal.");
    console.log("\n✅ YT_REFRESH_TOKEN:\n");
    console.log(tok.refresh_token);
    console.log("\nStore it:\n  wrangler secret put YT_REFRESH_TOKEN   # paste the value above\n");
    server.close();
    process.exit(0);
  } catch (e) {
    return fail(res, "Token exchange error.", e instanceof Error ? e.message : String(e));
  }
});

server.listen(PORT, () => {
  console.log("\nOpen this URL and authorize with the channel-owner Google account:\n");
  console.log(authUrl.toString() + "\n");
  const opener =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${opener} "${authUrl.toString()}"`, () => {}); // best-effort; ignore failure
});
