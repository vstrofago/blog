# Tema Hugo VSTROFAGO — diseño

Fecha: 2026-09-17 · Estado: aprobado (desarrollo autónomo autorizado)
Alcance: sustituir PaperMod por un tema propio que implemente el VSTROFAGO Design System.

## Objetivo

Un tema Hugo que renderice el blog bilingüe (EN/ES) con la estética del DS: mesa de
dibujo, papel cálido, rejilla cobalto, tics en L, un único acento. Sin JavaScript
obligatorio: todo se ve correcto y completo sin JS.

## Decisiones

- **D1 — Ubicación.** El tema vive en `themes/vstrofago/`, versionado dentro del repo,
  sin submódulo. PaperMod se elimina junto con `.gitmodules` y el override
  `layouts/_partials/header.html`.
- **D2 — Tokens.** `tokens/{colors,typography,spacing,patterns,animations,base}.css` se
  copian **verbatim** del DS y son la única fuente de color/tipo/espacio. `tokens/fonts.css`
  se sustituye por `@font-face` autocontenido (Sanchez + IBM Plex Mono desde
  `static/fonts/`, binarios ya presentes en el DS). Desviación documentada: elimina la
  dependencia de Google Fonts.
- **D3 — Variante oscura.** El DS declara modo claro único. La oscura es una **extensión
  de canal** aislada en `assets/css/vf-dark.css`, activada solo por
  `html[data-theme="dark"]`, y **opt-in explícito**: sin JS, sin elección guardada o con
  JS desactivado, el sitio es claro. No se toca ningún token del DS.
- **D4 — Código.** Tema de sintaxis restringido a papel/tinta/cobalto (sin colores
  semánticos, que el DS eliminó). Los niveles de tinta hacen el trabajo; el cobalto marca
  palabra clave y número.
- **D5 — Motion.** Los contratos del DS (`.vf-stage`, `.is-armed`, `.is-playing`) se
  controlan con un `IntersectionObserver` de ~30 líneas. `prefers-reduced-motion` no arma
  nunca: se ve el estado final. Sin fades, sin blurs, sin gradientes.
- **D6 — Búsqueda.** Índice JSON generado por Hugo + búsqueda cliente vanilla (`/search/`).
  No entra al menú hasta que se decida; la página existe.
- **D7 — Paridad funcional.** Se preservan: TOC, tiempo de lectura, conteo de palabras,
  breadcrumbs, prev/next, tags, RSS, sitemap, multiidioma con `translationKey`, toggle de
  idioma (con fallback a la home traducida), toggle de tema, y `outputs.home` JSON.

## Superficies

| Superficie | Plantilla | Piezas DS |
|---|---|---|
| Home | `baseof` + `home` | placa destacada con tics, kicker, display Sanchez cobalto, `.vf-underline`, índice numerado `N.º 01` |
| Lista de sección | `list` | kicker + display, filas con regla 1px, meta mono, `.vf-rise` escalonado |
| Entrada | `single` | breadcrumbs, kicker meta, display-xl, placa TOC con `.vf-panel-grid`, cuerpo mono, bloque de código en `--bg-deep` |
| Taxonomía / término | `taxonomy`, `term` | tags como `.vf-tag`, filas |
| Acerca de | `single` | mismo contrato |
| 404 | `404` | placa con tics, display, enlaces de estado |
| Búsqueda | `search` | input mono + filas de resultado |
| Chrome | `_partials/*` | header con wordmark + menú; footer como **campo cobalto** (`--blue-700`) |

## Verificación

Criterio de aceptación (checklist de `vstrofago-ds-apply`):

1. `grep` de residuos = 0: `gradient`, `backdrop-blur`, `rounded-full`, `prefers-color-scheme: dark` en tokens.
2. Un solo acento cobalto; bordes 1px; radios 2–6px (10 solo en placas).
3. Ningún `<a href="#">`: enlaces sin URL son `<span aria-disabled="true">`.
4. Con `prefers-reduced-motion: reduce` todo aparece en estado final.
5. `hugo --gc --minify` sin errores ni warnings; `index.json`, RSS y sitemap por idioma.
6. Sin JS: navegación, lectura y TOC funcionan; el tema es claro.

## Fuera de alcance

Plantillas de YouTube (miniaturas, overlays, end screen, decks) y los componentes JSX del
DS: no aplican a un sitio estático de texto. La oscura no se propone al DS como token.

## Resultado

Tema propio en `themes/vstrofago/` (39 archivos), PaperMod y su submódulo fuera, CI sin
`submodules`. Verificación automatizada en navegador real: **51/51 comprobaciones**, con
`docs/superpowers/verify-theme.cjs` (Playwright local; el navegador remoto de Hermes no
alcanza `localhost`).

| Comprobado | Valor medido |
|---|---|
| Papel claro / tinta oscura | `#F4F3EE` / `#101216` |
| Acento | `#1249D6` claro, `#4D79F0` oscuro (mismo cobalto, aclarado un paso) |
| Contraste cuerpo/fondo | 13.46 claro · 15.02 oscuro |
| Fuentes | Sanchez y IBM Plex Mono cargadas desde `/fonts` (sonda 1580px vs Georgia 1431px) |
| Modo oscuro | opt-in, persiste en `localStorage`, sin elección vuelve a claro |
| reduced-motion | nada armado, todo en estado final |
| Móvil 390px | sin overflow; nada queda oculto tras recorrer la página |
| Impresión | `@media print` desarma el motion y oculta el chrome |
| Residuos del DS | 0 (gradientes/blur/pills/`href="#"`); los `linear-gradient` del CSS del DS son rejillas |
| Búsqueda | índice por idioma: EN y ES encuentran su propia entrada |

## Decisiones tomadas durante la implementación

- **D8 — Numeración.** Las entradas se numeran `N.º NN` desde el total de la sección
  (mapa `RelPermalink → número`), no desde el paginador: sobrevive a la paginación y a
  `Pager.PageSize` (eliminado en Hugo moderno).
- **D9 — Etiquetas distintas.** La placa destacada dice `DESTACADA/FEATURED`; la lista,
  `MÁS ENTRADAS/MORE ENTRIES` con enlace `TODAS LAS ENTRADAS/ALL ENTRIES`. Se evita repetir
  "últimas entradas" dos veces en la misma pantalla.
- **D10 — Rejilla bajo el texto.** Se mantiene la rejilla del DS como fondo de página (es
  el motivo central del sistema) en vez de dar un lienzo opaco al contenido.
- **D11 — Subrayado del hero.** El grosor del subrayado viene de `tokens/animations.css`
  del DS; no se modifica allí. Si el canal quiere afinarlo, se cambia en el DS y baja solo.
- **D12 — Motion por scroll.** El contenido se revela al entrar en pantalla (contrato del
  DS). Consecuencia asumida: una captura `fullPage` sin recorrer la página muestra filas
  aún no reveladas. Cubierto para `reduced-motion` y para impresión.

## Pendiente (a decisión del usuario)

- Publicar: el trabajo está sin commitear a propósito para que se revise el diff antes de
  tocar `main` (un push despliega).
- Búsqueda: la página existe en ambos idiomas pero **no** entra al menú hasta que se decida.
- Imagen Open Graph: hoy apunta al lockup oficial; una tarjeta 1200×630 propia sería el
  siguiente paso natural.
- `latest` y `index` quedan en los i18n: `latest` ya no se usa, `index` sí.
