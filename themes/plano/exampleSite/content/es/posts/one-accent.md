---
title: "Un solo acento, y código que lo respeta"
date: 2026-02-20
summary: "Resaltado de sintaxis monocromo y el acento reservado a lo que importa."
tags: ["código", "diseño"]
categories: ["Notas"]
translationKey: "one-accent"
---

Los bloques de código son el sitio donde los temas suelen perder los nervios:
llega un arcoíris de colores de sintaxis y la regla del acento único desaparece
sin que nadie se dé cuenta.

Plano resalta en monocromo y reserva el acento para las palabras clave. El
resultado se lee bien en una función larga, y el acento sigue significando algo.

## Cómo se ve

```python
def fold(value: str) -> str:
    """Normaliza una cadena para buscar."""
    return value.normalize("NFD").lower()  # el acento, solo en palabras clave
```

```bash
hugo --gc --minify
```

## Por qué molestarse

Porque un tema es un conjunto de decisiones sostenidas con coherencia. Si el
color de acento significa "esto está activo" en todo lo demás, no puede
significar a la vez "esto es una cadena de texto" dentro de un bloque de código.
