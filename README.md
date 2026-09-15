# Blog — Hugo + GitHub Pages

Bilingual (English / Spanish) static blog built with [Hugo](https://gohugo.io/) and the
[PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme, deployed to GitHub Pages
through GitHub Actions.

- English: <https://vstrofago.github.io/blog/>
- Español: <https://vstrofago.github.io/blog/es/>

## Requirements

- Hugo **extended** `0.166.0` (the CI installs this exact version)
- Git

## Local development

```bash
# preview with drafts, live reload
hugo server -D

# production build (same command the CI runs)
hugo --gc --minify
```

`hugo server` serves English at `/` and Spanish at `/es/`.

## Repository layout

```
hugo.toml                     # site config: languages, menus, params, markup
content/en/                   # English content  -> /
content/es/                   # Spanish content  -> /es/
layouts/_partials/header.html # project override of PaperMod's header
themes/PaperMod/              # git submodule, pinned to a working commit
.github/workflows/hugo.yaml   # build + deploy to GitHub Pages
archetypes/default.md         # front matter template for `hugo new`
```

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
translationKey: "my-post"   # identical in both files
---
```

A page without a translation still builds; the switcher then falls back to the other
language's home page.

## Notes on the setup

- **Public repository.** GitHub Pages on the Free plan only serves public repositories.
- **The theme is a pinned submodule**, tracked on `master` but locked to the commit in the
  index. `git submodule update --remote themes/PaperMod` upgrades it deliberately. The
  `v8.0` tag is *not* usable: it predates Hugo's `layouts/_partials` layout scheme and
  fails to build on Hugo 0.166.
- **`layouts/_partials/header.html` overrides the theme** so the header language switcher
  points at the translated *page* rather than always at the other language's home page.
  When upgrading PaperMod, diff this file against the new upstream version.
- **`disableKinds`/taxonomies** are left at Hugo's defaults; tags and categories are
  enabled.
- `ignoreLogs = ['warning-partial-superfluous-prefix']` silences a warning the theme emits
  on Hugo 0.166.

## Deployment

Every push to `main` triggers `.github/workflows/hugo.yaml`: it installs Hugo, builds the
site and publishes `public/` to GitHub Pages. Pages must be configured once with
**Source: GitHub Actions** (Settings → Pages).

## Cambiar el contenido

El contenido vive en `content/en/` y `content/es/`. El título del sitio, las descripciones
y los menús se editan en `hugo.toml`.
