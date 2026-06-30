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
                3. commit       (GitHub Contents API → data/packaging/<videoId>.json)
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
# set DRIVE_ROOT_FOLDER_ID in wrangler.toml [vars] to the Drive id of /WetSea
npm run typecheck
npm run deploy
```

## Test one video without waiting for cron

```sh
curl -X POST https://wetsea-packaging.<your-subdomain>.workers.dev/run \
  -H 'content-type: application/json' \
  -d '{"videoId":"isolation-agents","folderId":"<drive-folder-id>","sujet":"Trois modèles d'\''isolation pour sécuriser les agents IA"}'
```

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
