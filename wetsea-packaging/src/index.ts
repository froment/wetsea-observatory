import type { Env, PackagingParams } from "./env";
import { listSubfolders } from "./drive";
import { kitExists } from "./github";

export { PackagingWorkflow } from "./workflow";

export default {
  // Manual / API trigger: POST /run { videoId, folderId, sujet, langue? }
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === "/run") {
      const p = (await req.json().catch(() => null)) as Partial<PackagingParams> | null;
      if (!p?.videoId || !p?.folderId || !p?.sujet)
        return new Response("required: videoId, folderId, sujet", { status: 400 });
      const instance = await env.PACKAGING.create({ params: p as PackagingParams });
      return Response.json({ instanceId: instance.id });
    }
    return new Response(
      "wetsea-packaging — POST /run { videoId, folderId, sujet, langue? }",
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
