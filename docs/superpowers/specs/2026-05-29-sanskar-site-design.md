# Sanskar Nanegaonkar — Personal Site Design

**Date:** 2026-05-29
**Status:** Approved → in build

## Goal
A cinematic one-page profile for Sanskar Nanegaonkar (AI Engineer), reskinning the
proven engineering DNA of `neeshant.com` (portfolio-site) and Dhatri's site
(`dhatri-astro`) into a Makoto Shinkai twilight aesthetic.

## North Star concept
**Scrolling = the passage of a day.** The fixed sky gradient interpolates by scroll
progress: golden-hour peach at the hero → clear sky-blue mid-page → deep indigo /
night at contact. Every section is "a frame from a film."

## Decisions (locked with user)
- **Stack:** static HTML + CSS + vanilla JS, no build step (matches both references).
- **Atmosphere:** 100% generated (CSS + canvas) — no image assets to source.
- **Sections:** About/Summary, Experience, Projects, Skills + Publications, Contact.
- **Hosting:** build files + SEO assets only; hosting decided later.
- **Darkest tone:** deep indigo `#1A1A3D` / `#16213E` — never harsh pure black.

## Files
```
index.html   semantic markup, content, JSON-LD, OG/Twitter meta
style.css    tokens, layout, atmosphere layers, motion, responsive, reduced-motion
main.js      canvas sky engine, scroll-sky interpolation, reveals, splitting, parallax, intro
favicon.svg  twilight sun-disc mark
robots.txt   SEO
sitemap.xml  SEO
```

## Typography
- Headings: **Zen Maru Gothic** (soft humanist)
- Body: **Inter**
- Labels / eyebrows / HUD: **JetBrains Mono**
- Kanji flourish: **Noto Serif JP** (e.g. 黄昏 "twilight"), used sparingly

## Color tokens
peach `#FFB88C` · rose `#DE6262` · indigo `#3A4A7A` · night `#1A1A3D` / `#16213E` /
`#0F3460` · sky `#7EC8E3` / `#A8DADC` · gold `#FFD98E` / `#FFC371` · cloud `#FFF5E1` ·
flare `#FFE8A3` · text `#FDFBF7` (on dark) / `#1A1A2E` (on light)

## Atmosphere engine
1. Scroll-interpolated twilight gradient sky (fixed, full viewport).
2. 2–3 parallax cloud bands, 20–40s drift loops.
3. Soft sun/flare bloom with god-ray streaks.
4. Particle canvas (drifting dust motes / petals).
5. Film grain + faint chromatic aberration on hero; cursor-follow glow.
6. Foreground horizon/city/telephone-wire silhouette at hero base.

## Sections → resume mapping
- Intro splash: SANSKAR logotype, `AI ENGINEER · LLM SYSTEMS`, ENTER → bloom reveal.
- Hero: full name, "AI Engineer — Production LLM, Multimodal & Clinical ML", chips
  (IIT HYDERABAD '22, SAN FRANCISCO, 4+ YRS), pitch line, HUD readouts (1,000+ calls/day,
  RAG tenants, 83% accuracy, −70% doc time).
- 01 About: professional summary narrative + pull-quote.
- 02 Experience: 3 cards (Senior AI Engineer; Data Scientist — Clinical AI; Intern).
- 03 Projects: LLM Evaluation Harness; RLHF & Preference Optimization Stack; Offline RL
  Benchmarking Suite — with tech tags.
- 04 Skills + Publications: chip groups (LLM Apps, Evals & Observability, AI/ML,
  Post-training, Backend/Infra) + education + 2 publications.
- 05 Contact: email sanskarnanegaonkar@gmail.com, LinkedIn in/sanskar-nanegaonkar,
  graceful placeholders for GitHub/Scholar.
- Footer.

## Motion
Fade-and-rise reveals (opacity 0→1, translateY 30→0, ~600ms, cubic-bezier(0.22,1,0.36,1));
splitting.js char reveals on headings; cloud/particle drift 20–40s; cursor parallax on hero
title; soft bloom hovers. Full `prefers-reduced-motion` fallback.

## SEO
JSON-LD Person + WebSite + ProfilePage; OG/Twitter; semantic headings; robots.txt; sitemap.xml;
theme-color; color-scheme.

## Quality gates (avoid)
No harsh pure black; no flat corporate UI; no neon/cyberpunk; no clutter; no character
close-ups as backgrounds; no cartoon/chibi.
