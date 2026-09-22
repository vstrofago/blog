---
# Fixture del tema, no contenido del blog.
# `draft: true` => solo el servidor de desarrollo con `--buildDrafts` la sirve
# (sin la bandera responde 404) y la compilación de producción la EXCLUYE. No se
# publica nunca. Es para que docs/superpowers/verify-theme.cjs pueda ejercitar la
# placa de código y su resaltado.
title: "Code probe"
date: 2026-09-17
draft: true
tags: ["probe"]
summary: "Internal fixture: exercises the codeblock render hook and the syntax theme."
---

Texto previo a la placa.

```python
def fold(value: str) -> str:
    """Normaliza para buscar."""
    return value.normalize("NFD").lower()  # comentario
```

```bash
hugo --gc --minify
```
