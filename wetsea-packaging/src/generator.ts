import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Env } from "./env";
import type { SourceEntry } from "./drive";
import { EditorialKitSchema, type EditorialKit } from "./schema";
import { validateKit } from "./validator";

const SYSTEM_PROMPT = `Tu es l'expert éditorial de l'Observatoire WetSeaTech : intelligence technique,
rigueur scientifique, cyber, architecture, systèmes complexes, sobriété, crédibilité, AUCUN
sensationnalisme. Tu conçois le kit d'habillage d'une vidéo à partir d'un brief et de "golden
sources" déjà validées. Respecte STRICTEMENT ces directives :

TITRE — affirmation directe et mesurable, ≤ 60 caractères, sans hyperbole ni buzzword.
HOOK (CLAC) — Contexte / Lean-in / Arrest / Counterdirection : crée un vrai écart de
  connaissance, pas de suspense artificiel. Pas d'auto-présentation. ≤ 200 caractères.
FAITS MARQUANTS — EXACTEMENT 3. Chacun étiqueté [OBSERVED] (donnée mesurable),
  [INFERRED] (extrapolation logique) ou [HYPOTHETICAL] (non prouvé, signalé). Le champ
  "source_ref" de chaque fait DOIT être identique au champ "document" de la source d'or
  correspondante (intégrité référentielle).
CTA (écran de fin) — pas de langage marketing, orienté action, ≤ 80 caractères, style
  "Pour aller plus loin : ...".
SOURCES D'OR — pour chaque source : document | auteur | date | claim | fait_associe.
  N'invente aucune source : utilise uniquement celles fournies.
CHAPITRAGE YOUTUBE — au moins 3 chapitres, format MM:SS, strictement chronologiques. Le
  PREMIER chapitre est OBLIGATOIREMENT { "timestamp": "00:00", "titre": "Introduction" }.
PHRASES INTERDITES — n'emploie jamais : "en conclusion", "révolutionnaire", "game changer",
  "incontournable", "n'oubliez pas de liker".

Réponds uniquement via le format structuré demandé.`;

function buildUserPrompt(brief: string, sources: SourceEntry[]): string {
  const lines = sources.map(
    (s, i) =>
      `${i + 1}. document="${s.document}" | auteur=${s.auteur ?? "?"} | date=${s.date ?? "?"}` +
      ` | label=${s.fait_label ?? "?"} | claim=${s.claim}`,
  );
  return [
    "BRIEF DE LA VIDÉO :",
    brief.trim(),
    "",
    "GOLDEN SOURCES (utilise EXACTEMENT ces titres comme source_ref) :",
    ...lines,
  ].join("\n");
}

/**
 * Generate the editorial kit with Claude Opus 4.8 (structured outputs), then validate
 * against the hard rules. On violations, feed them back and retry (up to `maxAttempts`).
 */
export async function generateKit(
  env: Env,
  brief: string,
  sources: SourceEntry[],
  maxAttempts = 3,
): Promise<EditorialKit> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildUserPrompt(brief, sources) },
  ];

  let lastViolations: string[] = ["no output produced"];
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await client.messages.parse({
      model: env.GENERATION_MODEL || "claude-opus-4-8",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages,
      output_config: { format: zodOutputFormat(EditorialKitSchema, "packaging_kit") },
    });

    const kit = res.parsed_output;
    if (kit) {
      const violations = validateKit(kit);
      if (violations.length === 0) return kit;
      lastViolations = violations;
      messages.push(
        { role: "assistant", content: JSON.stringify(kit) },
        {
          role: "user",
          content:
            "Ton kit a violé ces règles strictes :\n- " +
            violations.join("\n- ") +
            "\nRenvoie un kit corrigé qui respecte TOUTES les règles. Conserve le reste.",
        },
      );
    }
  }
  throw new Error(`generation failed after ${maxAttempts} attempts: ${lastViolations.join("; ")}`);
}
