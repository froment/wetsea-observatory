# WetSea Observatory — Point d'entrée

> Ce fichier est le **seul point d'entrée** du système. Commence toujours par ici.  
> En cas de conflit entre deux fichiers, ce fichier et `design_tokens.yaml` ont priorité.

---

## Tu es un agent IA ?

**Si tu es Claude, NotebookLM, Midjourney ou tout autre agent :**

1. Lis `design_tokens.yaml` — source de vérité pour palette, typographie, espacements
2. Lis `brand/core.md` — positionnement et ADN visuel
3. Lis `brand/editorial_voice.md` pour les productions textuelles
4. Consulte le fichier de ton canal ci-dessous

**Hiérarchie de priorité en cas de conflit :**
```
design_tokens.yaml  >  brand/core.md  >  fichiers de canal  >  autres fichiers
```

---

## Par canal de production

| Je génère... | Lis en priorité |
|---|---|
| Miniature YouTube | `channels/youtube.md` + `prompts/youtube_thumbnail_prompt.md` |
| Visuel Etsy / affiche | `channels/etsy.md` + `prompts/master_prompt.md` |
| Cover podcast | `channels/podcast.md` |
| Script / narration vidéo | `notebooklm/directives.md` |
| Mascotte | `brand/mascot.md` (voir `design_tokens.yaml` section mascots) |
| Contenu cyber/WetSeaTech | `brand/wetseatech_program.md` |
| Hook CLAC | `frameworks/clac.md` |
| Prompt d'illustration général | `prompts/master_prompt.md` |

> Utiliser `design_tokens.yaml` comme source de palette et `brand/wetseatech_program.md`
> comme adaptateur contextuel. `#5E8FA3` reste l'accent cyan canonique.

---

## Rappel des 5 règles non-négociables

1. **Espace négatif** — minimum 25% dans toute composition
2. **Cyan discret** — `#5E8FA3` uniquement, jamais saturé, jamais dominant
3. **Pas de centrage statique** — compositions asymétriques, ancrage aux tiers
4. **Maximum 2 familles de fontes** par composition
5. **Interdit absolu** → `brand/forbidden.md`

---

## Structure du repo

```
design_tokens.yaml          Source de vérité technique (palette, typo, spacings)
START_HERE.md               Ce fichier
MASTER_DIRECTIVES.md        Agrégat auto-généré (read-only, ne pas éditer)
AGENTS.md                   Règles pour agents IA
brand/
  core.md                   Positionnement, ADN et applications
  editorial_voice.md        Ton et discipline éditoriale
  forbidden.md              Liste unique et maintenue des interdits
  mascot.md                 Spécification complète des mascottes
  wetseatech_program.md     Adaptateur cyber/tech/security
frameworks/
  clac.md                   Framework canonique de hook
channels/
  youtube.md                Règles miniatures et format vidéo
  etsy.md                   Règles produits Etsy
  podcast.md                Règles covers podcast
prompts/                    Prompts opérationnels (IA image/texte)
notebooklm/                 Directives NotebookLM
references/                 Références visuelles
assets/                     Gouvernance des assets ; approbation à documenter
maintenance/                Migration, audits et historique opérationnel
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
