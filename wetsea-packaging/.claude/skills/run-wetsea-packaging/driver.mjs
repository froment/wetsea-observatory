#!/usr/bin/env node
// Driver for the wetsea-packaging Cloudflare Worker.
//
// Two layers, because the two layers fail differently:
//   unit  -> bundle the pure functions (validator + compose) with esbuild and
//            assert them against examples/pilot_kits.json. No network, no
//            secrets, deterministic. This is the layer most PRs touch
//            (generator/validator/schema/compose), so it runs first and fast.
//   serve -> boot `wrangler dev` (Miniflare) and curl the real routes:
//            GET / (help), POST /publish (dry-run, creates Workflow instances),
//            and the 400 paths. Proves routing + Workflow bindings + dry-run.
//
// Usage:
//   node .claude/skills/run-wetsea-packaging/driver.mjs unit     # pure-fn smoke (default)
//   node .claude/skills/run-wetsea-packaging/driver.mjs serve    # boot Worker + curl routes
//   node .claude/skills/run-wetsea-packaging/driver.mjs all      # both
//
// Exit code 0 = all assertions passed; non-zero = something broke.

import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const UNIT = resolve(HERE, "../../.."); // .claude/skills/run-wetsea-packaging -> unit root
const ESBUILD = join(UNIT, "node_modules/.bin/esbuild");
const WRANGLER = join(UNIT, "node_modules/.bin/wrangler");
const PORT = process.env.PORT || "8787";
const BASE = `http://127.0.0.1:${PORT}`;

let failed = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "PASS" : "FAIL"} ${msg}`);
  if (!cond) failed++;
};
const sh = (file, args, opts = {}) =>
  new Promise((res) => {
    const p = spawn(file, args, { cwd: UNIT, ...opts });
    let out = "", err = "";
    p.stdout?.on("data", (d) => (out += d));
    p.stderr?.on("data", (d) => (err += d));
    p.on("close", (code) => res({ code, out, err }));
  });

// ---- unit: bundle pure functions, run assertions ------------------------
async function unit() {
  console.log("== unit: pure-function smoke (validator + compose) ==");
  const entry = join(UNIT, `._smoke_${process.pid}.mjs`);
  const bundle = join(mkdtempSync(join(tmpdir(), "wsp-")), "smoke.mjs");
  writeFileSync(
    entry,
    `import { validateKit } from "./src/validator.ts";
import { composeDescription } from "./src/youtube.ts";
import { composeNotionBody, composeReferences, buildBlocks } from "./src/notion.ts";
import pilots from "./examples/pilot_kits.json" with { type: "json" };
const kits = pilots.kits ?? (pilots.kit ? [pilots.kit] : [pilots]);
let bad = 0;
for (const kit of kits) {
  const v = validateKit(kit);
  const desc = composeDescription(kit), body = composeNotionBody(kit);
  const refs = composeReferences(kit), blocks = buildBlocks(kit);
  const good = v.length === 0 && desc.includes("00:00 Introduction")
    && body.includes("## Faits marquants") && blocks.length > 0 && refs.length > 0;
  console.log(\`  \${good ? "ok" : "BAD"} \${kit.videoId}  violations=\${v.length} desc=\${desc.length}c blocks=\${blocks.length}\`);
  if (!good) { bad++; if (v.length) console.log("    ", v.join("; ")); }
}
const broken = structuredClone(kits[0]);
broken.titre = "x".repeat(80); broken.chapitrage_youtube[0].timestamp = "01:00";
const bv = validateKit(broken);
console.log(\`  \${bv.length >= 2 ? "ok" : "BAD"} negative-control  violations=\${bv.length}\`);
if (bv.length < 2) bad++;
process.exit(bad === 0 ? 0 : 1);
`,
  );
  try {
    const b = await sh(ESBUILD, [
      entry, "--bundle", "--platform=node", "--format=esm",
      "--loader:.json=json", `--outfile=${bundle}`, "--log-level=warning",
    ]);
    if (b.code !== 0) { console.log(b.err); ok(false, "esbuild bundle"); return; }
    const r = await sh(process.execPath, [bundle]);
    process.stdout.write(r.out);
    if (r.err) process.stderr.write(r.err);
    ok(r.code === 0, "all pilot kits valid + composed, negative control flagged");
  } finally {
    rmSync(entry, { force: true });
  }
}

// ---- serve: boot wrangler dev, curl routes ------------------------------
async function waitReady(timeoutMs = 40000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.status === 200) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function serve() {
  console.log("== serve: wrangler dev + route smoke ==");
  const proc = spawn(WRANGLER, ["dev", "--port", PORT, "--ip", "127.0.0.1"], {
    cwd: UNIT, stdio: ["ignore", "pipe", "pipe"], detached: true,
  });
  let log = "";
  proc.stdout.on("data", (d) => (log += d));
  proc.stderr.on("data", (d) => (log += d));
  try {
    if (!(await waitReady())) {
      console.log(log.slice(-1500));
      ok(false, "wrangler dev became ready");
      return;
    }
    ok(true, "wrangler dev ready");

    const help = await (await fetch(`${BASE}/`)).text();
    ok(help.includes("/publish"), "GET / serves help text");

    const pilots = readFileSync(join(UNIT, "examples/pilot_kits.json"), "utf8");
    const pubRes = await fetch(`${BASE}/publish`, {
      method: "POST", headers: { "content-type": "application/json" }, body: pilots,
    });
    const pub = await pubRes.json();
    ok(pubRes.status === 200 && pub.created?.length === 3 && pub.errors?.length === 0,
      `POST /publish dry-run created ${pub.created?.length ?? 0} workflow instances`);

    const empty = await fetch(`${BASE}/publish`, {
      method: "POST", headers: { "content-type": "application/json" }, body: "{}",
    });
    ok(empty.status === 400, "POST /publish {} -> 400");

    const run = await fetch(`${BASE}/run`, {
      method: "POST", headers: { "content-type": "application/json" }, body: '{"videoId":"x"}',
    });
    ok(run.status === 400, "POST /run (missing fields) -> 400");
  } finally {
    try { process.kill(-proc.pid, "SIGTERM"); } catch { /* already gone */ }
  }
}

const mode = process.argv[2] || "unit";
if (mode === "unit") await unit();
else if (mode === "serve") await serve();
else if (mode === "all") { await unit(); await serve(); }
else { console.error(`unknown mode: ${mode} (use unit|serve|all)`); process.exit(2); }

console.log(failed === 0 ? "\nDRIVER OK" : `\nDRIVER FAILED (${failed})`);
process.exit(failed === 0 ? 0 : 1);
