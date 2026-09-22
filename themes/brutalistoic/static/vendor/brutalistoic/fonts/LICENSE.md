# Licencias de las caras de `fonts/`

Copiadas tal cual del repositorio del design system brutalistoic (commit `e026da5`),
que a su vez no distribuye licencias: lo que sigue está extraído de la tabla `name`
de cada binario (`strings -e b`). La familia declarada en `tokens.css` da nombre a
la cara; el Reserved Font Name se respeta (no se renombra ninguna).

## SIL Open Font License 1.1 — texto completo en `OFL-1.1.txt`

| Archivo | Copyright | Diseño |
|---|---|---|
| `SpaceGrotesk-VariableFont_wght.ttf` | Copyright 2020 The Space Grotesk Project Authors (github.com/floriankarsten/space-grotesk) | Florian Karsten |
| `Jacquard24-Regular.ttf` | Copyright 2023 The Soft Type Project Authors (github.com/scfried/soft-type-jacquard) | Sarah Cadigan-Fried |
| `IBMPlexSerif-Regular.ttf` / `-Italic.ttf` / `-Light.ttf` / `-Thin.ttf` | Copyright 2020 IBM Corp. All rights reserved. IBM Plex(r) es marca registrada de IBM Corp. | Mike Abbink, Paul van der Laan, Pieter van Rosmalen (Bold Monday) |
| `GeistMono-Regular.ttf` / `-Medium.ttf` / `-VariableFont_wght.ttf` | Copyright 2024 The Geist Project Authors (github.com/vercel/geist-font.git) | basement.studio, Andrés Briganti, Guido Ferreyra, Mateo Zaragoza |
| `Sanchez-Regular.ttf` / `-Italic.ttf` | Copyright (c) 2012, LatinoType (www.latinotype.com), con Reserved Font Name 'Sanchez' | Daniel Hernández (LatinoType) |

## Sin información de licencia en el binario

Estas cuatro caras no llevan copyright ni licencia en su tabla `name` (comprobado con
`strings -e b -n 5`). **Antes de publicar el sitio hay que decidir qué hacer con ellas**:

| Archivo | ¿La usa el tema? |
|---|---|
| `TechnoVibeFont.otf` | Sí — subtítulos, decks y eyebrows (`tech-subtitle`) |
| `DFMPenScriptFont.otf` | No |
| `DFMThornyDoodleFont.otf` | No |
| `OpenCode.otf` | No |

Las tres que no se usan están porque la copia del DS se vendoriza **verbatim** y
`verify-vendor.mjs` exige los 15 archivos y los 15 `@font-face` de `tokens.css`
resolviendo contra `../fonts/`. Ninguna se descarga en el navegador salvo que un
estilo la cite (hoy: ninguna de las tres).
