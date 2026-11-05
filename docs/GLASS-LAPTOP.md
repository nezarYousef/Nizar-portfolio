# Glass laptop refinement

## Latest visual refinement

Continued the same `feat/glass-laptop-hero-scroll` work, using the previous `refined-hero.png` and `refined-about.png` as the immediate before captures. The original architecture board remains the art-direction reference.

- Reduced the base-to-deck separation and chassis/lid thickness. Refined the display bezel proportions, hinge barrels, front opening, inset trackpad, matte keycaps, and balanced three-quarter angle. Lower reflection strength retains material definition in both themes.
- Kept the processor below the glass deck at rest. Its smaller mounted package now has a satin metal frame, dark etched die, fine lithography, subtle circuitry, and restrained illumination. The same package lifts into the final architecture.
- Refined the existing six 3D cards with thin edges, soft translucent gradients, inset highlights, lighter shadows, consistent dimensions, small indicators, and short accent rules. These are real scene meshes with generated UI textures; no raster scene replacement or dependencies were added.
- Reorganised card typography into a category row and prominent technology names. Values wrap at technology separators, keeping phrases such as “Data Structures” intact. Compact viewports use larger texture type. Information and technologies are unchanged; numbering now follows the visual reading order.
- Made the terminal the aligned lower-right endpoint of the architecture, matching the other modules' size, padding, surface, and typography. Its original prompt, command, and output remain.
- Reduced the upper plate's footprint, moved it clear of the processor face, and retuned curved connections to meet card edges. Kept the original laptop meshes and common scroll progress throughout forward and reverse motion. No new decorative objects were introduced.

New captures: `screenshots/polished-hero.png`, `polished-reveal.png`, `polished-separation.png`, and `polished-about.png`, plus theme, RTL, compact, and reverse-scroll captures. Inspection caught and corrected upper-plate occlusion, overly reflective keycaps, dark-mode plate reflections, and compact card text size.

Latest verification: supplementary ESLint (11 changed JS/JSX files), JavaScript project configuration check, and whitespace checks pass. Browser verification covers light/dark × English/Arabic at Hero/final states and widths 320–1920px; no overflow or page exceptions. Mobile Arabic menu behavior passes. Development scroll sampling measured 60 fps forward and reverse with zero progress reversals (maximum sampled progress steps 0.0786 / 0.0690). Final production build passed (34.3 kB route / 137 kB first-load JavaScript). Production replay passed all four captured stages, theme/RTL/responsive cases, six navigation links, reduced motion, forced context loss, and disabled WebGL. Final production motion sampling measured 59 fps forward / 60 fps reverse with zero progress reversals and maximum progress steps 0.0698 / 0.0694. No page exceptions occurred. These are local requestAnimationFrame measurements, not cross-device GPU benchmarks.

Implementation branch: `feat/glass-laptop-hero-scroll`, based on `origin/main` at `4e75ed3`. No dependency changes.

## What changed in this refinement

The existing React Three Fiber laptop and scroll architecture were refined in place. The supplied board remains a design reference, never a background asset.

- Stronger glass and metal materials, a thinner proportioned chassis, a defined screen bezel and webcam, refined hinge barrels, recessed keyboard well, solid instanced keycaps with legends and a spacebar, and a separate inset trackpad.
- The smaller processor is physically below the deck at rest. Its etched die, substrate, and instanced contacts rise through the chassis during reveal.
- The original display, keyboard deck, and bottom chassis become the three architecture plates. The extra replacement plate was removed. The screen transforms around its centre, following a short arc.
- Rig, hardware, cards, and HTML caption now read the same smoothed scroll progress. Independent scene smoothing was removed. Camera and vertical movement are staged to keep the lifting display clear of navigation.
- All six existing module entries settle into three symmetric pairs around the core. Card sizes match, metadata is more legible, shadows are softer, and curved connectors end at card edges.
- Removed the moving connector dots and all sphere geometry from the scene. Floating background symbols are disabled while Hero is active; the original ambient treatment remains in the other sections.
- Desktop scroll travel is 96svh instead of 124svh. The final caption sits closer to the architecture and About introduction. Mobile handoff padding is also smaller.
- About overlap applies only when Hero is actually pinned, so WebGL fallback and reduced motion cannot pull About over visible Hero content.
- The loading fallback remains through the first completed scene draw, allowing shader compilation and texture upload before the scene is exposed. Demand rendering explicitly requests that second frame for reduced motion.

## Files

This refinement updates:

- `components/hero3d/GlassLaptop.jsx`
- `components/hero3d/HeroScene.jsx`
- `components/hero3d/ModuleCards.jsx`
- `components/hero3d/choreography.js`
- `components/hero3d/palette.js`
- `components/hero3d/cardTexture.js`
- `components/hero3d/screenTexture.js`
- `components/Hero.module.css`
- `components/About.module.css`
- `components/PortfolioApp.jsx` (Hero-only ambient visibility)
- `docs/GLASS-LAPTOP.md`

The existing geometry helper, error boundary, WebGL fallback, motion preference support, and lazy scene loading are retained. The fallback files and removed neural core are part of the same feature implementation.

Portfolio copy, fonts, projects, experiences, education, contact details, links, theme switching, and language switching were not replaced. The only changes outside the scene files concern its spacing and background during the Hero/About handoff.

## Visual verification

Reference: `Premium Glass Portfolio Architecture Board.png`.
Baseline: the previous `glass-final-hero.png` and `glass-production-1.png` captures.

Captured and inspected all four stages, including reverse scrolling:

| State | Local evidence |
| --- | --- |
| Initial Hero | `screenshots/refined-hero.png` |
| Internal processor reveal | `screenshots/refined-reveal.png` |
| Layer separation | `screenshots/refined-separation.png` |
| Final architecture / About handoff | `screenshots/refined-about.png` |

Inspection led to further changes: the lifting display was lowered during the middle of the journey; the upper architecture plate was raised to avoid washing out the core; die reflections were reduced and an etched texture added; card shadow interiors were reduced to eliminate hard stripes; and the one-sided canvas mask was removed to keep paired cards equally visible.

Additional captures cover light/dark, English/Arabic, 1920×1080, 1440×900, 1280×640, 1024×768, 768×1024, 390×844, and 320×740. Desktop handoff text gaps measured 54–80px and compact layouts measured 79px, with no text overlap or horizontal overflow. The Arabic mobile menu closes and releases scroll correctly.

The six navigation links reached their original sections at about 88px below the viewport top. Ambient code remains enabled outside Hero. Reduced motion resolves progress to zero without pinning. Forced context loss produces six fallback cards; on a 640px-tall viewport, About starts after the fallback Hero rather than overlapping it. Disabled WebGL at 320px also works without overflow.

Foreground development sampling measured approximately 59 fps at 1440×900 on the local integrated GPU. An immediate first-draw production test initially caught a startup hitch, prompting the ready-signal adjustment above. The final production replay measured 60 fps in both directions over 2.3-second samples, with zero progress reversals and maximum per-frame progress changes of 0.0695 forward / 0.0697 reverse. These requestAnimationFrame observations on this computer are not GPU timings or cross-device benchmarks.

Screenshots and verification drivers are local, ignored QA artifacts, not production page assets.

## Checks

- Supplementary ESLint correctness and React hooks checks: passed.
- `git diff --check`: passed.
- Final `npm run build`: passed; static route 34.3 kB / 137 kB first-load JavaScript, with the 3D scene lazy-loaded.
- Production replay: all four stages captured and inspected, including reverse scroll; no page exceptions.
- Production light/dark × English/Arabic, responsive layouts, navigation, reduced motion, context loss, and disabled WebGL checks: passed.
- Supplementary JavaScript project configuration check with `tsc`: passed.

This is a JavaScript project without dedicated lint/type-check scripts. A supplementary `tsc -p jsconfig.json --noEmit --allowJs --checkJs false --jsx preserve --skipLibCheck` checks project validity, but does not strictly type-check JavaScript.

## Practical limits

Verified in Chromium on Windows. Physical iOS/Android devices, Safari, and Firefox were not available. Compact layouts use a shorter unpinned journey. Glass uses physical materials, transparency, and a generated reflection environment rather than expensive optical simulation. The editor is a texture on a real 3D screen, not an interactive IDE. The installed Three/Fiber combination emits a Clock deprecation warning; no dependency upgrade was introduced for this visual task.

Publication follows the feature branch pull request; deployment and remote CI results are recorded in GitHub.
