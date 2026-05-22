# Typography
<!-- Source canonique complétée — design_tokens.yaml section `typography` fait référence -->

## Font Stack

### Primary Serif — Autorité éditoriale
- **Recommandé** : Playfair Display
- **Alternatives** : Libre Baskerville · EB Garamond · Cormorant Garamond
- **Fallback système** : Georgia, 'Times New Roman', serif
- **Usage** : texte long-form (blog, articles), titres H1, affiches, descriptions Etsy premium
- **Mot-clé pour prompts IA** : *"Playfair Display editorial serif, elegant, restrained"*

### Primary Sans — Précision technique
- **Recommandé** : IBM Plex Sans *(open-source, préféré)*
- **Alternatives** : Space Grotesk · Inter · Suisse Int'l
- **Fallback système** : 'Helvetica Neue', Arial, sans-serif
- **Usage** : labels UI, métadonnées, texte de miniatures YouTube, annotations de données, tags courts
- **Mot-clé pour prompts IA** : *"IBM Plex Sans geometric sans, clean technical"*

### Monospace — Données techniques uniquement
- **Recommandé** : IBM Plex Mono
- **Alternatives** : Space Mono · JetBrains Mono
- **Fallback système** : 'Courier New', monospace
- **Usage** : coordonnées GPS, timestamps, IDs de câbles, annotations techniques de précision
- **Note** : usage très limité — élément de détail, jamais fonte principale

## Hierarchy

| Niveau | Famille | Graisse | Espacement | Style |
|---|---|---|---|---|
| H1 | Serif | 600–700 | Tracking serré (–0.02em) | Contraste élevé, autorité éditoriale |
| H2 / H3 | Sans | 500 | Standard (0 à +0.01em) | Structuré, retenu |
| Corps | Serif | 400 | Line-height 1.65 | 55–75 caractères par ligne |
| Légendes / metadata | Sans ou Mono | 400 | Uppercase autorisé | 0.75–0.875em relatif au corps |

## Rules

- Maximum 2 familles de fontes par composition.
- Éviter les fontes fantaisie, futuristes ou gaming.
- Éviter les effets d'outline épais, strokes lourds, glows.
- Longueur de ligne corps : 55–75 caractères.
- Titres courts (3–6 mots) en uppercase pour thumbnails et covers.
- Hiérarchie maximale : 1 titre fort + 1 sous-titre + 1 couche d'annotation.
