# WetSea Observatory — Migration Map

**Status:** MAINTENANCE
**Scope:** Lots A et B — structure, identité canonique, adaptateur WetSeaTech et CLAC
**Baseline commit:** `a454b4b3d78f5d1d45cf6957c89fd49574959e59`
**Deletion policy:** aucun fichier legacy ni asset binaire supprimé dans ces lots

---

## Principes

1. `design_tokens.yaml` reste la source de vérité technique.
2. Les documents sous `brand/` deviennent les sources canoniques d'identité.
3. Les anciens chemins canoniques restent temporairement sous forme de références
   de compatibilité.
4. Les fichiers legacy ne sont pas supprimés avant une validation de contenu.
5. Les assets binaires ne sont ni déplacés, ni renommés, ni modifiés.
6. Les audits et fichiers legacy ne doivent pas être considérés comme canoniques.

---

## Migrations réalisées — Lot A

| Source | Cible | Traitement |
|---|---|---|
| `identity/brand_core.md` | `brand/core.md` | Déplacé et enrichi avec le contenu unique des résumés legacy |
| `identity/forbidden.md` | `brand/forbidden.md` | Déplacé ; reste la liste normative unique |
| `identity/mascot.md` | `brand/mascot.md` | Déplacé ; conserve les archétypes et contraintes |
| `references/visual_references.md` | `brand/visual_references.md` | Déplacé et classé comme référence canonique |
| `docs/editorial_direction.md` | `brand/editorial_voice.md` | Modèle narratif consolidé dans un nouveau document canonique |
| `docs/context.md` | `brand/core.md` | Vision et stratégie intégrées |
| `docs/visual_identity.md` | `brand/core.md` | Déclaration et composants déjà couverts, vérifiés |
| `branding/composition_rules.md` | `brand/core.md` | Grille, profondeur et cadrage intégrés |
| `brand_guidelines.md` | `brand/core.md` | Positionnement et priorité omission/invention intégrés |
| `knowledge.md` | `brand/core.md`, `brand/editorial_voice.md`, `brand/mascot.md` | Contenu unique réparti ; fichier conservé en legacy |

---

## Migrations réalisées — Lot B

| Source | Cible | Traitement |
|---|---|---|
| `notebooklm/WetSeaTech_Graphic_Identity_NotebookLM.md` | `brand/wetseatech_program.md` | Règles de programme consolidées sans créer une marque concurrente |
| `docs/CLAC_FRAMEWORK.md` | `frameworks/clac.md` | Déplacé et déclaré framework canonique |
| `notebooklm/clap.md` | `frameworks/clac.md` | Vérifié comme duplication sémantique ; ancien chemin converti en référence de compatibilité |

---

## Références de compatibilité

Les chemins suivants sont conservés temporairement et ne doivent plus recevoir
de règles :

- `identity/brand_core.md`
- `identity/forbidden.md`
- `identity/mascot.md`
- `references/visual_references.md`
- `docs/CLAC_FRAMEWORK.md`
- `notebooklm/clap.md`
- `notebooklm/WetSeaTech_Graphic_Identity_NotebookLM.md`

---

## Fichiers legacy conservés pour les lots suivants

- `brand_guidelines.md`
- `knowledge.md`
- `docs/context.md`
- `docs/editorial_direction.md`
- `docs/visual_identity.md`
- `docs/mascot_systems.md`
- `branding/composition_rules.md`
- `branding/forbidden_styles.md`
- `branding/palettes.md`
- `docs/typography.md`
- fichiers legacy de canal et de prompts

Leur suppression éventuelle nécessite une nouvelle validation après migration
des canaux, prompts, templates et du pipeline NotebookLM.

---

## Assets binaires

Les six fichiers PNG/MP4 existants restent inchangés. Leur rôle, provenance,
licence et statut d'approbation demeurent `[UNKNOWN]`.

---

## Étapes non incluses

- manifeste NotebookLM
- nouveau build généré
- prompts article, tutoriel, learning notes et think tank
- canaux website, WordPress et LinkedIn
- suppression des doublons legacy
- déplacement ou classification des assets binaires

Le fichier legacy `MASTER_DIRECTIVES.md` est seulement régénéré avec le script
existant afin de rester cohérent avec les sources Markdown de ce lot. Son
remplacement par un pack sélectif piloté par manifeste reste hors périmètre.
