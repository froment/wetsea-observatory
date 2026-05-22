# WetSea Observatory — Canal Etsy
<!-- Enrichi depuis docs/etsy_branding.md -->

> Palette & typo → `design_tokens.yaml` | Interdits → `identity/forbidden.md`

---

## Familles de produits

| Famille | Format courant | Typographie |
|---|---|---|
| Affiches cartographiques d'archive | A3 / A2 / 18×24 in | Serif (Playfair Display) + Sans annotations |
| Prints d'étude d'infrastructure | A3 / A2 / 24×36 in | Sans technique (IBM Plex Sans) |
| Couvertures de carnets | 148×210 mm (A5), 210×297 mm (A4) | Serif ou Sans selon famille |
| Papeterie et stickers | Variable | Sans, lisible à petite taille |

---

## Formats de fichiers

- **Print haute résolution** : 300 dpi minimum
- **Espace colorimétrique** : CMJN pour impression, RVB pour aperçu numérique
- **Marges de sécurité** : 5 mm de fond perdu + 3 mm de marge intérieure

---

## Règles visuelles des listings

**Image hero :**
- Mockup neutre uniquement (cadre blanc, surface bois clair, fond uni)
- Aucun décor lifestyle (plantes, tasses, accessoires non approuvés)
- Éclairage plat ou légèrement latéral — pas de dramatisation

**Détails :**
- 2–4 images de détail rognées sur les zones d'intérêt (annotations, textures, typographie)
- Superpositions de légendes techniques en muted cyan / off-white

**Fond des mockups :**
- Blanc cassé (#F2F1EC compatible) ou béton clair
- Jamais de fond coloré ni sombre dans les photos produit

---

## Ton des textes listing

- Informatif, précis, non promotionnel
- Décrire le contenu technique et l'intention éditoriale
- Éviter : "magnifique", "incroyable", "parfait pour", langage marketing
- Préférer : "représentation de", "documentation de", "étude de", "carte de"

**Exemple de description :**
> "Archival study of the North Atlantic submarine cable network. Deep navy base with cartographic contour overlays and route annotations. Playfair Display typography. Print-ready at A2."

---

## Palette appliquée aux produits Etsy

| Élément | Token | Hex |
|---|---|---|
| Fond principal (print) | deep-navy | `#0A1A2B` |
| Texte long-form | off-white | `#F2F1EC` |
| Annotations / légendes | mineral-sand | `#C9BDA8` |
| Accents routes/data | muted-cyan | `#5E8FA3` |
| Zones secondaires | dark-ocean-green | `#1D3A3A` |

---

## Typographie Etsy

- **Titres affiches** : Playfair Display, graisse 600, tracking serré
- **Sous-titres / familles** : IBM Plex Sans, graisse 500
- **Annotations / coordonnées** : IBM Plex Mono, graisse 400
- Jamais plus de 2 familles par pièce

---

## Prompt opérationnel

→ `prompts/master_prompt.md`

---

## Interdits spécifiques Etsy

En complément de `identity/forbidden.md` :
- Mockups avec personnes (mains trop visibles, corps partiels en scène)
- Fonds de photos surchargés (bibliothèques, décors complexes)
- Polices décoratives ou fantaisie dans les titres produit
- Textes de description exagérément promotionnels
