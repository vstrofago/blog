---
title: "La variante oscura es opcional"
date: 2026-01-15
summary: "El claro es el tema. El oscuro existe, está aislado y nunca se enciende solo."
tags: ["diseño", "oscuro"]
categories: ["Notas"]
translationKey: "optical-dark"
---

Mucha gente prefiere una pantalla oscura de noche, y un tema que se niega a
ofrecerla es un tema que acaba bifurcado. Así que Plano trae variante oscura,
con dos reglas.

## Nunca se enciende sola

No hay `prefers-color-scheme` en el tema. Sin JavaScript, o sin una elección
previa, obtienes claro. El ajuste del sistema no se trata como una orden; el
lector sí.

## No puede filtrarse al tema claro

Las reglas oscuras viven en su propio archivo, detrás de
`html[data-theme="dark"]`. Redefinen colores de superficie y nada más, así que
el tema canónico y sus tokens quedan exactamente como se diseñaron.

Pulsa el botón de la cabecera: tu elección se recuerda en ese dispositivo, y al
volver a pulsarlo regresas al claro.
