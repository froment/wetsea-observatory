import Anthropic from "@anthropic-ai/sdk";
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

CONTRAT DE SORTIE — réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte ni balise
Markdown autour, conforme exactement à ce schéma :
{
  "titre": string,
  "hook_intro": string,
  "faits_marquants": [{ "label": "OBSERVED" | "INFERRED" | "HYPOTHETICAL", "fait": string, "source_ref": string }],
  "ecran_de_fin_cta": string,
  "sources_or": [{ "document": string, "auteur": string, "date": string, "claim": string, "fait_associe": string }],
  "chapitrage_youtube": [{ "timestamp": "MM:SS", "titre": string }]
}`;

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

// Extract a kit from the model text: strip an optional ```json fence, else take
// the outermost {...} (so leaked reasoning prose before the JSON is tolerated),
// then JSON.parse + Zod-validate the shape.
function parseEditorial(text: string): { kit?: EditorialKit; error?: string } {
  let raw = text.trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    raw = fenced[1].trim();
  } else {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  }
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    return { error: `JSON invalide: ${(e as Error).message}` };
  }
  const parsed = EditorialKitSchema.safeParse(obj);
  if (!parsed.success) {
    return { error: `schéma: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}` };
  }
  return { kit: parsed.data };
}

/**
 * Generate the editorial kit with Claude Opus 4.8, then validate against the hard
 * rules. Malformed output or rule violations are fed back and retried (up to
 * `maxAttempts`). Version-agnostic: plain messages.create + JSON + Zod (no
 * structured-output helper, which is not in every SDK version).
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

  let last = "no output produced";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await client.messages.create({
      model: env.GENERATION_MODEL || "claude-opus-4-8",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = res.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    const text = textBlock?.text ?? "";
    const { kit, error } = parseEditorial(text);

    if (kit) {
      const violations = validateKit(kit);
      if (violations.length === 0) return kit;
      last = violations.join("; ");
      messages.push(
        { role: "assistant", content: text },
        {
          role: "user",
          content:
            "Ton kit a violé ces règles strictes :\n- " +
            violations.join("\n- ") +
            "\nRenvoie UNIQUEMENT le JSON corrigé qui respecte TOUTES les règles.",
        },
      );
    } else {
      last = error ?? "sortie illisible";
      messages.push(
        { role: "assistant", content: text || "(vide)" },
        {
          role: "user",
          content: `Sortie invalide (${last}). Renvoie UNIQUEMENT un objet JSON valide conforme au schéma, sans texte autour.`,
        },
      );
    }
  }
  throw new Error(`generation failed after ${maxAttempts} attempts: ${last}`);
}
