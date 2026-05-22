# WetSea Observatory — Canal YouTube
<!-- Fusionne youtube/README.md + youtube/thumbnail_rules.md + prompts/youtube_thumbnail_prompt.md -->

> Palette & typo → `design_tokens.yaml` | Interdits → `identity/forbidden.md`

---

## Format technique

- **Ratio** : 16:9
- **Résolution recommandée** : 1280×720 px minimum, 1920×1080 px préféré
- **Marges de sécurité texte** : 5% depuis chaque bord
- **Espace sécurisé mobile** : conserver le sujet principal dans les 80% centraux

---

## Structure de composition

**Règle fondamentale : une seule idée par thumbnail.**

| Couche | Contenu |
|---|---|
| Fond | Contexte cartographique ou infrastructurel (deep navy base) |
| Milieu | Sujet technique principal (câble, port, radar, infrastructure) |
| Premier plan | Texte titre (3–6 mots) + sous-label optionnel |

- Composition asymétrique — sujet ancré aux tiers, jamais centré
- Espace négatif délibéré : minimum 25% de surface non chargée
- Profondeur atmosphérique : grain éditorial 5–12% d'opacité

---

## Typographie

- **Fonte principale** : IBM Plex Sans (condensed autorisé pour les titres)
- **Fallback** : Space Grotesk, Inter
- **Titre** : 3–6 mots, uppercase, graisse 600–700
- **Sous-label** : optionnel, 1–2 mots, graisse 400, taille 60% du titre
- Maximum 2 familles de fontes par image
- Éviter les effets d'outline épais, les glows, les ombres dures

---

## Palette (extraite de `design_tokens.yaml`)

| Rôle | Hex | Usage |
|---|---|---|
| Fond | `#0A1A2B` (deep-navy) | Base 85–90% de la surface |
| Accent | `#5E8FA3` (muted-cyan) | Signal, lignes, nœuds — 10% max |
| Texte | `#F2F1EC` (off-white) | Titre principal |
| Secondaire | `#C9BDA8` (mineral-sand) | Sous-label, annotations |

---

## Éléments visuels récurrents

Privilégier selon le sujet :
- Routes maritimes et lignes de câbles
- Cercles radar / sonar
- Grilles d'infrastructure, cartes de réseau
- Ports, terminaux, relais
- Superpositions tactiques et données abstraites

---

## Ton visuel

- Éditorial documentaire — pas clickbait
- Tension retenue — révèle quelque chose, ne crie pas
- Atmosphérique — grain, brume légère, lumière cinématographique douce
- Lisible en vignette mobile (tester à 120×67 px)

---

## Prompt opérationnel

→ `prompts/youtube_thumbnail_prompt.md`

---

## Interdits spécifiques YouTube

En complément de `identity/forbidden.md` :
- Flèches rouges pointant vers des éléments
- Visages en gros plan ou expressions réactives
- Texte en majuscules criard sur fond blanc
- Vignettes centrées avec sujet isolé sans contexte
- Thumbnails "before/after" avec comparaisons évidentes

---

## Anti-drift — questions de validation

- [ ] Lisible à 120 px de large sur mobile ?
- [ ] Un seul concept principal visible ?
- [ ] Cyan utilisé comme signal, pas comme fond ?
- [ ] Aucun élément clickbait (flèche, visage choqué, rouge) ?
- [ ] La composition pourrait-elle s'appliquer à une série cohérente ?
