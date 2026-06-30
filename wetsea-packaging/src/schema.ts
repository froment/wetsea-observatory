import { z } from "zod";

// --- Fact taxonomy (WetSeaTech directive) ---
export const FACT_LABELS = ["OBSERVED", "INFERRED", "HYPOTHETICAL"] as const;

export const FaitSchema = z.object({
  label: z.enum(FACT_LABELS),
  fait: z.string(),
  // MUST equal one sources_or[].document (referential integrity, enforced in validator).
  source_ref: z.string(),
});

export const SourceSchema = z.object({
  document: z.string(),
  auteur: z.string(),
  date: z.string(),
  claim: z.string(),
  fait_associe: z.string(),
});

export const ChapitreSchema = z.object({
  timestamp: z.string(), // MM:SS — validated downstream
  titre: z.string(),
});

// The editorial subset the model generates. Length/format/domain rules are NOT
// expressed here (structured-output JSON Schema can't carry maxLength/pattern/minItems);
// they live in validator.ts and drive the retry loop.
export const EditorialKitSchema = z.object({
  titre: z.string(),
  hook_intro: z.string(),
  faits_marquants: z.array(FaitSchema),
  ecran_de_fin_cta: z.string(),
  sources_or: z.array(SourceSchema),
  chapitrage_youtube: z.array(ChapitreSchema),
});
export type EditorialKit = z.infer<typeof EditorialKitSchema>;

// Brand invariants — never model-generated, merged in after generation.
export const BRAND = {
  WetSeaTech: {
    project: "WetSeaTech",
    tone_flags: ["analytical", "restrained_irony"],
    forbidden_phrases: [
      "en conclusion",
      "révolutionnaire",
      "game changer",
      "incontournable",
      "n'oubliez pas de liker",
    ],
    color_palette: { primary: "#0A1A2B", secondary: "#2A2F36", accent: "#5E8FA3" },
    visual_style: "technical_documentary",
  },
} as const;

export type Channel = keyof typeof BRAND;

export function assembleKit(
  channel: Channel,
  sujet: string,
  langue: string,
  editorial: EditorialKit,
) {
  return {
    ...BRAND[channel],
    content_type: "video_script",
    sujet,
    langue,
    ...editorial,
  };
}
