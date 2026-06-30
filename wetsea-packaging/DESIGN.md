# WetSea Observatory — NotebookLM → Packaging-Kit Integration

Design note (no code yet). Goal: let the video pipeline pull a video's description
and its **golden sources** from a NotebookLM, then emit the strict packaging-kit JSON.

---

## 1. The hard constraint

**NotebookLM has no official public API.** The consumer product
(`notebooklm.google.com`) exposes no documented REST/SDK surface, and a share link
returns **403** to anything not signed in to Google (confirmed this session). So
"the app calls NotebookLM" is not directly buildable on a stable contract.

Three access paths exist; only one is robust:

| Path | How | Verdict |
|---|---|---|
| **A. Reverse-engineered web client** (the "git that permits it") | Replays NotebookLM's internal `batchexecute` RPCs using your Google cookies | ❌ Fragile (breaks on any UI change), ToS-grey, needs full-account cookies — worst credential blast radius |
| **B. Browser automation** (Playwright — already installed here) | Drive a logged-in Chromium, scrape sources/notes | ⚠️ Works, but brittle + 2FA/login friction; fine as a one-off, bad as a pipeline dependency |
| **C. Mirror the sources, read the system of record** | NotebookLM's sources almost always originate as **Google Drive** docs/PDFs/links. Read *those* via the official **Drive API**; NotebookLM stays an authoring surface, not a runtime dependency | ✅ **Recommended** — stable contract, scoped OAuth, ToS-clean |

**Recommendation: Path C.** Don't make NotebookLM a runtime dependency. Treat a
**Drive folder (or a single "golden sources" Doc)** as the contract between you (the
human curator working in NotebookLM) and the pipeline. The pipeline reads Drive, which
*does* have a real API and a scoped credential — and which I can already reach in this
session via the Drive connector.

> If you specifically want NotebookLM's *synthesised* output (its grounded summaries,
> not the raw sources), that's a generation step — see §5 — not a fetch. Replicating it
> against the same source docs is more reliable than scraping NotebookLM's answers.

---

## 2. Recommended data flow

```
  Curator (you)                Drive (system of record)         Pipeline (ephemeral)
  ───────────                  ───────────────────────         ────────────────────
  NotebookLM notebook  ──curate──▶  /WetSea/<video-id>/             ┌───────────────┐
   • video brief                      brief.md                      │ 1. read Drive │  scoped OAuth
   • golden sources    ──export──▶    sources.json   ───read──────▶ │    (read-only)│  (Drive.readonly)
   • (optional) audio                 sources/*.pdf                 │ 2. generate   │  LLM + citations
                                                                    │ 3. emit kit   │  strict JSON
                                                                    └──────┬────────┘
                                                                           ▼
                                                              packaging_kit.json
                                                              (→ article_publish.py / Hugo)
```

`sources.json` is the explicit golden-source list ("titre du document → fait", plus
URL/Drive-id). It's the one artifact you maintain by hand in/after NotebookLM. Everything
downstream is deterministic.

---

## 3. Authentication & credential model

- **Credential:** a Google OAuth token scoped to **`drive.readonly`** (or a
  service-account key shared into the `/WetSea` folder). Nothing broader — the pipeline
  never needs write, never needs Gmail, never needs the whole account.
- **One human consent, then headless:** the OAuth consent screen is a one-time
  interactive step (a human approves the Drive scope). After that the **refresh token**
  runs the pipeline headlessly. This maps cleanly onto the next section.
- **Never** put the token in the repo, the Hugo build, or the system prompt. It is a
  runtime secret injected by the platform.

---

## 4. Where the secret lives — the three isolation models (your video's own subject)

This is the satisfying part: the credential-placement decision *is* the video. The same
three models the script teaches are the three deployment options for this pipeline.

| Isolation model (from the video) | Use it here for… | Credential placement | Network |
|---|---|---|---|
| **Bac à sable supervisé** (human-in-the-loop) | The **one-time OAuth consent** — a human approves the Drive scope in a browser | Token minted under human approval, then handed to the headless runner | Interactive, once |
| **Conteneur éphémère** (recommended for the pipeline) | The recurring run (mirrors your existing Hugo/Cloudflare CI) | Injected at runtime from the platform **secret store** (env var), gone when the container dies — never baked into the image | Egress **limited** to `*.googleapis.com` (+ the LLM endpoint) |
| **Machine virtuelle locale** | A developer running the generator by hand | Token in the **OS keychain inside the VM**, isolated from the host | Developer-controlled |

**Recommendation: ephemeral container** for the pipeline (it already matches how the site
builds), with the secret from the platform secret manager and egress restricted. The
human-in-the-loop sandbox covers only the initial consent. That's the same "match the
isolation model to the trust level and the degree of freedom" lesson the video makes —
nice internal consistency you can even reference in the script.

---

## 5. The generation step — and the provider decision

Once `brief.md` + `sources/*` are in hand, an LLM turns them into the strict kit. Two
features make this clean regardless of vendor:

1. **Structured outputs** — constrain the model to the exact packaging-kit JSON schema, so
   the output always validates (no post-hoc repair).
2. **Document citations** — feed the golden sources as document blocks with citations on;
   the model returns each fact tied to its source. This *directly implements* requirement
   #5 ("Sources d'or": relier chaque titre de document à un fait) — the source→fact map
   is produced by the citation layer, not hand-assembled.

**Provider fork (this needs your call):**

- Your current pipeline (`CIAT`, the article generator) uses **Gemini** (`@google/genai`,
  `gemini-3-flash-preview`). Since NotebookLM and Drive are Google, staying on Gemini keeps
  one auth domain and one SDK.
- You invoked **`/claude-api`**, which targets Claude. **Claude Opus 4.8** is a strong fit
  for this specific job: `output_config.format` enforces the strict schema, and the
  **citations** feature (`citations: {enabled: true}` on each `document` block) yields the
  exact `cited_text → fact` mapping the "sources d'or" section needs — arguably a better
  fit than Gemini for the *cited, schema-locked* shape you want. Model id `claude-opus-4-8`;
  default to streaming for the long generation.

I won't write generation code until you pick the lane (and I won't quietly drop Anthropic
SDK calls into the Gemini codebase — the skill is explicit about that).

---

## 6. What I'd build, in order (once you approve)

1. **Drive contract**: define `/WetSea/<video-id>/{brief.md, sources.json}` and a tiny
   schema for `sources.json` (title, url-or-drive-id, claim, fact-label).
2. **Reader**: Drive `readonly` client → pulls brief + sources for a given video-id.
3. **Generator**: sources → packaging-kit JSON via structured outputs + citations.
4. **Validator**: assert the strict schema + the task's hard rules (titre ≤60, hook ≤200,
   CTA ≤80, chapitrage starts `00:00 Introduction`, ≥3 chapters MM:SS).
5. **Wire into** `article_publish.py` so the kit flows to the Hugo article.

---

## 7. Open decisions for you

- **D1 — Provider:** Claude (per `/claude-api`, best for cited + schema-locked output) or
  stay on Gemini (one Google auth domain)?
- **D2 — Source contract:** Drive folder per video (Path C, recommended) — or do you
  insist on reading NotebookLM directly (Path A/B, fragile)?
- **D3 — Where it runs:** confirm ephemeral container (Cloudflare/CI) as the home, or is
  there a local/VM workflow to support too?
- **D4 — Write target:** none of these repos is writable from here yet
  (`quiz_video_generator` is private/404, `wetsea-observatory` is public read-only). Where
  should the integration code land?
```
