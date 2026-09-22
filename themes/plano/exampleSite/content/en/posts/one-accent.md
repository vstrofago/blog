---
title: "One accent, and code that respects it"
date: 2026-02-20
summary: "Syntax highlighting with a monochrome palette and the accent reserved for what matters."
tags: ["code", "design"]
categories: ["Notes"]
translationKey: "one-accent"
---

Code blocks are the place where themes usually lose their nerve: a rainbow of
syntax colors arrives and the single-accent rule quietly disappears.

Plano highlights in monochrome and keeps the accent for keywords only. The
result reads well in a long function, and the accent still means something.

## What it looks like

```python
def fold(value: str) -> str:
    """Normalize a string for searching."""
    return value.normalize("NFD").lower()  # keep the accent for keywords only
```

```bash
hugo --gc --minify
```

## Why bother

Because a theme is a set of decisions held consistently. If the accent color
means "this is active" everywhere else, it cannot also mean "this is a string
literal" inside a code block.
