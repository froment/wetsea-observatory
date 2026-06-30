import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import type { Env } from "./env";
import type { EditorialKit } from "./schema";
import { validateKit } from "./validator";
import { publishToYouTube } from "./youtube";
import { publishToNotion } from "./notion";

// Retroactive publish: take a PRE-COMPUTED kit and push it to YouTube + Notion
// only (no Drive read, no generation, no Hugo commit). One instance per video.
// Honours the same YT_PUBLISH / NOTION_PUBLISH opt-in flags as the main pipeline.
export interface PublishParams {
  videoId: string;
  kit: EditorialKit;
}

export class PublishWorkflow extends WorkflowEntrypoint<Env, PublishParams> {
  async run(event: WorkflowEvent<PublishParams>, step: WorkflowStep) {
    const { videoId, kit } = event.payload;

    // Re-validate the supplied kit (same hard rules) before touching anything.
    await step.do("validate kit", async () => {
      const violations = validateKit(kit);
      if (violations.length) throw new Error(`invalid kit for ${videoId}: ${violations.join("; ")}`);
      return "ok";
    });

    const youtube = await step.do(
      "publish to YouTube",
      { retries: { limit: 2, delay: "20 seconds", backoff: "exponential" }, timeout: "2 minutes" },
      () => publishToYouTube(this.env, videoId, kit),
    );

    const notion = await step.do(
      "publish to Notion (-> WordPress)",
      { retries: { limit: 2, delay: "20 seconds", backoff: "exponential" }, timeout: "2 minutes" },
      () => publishToNotion(this.env, videoId, kit),
    );

    return {
      videoId,
      youtube: { applied: youtube.applied },
      notion: { applied: notion.applied, skipped: notion.skipped ?? false },
    };
  }
}
