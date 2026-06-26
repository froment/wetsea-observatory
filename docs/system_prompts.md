# System Prompt Library
<!-- Fichier restructuré — voir START_HERE.md pour l'arbre de décision complet -->

> Consulter `START_HERE.md` pour la logique de routage complète par canal.

## Ordre de lecture obligatoire (tout agent)

1. `design_tokens.yaml` — palette, typo, espacements (source de vérité)
2. `brand/core.md` — positionnement et ADN
3. `brand/editorial_voice.md` — ton et narration
4. Le fichier de canal ci-dessous selon le livrable visé

## Prompts par canal

| Canal | Fichier de spec | Prompt opérationnel |
|---|---|---|
| YouTube thumbnail | `channels/youtube.md` | `prompts/youtube_thumbnail_prompt.md` |
| Etsy / affiche | `channels/etsy.md` | `prompts/master_prompt.md` |
| Podcast cover | `channels/podcast.md` | `prompts/master_prompt.md` |
| Mascotte | `brand/mascot.md` | `prompts/mascot_prompt.md` |
| Illustration générale | `brand/core.md` | `prompts/master_prompt.md` |
| Script / narration | `notebooklm/directives.md` | `examples/MLpromptsample.md` |
| Contenu WetSeaTech cyber | `brand/wetseatech_program.md` | `prompts/master_prompt.md` |
| Hook CLAC | `frameworks/clac.md` | `notebooklm/directives.md` |

## Prompt de base global

Fichier : `system_prompt.md` — à inclure comme baseline dans tous les contextes
où aucun prompt canal spécifique n'est disponible.

## Règle de priorité en cas de conflit

```
design_tokens.yaml > brand/core.md > fichier canal > system_prompt.md
```
