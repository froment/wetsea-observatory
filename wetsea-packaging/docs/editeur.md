# Guide éditeur

*Public : qui prépare et valide le contenu d'une vidéo.*

Ton rôle : fournir la **matière première** (description + sources validées) et
**relire** avant que ça parte en ligne. Tu ne touches pas au code.

## 1. Préparer la matière (NotebookLM → Drive)

La source canonique est **NotebookLM** (vidéo + « golden sources »). Le pipeline
ne lit pas NotebookLM directement : tu **miroites** la matière dans Google Drive,
un dossier par vidéo :

```
/WetSea/<videoId>/
  brief.md       # la description / les notes de la vidéo
  sources.json   # la liste des sources d'or validées
```

`videoId` = l'identifiant YouTube de la vidéo (ex. `7C9LEnHSX6o`).

### Format `sources.json`

Un tableau d'objets (voir `../sources.example.json`) :

```json
[
  {
    "document": "Titre exact de la source",
    "auteur": "Auteur / organisme",
    "date": "2024",
    "claim": "Ce que la source établit, en une phrase.",
    "fait_label": "OBSERVED",
    "url": "https://…"
  }
]
```

⚠️ **`document` est la clé** : chaque fait généré la référence à l'identique.
N'invente pas de source ; mets uniquement des références réelles et vérifiables.

## 2. Laisser le pipeline générer le kit

À partir du brief + sources, le système produit un **kit** (titre, accroche,
3 faits étiquetés, CTA, sources, chapitres) qui respecte des règles strictes
(longueurs, chapitres, intégrité des sources).

## 3. Relire avant publication

Rien ne part en ligne sans validation :

- **WordPress** : le pipeline crée un **brouillon Notion** (Statut `📝 Brouillon`)
  dans la base « 📚 Episodes - Chroniques ». **Relis-le**, ajuste si besoin, puis
  fais-le promouvoir en `📋 Publié` (le publisher Python pousse alors vers
  `wetandseaai.fr`).
- **YouTube** : tant que la publication réelle n'est pas activée, l'étape produit
  le titre/description **sans** modifier la vidéo (dry-run). Vérifie le rendu,
  puis l'administrateur active la publication.

## 4. Points de contrôle qualité

- Les 3 faits sont-ils correctement étiquetés (OBSERVED / INFERRED / HYPOTHETICAL) ?
- Les sources marquées `à vérifier` ont-elles été confirmées ?
- Les chapitres commencent-ils par `00:00 Introduction` et suivent-ils la vidéo ?
- Le titre est-il sobre (pas de sensationnalisme, pas de phrase interdite) ?
