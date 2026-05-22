# WetSea Observatory — Point d'entrée

> Ce fichier est le **seul point d'entrée** du système. Commence toujours par ici.  
> En cas de conflit entre deux fichiers, ce fichier et `design_tokens.yaml` ont priorité.

---

## Tu es un agent IA ?

**Si tu es Claude, NotebookLM, Midjourney ou tout autre agent :**

1. Lis `design_tokens.yaml` — source de vérité pour palette, typographie, espacements
2. Lis `identity/brand_core.md` — positionnement, ADN visuel, ton, interdits
3. Consulte le fichier de ton canal ci-dessous

**Hiérarchie de priorité en cas de conflit :**
```
design_tokens.yaml  >  identity/brand_core.md  >  fichiers de canal  >  autres fichiers
```

---

## Par canal de production

| Je génère... | Lis en priorité |
|---|---|
| Miniature YouTube | `channels/youtube.md` + `prompts/youtube_thumbnail_prompt.md` |
| Visuel Etsy / affiche | `channels/etsy.md` + `prompts/master_prompt.md` |
| Cover podcast | `channels/podcast.md` |
| Script / narration vidéo | `notebooklm/directives.md` |
| Mascotte | `identity/mascot.md` (voir `design_tokens.yaml` section mascots) |
| Contenu cyber/WetSeaTech | `notebooklm/WetSeaTech_Graphic_Identity_NotebookLM.md` + note palette ci-dessous |
| Prompt d'illustration général | `prompts/master_prompt.md` |

> La palette de `WetSeaTech_Graphic_Identity_NotebookLM.md` a été alignée sur `design_tokens.yaml`. Utiliser `#5E8FA3` (muted-cyan) comme accent dans tous les contextes WetSeaTech.

---

## Rappel des 5 règles non-négociables

1. **Espace négatif** — minimum 25% dans toute composition
2. **Cyan discret** — `#5E8FA3` uniquement, jamais saturé, jamais dominant
3. **Pas de centrage statique** — compositions asymétriques, ancrage aux tiers
4. **Maximum 2 familles de fontes** par composition
5. **Interdit absolu** → `identity/forbidden.md`

---

## Structure du repo

```
design_tokens.yaml          Source de vérité technique (palette, typo, spacings)
START_HERE.md               Ce fichier
MASTER_DIRECTIVES.md        Agrégat auto-généré (read-only, ne pas éditer)
AGENTS.md                   Règles pour agents IA
identity/
  brand_core.md             Positionnement, ADN, ton, applications
  forbidden.md              Liste unique et maintenue des interdits
  mascot.md                 Spécification complète des mascottes
channels/
  youtube.md                Règles miniatures et format vidéo
  etsy.md                   Règles produits Etsy
  podcast.md                Règles covers podcast
prompts/                    Prompts opérationnels (IA image/texte)
notebooklm/                 Directives NotebookLM
references/                 Références visuelles
assets/                     Assets approuvés (logos, textures, templates)
```

---

## Nommage de la marque

| Contexte | Nom à utiliser |
|---|---|
| Tous les fichiers core, outputs formels | **WetSea Observatory** |
| Contenus cyber/tech/security | WetSeaTech (label programme) |
| Communications digitales générales | WetAndSeaAI (label programme) |
| Jamais en remplacement du nom canonique | ~~WetAndSeaAI / WetSeaTech~~ |

---

*Dernière mise à jour : 2026-05-22*
