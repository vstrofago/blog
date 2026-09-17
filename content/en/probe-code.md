---
# Fixture del tema, no contenido del blog.
# `draft: true` => el servidor de desarrollo de Hugo SÍ la sirve (así
# docs/superpowers/verify-theme.cjs puede ejercitar la placa de código y su
# resaltado) y la compilación de producción la EXCLUYE. No se publica nunca.
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
