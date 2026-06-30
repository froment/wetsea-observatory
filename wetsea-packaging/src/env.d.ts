import type { Workflow } from "cloudflare:workers";

export interface Env {
  // Workflow bindings
  PACKAGING: Workflow; // full pipeline (Drive -> generate -> Hugo -> YouTube -> Notion)
  PUBLISH: Workflow;   // retroactive publish-only (YouTube + Notion) from a ready kit

  // Vars
  SITE_REPO: string;            // "owner/repo"
  GENERATION_MODEL: string;     // "claude-opus-4-8"
  DRIVE_ROOT_FOLDER_ID: string; // Drive folder id of /WetSea
  YT_PUBLISH: string;           // "true" to actually write to YouTube; anything else = dry-run
  NOTION_DATA_SOURCE_ID: string;// Chroniques DB data source (collection) id
  NOTION_PUBLISH: string;       // "true" to create the Notion draft; anything else = dry-run

  // Secrets
  ANTHROPIC_API_KEY: string;
  GCP_SA_EMAIL: string;
  GCP_SA_PRIVATE_KEY: string;   // PEM PKCS8
  GITHUB_TOKEN: string;
  // YouTube write-back (OAuth as channel owner — NOT a service account)
  YT_CLIENT_ID: string;
  YT_CLIENT_SECRET: string;
  YT_REFRESH_TOKEN: string;     // scope: https://www.googleapis.com/auth/youtube.force-ssl
  // Notion (source for the WordPress publisher — "via Notion" variant)
  NOTION_TOKEN: string;
}

// Workflow input params (one instance per video).
export interface PackagingParams {
  videoId: string;   // stable slug; also the per-video Drive subfolder name
  folderId: string;  // Drive folder id for this video
  sujet: string;     // human-readable subject
  channel?: "WetSeaTech";
  langue?: string;   // default "fr"
}
