# Licencias de las caras de `fonts/`

Copiadas del repositorio del design system brutalistoic (commit `e026da5`) y **podadas a
las caras que el blog usa** (2026-09-22; ver «Caras retiradas» abajo). El DS no distribuye
licencias: lo que sigue está extraído de la tabla `name` de cada binario (`strings -e b`).
La familia declarada en `tokens.css` da nombre a la cara; el Reserved Font Name se respeta
(no se renombra ninguna).

## SIL Open Font License 1.1 — texto completo en `OFL-1.1.txt`

| Archivo | Copyright | Diseño |
|---|---|---|
| `SpaceGrotesk-VariableFont_wght.ttf` | Copyright 2020 The Space Grotesk Project Authors (github.com/floriankarsten/space-grotesk) | Florian Karsten |
| `Jacquard24-Regular.ttf` | Copyright 2023 The Soft Type Project Authors (github.com/scfried/soft-type-jacquard) | Sarah Cadigan-Fried |
| `IBMPlexSerif-Regular.ttf` / `-Italic.ttf` / `-Light.ttf` / `-Thin.ttf` | Copyright 2020 IBM Corp. All rights reserved. IBM Plex(r) es marca registrada de IBM Corp. | Mike Abbink, Paul van der Laan, Pieter van Rosmalen (Bold Monday) |
| `GeistMono-Regular.ttf` / `-Medium.ttf` / `-VariableFont_wght.ttf` | Copyright 2024 The Geist Project Authors (github.com/vercel/geist-font.git) | basement.studio, Andrés Briganti, Guido Ferreyra, Mateo Zaragoza |
| `Sanchez-Regular.ttf` / `-Italic.ttf` | Copyright (c) 2012, LatinoType (www.latinotype.com), con Reserved Font Name 'Sanchez' | Daniel Hernández (LatinoType) |

## Caras retiradas del tema (2026-09-22)

Cuatro caras no viajan: **ninguna página las usa** y ninguna declara licencia en su
binario (comprobado con `strings -e b -n 5`).

| Archivo | Qué declaraba su tabla `name` |
|---|---|
| `TechnoVibeFont.otf` | «Free option of TechnoVibeFont» — diseño de Iuliia Mazur (designfamilymarket.com) |
| `DFMThornyDoodleFont.otf` | nada |
| `DFMPenScriptFont.otf` | nada |
| `OpenCode.otf` | nada |

De `tokens.css` / `tokens.json` se han quitado, para cada una, su variable, su estilo de
texto, su utilidad y su `@font-face`.

**El DS no se toca.** La copia del blog deja de ser verbatim por decisión propia: viaja
podada a las caras en uso (Space Grotesk, Jacquard24, IBM Plex Serif, Geist Mono y
Sanchez). El design system es la fuente y se trabaja **con** él, no sobre él; si algún día
quieres retirarlas allí también, se hace en su repositorio y el blog vuelve a copiar.
