# Environnement Claude Code « WetSea » — checklist de configuration

> À configurer dans l'app Claude Code web (création/édition d'environnement).
> Les **secrets ne sont pas commités** — ils se saisissent dans l'UI de
> l'environnement (ou via `wrangler secret put` pour le Worker au déploiement).
> Ce fichier ne liste que **les noms et l'origine**, jamais les valeurs.

CMS canonique : **les deux** — Hugo (`wetandseaai-site`) *et* WordPress
(`chroniques-...-publisher`). La chaîne fan-out : YouTube + Hugo + WordPress.

## 1. Dépôts (sources de l'environnement)

| Dépôt | Rôle dans la chaîne |
|---|---|
| `froment/wetsea-observatory` | Pipeline `wetsea-packaging/` + canon éditorial/marque |
| `froment/wetandseaai-site` | Cible **Hugo** (`wst-tech.org` / `next.wetandseaai.fr`) |
| `froment/chroniques-wetandseaai-publisher` | Cible **WordPress** (`wetandseaai.fr`) + source Notion |
| `froment/quiz_video_generator` | Générateur (optionnel, si réconciliation nécessaire) |

## 2. Secrets & variables (inventaire consolidé)

| Domaine | Nom | Utilisé par | Origine |
|---|---|---|---|
| Anthropic | `ANTHROPIC_API_KEY` | wetsea-packaging (génération Opus 4.8) | console.anthropic.com |
| Drive | `GCP_SA_EMAIL` | wetsea-packaging (lecture sources) | service account GCP |
| Drive | `GCP_SA_PRIVATE_KEY` | wetsea-packaging | clé SA (PEM PKCS8, bloc complet) |
| Drive | `DRIVE_ROOT_FOLDER_ID` | wetsea-packaging | id du dossier Drive `/WetSea` |
| GitHub | `GITHUB_TOKEN` | wetsea-packaging (commit Hugo) | PAT fine-grained, Contents:write sur `wetandseaai-site` |
| Cloudflare | `CLOUDFLARE_API_TOKEN` | `wrangler deploy` | dashboard CF (perm. Edit Workers) |
| Cloudflare | `CLOUDFLARE_ACCOUNT_ID` | `wrangler deploy` | dashboard CF |
| YouTube | `YT_CLIENT_ID` / `YT_CLIENT_SECRET` | write-back | OAuth client (proprietaire chaîne) |
| YouTube | `YT_REFRESH_TOKEN` | write-back | scope `youtube.force-ssl` |
| YouTube | `YT_PUBLISH` | gate (var, pas secret) | `"true"` pour publier, sinon dry-run |
| Notion | `NOTION_TOKEN` | chroniques + wetsea-packaging (draft) | intégration Notion (`ntn_…`) avec accès à la DB |
| Notion | `NOTION_DATA_SOURCE_ID` | wetsea-packaging | déjà préréglé : `647e4372-7470-4441-8435-cf3cc7680682` |
| Notion | `NOTION_PUBLISH` | gate (var) | `"true"` pour créer le brouillon, sinon dry-run |
| WordPress | `WORDPRESS_URL` | chroniques (publication) | `https://wetandseaai.fr` |
| WordPress | `WP_USERNAME` / `WP_PASSWORD` | chroniques | application password WordPress |

> Note : la DB Notion (`01150dde…`) est codée en dur dans le publisher ;
> seul `NOTION_TOKEN` est requis comme secret.

## 3. Politique réseau (egress à autoriser)

Si l'environnement utilise une politique « limited », autoriser :

- `api.anthropic.com`
- `*.googleapis.com`, `oauth2.googleapis.com` (Drive + YouTube)
- `api.github.com`, `github.com`
- `api.notion.com`
- `wetandseaai.fr` (REST WordPress)
- `api.cloudflare.com` (déploiement Worker)

(npm / PyPI sont déjà hors-proxy par défaut.)

## 4. Vérification rapide après config

- Une session démarrée sur cet environnement doit voir les 4 dépôts sans
  `add_repo`.
- `wetsea-packaging` : `npm run typecheck` doit passer ; `YT_PUBLISH` reste
  `"false"` tant que le write-back n'est pas validé.
- `chroniques` : `python core/health_check.py --verbose` doit voir Notion +
  WordPress en vert.
