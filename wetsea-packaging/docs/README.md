# Documentation WetSea — pipeline de packaging vidéo

Index de la documentation, par rôle. Tout est ancré sur le pipeline réel
(`wetsea-packaging/`) : un kit d'habillage généré à partir d'une vidéo +
sources, publié vers **YouTube**, **Hugo** et **WordPress**.

| Rôle | Document | Pour |
|---|---|---|
| 👀 Utilisateur | [utilisateur.md](./utilisateur.md) | Ce qui est publié et où le voir |
| ✍️ Éditeur | [editeur.md](./editeur.md) | Préparer une vidéo, relire, valider avant publication |
| 🎨 Concepteur | [concepteur.md](./concepteur.md) | Le canon éditorial (CLAC, taxonomie, schéma) et comment le modifier |
| 🛠️ Administrateur | [administrateur.md](./administrateur.md) | Déployer, exploiter, sécuriser, lancer les batchs |
| 🏗️ Architecture | [architecture.md](./architecture.md) | Vues fonctionnelle et technique, flux, auth, décisions |

---

## Comment voir le site / vérifier une publication

Le pipeline a **trois sorties**. Selon ce que tu veux vérifier :

| Sortie | Où regarder | Quand ça apparaît |
|---|---|---|
| **YouTube** | la page de la vidéo `@wetseatech` (titre, description, chapitres cliquables) | après l'étape *publish to YouTube* avec `YT_PUBLISH="true"` |
| **Hugo** | `https://next.wetandseaai.fr` (et `https://wst-tech.org`) | après le commit `data/packaging/<id>.json` → build Cloudflare du dépôt site |
| **WordPress** | `https://wetandseaai.fr` | après que le publisher Python promeut le **brouillon Notion** |
| **Notion** (intermédiaire) | base « 📚 Episodes - Chroniques » (Statut `📝 Brouillon`) | après l'étape *publish to Notion* avec `NOTION_PUBLISH="true"` |

### Vérifier l'exécution elle-même

- **Cloudflare dashboard** → Workers → `wetsea-packaging` :
  - **Logs** (temps réel) ;
  - **Workflows** : une instance par vidéo (`PACKAGING` pour le pipeline complet,
    `PUBLISH` pour le batch). Chaque instance montre ses étapes et leur statut.
- **Mode dry-run** (flags à `"false"`, défaut) : les étapes *composent* le titre,
  la description, le brouillon… **sans rien écrire**. La sortie du Workflow
  contient `applied: false` — c'est le moyen sûr de tout vérifier avant d'activer.
- **Idempotence Notion** : si un brouillon existe déjà pour la vidéo
  (`ID_Episode` = lien YouTube), l'étape renvoie `skipped: true`.
