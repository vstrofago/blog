# Tema Hugo «brutalistoic» para el blog — diseño

Fecha: 2026-09-21 · **Revisión 2: 2026-09-22** · Estado: **aprobado (desarrollo autónomo autorizado) · implementado 2026-09-22**
Alcance: sustituir el tema del blog (hoy `plano`) por un tema propio que implemente el DS
brutalistoic como sistema principal de vstrofago. Solo el blog: el tema vive en `themes/`
committed; «Plano» sigue su camino aparte (extracción/publicación independiente).

## Cambios en la revisión 2

El DS se actualizó a un sistema de **un solo tema** (repo `vstrofago/brutalistoic`, commit
`e026da5`); esta revisión reescribe el plan contra él. La revisión 1 no es implementable tal
cual. Lo que asumía y ya no existe:

| Rev. 1 asumía | Hoy |
|---|---|
| `paper` canónico (verde militar, tinta negra) y `terminal` opt-in con toggle, `localStorage` y script anti-parpadeo | **Un tema, `terminal`** (oscuro, `bg` `#141414`). No hay toggle, ni `localStorage`, ni `prefers-color-scheme` |
| Títulos de entrada en `slab` (Sanchez) | `ArticleHeader` usa `gothic` (**Jacquard24**) por defecto; `slab` queda para notas y READMEs |
| Cuerpo y UI en Geist Mono; entradilla en IBM Plex Serif | Cuerpo y UI en **Space Grotesk**; IBM Plex Serif **solo** dentro de `.bl-prose`; Geist Mono solo código y ASCII |
| Caras a cargar: Geist Mono, IBM Plex Serif, Sanchez, Jacquard24 | + **Space Grotesk** (cuerpo/UI, obligatoria) y **Techno Vibe** (subtítulos y eyebrows, obligatoria). Sanchez deja de hacer falta |
| Tokens `ink`, `ink-muted`, `line`, `line-soft`, `accent-text`, `surface`, `surface-2`, `focus` | `bg`, `fg`, `fgplus`, `og`, `gr`, `yl`, `rd`, `bl`, `mg` + derivados `--bl-muted`, `--bl-line`, `--bl-hover` |
| Texto tenue solo sobre `surface`/`surface-2` | No hay superficies más claras: las tarjetas se separan por **marco**. `--bl-muted` es 5.2:1 sobre `bg` |
| 18 componentes | **19** (+`MarbleDither`); `Cover`, `TitleCard` y `Slide*` son layouts de referencia |
| Chroma: comentarios `ink-muted`, keywords `accent-text` | Comentarios `--bl-muted`, keywords `--og`, números `--fgplus` (tabulares) |
| H1 44px en slab | H1 **Jacquard24** (`.bl-h1`, 42px mínimo, siempre el título mayor de la página; `.bl-gothic`/`--gothic-scale` para tamaños propios) |

## Objetivo

Un tema Hugo que renderice el blog bilingüe (EN/ES) con brutalistoic: flat 2D sin sombras,
un solo tema oscuro `terminal`, tipografía por rol (Jacquard24 h1, Techno Vibe subtítulos,
Space Grotesk cuerpo y UI, IBM Plex Serif solo en el cuerpo de las entradas, Geist Mono solo
código). La firma ASCII viva (AsciiBanner) solo en la portada; el resto del sitio sin React.
Sin JS, el sitio se ve completo y correcto.

## Decisiones

- **D1 — Ubicación y nombre.** Tema nuevo en `themes/brutalistoic/`, committed, sin
  submódulo (como hasta ahora). `hugo.toml` cambia de `plano` a `brutalistoic` al final,
  cuando la verificación pase; el cambio es reversible en una línea. Nombre propuesto:
  `brutalistoic` (alternativas si prefieres: `vstrofago`, `devoured`).
- **D2 — Integración del DS.** Copia vendorizada **verbatim** en
  `themes/brutalistoic/static/vendor/brutalistoic/{tokens,dist,fonts}` (la receta del skill:
  `tokens/` y `fonts/` hermanos; `verify-vendor.mjs` debe pasar, 19 componentes). `tokens.css`
  y `bundle.css` se enlazan tal cual (sin pasar por el pipeline, para conservar las rutas
  relativas de `@font-face`). Los archivos React 18 UMD (MIT) se añaden a
  `vendor/brutalistoic/react/` (el repo del DS no los trae). La capa de sitio (chrome) vive
  en `assets/css/` y sí pasa por el pipeline (concat + minify + fingerprint) como hoy.
- **D3 — Tema.** Un solo tema: `data-theme="terminal"` en el documento con `.bl-root` en
  `<body>`. **No hay toggle**: se elimina el conmutador, la clave de `localStorage` y el
  script anti-parpadeo de la cabecera. Nada de `prefers-color-scheme`.
- **D4 — Componentes.** Los componentes React que aportan estructura se reproducen en
  plantillas con el **mismo DOM y clases `.bl-*`** (Card, ArticleHeader, Terminal, Badge,
  Field, Frame/HUD, Logo, Button, Table). Criterio: dump headless del componente real y
  contraste contra el markup renderizado; nada de clases paralelas para cosas que el DS ya
  nombra. `.vf-*` queda solo para layout/chrome (página, cabecera, pie, hileras), nunca para
  componentes. Los tonos de `Badge` disponibles son `default`, `accent`, `ok`, `warn`, `err`,
  `info`, `outline`.
- **D5 — Movimiento.** Solo el del DS: animaciones CSS de `bundle.css` (flicker CRT, cursor,
  pulse del logo) y transiciones de 150-250 ms en hover. Se **elimina** el sistema de reveal
  por scroll del tema anterior (no es contrato del DS). `prefers-reduced-motion` detiene
  todo (ya está resuelto en `bundle.css`).
- **D6 — Portada.** El AsciiBanner es la única isla React, solo en la home, cargada en
  diferido con `IntersectionObserver` (React + bundle se descargan solo cuando el banner
  entra en pantalla; ~2.4 MB que no toca ningún otro page load). Sin JS o con
  reduced-motion: **fotograma horneado** — se extrae el markup quieto del propio bundle con
  Playwright y se commitea como partial estático, con altura reservada: nunca hay hueco ni
  CLS. Si la isla falla, el fotograma se queda. Props del componente: `rows`, `size`, `alt`;
  el banner es ASCII puro (sin barra de estado ni corchetes HUD), así que el fotograma
  tampoco los lleva.
- **D7 — Código.** Bloques como `.bl-terminal` + `.bl-crt` (el único estilo de código del
  DS, siempre oscuro). El resaltado sigue siendo Chroma (config actual, clases) con un mapeo
  a tokens del DS: comentarios `--bl-muted`, palabras clave `--og`, números `--fgplus`
  tabulares, tipos y builtins `--bl`, error `--rd` con subrayado (nunca color solo). El
  acento de señal de la pieza editorial es `mg`, reservado a kickers y eyebrows: Chroma no
  introduce un segundo acento. Botón de copiar vanilla (el de hoy). El typing del componente
  no se usa en artículos.
- **D8 — Búsqueda.** Mismo índice JSON y mismo motor vanilla; restilizado a `.bl-field`
  (prompt `>`) + filas de resultado. Sin JS: mensaje `noscript` (como hoy).
- **D9 — Fuentes.** Se vendorizan las caras que el tema usa: **Space Grotesk** (variable
  300-700; cuerpo y UI), **Jacquard24** (H1), **Techno Vibe** (subtítulos y eyebrows),
  **IBM Plex Serif** (Regular, Italic; cuerpo de entradas) y **Geist Mono** (Regular, Medium;
  código y ASCII). Se excluyen DFM* y Open Code (acentos especiales que el blog no usa).
  **Pendiente de licencia:** el repo del DS no trae `LICENSE` ni texto de licencia por cara;
  Techno Vibe y Jacquard24 hay que verificarlas antes de publicar (Space Grotesk, IBM Plex
  Serif y Geist Mono son OFL). Van con `OFL.txt` y atribución, como en Plano.
- **D10 — Paridad funcional.** Mismos params de `hugo.toml` e i18n keys que hoy: multiidioma
  con `translationKey`, menu, TOC, tiempo de lectura, palabras, breadcrumbs, prev/next,
  tags/categorías, RSS, sitemap, `index.json`, 404. Se retira solo la clave del toggle de
  tema. La copia (i18n, pie, kickers) se reescribe a la voz del DS: línea de estado, sin
  exclamaciones, sin emoji, números exactos.

## Superficies

| Superficie | Plantilla | Piezas del DS |
|---|---|---|
| Base | `baseof` | `data-theme="terminal"`, `.bl-root` en `<body>`, skip-link |
| Portada | `home` | eyebrow `mg` + H1 `gothic-title` (Jacquard24) + entradilla en `body` (Space Grotesk); **AsciiBanner** (isla); destacada como `Card` (dither estático, sin HUD); índice numerado `N.º NN` en mono; badges de tags |
| Lista de sección | `list` | cabecera kicker + H1 Jacquard; filas con regla `--bl-line`, meta `caption`, badges; paginador mono |
| Entrada | `single` | `ArticleHeader` (kicker, Jacquard h1 `gothic`, deck Techno Vibe, meta `caption`, dither estático), placa de TOC, `.bl-prose` (IBM Plex Serif 18px/1.7, 66ch), `.bl-terminal` + `.bl-crt` en código, blockquote del DS, badges, prev/next |
| Acerca | `single` | mismo contrato |
| Taxonomía / término | `taxonomy`, `term` | badges con contador, filas |
| Búsqueda | `search` | `.bl-field` con prompt `>`; resultados en filas; estado en `caption` |
| 404 | `404` | placa con `Frame` (HUD corners) + enlaces; sin marco nativo |
| Chrome | `_partials` | cabecera: `Logo` (SVG inline) + wordmark + nav + idioma; pie: línea de estado mono (`caption`) con palabra de estado. Sin toggle de tema |

## Verificación (criterio de aceptación)

1. `hugo --gc --minify` sin errores ni warnings; barrido de rutas y assets con 200 bajo
   `/blog/` en servidor local.
2. Barrido de residuos en lo propio (search_files): sin `box-shadow`, `text-shadow`,
   `backdrop-filter` ni gradientes fuera del CRT/dither — que son del DS vendorizado; sin
   hexes inline en la capa de sitio; sin residuos del sistema anterior
   (`--surface|--ink|--accent-text|data-theme="paper"`).
3. Auditoría de contraste real (Playwright) por página, umbral AA. Un solo tema: el texto
   tenue es `--bl-muted` (5.2:1 sobre `bg`) y la línea decorativa `--bl-line` nunca lleva
   texto.
4. Markup de componentes: dump headless del bundle vs. HTML renderizado → mismas clases.
5. `prefers-reduced-motion`: nada anima; el banner muestra el fotograma (no un dibujo a
   medias); el CRT no parpadea.
6. Sin JS: navegación/lectura/TOC funcionan, banner con fotograma, búsqueda con mensaje
   `noscript`.
7. Fuentes: `document.fonts.check` por cara usada (Jacquard24, Techno Vibe, Space Grotesk,
   IBM Plex Serif, Geist Mono); sin fallback silencioso a sistema.
8. Impresión: chrome fuera, sin dither ni CRT (código legible en claro), dentro de
   `@media print`.
9. Móvil 390px sin overflow.
10. Entrega renderizada: capturas (escritorio/móvil) + servidor local para recorrerlo.

## Extras de marca (dentro del alcance)

- Favicon desde el emblema (estrella de píxel): SVG + PNG 180 (reemplaza el actual).
- Tarjeta Open Graph 1200×630 compuesta con tokens del DS (bloques flat y dither Bayer, al
  estilo de `Cover`; sin gradientes), reemplaza `logo-lockup.png` en `og:image`/`twitter:image`.

## Fuera de alcance

- Publicar el tema como repo propio (decidido: solo el blog).
- Cambios en el DS: cualquier necesidad nueva se propone en el repo del DS, aquí no se
  forkea ni se edita la copia vendorizada.
- Contenido de las entradas y su front matter.

## Coordinación

Hay una sesión paralela con trabajo en vuelo sobre `plano` (renombre, LICENSE, exampleSite,
auditoría). Antes de implementar: comprobar que ese trabajo está commiteado, y si no,
commitear/escalonar sin mezclar su diff con el mío. La implementación no toca
`themes/plano/` ni sus archivos.

## Pendiente al cerrar

- ~~Actualizar este documento a «aprobado (desarrollo autónomo autorizado)» al recibir el sí.~~ Hecho.
- **Verificar la licencia de Techno Vibe y Jacquard24 antes de publicar el sitio (D9).**
  Resuelto el 2026-09-22: Jacquard24 es SIL OFL 1.1 (The Soft Type Project Authors) y
  **Techno Vibe se retira del tema**, porque su binario no declara licencia. DFM* y
  OpenCode siguen sin licencia, pero ninguna página las usa. Detalle cara por cara en
  `themes/brutalistoic/static/vendor/brutalistoic/fonts/LICENSE.md` (+ `OFL-1.1.txt`).
- Pendiente en el DS (`vstrofago/brutalistoic`): aplicar allí la retirada de Techno Vibe,
  para que la copia vendorizada del blog vuelva a ser verbatim sin excepciones.
- Registrar en el skill `hugo-github-pages-bilingual` lo que este tema enseñe (consumo de
  un DS React desde un sitio estático).

## Desviaciones conscientes sobre el diseño

- **Sin isla ASCII (revisión del render, 2026-09-22).** El AsciiBanner (D6) se retira del
  blog: la portada va del hero a la destacada, sin React, sin isla diferida y sin
  fotograma horneado. Con él se van `banner.html`, `banner-frame.html`, `bl-banner.js` y
  los UMD de React vendorizados: el sitio no carga ya ninguna dependencia externa. El
  dither Bayer estático (canvas propio, decorativo) se queda.

- **Techno Vibe fuera (2026-09-22).** La cara Techno Vibe se retira del tema —su binario
  no declara licencia— junto con su variable, su estilo de texto, su utilidad
  `.tech-subtitle` y su `@font-face`: es la única desviación de la copia verbatim del DS
  (D2/D9). Detalle en `themes/brutalistoic/static/vendor/brutalistoic/fonts/LICENSE.md`.

- **Acerca con el diseño de una lista (2026-09-22).** Las páginas sueltas (raíz, sin
  sección) ya no usan el ArticleHeader: cabecera de lista —eyebrow + hero Jacquard en
  minúsculas— y el contenido en `.bl-prose`. La placa repetía en su deck el propio texto
  de la página y arrastraba meta de entrada, breadcrumbs y prev/next, que no son de una
  página.

- **Tipografía del blog (corrección tras revisar el render, 2026-09-22).** El par del blog
  es **Sanchez + IBM Plex Serif**: títulos y encabezados de entrada (y los mismos títulos
  en el índice, la destacada y prev/next) en **Sanchez**, y todo su texto (cuerpo,
  resúmenes, deck) en **IBM Plex Serif**. **Jacquard24 queda SOLO para los heroes** —H1 de
  portada, de listas/etiquetas/búsqueda y de 404— y **siempre en minúsculas**. Corrige la
  tabla de D3 (que ponía `gothic` en el título de entrada y Techno Vibe en deck y
  subtítulos) y devuelve al blog el par de la rev. 1 («títulos de entrada en `slab`
  (Sanchez)», «entradilla en IBM Plex Serif»). Uso de las variantes del propio DS:
  `bl-article-head__title--slab`, `bl-card__title--slab`, `bl-note-title`.

- **D2 / D9 en tensión sobre las fuentes.** La copia del DS se vendoriza *verbatim* (los
  15 binarios) porque `verify-vendor.mjs` exige 15 archivos y 15 `@font-face` resolviendo;
  el tema solo *usa* cinco caras. Las otras diez no se descargan nunca en el navegador.
- **D5 cumplido al pie: no se reprodujo el relleno ASCII de los botones.** El efecto es
  comportamiento del componente React; el plan acota el movimiento al de `bundle.css` más
  transiciones de hover, así que los botones quedan en contorno que se refuerza al pasar.
- **D7: el bloque de código conserva el markup de Chroma dentro de la placa Terminal**
  (el plan mantiene la configuración y las clases de Chroma). La estructura `.bl-terminal`
  + `.bl-crt` + barra + COPY es la del componente; el interior es el resaltado de Hugo.
- **El dither Bayer estático se pinta en un `canvas.bl-bayer` con JS propio** (40 líneas,
  sin React) para no cargar el bundle donde no hace falta. Sin JS, la superficie queda
  limpia: el dither es decorativo y el DOM/clases son los del componente.
