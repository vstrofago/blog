# Blog — Hugo + GitHub Pages

Bilingual (English / Spanish) static blog built with [Hugo](https://gohugo.io/) and the
`stoico` theme: **Stoico**, the vstrofago design language, in its Editorial voice ("A quiet
room for reading."). Deployed to GitHub Pages through GitHub Actions.

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
themes/stoico/                     # the theme: layouts, css, js, i18n, static
  layouts/                         # baseof, home, list, single, taxonomy, term, search, 404, home.json
  layouts/_partials/               # chrome, entry rows, page head, TOC, pager, icon, mark, wordmark
  layouts/_markup/                 # code blocks (Stoico Code block) and figures (Stoico Frame)
  assets/css/stoico/               # the design system's tokens/ and components/, verbatim
  assets/css/                      # chroma.css (syntax colours on tokens) + site.css (layout)
  assets/js/                       # stoico.js (theme, reading progress, copy) + search.js
  data/octicons.json               # the Octicon paths the theme uses
  static/fonts/                    # self-hosted WOFF2 subsets + licences
  static/img/                      # favicon (svg + png 180) and the 1200x630 Open Graph card
themes/plano/                      # an earlier theme, kept as-is (its own repo: hugo-theme-plano)
docs/superpowers/                  # design specs and the verification script of the previous theme
scripts/publish-theme.sh           # one-way export of themes/plano to its own repo
.github/workflows/hugo.yaml        # build + deploy to GitHub Pages
```

## The theme and the design system

`themes/stoico` follows **Stoico** (built in Claude Design): one philosophy, four voices.
The blog is the **Editorial** voice in mode **E01 Literary**:

- Notes index: the headline "Blog" in Geist Pixel and a one-line serif lead, topics as tags,
  then a numbered list separated by hairlines (number · title and dek · date, minutes, topic).
- A note is only text: a reading-progress hairline, the title in Geist Pixel, an italic serif
  dek, then the body in IBM Plex Serif 20/1.72 in a 680px column. The foot carries the
  topics, a byline with the pixel star and "Copy link", and previous / next.
- Type has one job per face: Geist Pixel for headlines and the name *vstrofago* (always
  lowercase), Geist for interface and section heads, Geist Mono for labels and code, IBM
  Plex Serif for reading.
- No colour: the blog is black and white. Stoico's one accent (Ember) is mapped to `--fg`
  in `site.css`; title hovers dim to `--fg-muted` and code is monochrome. Dark is the
  default; the moon/sun button switches to paper. The choice is stored under
  `stoico-theme`, shared with the landing on the same origin, and applied before first
  paint.

`assets/css/stoico/` is a verbatim copy of the system's `tokens/` and `components/`
(its `tokens/fonts.css` is replaced by the `@font-face` rules in `_partials/head.html`,
so font URLs follow `baseURL`). Don't edit those files; copy them again when the system
changes. Everything else in `site.css` uses tokens only.

Front matter the theme understands, beyond Hugo's own: `deck` (the dek; defaults to the
summary).

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
hugo --gc --minify          # must finish with no errors or warnings
hugo server --buildDrafts   # then check /blog/, a note, /blog/es/, search and a 404,
                            # in both themes and at 390px wide
```

`docs/superpowers/verify-theme.cjs` was written for the previous theme (brutalistoic) and
checks its markup; it does not apply to `stoico`.

## Deployment

Every push to `main` triggers `.github/workflows/hugo.yaml`: it installs Hugo, builds the
site and publishes `public/` to GitHub Pages. Pages must be configured once with
**Source: GitHub Actions** (Settings → Pages).

## Notes on the setup

- **Public repository.** GitHub Pages on the Free plan only serves public repositories.
- **The theme is committed, not a submodule.** `themes/plano` stays untouched: it is
  exported to its own repository (`vstrofago/hugo-theme-plano`) by `scripts/publish-theme.sh`.
- **Font licensing** lives next to the binaries in `themes/stoico/static/fonts/LICENSE.md`
  (+ `OFL-1.1.txt`). Geist, Geist Mono, Geist Pixel and IBM Plex Serif are all SIL OFL 1.1.
- `content/en/probe-code.md` is a `draft: true` fixture for code blocks; the production
  build never publishes it.

## Cambiar el contenido

El contenido vive en `content/en/` y `content/es/`. El título del sitio, las descripciones
y los menús se editan en `hugo.toml`.
