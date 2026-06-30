import type { Env, PackagingParams } from "./env";
import type { PublishParams } from "./publish-workflow";
import type { EditorialKit } from "./schema";
import { listSubfolders } from "./drive";
import { kitExists } from "./github";

export { PackagingWorkflow } from "./workflow";
export { PublishWorkflow } from "./publish-workflow";

export default {
  // Manual / API triggers.
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // Full pipeline for one video (Drive -> generate -> Hugo -> YouTube -> Notion).
    if (req.method === "POST" && url.pathname === "/run") {
      const p = (await req.json().catch(() => null)) as Partial<PackagingParams> | null;
      if (!p?.videoId || !p?.folderId || !p?.sujet)
        return new Response("required: videoId, folderId, sujet", { status: 400 });
      const instance = await env.PACKAGING.create({ params: p as PackagingParams });
      return Response.json({ instanceId: instance.id });
    }

    // Retroactive batch: publish pre-computed kits to YouTube + Notion only.
    // Body: { kit } or { kits: [...] } — each kit must carry videoId. Accepts
    // examples/pilot_kits.json verbatim. Respects YT_PUBLISH / NOTION_PUBLISH.
    if (req.method === "POST" && url.pathname === "/publish") {
      const body = (await req.json().catch(() => null)) as
        | { kit?: (EditorialKit & { videoId?: string }); kits?: (EditorialKit & { videoId?: string })[] }
        | null;
      const kits = Array.isArray(body?.kits) ? body!.kits : body?.kit ? [body.kit] : null;
      if (!kits?.length) return new Response("body: { kit } or { kits: [...] }", { status: 400 });

      const created: { videoId: string; instanceId: string }[] = [];
      const errors: { index: number; error: string }[] = [];
      for (let i = 0; i < kits.length; i++) {
        const kit = kits[i];
        const videoId = kit?.videoId;
        if (!videoId) {
          errors.push({ index: i, error: "kit.videoId missing" });
          continue;
        }
        const instance = await env.PUBLISH.create({ params: { videoId, kit } as PublishParams });
        created.push({ videoId, instanceId: instance.id });
      }
      return Response.json({ created, errors });
    }

    return new Response(
      "wetsea-packaging — POST /run { videoId, folderId, sujet } | POST /publish { kits: [...] }",
      { headers: { "content-type": "text/plain" } },
    );
  },

  // Cron: discover video folders without a committed kit, fan out one Workflow each.
  async scheduled(_e: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        if (!env.DRIVE_ROOT_FOLDER_ID) {
          console.warn("DRIVE_ROOT_FOLDER_ID not set — skipping discovery");
          return;
        }
        const folders = await listSubfolders(env, env.DRIVE_ROOT_FOLDER_ID);
        for (const f of folders) {
          if (await kitExists(env, f.name)) continue; // already published
          await env.PACKAGING.create({
            params: { videoId: f.name, folderId: f.id, sujet: f.name, langue: "fr" },
          });
        }
      })(),
    );
  },
};
