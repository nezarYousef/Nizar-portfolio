# Portfolio redesign (development branch)

Self-authored brief under explicit creative delegation. Content is unchanged; only
presentation, motion and structure were redesigned.

## Brief

- **Subject:** Nizar Yousef Alqerem, computer engineer (software, AI, web). Audience:
  recruiters, engineering leads, collaborators. Single job: show range and craft,
  then make contacting him effortless.
- **Vibe:** engineered, friendly, calm, precise. "Very polished, but surprisingly simple."
- **Identity kept from v1:** teal accent (`#0ea5a4` / `#28d7c4`), blueprint grid ground,
  heavy grotesque headings, monospace labels, `~/nizar_` terminal voice, numbered
  navigation, the "portfolio.lab" module cards (Interface Layer, Intelligence,
  Systems Core, Data Flow) and the live neural-network orb.
- **Tell-someone sentence:** "It's the portfolio where scrolling takes his tech stack
  apart like an exploded engineering drawing, and his projects sit in a deck you deal
  through."

## Feeling curve

| Act | Feeling | Cause |
|---|---|---|
| Hero | curiosity, then the peak | assembled 3D system (neural core + skill modules) explodes into an engineering diagram under the scroll |
| About | warmth | portrait with depth, the heading inks in word by word |
| Skills | clarity | the same modules land as a legible spec sheet, row by row |
| Projects | play | stacked deck dealt with arrows, swipe or keys |
| Experience | trust | the timeline draws itself as you read |
| Other experience | humanity | field-work photos pan sideways (breadth, not hierarchy) |
| Education | grounding | second drawn timeline |
| Contact | invitation | statement settles and holds; email is the one action |

**Peak:** the hero exploded view (largest scroll span, only pinned 3D moment).
**Signature move:** the project deck (depth-stacked cards, one active, deal/return motion).

## Visual system

- **Colour (light / dark):** ground `#f7fbfa` / `#0a0e0d`, surface `#ffffff` / `#131a18`,
  ink `#111b1d` / `#fbfffc`, text `#253236` / `#e6eee9`, muted `#5d6c71` / `#a3b4ac`,
  accent `#0ea5a4` / `#28d7c4` (small accent text uses `#047481` in light mode).
  Module swatches (only on module markers): web teal, AI violet `#9a5bbd`, systems rust
  `#c8556a`, data blue `#3d73d9`, vision green `#548f45`, tools `#12977f`.
- **Type:** Archivo variable (display at wdth 112 / wght 820-900, text at wdth 100),
  JetBrains Mono for labels and code-voice, IBM Plex Sans Arabic for Arabic.
  All self-hosted from `public/fonts` (OFL, subset WOFF2).
- **Radius:** 8px controls, 14px large surfaces.
- **Motion levels:** micro 140-200ms (hover, press), medium 420-700ms (deck, reveals,
  nav), large = scroll-bound (hero 3D, skills rows, timeline, rail). Easing
  `cubic-bezier(0.23, 1, 0.32, 1)`. `prefers-reduced-motion` removes pinning,
  scrubbing and float; content stays complete.

## Scroll score (Scroll-Craft)

Each act publishes `--p` (0..1) from `lib/scrollProgress.js`; CSS and the 3D frame
loop read it. No section re-renders React on scroll.

| Section | Device | Notes |
|---|---|---|
| Hero | pin + 3D scrub | 200svh desktop; unpinned on mobile and reduced motion |
| About | kinetic ink + parallax | portrait moves at a different rate than its frame |
| Skills | scrubbed stagger | rows slide in by scroll position, not by timers |
| Projects | deal-in + interactive deck | fan closes as the section arrives |
| Experience / Education | draw | line length follows reading position |
| Other experience | pan | pinned horizontal rail on desktop, swipe rail on touch |
| Contact | hold | final statement does not fade |

## Project links

One destination per project: GitHub first, otherwise a live demo, otherwise none.
Only `shell` and `school` have a published URL in the source data; add `github` or
`demo` to a project in `data/portfolio.js` (`projectMeta`) and the card picks it up.
