#!/usr/bin/env bash
# Publica themes/plano en https://github.com/vstrofago/hugo-theme-plano
#
# El blog es la fuente: el tema vive dentro de este repositorio y el repositorio
# público es una copia extraída de ese directorio (git subtree split), no un
# proyecto aparte que se edita por separado. La dirección es una sola: del blog
# al tema. Si algún día se acepta trabajo en el repositorio del tema, esto se
# convierte en un rebase y no en un push directo.
#
# El split es determinista: si nada tocó el tema desde la última publicación, la
# extracción reproduce el mismo commit y el script no empuja nada.
set -euo pipefail

THEME=plano
REMOTE=https://github.com/vstrofago/hugo-theme-plano.git
BRANCH="export-${THEME}"

cd "$(dirname "$0")/.."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "no es un repositorio git"; exit 1; }

if [ -n "$(git status --porcelain)" ]; then
  echo "hay cambios sin commitear: commitea o guárdalos antes de publicar el tema"
  exit 1
fi

cleanup() { git branch -D "$BRANCH" >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "extrayendo themes/${THEME}…"
git subtree split --prefix="themes/${THEME}" -b "$BRANCH" >/dev/null

local_sha=$(git rev-parse "$BRANCH")
remote_sha=$(git ls-remote "$REMOTE" refs/heads/main | cut -f1)

if [ "$local_sha" = "$remote_sha" ]; then
  echo "al día: el repositorio del tema ya está en $local_sha"
  exit 0
fi

echo "publicando $local_sha (el remoto estaba en ${remote_sha:-vacío})"
git push "$REMOTE" "${BRANCH}:main"

published=$(git ls-remote "$REMOTE" refs/heads/main | cut -f1)
if [ "$published" != "$local_sha" ]; then
  echo "el remoto no quedó en lo esperado: $published != $local_sha"
  exit 1
fi

echo "hecho: $published"
echo
echo "recuerda: si el cambio merece versión, etiquétala"
echo "  git tag -a vX.Y.Z $BRANCH -m 'Plano X.Y.Z' && git push $REMOTE vX.Y.Z"
