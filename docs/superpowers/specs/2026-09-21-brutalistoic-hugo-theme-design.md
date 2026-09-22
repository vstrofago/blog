# Tema Hugo «brutalistoic» para el blog — diseño

Fecha: 2026-09-21 · Estado: propuesto (pendiente de aprobación)
Alcance: sustituir el tema del blog (hoy `plano`) por un tema propio que implemente el DS
brutalistoic como sistema principal de vstrofago. Solo el blog: el tema vive en `themes/`
committed; «Plano» sigue su camino aparte (extracción/publicación independiente).

## Objetivo

Un tema Hugo que renderice el blog bilingüe (EN/ES) con brutalistoic: flat 2D sin sombras,
`paper` canónico (verde militar, tinta negra, lectura larga) y `terminal` como variante
oscura opt-in. La firma ASCII viva (AsciiBanner) solo en la portada; el resto del sitio sin
React. Sin JS, el sitio se ve completo y correcto.

## Decisiones

- **D1 — Ubicación y nombre.** Tema nuevo en `themes/brutalistoic/`, committed, sin
  submódulo (como hasta ahora). `hugo.toml` cambia de `plano` a `brutalistoic` al final,
  cuando la verificación pase; el cambio es reversible en una línea. Nombre propuesto:
  `brutalistoic` (alternativas si prefieres: `vstrofago`, `devoured`).
- **D2 — Integración del DS.** Copia vendorizada **verbatim** en
  `themes/brutalistoic/static/vendor/brutalistoic/{tokens,dist,fonts}` (la receta del skill:
  `tokens/` y `fonts/` hermanos; `verify-vendor.mjs` debe pasar). `tokens.css` y
  `bundle.css` se enlazan tal cual (sin pasar por el pipeline, para conservar las rutas
  relativas de `@font-face`). Los archivos React 18 UMD (MIT) se añaden a
  `vendor/brutalistoic/react/` (el repo del DS no los trae). La capa de sitio (chrome) vive
  en `assets/css/` y sí pasa por el pipeline (concat + minify + fingerprint) como hoy.
- **D3 — Tema.** `data-theme="paper"` en el documento; `terminal` es opt-in con el toggle
  (persistencia `localStorage`, script anti-parpadeo en `<head>`). Nada de
  `prefers-color-scheme`. Sin JS o sin elección guardada: paper.
- **D4 — Componentes.** Los componentes React que aportan estructura se reproducen en
  plantillas con el **mismo DOM y clases `.bl-*`** (Card, ArticleHeader, Terminal, Badge,
  Field, Frame/HUD, Logo, Button). Criterio: dump headless del componente real y contraste
  contra el markup renderizado; nada de clases paralelas para cosas que el DS ya nombra.
  `.vf-*` queda solo para layout/chrome (página, cabecera, pie, hileras), nunca para
  componentes.
- **D5 — Movimiento.** Solo el del DS: animaciones CSS de `bundle.css` (flicker CRT, cursor,
  pulse del logo) y transiciones de 150-250 ms en hover. Se **elimina** el sistema de reveal
  por scroll del tema anterior (no es contrato del DS). `prefers-reduced-motion` detiene
  todo (ya está resuelto en `bundle.css`).
- **D6 — Portada.** El AsciiBanner es la única isla React, solo en la home, cargada en
  diferido con `IntersectionObserver` (React + bundle se descargan solo cuando el banner
  entra en pantalla; ~1.4 MB comprimido que no toca ningún otro page load). Sin JS o con
  reduced-motion: **fotograma horneado** — se extrae el markup quieto del propio bundle con
  Playwright y se commitea como partial estático (mismas capas `__bg/__fg/__hot`), con
  altura reservada: nunca hay hueco ni CLS. Si la isla falla, el fotograma se queda.
- **D7 — Código.** Bloques como `.bl-terminal` + `.bl-crt` (el único estilo de código del
  DS, siempre oscuro incluso en paper). El resaltado sigue siendo Chroma (config actual,
  clases) con un mapeo a tokens del DS: comentarios `ink-muted`, palabras clave
  `accent-text`, números `ink-strong` tabulares, error con subrayado (sin rojo semántico).
  Botón de copiar vanilla (el de hoy). El typing del componente no se usa en artículos.
- **D8 — Búsqueda.** Mismo índice JSON y mismo motor vanilla; restilizado a `.bl-field`
  (prompt `>`) + filas de resultado. Sin JS: mensaje `noscript` (como hoy).
- **D9 — Fuentes.** Solo caras con licencia clara (todas OFL): Geist Mono (Regular, Medium),
  IBM Plex Serif (Regular, Italic), Sanchez (Regular) y Jacquard24 (para títulos
  `gothic`; se descarga solo si una entrada lo usa). Se excluyen Techno Vibe, Godwin, DFM*
  y Open Code (licencia ausente o «all rights reserved»; además, innecesarias aquí). Van con
  `OFL.txt` y atribución, como en Plano.
- **D10 — Paridad funcional.** Mismos params de `hugo.toml` e i18n keys que hoy: multiidioma
  con `translationKey`, menu, TOC, tiempo de lectura, palabras, breadcrumbs, prev/next,
  tags/categorías, RSS, sitemap, `index.json`, 404. La copia (i18n, pie, kickers) se
  reescribe a la voz del DS: línea de estado, sin exclamaciones, sin emoji, números exactos.

## Superficies

| Superficie | Plantilla | Piezas del DS |
|---|---|---|
| Base | `baseof` | `data-theme="paper"`, `.bl-root` en `<body>`, skip-link, toggle anti-parpadeo |
| Portada | `home` | kicker + título slab (Sanchez) + entradilla serif; **AsciiBanner** (isla); destacada como `Card` (dither estático, sin HUD); índice numerado `N.º NN` en mono; badges de tags |
| Lista de sección | `list` | cabecera kicker + display; filas con regla 1px, meta `caption`, badges; paginador mono |
| Entrada | `single` | `ArticleHeader` (kicker, slab 44px, deck serif, meta caption, dither estático), placa de TOC, `.bl-prose` (18px/1.7, 66ch), `.bl-terminal` + `.bl-crt` en código, blockquote del DS, badges, prev/next |
| Acerca | `single` | mismo contrato |
| Taxonomía / término | `taxonomy`, `term` | badges con contador, filas |
| Búsqueda | `search` | `.bl-field` con prompt `>`; resultados en filas; estado en `caption` |
| 404 | `404` | placa con `Frame` (HUD corners) + enlaces; sin marco nativo |
| Chrome | `_partials` | cabecera: `Logo` (SVG inline) + wordmark mono + nav + idioma + toggle (`Button` ghost); pie: línea de estado mono (`caption`) con palabra de estado |

## Verificación (criterio de aceptación)

1. `hugo --gc --minify` sin errores ni warnings; barrido de rutas y assets con 200 bajo
   `/blog/` en servidor local.
2. Barrido de residuos en lo propio (search_files): sin `box-shadow`, `text-shadow`,
   `backdrop-filter` ni gradientes fuera del CRT/dither — que son del DS vendorizado; sin
   hexes inline en la capa de sitio.
3. Auditoría de contraste real (Playwright) por página y por tema, umbral AA; texto tenue
   solo sobre `surface`/`surface-2`.
4. Markup de componentes: dump headless del bundle vs. HTML renderizado → mismas clases.
5. `prefers-reduced-motion`: nada anima; el banner muestra el fotograma (no un dibujo a
   medias); el CRT no parpadea.
6. Sin JS: paper, navegación/lectura/TOC funcionan, banner con fotograma, búsqueda con
   mensaje `noscript`, toggle ausente sin romper nada.
7. Fuentes: `document.fonts.check` por cara usada; sin fallback silencioso a sistema.
8. Impresión: chrome fuera, sin dither ni CRT (código legible en claro), dentro de
   `@media print`.
9. Móvil 390px sin overflow; ambos temas en todas las páginas.
10. Entrega renderizada: capturas (paper/terminal, escritorio/móvil) + servidor local para
    recorrerlo.

## Extras de marca (dentro del alcance)

- Favicon desde el emblema (estrella de píxel): SVG + PNG 180 (reemplaza el actual).
- Tarjeta Open Graph 1200×630 compuesta con primitivas del DS (flat, sin gradientes),
  reemplaza `logo-lockup.png` en `og:image`/`twitter:image`.

## Fuera de alcance

- Publicar el tema como repo propio (decidido: solo el blog).
- Cambios en el DS: cualquier necesidad nueva se propone en el repo del DS, aquí no se
  forkea ni se edita la copia vendorizada.
- Contenido de las entradas y su front matter (salvo el interruptor opcional de título
  `gothic`).

## Coordinación

Hay una sesión paralela con trabajo en vuelo sobre `plano` (renombre, LICENSE, exampleSite,
auditoría). Antes de implementar: comprobar que ese trabajo está commiteado, y si no,
commitear/escalonar sin mezclar su diff con el mío. La implementación no toca
`themes/plano/` ni sus archivos.

## Pendiente al cerrar

- Actualizar este documento a «aprobado (desarrollo autónomo autorizado)» al recibir el sí.
- Registrar en el skill `hugo-github-pages-bilingual` lo que este tema enseñe (consumo de
  un DS React desde un sitio estático).
