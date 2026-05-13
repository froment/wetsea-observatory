#!/usr/bin/env bash
# build_master.sh — Génère MASTER_DIRECTIVES.md en consolidant tous les .md du repo
# Auto-exécuté par GitHub Action sur push vers main.

set -euo pipefail

OUTPUT="MASTER_DIRECTIVES.md"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

cat > "$OUTPUT" <<HEADER
# WST Observatory — Directives Consolidées

> **Auto-généré** par \`scripts/build_master.sh\` · Last update : $TS
> Source : https://github.com/FROMENT/wetsea-observatory
> **Ne pas éditer ce fichier manuellement** — il est régénéré à chaque push.

Ce document concatène toutes les directives du repo pour servir de **source
unique NotebookLM** (Pattern C). Tout LLM qui utilise ce document a accès à
l'intégralité de la charte WST en une seule source indexée.

---

## 📚 Table des matières

HEADER

# Liste des .md (exclusions : MASTER lui-même, archives, .git)
FILES=$(find . -name "*.md" \
  -not -path "./MASTER_DIRECTIVES.md" \
  -not -path "./.git/*" \
  -not -path "./archive/*" \
  -not -path "./node_modules/*" | sort)

# Sommaire
echo "$FILES" | while read -r f; do
  REL="${f#./}"
  TITLE=$(grep -m1 '^# ' "$f" 2>/dev/null | sed 's/^# //' || echo "$REL")
  echo "- **[\`$REL\`](#source-$(echo "$REL" | tr '/.' '--' | tr '[:upper:]' '[:lower:]'))** — $TITLE"
done >> "$OUTPUT"

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"

# Concaténation contenu
echo "$FILES" | while read -r f; do
  REL="${f#./}"
  ANCHOR=$(echo "$REL" | tr '/.' '--' | tr '[:upper:]' '[:lower:]')
  {
    echo ""
    echo "<a id=\"source-$ANCHOR\"></a>"
    echo ""
    echo "## 📄 SOURCE: \`$REL\`"
    echo ""
    cat "$f"
    echo ""
    echo "---"
  } >> "$OUTPUT"
done

# Stats
LINES=$(wc -l < "$OUTPUT" | tr -d ' ')
WORDS=$(wc -w < "$OUTPUT" | tr -d ' ')
SIZE_KB=$(du -k "$OUTPUT" | cut -f1)
NUM_FILES=$(echo "$FILES" | wc -l | tr -d ' ')

echo ""
echo "✓ Généré : $OUTPUT"
echo "  Fichiers concaténés : $NUM_FILES"
echo "  Lignes              : $LINES"
echo "  Mots                : $WORDS"
echo "  Taille              : ${SIZE_KB} KB"
