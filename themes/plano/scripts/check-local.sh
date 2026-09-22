#!/usr/bin/env bash
# Reproduce localmente, paso a paso, lo que hace .github/workflows/build.yaml.
# Sirve para no publicar un CI que no se ha ejecutado nunca.
set -euo pipefail
cd "$(dirname "$0")/.."   # raíz del tema (themes/plano)
echo "== raíz: $(pwd)"

echo
echo "== paso 1: el tema está completo"
for f in theme.toml LICENSE README.md layouts/baseof.html \
         assets/css/vf-site.css assets/css/vf-dark.css \
         assets/js/vf-theme.js i18n/en.toml static/fonts/OFL.txt; do
  test -e "$f" || { echo "::error::falta $f"; exit 1; }
done
grep -q 'name = "Plano"' theme.toml || { echo "::error::theme.toml no declara el nombre"; exit 1; }
echo "   ok"

echo
echo "== paso 2: se ensambla y compila el sitio de ejemplo"
site=$(mktemp -d)/site
mkdir -p "${site}/themes"
rsync -a --exclude .git --exclude exampleSite ./ "${site}/themes/plano/"
rsync -a ./exampleSite/ "${site}/"
hugo --source "${site}" --gc --minify --panicOnWarning --baseURL https://example.org/ >/dev/null
echo "   ok"

echo
echo "== paso 3: el sitio construido tiene lo que debe"
pub="${site}/public"
for f in index.html es/index.html index.json es/index.json 404.html \
         sitemap.xml index.xml tags/index.html posts/index.html; do
  test -f "${pub}/$f" || { echo "::error::falta $f en el sitio construido"; exit 1; }
done
test "$(ls "${pub}"/css/vf.min.*.css | wc -l)" -eq 1 || { echo "::error::se esperaba un único bundle CSS"; exit 1; }
grep -q 'data-theme' "${pub}/css/"vf.min.*.css || { echo "::error::el bundle CSS no incluye la variante oscura"; exit 1; }
echo "   ok"

echo
echo "== tamaños que afirma el README"
src_css=$(find assets/css -name '*.css' -exec cat {} + | wc -c)
src_js=$(find assets/js -name '*.js' -exec cat {} + | wc -c)
built_css=$(stat -c%s "${pub}/css/"vf.min.*.css)
built_js=$(cat "${pub}"/js/vf.min.*.js "${pub}"/js/vf-search.min.*.js | wc -c)
printf '   CSS fuente: %s KB | CSS construido (min): %s KB\n' "$((src_css/1024))" "$((built_css/1024))"
printf '   JS  fuente: %s KB | JS  construido (min): %s KB\n' "$((src_js/1024))" "$((built_js/1024))"
echo "   localidades de plantillas: $(find layouts -name '*.html' | wc -l) archivos"
echo
echo "TODO OK"
rm -rf "$(dirname "$site")"
