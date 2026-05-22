# WetSea Observatory — Canal Podcast
<!-- Enrichi depuis docs/podcast_cover_prompts.md -->

> Palette & typo → `design_tokens.yaml` | Interdits → `identity/forbidden.md`

---

## Format technique

- **Dimensions** : 3000×3000 px (carré obligatoire pour les plateformes podcast)
- **Résolution** : 300 dpi
- **Format livrable** : JPEG ou PNG, profil couleur sRVB
- **Taille de fichier** : < 2 MB (contrainte Spotify / Apple Podcasts)

---

## Structure de composition

```
┌─────────────────────────────────┐
│                                 │
│      [espace négatif haut]      │
│                                 │
│    ┌───────────────────────┐    │
│    │   EMBLÈME CENTRAL     │    │
│    │   (sujet principal)   │    │
│    └───────────────────────┘    │
│                                 │
│  [anneau de données périphérique│
│   ou contexte cartographique]   │
│                                 │
│  TITRE · 3–4 MOTS MAX           │
│  sous-label optionnel           │
│                                 │
└─────────────────────────────────┘
```

- Emblème central : sujet fort, géométrique, une seule idée
- Anneau périphérique : lignes de route, cercles radar, marqueurs de données
- Espace négatif : minimum 30% de la surface totale
- Composition peut être légèrement asymétrique

---

## Typographie

- **Titre** : IBM Plex Sans, uppercase, graisse 600, 3–4 mots maximum
- **Nom de l'émission** : Playfair Display ou IBM Plex Sans, taille plus petite que le titre
- **Sous-label** : IBM Plex Mono pour numéros d'épisode, dates, saisons (optionnel)
- Taille lisible à 55×55 px (aperçu mobile dans les apps podcast)

---

## Palette appliquée

| Élément | Token | Hex |
|---|---|---|
| Fond | deep-navy | `#0A1A2B` |
| Emblème principal | off-white ou muted-cyan | `#F2F1EC` / `#5E8FA3` |
| Anneau de données | muted-cyan | `#5E8FA3` (opacité 40–70%) |
| Titre | off-white | `#F2F1EC` |
| Sous-label | mineral-sand | `#C9BDA8` |

---

## Prompt opérationnel

```
"Minimal cinematic podcast cover for WetSea Observatory, oceanic infrastructure motif,
cartographic textures, instrument-style labeling, restrained palette deep navy and muted cyan,
premium editorial finish, timeless design, central emblem with peripheral data ring,
3000x3000 composition, no neon, no cartoon, no gaming aesthetic."
```

→ Voir aussi `prompts/master_prompt.md` pour le template complet.

---

## Variantes par série

Si plusieurs séries coexistent, différencier par :
- Variation de l'emblème central (même ADN, sujet différent)
- Conservation stricte de la palette et du layout
- Sous-label de série en mineral-sand pour identification rapide

---

## Interdits spécifiques podcast

En complément de `identity/forbidden.md` :
- Microphone ou casque comme sujet principal (trop générique)
- Ondes sonores stylisées en vert/rouge (cliché podcast)
- Photo de visage ou portrait en fond
- Titre sur plus de 2 lignes
- Taille de texte illisible à 55 px

---

## Checklist de validation

- [ ] Lisible comme vignette à 55×55 px ?
- [ ] Maximum 4 mots de titre ?
- [ ] Emblème identifiable sans le texte ?
- [ ] Palette respectée (aucun cyan saturé, aucun neon) ?
- [ ] Espace négatif ≥ 30% ?
