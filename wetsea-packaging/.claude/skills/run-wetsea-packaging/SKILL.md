---
name: run-wetsea-packaging
description: Build, run, and smoke-test the wetsea-packaging Cloudflare Worker — the WetSeaTech video packaging pipeline (validator + kit generator + POST /run, POST /publish routes). Use when asked to run, start, serve, build, typecheck, or test wetsea-packaging, drive its Worker locally, or exercise the /publish dry-run.
---

# Run wetsea-packaging

A **Cloudflare Worker + two Workflows** (TypeScript) that turns a brief +
golden sources into the strict WetSeaTech **video packaging kit** JSON and
fans it out to GitHub/Hugo, YouTube, and Notion. There is **no GUI** — you
drive it as a server (`wrangler dev` + HTTP) and as a library (the pure
validator/compose functions).

Everything is driven by one script:
[`.claude/skills/run-wetsea-packaging/driver.mjs`](driver.mjs). Paths below are
relative to the unit root (`wetsea-packaging/`).

## Prerequisites

- **Node 22+** (the driver uses global `fetch`, `structuredClone`, detached
  process groups). Verified on `v22.22.2`. No `apt-get` packages needed — it's
  a headless Worker, not a desktop app.

```sh
node --version          # must be >= 22
npm ci                  # ~46 packages, installs wrangler + esbuild + zod + SDK
npm run typecheck       # tsc --noEmit — exits 0
```

## Run (agent path) — the driver

The driver has two layers because they fail differently. **No secrets are
required** for either: dry-run is the default (`YT_PUBLISH`/`NOTION_PUBLISH` =
`"false"` in `wrangler.toml`), and the pure functions touch no network.

```sh
# pure-function smoke (validator + compose) — fast, deterministic, no network.
# This is the layer most PRs touch. esbuild-bundles src against the pilot kits.
node .claude/skills/run-wetsea-packaging/driver.mjs unit

# boot `wrangler dev` (Miniflare) and curl the real routes, then kill it.
node .claude/skills/run-wetsea-packaging/driver.mjs serve

# both
node .claude/skills/run-wetsea-packaging/driver.mjs all
```

Expected tail of `all` (exit 0):

```
PASS all pilot kits valid + composed, negative control flagged
PASS wrangler dev ready
PASS GET / serves help text
PASS POST /publish dry-run created 3 workflow instances
PASS POST /publish {} -> 400
PASS POST /run (missing fields) -> 400

DRIVER OK
```

- **`unit`** bundles `src/validator.ts` + `src/youtube.ts` + `src/notion.ts`
  with esbuild and asserts every kit in `examples/pilot_kits.json` validates
  (0 violations), composes a YouTube description containing `00:00 Introduction`
  and Notion blocks, and that a deliberately-broken kit produces ≥2 violations.
- **`serve`** launches the Worker and exercises `GET /` (help), `POST /publish`
  (dry-run, creates 3 Workflow instances), and the two `400` paths. It cleans
  up the `wrangler dev` process group on exit.
- Override the port with `PORT=8788 node .claude/skills/.../driver.mjs serve`.

## Run (human path) — wrangler dev + curl

`serve` mode wraps exactly this. To poke it by hand:

```sh
npx wrangler dev --port 8787 --ip 127.0.0.1     # leave running; Ctrl-C to stop
```

Then, in another shell:

```sh
curl -s http://127.0.0.1:8787/
curl -s -X POST http://127.0.0.1:8787/publish \
  -H 'content-type: application/json' --data @examples/pilot_kits.json
```

`POST /publish` returns `{ "created": [ {videoId, instanceId}, … ], "errors": [] }`.
`POST /run { videoId, folderId, sujet }` needs Drive + Anthropic secrets and is
**not** exercised dry — it will error without them.

## Gotchas (battle scars from this container)

- **`wrangler dev` prints scary errors at startup and is fine.** You'll see
  `Error: Request was cancelled`, `Unable to fetch the Request.cf object`, and
  an undici stack trace — that's wrangler reaching Cloudflare for the `cf`
  placeholder / update check through the proxy. It still logs
  `[wrangler:info] Ready on http://127.0.0.1:8787`. Don't treat those as
  failures; wait for `Ready` (the driver polls `GET /` until 200).
- **Dry-run is the whole point of testing without secrets.** `/publish` runs
  the full Workflow (`validate kit` → `publishToYouTube` → `publishToNotion`),
  but with the default `"false"` flags the YouTube/Notion steps `return` before
  any network call. So the route is fully exercisable with zero real
  credentials. Flip `YT_PUBLISH`/`NOTION_PUBLISH` to `"true"` only with real
  secrets in `.dev.vars`.
- **The esbuild smoke entry must live in the unit root, not the skill dir.**
  esbuild resolves `./src/...` relative to the entry file, so the driver writes
  a temp `._smoke_<pid>.mjs` into `wetsea-packaging/` and deletes it in a
  `finally`. If you hand-roll a smoke entry, put it at the unit root.
- **The pure-fn bundle stays SDK-free.** Only `src/generator.ts` imports
  `@anthropic-ai/sdk`; the validator/compose path imports types-only + zod, so
  the `unit` bundle never pulls the SDK (no API key needed).
- **Cron is not auto-triggered locally.** `scheduled()` (Drive discovery)
  never fires under `wrangler dev`; trigger it manually with
  `curl http://127.0.0.1:8787/cdn-cgi/handler/scheduled` — but it needs the
  Drive service-account secrets, so it errors without them. Out of scope for
  the no-secrets smoke.
- **Workflow instances are async.** `/publish` returns `instanceId`s
  immediately; local dev has no tidy HTTP endpoint for instance status. The
  proof the kit is valid is that the `unit` layer runs the *same* `validateKit`
  deterministically.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `serve` hangs / `wrangler dev became ready` FAIL | A previous Worker holds the port. `pkill -f 'wrangler dev'; pkill -f workerd`, or run with `PORT=8788`. |
| esbuild `Could not resolve "./src/validator.ts"` | You ran a smoke entry from outside the unit root. Entry must sit in `wetsea-packaging/` (the driver handles this). |
| `npm run typecheck` errors about `messages.parse` / `helpers/zod` | Stale `@anthropic-ai/sdk`. `package.json` pins `^0.109.0`; run `npm ci` (not a partial install) so `package-lock.json` is honored. |
