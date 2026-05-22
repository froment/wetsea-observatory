# WetSea Observatory — Prompt Maître
<!-- Naming rule appliquée. Couleurs alignées sur design_tokens.yaml. -->

Create a premium editorial illustration for **WetSea Observatory**.

## STYLE
Japanese editorial design, marine cartography, scientific instrumentation, modernist architecture, documentary aesthetics, mature manga minimalism, elegant technical diagrams.

## MOOD
Calm, intelligent, contemplative, cinematic, timeless.

## VISUAL LANGUAGE
Strong negative space, restrained composition, subtle technical annotations, elegant line systems, quiet cyan highlights, minimal but emotionally deep.

## COLORS
<!-- Source canonique : design_tokens.yaml — valeurs hex obligatoires pour outils IA image -->
Deep navy #0A1A2B · Graphite #2A2F36 · Muted cyan #5E8FA3
Dark ocean green #1D3A3A · Off-white #F2F1EC · Mineral sand #C9BDA8
Rule: 90% dark neutral tones, 10% muted cyan accents maximum.

## SUBJECT
[INSERT SUBJECT]
<!-- Exemples de sujets adaptés :
  - "North Atlantic submarine cable network — AEConnect-1 route"
  - "Port of Rotterdam as global logistics node — aerial infrastructure view"
  - "BGP routing failure cascade — abstract network diagram"
  - "Hyperscaler datacenter geography — Atlantic coast"
  - "Submarine cable landing station on a foggy coastline"
  - "Maritime traffic density map — Strait of Malacca"
-->

## OPTIONAL ELEMENTS
Use only elements relevant to the subject:
Sonar circles · maritime routes · underwater cables · radar geometry · navigation markers
ocean currents · abstract cloud infrastructure · port cranes · vessel silhouettes
coordinate grids · depth contours · signal paths

## NEGATIVE PROMPT
<!-- Inclure dans les outils qui supportent les negative prompts (Midjourney, Flux, SD) -->
→ See `prompts/negative_prompt_standard.md` for the full list.
Summary: neon, cyberpunk, gaming, RGB, glitch, startup branding, cartoon, kawaii, clickbait,
shocked face, red arrows, stock photography, corporate aesthetic, saturated gradients.

## MASCOT CONSTRAINTS (if mascot is used)
→ See `identity/mascot.md` for full specification.
Summary: silent, intelligent, symbolic, restrained, observant, non-cartoon, geometric primitives.

## OUTPUT FORMAT
- Follow the destination channel spec:
  - YouTube thumbnails: `channels/youtube.md` (16:9, safe margins)
  - Etsy / print: `channels/etsy.md` (300dpi, CMYK)
  - Podcast cover: `channels/podcast.md` (3000×3000px)
- Transparent background only when explicitly required.
- Print-ready export when the deliverable is intended for print.

## TOOL-SPECIFIC PARAMETERS
### Midjourney
```
[your prompt above] --ar 16:9 --style raw --v 6.1 --no neon cyberpunk gaming RGB
```
### DALL-E / GPT-4o
Use the full prose prompt above. Specify aspect ratio in the request.
### Flux / Stable Diffusion
Add negative prompt from `prompts/negative_prompt_standard.md`.
### Ideogram / Recraft
Specify font family: IBM Plex Sans for any text elements.
