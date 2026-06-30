# Guide administrateur

*Public : exploitation, déploiement, sécurité.*

## Déploiement

Le pipeline est un **Worker Cloudflare** (+ Workflows). Voir aussi `../README.md`
et `../ENVIRONMENT.md`.

```sh
cd wetsea-packaging
npm ci
npm run typecheck
# secrets (une fois) :
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GCP_SA_EMAIL
wrangler secret put GCP_SA_PRIVATE_KEY
wrangler secret put GITHUB_TOKEN
wrangler secret put NOTION_TOKEN
wrangler secret put YT_CLIENT_ID
wrangler secret put YT_CLIENT_SECRET
wrangler secret put YT_REFRESH_TOKEN   # via `npm run get-yt-token`
# vars dans wrangler.toml : DRIVE_ROOT_FOLDER_ID, NOTION_DATA_SOURCE_ID (préréglé)
npm run deploy
```

## Activation par paliers (sûr par défaut)

Tout est **opt-in**. On active une sortie à la fois après vérification en dry-run.

| Flag (var `wrangler.toml`) | Effet |
|---|---|
| `YT_PUBLISH = "false"` → `"true"` | écrit réellement titre/description/chapitres sur la vidéo |
| `NOTION_PUBLISH = "false"` → `"true"` | crée réellement le brouillon Notion |

Le commit Hugo (`data/packaging/<id>.json`) n'est pas derrière un flag — il écrit
dans le dépôt site via `GITHUB_TOKEN`. Restreins ce PAT à `Contents:write` sur
`wetandseaai-site` uniquement.

## Exploitation

| Déclencheur | Effet |
|---|---|
| **cron** (`wrangler.toml [triggers]`) | découvre les dossiers `/WetSea/*` sans kit publié et lance le pipeline complet pour chacun |
| `POST /run { videoId, folderId, sujet }` | pipeline complet pour une vidéo |
| `POST /publish { kits: [...] }` | **batch rétroactif** : publie des kits déjà calculés vers YouTube + Notion (accepte `examples/pilot_kits.json` tel quel) |

Suivi : Cloudflare → Workers → `wetsea-packaging` → **Logs** + **Workflows**
(instances `PACKAGING` / `PUBLISH`, étape par étape).

## Sécurité

- **Secrets** : seulement dans l'UI de l'environnement / `wrangler secret` —
  jamais commités. Voir l'inventaire dans `../ENVIRONMENT.md`.
- **Isolation** : le pipeline tourne dans un **conteneur éphémère** (invocation
  Worker) ; egress à limiter aux hôtes listés dans `../ENVIRONMENT.md`.
- **Auth, par sortie** :
  - Drive = **service account** (lecture seule, dossier `/WetSea` partagé) ;
  - YouTube = **OAuth propriétaire de la chaîne** (refresh token) — pas un SA ;
  - GitHub = PAT fine-grained ;
  - Notion = token d'intégration ; WordPress = application password (côté
    publisher Python).
- **Rollback** : repasser les flags à `"false"` arrête toute écriture externe
  immédiatement (les étapes repassent en dry-run).

## Quotas à surveiller

- YouTube Data API : `videos.update` ≈ 50 unités ; quota par défaut 10 000/jour
  (≈ 200 updates/jour) — large pour ~40 vidéos.
- Notion : ~3 req/s — sans souci au rythme du batch.
