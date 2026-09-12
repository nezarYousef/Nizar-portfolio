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

## Round two additions

- **Intro (`components/Preloader.jsx`)** — a boot sequence in the site's own
  voice: `$ ./boot-nizar-portfolio`, the modules checking in, then "Hello,
  welcome to my portfolio" rising word by word, then four panels flying up to
  hand over to the hero. Roughly 3s, and it is skipped by a click, a key, the
  skip button, a second visit in the same tab (sessionStorage), a deep link
  (`/#projects`), or `prefers-reduced-motion`. Its timeline is measured in real
  time, not CSS delays, so a slow first paint cannot leave it out of step. The
  hero's WebGL scene is held back until the panels start flying, so three.js
  initialisation never stalls the intro.
- **Drifting code (`components/AmbientCode.jsx`)** — v1's background code
  fragments, now behind the whole page: slow drift at rest, and on scroll they
  fly past at a speed set by each fragment's depth, with a short streak on fast
  flicks. Masked away from the centre of the page, thinner on phones, off under
  reduced motion. This is also why the ground colour lives on `<html>` and not
  on `<body>`: an opaque body background would paint over both this layer and
  the blueprint grid.
- **Reticle cursor (`components/Cursor.jsx`)** — the native arrow is replaced by
  a small square point plus a four-corner frame that trails it. The frame opens
  into a crosshair over the 3D stage, closes and captions itself over links
  ("open"), buttons ("select") and the project deck ("swipe"). Fine pointers
  only; untouched on touch and under reduced motion.
- **Smoother scroll acts** — `lib/scrollProgress.js` now eases the published
  `--p` toward the raw scroll position instead of copying it, so every
  scroll-driven effect on the page glides rather than stepping with the wheel.
- **More scroll devices** — the project deck arrives fanned *and* tilted and
  closes flat; each cover wipes in when its card becomes active; the About
  heading travels on its own plane during the hand-off from the hero; the
  portrait eases out of a slight scale; the contact statement rises word by
  word; Skills and Other Experience sit on a banded ground for rhythm.

## Verification (development branch)

Rendered in Chromium (WebGL via SwiftShader) at 1440x900, 820x1180 and 390x844, in
light and dark, English and Arabic (RTL), and with `prefers-reduced-motion: reduce`:
no page errors, no horizontal overflow, hero 3D renders and responds to scroll,
deck works with arrows, keyboard (Left/Right/Home/End) and swipe, mobile menu traps
scroll and closes on Escape. The only console message is a `THREE.Clock` deprecation
warning emitted inside @react-three/fiber, not by this code.

The intro, the drifting fragments and the reticle were verified the same way
(phases and skip paths, canvas paint counts, cursor modes and captions).

`next build` could not be run from the sandbox (Next's SWC compiler for Linux is not
installed and the registry is unreachable there). Run on your machine:

```bash
npm install
npm run build
npm run dev
```

## Files

- `components/hero3d/*`: the WebGL scene (neural core, module cards, choreography).
- `components/Hero.jsx`: pinned hero, copy, second beat, WebGL detection + fallback.
- `components/ProjectStack.jsx`, `ProjectCard.jsx`, `ProjectCover.jsx`: the deck.
- `lib/scrollProgress.js`: the shared `--p` publisher; `lib/useMedia.js`, `lib/useReveal.js`.
- Removed: `CustomCursor.jsx`, `ProjectModal.jsx` (galleries are out of scope by design).


---

# Round three: refinement pass

Nothing was rebuilt from scratch and the identity is unchanged: same teal accent,
same off-white ground, same blueprint grid, same monospace labels and `~/nizar_`
voice, same hero concept. This round is about intention, hierarchy and legibility.

## Typography

Manrope replaces Archivo as the text and display face, self-hosted as a variable
`wght` subset (`public/fonts/manrope-var.woff2` latin, `manrope-var-ext.woff2`
latin-ext, 25 KB + 15 KB, from `@fontsource-variable/manrope`, MIT/OFL). Arabic
still uses IBM Plex Sans Arabic; JetBrains Mono still carries every label.
Manrope has no width axis, so `font-stretch` is gone everywhere and 800 is the
top weight.

The scale now has exactly three heading voices, so only one thing on any screen
is large:

| Token | Use |
|---|---|
| `--t-hero` | the hero name, once per page |
| `--t-display` (`.statement`) | the two statement moments: About, Contact |
| `--t-title` (`.title`) | every section heading |
| `--t-lead`, `--t-body`, `--t-small` | lead paragraph, body, dense body |
| `--t-label` + mono | eyebrows, dates, counters, tags |

## Section architecture

`.screen` (in `app/globals.css`) is the new primitive: `min-height: 100svh` with
`align-content: center`, which centres content only while there is spare room
and lets a taller section grow instead of clipping. `svh` keeps it honest while
mobile browser chrome collapses, with a `100vh` fallback and an opt-out under
620 px of viewport height. Short sections (Skills panels, Education records)
carry `svh`-elastic internal heights so a tall monitor gets generous layout
rather than a void.

## What changed, section by section

- **Loading screen.** The first frame is now painted by the document itself:
  `app/layout.jsx` decides before paint whether the intro should play, sets
  `data-intro` on `<html>`, and ships a static `#boot-cover` with the same
  columns and ground as the intro's panels. The React intro mounts on top of it,
  so there is no flash of the page and no seam. Timing is measured from
  navigation start and gated on a minimum hold **and** real readiness
  (`document.fonts.ready` + `load`), with a 2.4 s cap, so it holds for about
  1.5 s and never flashes past. It leaves by fading while the panels lift.
- **Cursor.** Circular now: a 5 px dot that tracks exactly plus a ring that
  follows with a lerp of 0.18. The ring is the only thing that reacts, by size
  (30 px at rest, 46 px on anything interactive, 58 px with a drag axis over the
  deck, 20 px over the 3D stage). `pointer-events: none`, fine pointers only,
  and disabled under `prefers-reduced-motion`.
- **Portrait.** The head was being clipped: the frame cropped from
  `object-position: center 22%` and then scaled the image up by 8 %. The source
  only has 38 px above the hairline, so instead of zooming or inventing pixels
  the photo is now top-aligned (`50% 0%`) with no internal scale, and mounted
  inside a bordered frame whose padding supplies the rest of the breathing room.
  Parallax moved from the image to the mount, so the crop is identical at every
  scroll position. One portrait only, with the badge overlapping the mount edge
  and a blueprint offset line behind it.
- **Skills.** Five numbered panels (`components/SkillPanel.jsx`) instead of a
  table of rows: index, title, one line of context, and the technologies as
  tags. The panel crossing the middle of the viewport is marked active by one
  IntersectionObserver and lifts onto the surface; nothing else moves.
- **Experience.** A road (`components/ExperienceRoad.jsx`): a rail that fills
  as you read, a sticky heading with a stage marker showing which stop you are
  level with, the active entry on the surface and the ones behind it at 52 %
  opacity. Each stop reads role, organisation, date, points, then a `Tech` row.
  Ordinary page scroll throughout; nothing is hijacked or pinned.
- **Other experience.** Same pinned horizontal pan, now with consistent card
  heights, a pan-progress meter, and a native snapping swipe rail below
  1024 px or under reduced motion.
- **Education.** Deliberately the quietest device: two dated records side by
  side, no rail, no stickiness, so it does not repeat the Experience road.
- **Projects.** Hierarchy added. EduFusion AI is the flagship
  (`components/FeaturedProject.jsx`): large cover, full stack, one CTA. The
  other eight stay in the deck, numbered 02 to 09, now with tech tags. The list
  is reordered so AI, computer vision and full-stack work comes first.
- **Hero.** Unchanged in concept, quieter in execution: the network's edges drop
  from 0.34 to 0.17 opacity, its nodes and core become translucent, the whole
  visual layer sits at 0.88 and fades on the copy side, and the pinned run is
  178 svh instead of 205 svh so the page below announces itself sooner.
- **Navigation.** Six items; Experience now covers the field-work section, which
  keeps its own heading but no number, and the two sit on one continuous band.
- **Ambient fragments.** Down from 44 to 24 on desktop, roughly half the alpha,
  and masked plus spawned into the margins so nothing can drift across a
  paragraph.

## Verification

Chromium (WebGL via SwiftShader) at 1920x1080, 1440x900, 1280x800, 1024x768,
834x1112 and 390x844, light and dark, English and Arabic (RTL), plus
`prefers-reduced-motion: reduce`. Checked: no page errors, no horizontal
overflow, hero 3D renders and answers the scroll, deck works via arrows,
keyboard and swipe, intro phases and all three skip paths, second visit and deep
link skip the intro, cursor tracks and changes size, focus order and visible
focus rings, mobile menu behaviour. `harness/css.mjs` also parses every
declaration in the built stylesheet through the browser, which is how three
invalid logical values were caught (`linear-gradient(to inline-end, ...)` and
two `transform-origin: inline-start`, all silently dropped by the parser and now
written physically with RTL overrides).

`next build` still cannot run in the sandbox (no Linux SWC binary, registry
unreachable), so run on your machine:

```bash
npm install
npm run build
npm run dev
```
