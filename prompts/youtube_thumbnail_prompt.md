# WetSea Observatory — YouTube Thumbnail Prompt
<!-- Ce fichier est un wrapper. Le prompt complet est dans examples/prompt_examples.md -->
<!-- Pour la spec de canal complète : channels/youtube.md -->

## Usage rapide

Copier le prompt complet depuis `examples/prompt_examples.md` et remplacer
`[INSERT DOCUMENT / VIDEO TOPIC]` par le sujet de la vidéo.

## Rappel des paramètres essentiels

- **Format** : 16:9 · marges sécurisées 5% depuis les bords
- **Sujet** : 1 seul concept, composition asymétrique
- **Texte** : 3–6 mots maximum, IBM Plex Sans uppercase
- **Palette** : deep navy #0A1A2B base · muted cyan #5E8FA3 accent 10% max
- **Negative prompt** → `prompts/negative_prompt_standard.md`

## Paramètres Midjourney

```
[prompt depuis examples/prompt_examples.md] --ar 16:9 --style raw --v 6.1
--no neon cyberpunk gaming RGB clickbait shocked-face red-arrows stock-photo
```

## Checklist avant livraison

- [ ] Lisible à 120 px sur mobile ?
- [ ] Un seul concept visible ?
- [ ] Cyan utilisé comme signal, pas comme fond ?
- [ ] Aucun élément clickbait ?
- [ ] Anti-drift checklist passée → `brand/forbidden.md`
