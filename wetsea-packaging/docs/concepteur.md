# Guide concepteur

*Public : qui définit la ligne éditoriale et la marque WetSeaTech.*

Le « design » ici n'est pas visuel uniquement : c'est le **canon éditorial** qui
contraint toute génération. Il est encodé dans le code, donc reproductible.

## Le canon WetSeaTech

Valeurs : intelligence technique, rigueur scientifique, cyber, architecture,
systèmes complexes, pensée long terme, documentation premium, **sobriété**,
crédibilité, **aucun sensationnalisme**.

### Règles appliquées à chaque kit

| Élément | Règle |
|---|---|
| **Titre** | affirmation directe et mesurable, ≤ 60 caractères, sans hyperbole/buzzword |
| **Hook (CLAC)** | Contexte · Lean-in · Arrest · Counterdirection ; crée un vrai écart de connaissance ; ≤ 200 caractères ; pas d'auto-présentation |
| **Faits** | exactement 3, chacun étiqueté `[OBSERVED]` / `[INFERRED]` / `[HYPOTHETICAL]` ; `source_ref` = un `document` des sources d'or |
| **CTA** | pas de marketing, orienté action, ≤ 80 caractères |
| **Chapitres** | ≥ 3, format `MM:SS`, chronologiques, le premier est `00:00 Introduction` |
| **Interdits** | « en conclusion », « révolutionnaire », « game changer », « incontournable », « n'oubliez pas de liker » |

## Où c'est codifié (et comment le modifier)

| Fichier | Rôle | À modifier pour… |
|---|---|---|
| `src/generator.ts` | **prompt système** (directives CLAC, taxonomie, format sources) | changer le ton, ajouter une consigne éditoriale |
| `src/schema.ts` | **invariants de marque** (`BRAND` : palette, `tone_flags`, `forbidden_phrases`, `visual_style`) + schéma du kit | ajouter une phrase interdite, changer la palette, ajouter un canal |
| `src/validator.ts` | **règles dures** (longueurs, 3 faits, chapitres, intégrité des sources) | durcir/assouplir une contrainte |

Principe clé : les invariants de marque (palette, tone, interdits) sont
**fusionnés après génération** (`assembleKit`) — le modèle ne les invente jamais.
La génération est forcée au **schéma strict** (structured outputs) puis revalidée,
avec une boucle de correction si une règle dure est violée.

## Référence

Le canon complet de l'Observatoire vit à la racine du dépôt
(`MASTER_DIRECTIVES.md`, `frameworks/clac.md`, `brand/`, `design_tokens.yaml`).
Le pipeline en est l'implémentation exécutable pour la vidéo.
