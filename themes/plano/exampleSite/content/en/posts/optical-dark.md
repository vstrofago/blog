---
title: "The dark variant is opt-in"
date: 2026-01-15
summary: "Light is the theme. Dark exists, is isolated, and never turns itself on."
tags: ["design", "dark"]
categories: ["Notes"]
translationKey: "optical-dark"
---

Plenty of readers prefer a dark screen at night, and a theme that refuses to
offer one is a theme that gets forked. So Plano ships a dark variant — with two
rules.

## It never turns itself on

There is no `prefers-color-scheme` in the theme. Without JavaScript, or without
a previous choice, you get light. The OS setting is not treated as an
instruction; the reader is.

## It cannot leak into the light theme

The dark rules live in their own file behind `html[data-theme="dark"]`. They
redefine surface colors and nothing else, so the canonical theme and its tokens
stay exactly as they were designed.

Press the toggle in the header: your choice is remembered on that device, and
pressing it again returns you to light.
