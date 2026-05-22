# System Prompt Library
<!-- Fichier restructuré — voir START_HERE.md pour l'arbre de décision complet -->

> Consulter `START_HERE.md` pour la logique de routage complète par canal.

## Ordre de lecture obligatoire (tout agent)

1. `design_tokens.yaml` — palette, typo, espacements (source de vérité)
2. `identity/brand_core.md` — positionnement, ADN, ton
3. Le fichier de canal ci-dessous selon le livrable visé

## Prompts par canal

| Canal | Fichier de spec | Prompt opérationnel |
|---|---|---|
| YouTube thumbnail | `channels/youtube.md` | `prompts/youtube_thumbnail_prompt.md` |
| Etsy / affiche | `channels/etsy.md` | `prompts/master_prompt.md` |
| Podcast cover | `channels/podcast.md` | `prompts/master_prompt.md` |
| Mascotte | `identity/mascot.md` | `prompts/mascot_prompt.md` |
| Illustration générale | `identity/brand_core.md` | `prompts/master_prompt.md` |
| Script / narration | `notebooklm/directives.md` | `examples/MLpromptsample.md` |
| Contenu WetSeaTech cyber | `notebooklm/WetSeaTech_Graphic_Identity_NotebookLM.md` | `prompts/master_prompt.md` |

## Prompt de base global

Fichier : `system_prompt.md` — à inclure comme baseline dans tous les contextes
où aucun prompt canal spécifique n'est disponible.

## Règle de priorité en cas de conflit

```
design_tokens.yaml > identity/brand_core.md > fichier canal > system_prompt.md
```
