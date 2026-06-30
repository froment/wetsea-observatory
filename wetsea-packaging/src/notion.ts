import type { Env } from "./env";
import type { EditorialKit } from "./schema";

// "Via Notion" variant: the Worker creates a DRAFT page in the Chroniques DB;
// the existing Python publisher (chroniques-...-publisher) reads it and pushes
// to WordPress. We never call WordPress directly.
//
// Schema (data source 647e4372-...): Titre=title, ID_Episode=url, Synopsis=text,
// Content=text (body, "publisher V4.2"), references=text, Statut=select.

const NOTION_VERSION = "2025-09-03";
const API = "https://api.notion.com/v1";

function headers(env: Env): HeadersInit {
  return {
    authorization: `Bearer ${env.NOTION_TOKEN}`,
    "notion-version": NOTION_VERSION,
    "content-type": "application/json",
  };
}

// Notion caps a single rich-text object at 2000 chars — split long text.
function richText(s: string): { type: "text"; text: { content: string } }[] {
  const out: { type: "text"; text: { content: string } }[] = [];
  for (let i = 0; i < s.length; i += 1900) out.push({ type: "text", text: { content: s.slice(i, i + 1900) } });
  return out.length ? out : [{ type: "text", text: { content: "" } }];
}

const youtubeUrl = (videoId: string) => `https://youtu.be/${videoId}`;

export function composeNotionBody(kit: EditorialKit): string {
  const facts = kit.faits_marquants.map((f) => `- **[${f.label}]** ${f.fait}`).join("\n");
  const chapters = kit.chapitrage_youtube.map((c) => `- \`${c.timestamp}\` ${c.titre}`).join("\n");
  return [
    kit.hook_intro,
    "",
    "## Faits marquants",
    facts,
    "",
    "## Chapitres",
    chapters,
    "",
    `> ${kit.ecran_de_fin_cta}`,
  ].join("\n");
}

export function composeReferences(kit: EditorialKit): string {
  return kit.sources_or
    .map((s) => `- ${s.document} — ${s.auteur} (${s.date}) : ${s.claim}`)
    .join("\n");
}

// Page blocks for publisher_final.py (it renders the body from children, not
// the Content property). Only block types it handles: paragraph, heading_2,
// bulleted_list_item, quote.
type RT = { type: "text"; text: { content: string }; annotations?: Record<string, boolean> };
const rt = (content: string, annotations?: Record<string, boolean>): RT =>
  annotations ? { type: "text", text: { content }, annotations } : { type: "text", text: { content } };

export function buildBlocks(kit: EditorialKit): unknown[] {
  const para = (rts: RT[]) => ({ object: "block", type: "paragraph", paragraph: { rich_text: rts } });
  const h2 = (t: string) => ({ object: "block", type: "heading_2", heading_2: { rich_text: [rt(t)] } });
  const li = (rts: RT[]) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rts } });
  const quote = (t: string) => ({ object: "block", type: "quote", quote: { rich_text: [rt(t)] } });

  const blocks: unknown[] = [para([rt(kit.hook_intro)]), h2("Faits marquants")];
  for (const f of kit.faits_marquants) blocks.push(li([rt(`[${f.label}] `, { bold: true }), rt(f.fait)]));
  blocks.push(h2("Chapitres"));
  for (const c of kit.chapitrage_youtube) blocks.push(li([rt(c.timestamp, { code: true }), rt(` ${c.titre}`)]));
  blocks.push(quote(kit.ecran_de_fin_cta));
  return blocks; // ~15 blocks, well under the 100-per-create limit
}

async function existsByEpisodeUrl(env: Env, url: string): Promise<boolean> {
  const res = await fetch(`${API}/data_sources/${env.NOTION_DATA_SOURCE_ID}/query`, {
    method: "POST",
    headers: headers(env),
    body: JSON.stringify({ filter: { property: "ID_Episode", url: { equals: url } }, page_size: 1 }),
  });
  if (!res.ok) throw new Error(`Notion query ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { results?: unknown[] };
  return (data.results?.length ?? 0) > 0;
}

export interface NotionResult {
  applied: boolean; // false => dry-run (NOTION_PUBLISH !== "true")
  episodeUrl: string;
  pageId?: string;
  skipped?: boolean; // already present in the DB
}

/**
 * Create a draft episode page from the kit. Opt-in (NOTION_PUBLISH==="true");
 * idempotent (skips if a page already has this ID_Episode URL). Sets Statut to
 * "📝 Brouillon" so the publisher/human reviews before WordPress goes live.
 */
export async function publishToNotion(
  env: Env,
  videoId: string,
  kit: EditorialKit,
): Promise<NotionResult> {
  const episodeUrl = youtubeUrl(videoId);

  if (env.NOTION_PUBLISH !== "true") return { applied: false, episodeUrl };
  if (await existsByEpisodeUrl(env, episodeUrl)) return { applied: false, episodeUrl, skipped: true };

  const res = await fetch(`${API}/pages`, {
    method: "POST",
    headers: headers(env),
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: env.NOTION_DATA_SOURCE_ID },
      properties: {
        Titre: { title: richText(kit.titre) },
        ID_Episode: { url: episodeUrl },
        Synopsis: { rich_text: richText(kit.hook_intro) },
        // Body in BOTH places: Content property (publisher V4.2) ...
        Content: { rich_text: richText(composeNotionBody(kit)) },
        references: { rich_text: richText(composeReferences(kit)) },
        Statut: { select: { name: "📝 Brouillon" } },
      },
      // ... and page blocks (publisher_final.py renders the body from children).
      children: buildBlocks(kit),
    }),
  });
  if (!res.ok) throw new Error(`Notion create page ${res.status}: ${await res.text()}`);
  const page = (await res.json()) as { id: string };
  return { applied: true, episodeUrl, pageId: page.id };
}
