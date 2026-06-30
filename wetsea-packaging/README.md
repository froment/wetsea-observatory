# wetsea-packaging

Cloudflare Worker + Workflow that turns a NotebookLM-curated brief and golden
sources (mirrored in Google Drive) into the strict WetSeaTech **video packaging
kit** JSON, then commits it to the `wetandseaai-site` repo (which triggers the
existing Hugo build + Cloudflare deploy).

## Flow

```
cron ─▶ scheduled(): list /WetSea/* folders, skip ones already published
          └─▶ Workflow per video:
                1. read Drive   (service-account JWT, drive.readonly)
                2. generate     (Claude Opus 4.8, structured outputs + retry-on-validation)
                3. commit       (GitHub Contents API → data/packaging/<videoId>.json) → Hugo
                4. youtube      (YouTube Data API: title + description + chapters) — OPT-IN
                5. notion       (draft in Chroniques DB → WordPress via the Python publisher) — OPT-IN
```

Also exposes `POST /run { videoId, folderId, sujet, langue? }` for manual runs.

## Drive contract

One folder per video under `/WetSea`, named with the video's stable slug:

```
/WetSea/<videoId>/
  brief.md        # the raw video description / notes (authored in NotebookLM, mirrored here)
  sources.json    # array of golden sources — see sources.example.json
```

`sources.json[].document` is the exact title; the generated facts reference it
verbatim via `source_ref` (the validator enforces this).

Share `/WetSea` (read-only) with the service-account email so the headless job
can read it — no interactive OAuth.

## Setup

```sh
npm install
wrangler secret put ANTHROPIC_API_KEY      # Anthropic key
wrangler secret put GCP_SA_EMAIL           # service-account email
wrangler secret put GCP_SA_PRIVATE_KEY     # PEM PKCS8 private key (full BEGIN/END block)
wrangler secret put GITHUB_TOKEN           # fine-grained PAT, Contents:write on the site repo
# YouTube write-back (only if you enable it — see below):
wrangler secret put YT_CLIENT_ID
wrangler secret put YT_CLIENT_SECRET
wrangler secret put YT_REFRESH_TOKEN       # scope youtube.force-ssl
# set DRIVE_ROOT_FOLDER_ID in wrangler.toml [vars] to the Drive id of /WetSea
npm run typecheck
npm run deploy
```

## YouTube write-back (step 4)

Pushes the kit onto the actual video: **title** and a **description** that
embeds the chapters (`00:00 Introduction …`). YouTube turns those timestamps
into clickable chapters automatically (first must be `00:00`, ≥3, ≥10s apart —
the validator already guarantees this), so the description *is* the chapter source.

- **Opt-in & safe by default.** `YT_PUBLISH = "false"` (default) → the step
  *composes* the title/description and returns them **without touching YouTube**
  (dry-run). Set `YT_PUBLISH = "true"` to actually update the video.
- **Auth = OAuth as the channel owner**, not a service account (a service
  account can't manage a personal channel). Mint a refresh token once with
  scope `https://www.googleapis.com/auth/youtube.force-ssl` and store it as
  `YT_REFRESH_TOKEN` (+ client id/secret).

### Mint `YT_REFRESH_TOKEN` (one-off)

1. Google Cloud Console: enable **YouTube Data API v3**; create an OAuth client
   of type **Desktop app**; on the consent screen add the `youtube.force-ssl`
   scope (and add the channel-owner account as a Test user if the app is in
   Testing).
2. Run the helper (Node 18+, no deps) and authorize **with the channel-owner
   account**:
   ```sh
   YT_CLIENT_ID=xxx YT_CLIENT_SECRET=yyy npm run get-yt-token
   ```
   It opens the consent URL, captures the loopback redirect, and prints the
   refresh token.
3. Store the three values, then enable publishing:
   ```sh
   wrangler secret put YT_CLIENT_ID
   wrangler secret put YT_CLIENT_SECRET
   wrangler secret put YT_REFRESH_TOKEN
   # set YT_PUBLISH = "true" in wrangler.toml [vars] when ready to go live
   ```
- **Non-destructive update.** `videos.update` replaces the whole `snippet`, so
  the code first `videos.list`s the current snippet and merges — preserving
  `categoryId` (required), `tags`, `defaultLanguage`. Only title + description
  change.

## WordPress, via Notion (step 5)

CMS canonical = **both** Hugo and WordPress. WordPress is reached **indirectly**:
the Worker creates a **draft page** in the Chroniques Notion DB; the existing
Python publisher (`chroniques-...-publisher`) reads Notion and pushes to
WordPress. The Worker never calls WordPress.

- Maps the kit to the DB schema: `Titre` (title), `ID_Episode` (url = the
  YouTube link), `Synopsis` (hook), `references` (sources), `Statut` =
  `📝 Brouillon`.
- **Body written twice for cross-version robustness**: the `Content` property
  (read by publisher V4.2) **and** page **blocks** — `publisher_final.py`
  renders the body from page children, not from `Content`. Only block types it
  handles are emitted (paragraph, heading_2, bulleted_list_item, quote).
- **Opt-in** (`NOTION_PUBLISH="true"`) and **idempotent** (skips if a page with
  the same `ID_Episode` URL already exists).
- Draft status means nothing auto-publishes to WordPress — a human/publisher
  promotes it.
- Secrets/vars: `NOTION_TOKEN` (integration with access to the DB),
  `NOTION_DATA_SOURCE_ID` (preset to the Chroniques collection).

## Test one video without waiting for cron

```sh
curl -X POST https://wetsea-packaging.<your-subdomain>.workers.dev/run \
  -H 'content-type: application/json' \
  -d '{"videoId":"isolation-agents","folderId":"<drive-folder-id>","sujet":"Trois modèles d'\''isolation pour sécuriser les agents IA"}'
```

## Retroactive batch — `POST /publish`

Publish **pre-computed** kits to YouTube + Notion only (no Drive read, no
generation, no Hugo commit). One durable Workflow instance per video; each
re-validates the kit, then runs the YouTube and Notion steps. Honours the same
`YT_PUBLISH` / `NOTION_PUBLISH` opt-in flags (dry-run until enabled).

Body is `{ kit }` or `{ kits: [...] }`; each kit must carry `videoId`. The
pilot file is accepted verbatim:

```sh
curl -X POST https://wetsea-packaging.<your-subdomain>.workers.dev/publish \
  -H 'content-type: application/json' \
  --data @examples/pilot_kits.json
# → { "created": [ { "videoId": "...", "instanceId": "..." }, ... ], "errors": [] }
```

This is the path for the ~40 existing `@wetseatech` videos: generate a kit per
video (Drive pipeline, or a transcript-based generator), collect them into a
`{ kits: [...] }` payload, and POST once.

## Hard rules enforced (validator.ts, drives the retry loop)

- `titre` ≤ 60, `hook_intro` ≤ 200, `ecran_de_fin_cta` ≤ 80 (code points)
- exactly 3 `faits_marquants`, each labelled OBSERVED / INFERRED / HYPOTHETICAL
- `chapitrage_youtube`: ≥ 3 chapters, MM:SS, strictly chronological, first is
  `{ "00:00", "Introduction" }`
- referential integrity: every fact `source_ref` matches a `sources_or.document`

## Notes

- TypeScript because Workers run JS/TS; the Anthropic **TS** SDK runs in Workers.
- Structured outputs and citations are mutually exclusive in one call — the
  source→fact map comes from the curated `sources.json`, not the citation API.
  (Citation-grounding of facts against source PDFs is a possible second pass.)
- Brand invariants (palette, tone_flags, forbidden_phrases, visual_style) are
  merged in `assembleKit()`, never model-generated.
