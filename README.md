# Blog — Hugo + GitHub Pages

Bilingual (English / Spanish) static blog built with [Hugo](https://gohugo.io/) and the
`brutalistoic` theme — the design system of vstrofago, adapted to Hugo — deployed to
GitHub Pages through GitHub Actions.

- English: <https://vstrofago.github.io/blog/>
- Español: <https://vstrofago.github.io/blog/es/>

## Requirements

- Hugo **extended** `0.166.0` (the CI installs this exact version)
- Git

## Local development

```bash
# preview with drafts (the code-plate fixture is a draft), live reload
hugo server --buildDrafts

# production build (same command the CI runs)
hugo --gc --minify
```

`hugo server` serves English at `/` and Spanish at `/es/`. The dev server mounts the site
at the full `baseURL` path, so routes live under `/blog/`.

## Repository layout

```
hugo.toml                          # site config: languages, menus, params, markup
content/en/ content/es/            # English (/) and Spanish (/es/) content
themes/brutalistoic/               # the theme: layouts, css, js, i18n, static
  layouts/                         # baseof, home, list, single, taxonomy, term, search, 404, home.json
  layouts/_partials/               # chrome, entries, TOC, pager, the baked banner frame
  layouts/_markup/                 # code blocks (Terminal plate) and figures
  assets/css/                      # site layer + Chroma mapping (pipeline: concat+minify+hash)
  assets/js/                       # copy button, Bayer dither, search, the banner island
  static/vendor/brutalistoic/      # vendored design system (tokens, dist, fonts, react)
  static/img/                      # favicon (svg+png 180) and the 1200x630 Open Graph card
themes/plano/                      # previous theme, kept as-is (its own path: hugo-theme-plano)
docs/superpowers/verify-theme.cjs  # real verification against a local server (Playwright)
scripts/publish-theme.sh           # one-way export of themes/plano to its own repo
.github/workflows/hugo.yaml        # build + deploy to GitHub Pages
```

## The theme and the design system

`themes/brutalistoic` consumes the private design system repo through a **verbatim vendored
copy** at `static/vendor/brutalistoic/{tokens,dist,fonts}` plus the React 18 UMD builds in
`vendor/brutalistoic/react/`. Load order is `tokens.css` → `bundle.css` → site layer; the
two DS stylesheets are linked as-is (never through the asset pipeline) because `tokens.css`
resolves every `@font-face` at `../fonts/`.

The theme is **static HTML with the DS component classes** (`.bl-*`): the markup is copied
from headless renders of the real React components. The only React in the site is one lazy
island on the home page (`AsciiBanner`); without JavaScript or under
`prefers-reduced-motion`, a baked still frame of the same component is shown instead. There
is one dark theme (`terminal`), no toggle and no `localStorage`.

Regenerate the baked frame or re-check the component markup with the scripts under
`/home/user/.hermes/cache/scratch/brutalo/` (dump + Playwright), or re-vendor from the DS
repo with `scripts/vendor-brutalistoic.sh` in the `brutalistoic` skill.

## Adding content

Create the same page in both languages and give them a matching `translationKey`, so the
language switcher in the header links the two versions together:

```bash
hugo new content/en/posts/my-post.md
hugo new content/es/posts/mi-entrada.md
```

```yaml
---
title: "My post"
date: 2026-09-15
draft: false
tags: []
categories: ["blog"]
translationKey: "my-post"   # identical in both files
summary: "…"
---
```

A page without a translation still builds; the switcher then falls back to the other
language's home page.

## Verify before publishing

```bash
hugo server --buildDrafts --port 1319 --bind 127.0.0.1
NODE_PATH=/home/user/.hermes/hermes-agent/node_modules node docs/superpowers/verify-theme.cjs
```

It measures the rendered CSS, real WCAG contrast (including `color-mix()` values), the
component markup against the DS bundle, motion and no-JS contracts, fonts actually loading,
print, and 390px overflow. Screenshots land in `docs/superpowers/shots/`. Exit code 1 means
something failed.

## Deployment

Every push to `main` triggers `.github/workflows/hugo.yaml`: it installs Hugo, builds the
site and publishes `public/` to GitHub Pages. Pages must be configured once with
**Source: GitHub Actions** (Settings → Pages).

## Notes on the setup

- **Public repository.** GitHub Pages on the Free plan only serves public repositories.
- **The theme is committed, not a submodule.** `themes/plano` stays untouched: it is
  exported to its own repository (`vstrofago/hugo-theme-plano`) by `scripts/publish-theme.sh`.
- **Font licensing** lives next to the binaries in
  `themes/brutalistoic/static/vendor/brutalistoic/fonts/LICENSE.md` (+ `OFL-1.1.txt`).
  Space Grotesk, Jacquard24, IBM Plex Serif, Geist Mono and Sanchez are SIL OFL 1.1;
  Techno Vibe, DFM* and OpenCode ship without licence information in their binaries and are
  an open decision before a public release.
- `content/en/probe-code.md` is a `draft: true` fixture for the code plate; the production
  build never publishes it.

## Cambiar el contenido

El contenido vive en `content/en/` y `content/es/`. El título del sitio, las descripciones
y los menús se editan en `hugo.toml`.
