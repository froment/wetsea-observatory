import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import type { Env, PackagingParams } from "./env";
import { readVideoInputs } from "./drive";
import { generateKit } from "./generator";
import { assembleKit } from "./schema";
import { commitKit } from "./github";
import { publishToYouTube } from "./youtube";
import { publishToNotion } from "./notion";

export class PackagingWorkflow extends WorkflowEntrypoint<Env, PackagingParams> {
  async run(event: WorkflowEvent<PackagingParams>, step: WorkflowStep) {
    const p = event.payload;

    const input = await step.do("read Drive sources", () =>
      readVideoInputs(this.env, p.folderId),
    );

    // Generation is the failure-prone step (model + network) — give it its own retries.
    const editorial = await step.do(
      "generate kit (Claude Opus 4.8)",
      { retries: { limit: 2, delay: "30 seconds", backoff: "exponential" }, timeout: "5 minutes" },
      () => generateKit(this.env, input.briefMd, input.sources),
    );

    const kit = assembleKit(p.channel ?? "WetSeaTech", p.sujet, p.langue ?? "fr", editorial);

    const commitSha = await step.do("commit kit to site repo", () =>
      commitKit(this.env, p.videoId, kit),
    );

    // Write the kit back to the YouTube video (title + description + chapters).
    // Opt-in: dry-run unless YT_PUBLISH === "true".
    const youtube = await step.do(
      "publish to YouTube",
      { retries: { limit: 2, delay: "20 seconds", backoff: "exponential" }, timeout: "2 minutes" },
      () => publishToYouTube(this.env, p.videoId, kit),
    );

    // Create a draft in the Chroniques Notion DB; the Python publisher pushes it
    // to WordPress. Opt-in (NOTION_PUBLISH) and idempotent.
    const notion = await step.do(
      "publish to Notion (-> WordPress)",
      { retries: { limit: 2, delay: "20 seconds", backoff: "exponential" }, timeout: "2 minutes" },
      () => publishToNotion(this.env, p.videoId, kit),
    );

    return {
      videoId: p.videoId,
      commitSha,
      youtube: { applied: youtube.applied, title: youtube.title },
      notion: { applied: notion.applied, skipped: notion.skipped ?? false, pageId: notion.pageId },
    };
  }
}
