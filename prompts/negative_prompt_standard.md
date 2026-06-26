# WetSea Observatory — Negative Prompt Standard
<!-- Source unique pour tous les prompts IA image utilisant un champ negative prompt -->
<!-- Compatible : Midjourney (--no), Flux, Stable Diffusion, Ideogram, Recraft, etc. -->

## Negative Prompt Complet

```
neon, cyberpunk, gaming, RGB lighting, RGB neon glow, glitch effect, lens flare,
startup branding, SaaS aesthetic, gradient blob, tech startup visuals,
stock photography, corporate aesthetic, office setting, generic business visuals,
cartoon, kawaii, chibi, anime action lines, hyper expressive mascot,
hyper saturated colors, vivid primary colors, rainbow palette, random color scheme,
crypto symbols, bitcoin, blockchain, web3 aesthetic, rocket, moon, meme symbols,
futuristic fonts, gaming fonts, cyberpunk fonts, heavy glow text, outlined text,
clickbait, shocked face, reaction face, red arrows, yellow circles, text overload,
overprocessed HDR, over-sharpened, excessive contrast, noise artifacts,
sci-fi cliché, spaceship, hologram, laser beam, tron grid,
generic AI texture, synthetic material texture, plastic look,
centered symmetrical layout, static centered composition,
childlike illustration, toy-like rendering, candy colors,
comic book panels, sequential art panels, manga action lines,
slapstick humor, exaggerated expression, meme format,
logo-heavy layout, oversized brand elements, watermark-style text,
blurry background bokeh cliché, sunset over water cliché
```

## Version courte (pour `--no` Midjourney)

```
--no neon cyberpunk gaming RGB glitch startup cartoon kawaii crypto clickbait
shocked reaction stock-photo corporate overprocessed saturated generic-ai
```

## Version Flux / SD (champ négatif structuré)

```
neon, cyberpunk, gaming aesthetic, RGB, glitch, lens flare, startup SaaS,
stock photo, cartoon, kawaii, chibi, clickbait, red arrows, shocked face,
saturated colors, rainbow palette, crypto, web3, futuristic fonts, heavy glow,
overprocessed HDR, generic AI texture, centered static layout, corporate aesthetic
```

## Usage dans les fichiers prompts

Chaque fichier prompt du repo doit référencer ce fichier ainsi :
```
## NEGATIVE PROMPT
→ See prompts/negative_prompt_standard.md for the full list.
Summary: neon, cyberpunk, gaming, cartoon, clickbait, stock photography, corporate.
```

## Mise à jour

Pour ajouter un nouvel élément interdit : modifier ce fichier uniquement.
Mentionner le changement dans `brand/forbidden.md` si c'est un interdit visuel général.
