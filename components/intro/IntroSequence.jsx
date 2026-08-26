"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./IntroSequence.module.css";

const SESSION_KEY = "nizar-portfolio-intro";

/* Timeline (seconds). The boot phase gathers energy, the burst detonates it,
   and the word flight overlaps the settle phase so the overlay hands over to
   the hero without a visible seam. */
const T_IGNITE = 1.15;
const T_BURST = 1.42;
const T_RELEASE = 3.35;
const T_UNMOUNT = 4.05;

/* Deterministic PRNG (mulberry32): the choreography is authored, so a replay
   of the same session should look identical rather than re-rolled. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutCubic = (v) => 1 - (1 - v) ** 3;

function readColors() {
  const cs = window.getComputedStyle(document.documentElement);
  return {
    accent: cs.getPropertyValue("--accent-bright").trim() || "#35d6c6",
    spark: "#eafcf9"
  };
}

/* Surfaces behind the opaque cover are made inert for the duration of the
   sequence, so keyboard focus cannot land on links the visitor cannot see.
   Each id lives in Site.jsx / SiteHeader.jsx / AssistantDock.jsx. */
const INERT_SURFACES = ["main", "site-header", "site-footer", "assistant-dock"];

function setSurfacesInert(inert) {
  INERT_SURFACES.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.inert = inert;
  });
}

export default function IntroSequence({ words, dir, skipLabel }) {
  const [phase, setPhase] = useState("idle");
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const wordsRef = useRef(null);
  const skipRef = useRef(null);

  /* Release hands over to the hero: data-hero-in starts the hero entrance
     choreography in the same frame the intro cover lets go, and removing
     data-intro unlocks scrolling. Both live on <html> so plain CSS can react
     with zero JS after this point. Focus moves to <main> so keyboard users
     resume from the content instead of a lost position behind the overlay. */
  const release = useCallback(() => {
    const html = document.documentElement;
    html.dataset.heroIn = "true";
    delete html.dataset.intro;
    try {
      window.sessionStorage.setItem(SESSION_KEY, "done");
    } catch {
      /* Storage can be blocked; the intro just replays next visit. */
    }
    document.getElementById("main")?.focus();
    setPhase("release");
    window.setTimeout(() => setPhase("done"), T_UNMOUNT * 1000 - T_RELEASE * 1000 + 400);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    let played = false;
    try {
      played = window.sessionStorage.getItem(SESSION_KEY) === "done";
    } catch {
      played = false;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (played || reduced || !words.length) {
      delete html.dataset.intro;
      html.dataset.heroIn = "true";
      return undefined;
    }

    setPhase("play");
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "play") return undefined;

    const html = document.documentElement;
    html.dataset.intro = "play";

    /* The cover is opaque: park background surfaces out of the tab order and
       put focus on the one interactive element that exists up here. */
    setSurfacesInert(true);
    skipRef.current?.focus();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const colors = readColors();
    const rand = seeded(20260822);
    const rtl = dir === "rtl";
    const targetX = rtl ? 0.3 : 0.72;
    const targetY = 0.44;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let minDim = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h * 0.46;
      minDim = Math.min(w, h);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    /* Static starfield behind everything - drawn every frame because it is
       cheaper than compositing a second canvas under the particles. */
    const stars = Array.from({ length: minDim < 560 ? 70 : 130 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.1,
      base: 0.12 + rand() * 0.4,
      speed: 0.3 + rand() * 1.4,
      phase: rand() * Math.PI * 2
    }));

    /* Boot-phase motes spiral slowly inward: energy gathering before the
       burst. They are consumed at ignition. */
    const motes = Array.from({ length: minDim < 560 ? 40 : 80 }, () => ({
      angle: rand() * Math.PI * 2,
      radius: (0.28 + rand() * 0.75) * minDim,
      speed: (0.25 + rand() * 0.6) / 1000,
      size: 0.6 + rand() * 1.3
    }));

    let particles = null;

    const spawnBurst = () => {
      const count = minDim < 560 ? 150 : 280;
      particles = Array.from({ length: count }, () => {
        const angle = rand() * Math.PI * 2;
        const speed = minDim * (0.35 + rand() * 1.05);
        const pick = rand();
        return {
          x: cx + Math.cos(angle) * (minDim * 0.012),
          y: cy + Math.sin(angle) * (minDim * 0.012),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.82,
          size: 0.7 + rand() * 2.1,
          /* Amber is reserved for the availability state, so the burst is
             accent + white-hot only. */
          color: pick < 0.85 ? colors.accent : colors.spark,
          life: 1.7 + rand() * 1.5,
          age: 0
        };
      });
    };

    /* ── Skill word flight paths ─────────────────────────────────────────── */
    if (wordsRef.current) {
      const host = wordsRef.current;
      const total = words.length;
      words.forEach((word, i) => {
        const el = document.createElement("span");
        el.className = styles.word;
        el.textContent = word;
        host.appendChild(el);

        const angle = rand() * Math.PI * 2;
        const spread = 0.24 + rand() * 0.38;
        const peakX = cx + Math.cos(angle) * spread * minDim * 1.15;
        const peakY =
          cy + Math.sin(angle) * spread * minDim * 0.8 - h * 0.04;
        const homeX = w * targetX + (rand() - 0.5) * minDim * 0.16;
        const homeY = h * targetY + (rand() - 0.5) * minDim * 0.22;
        const scalePeak = 0.9 + rand() * 0.7;
        const rot = (rand() - 0.5) * 9;

        const flyMs = 900 + rand() * 350;
        const driftMs = 850 + rand() * 300;
        const delay =
          (T_BURST + 0.06) * 1000 +
          (i / total) * 620 +
          rand() * 140;

        el.animate(
          [
            {
              transform: `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(0.25)`,
              opacity: 0
            },
            {
              transform: `translate(${peakX}px, ${peakY}px) translate(-50%, -50%) scale(${scalePeak}) rotate(${rot}deg)`,
              opacity: 0.92,
              offset: 0.52
            },
            {
              transform: `translate(${homeX}px, ${homeY}px) translate(-50%, -50%) scale(0.62) rotate(${rot * 0.35}deg)`,
              opacity: 0
            }
          ],
          {
            duration: flyMs + driftMs,
            delay,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "both"
          }
        );
      });
    }

    /* ── Frame loop ──────────────────────────────────────────────────────── */
    let raf = 0;
    let last = performance.now();
    let tNow = 0;
    let released = false;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      tNow += dt;

      ctx.clearRect(0, 0, w, h);

      /* Stars */
      ctx.globalCompositeOperation = "source-over";
      for (const star of stars) {
        const twinkle = star.base + Math.sin(tNow * star.speed + star.phase) * 0.08;
        ctx.globalAlpha = Math.max(0.04, twinkle);
        ctx.fillStyle = "#cfe8e5";
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "lighter";

      if (tNow < T_BURST) {
        /* Energy gathering: motes spiral inward, core brightens. */
        const bootP = clamp01(tNow / T_IGNITE);
        for (const mote of motes) {
          mote.angle += mote.speed * dt * 60;
          mote.radius -= dt * minDim * 0.22 * (0.4 + bootP);
          const mx = cx + Math.cos(mote.angle) * mote.radius;
          const my = cy + Math.sin(mote.angle) * mote.radius * 0.85;
          ctx.globalAlpha = 0.16 + bootP * 0.4;
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.arc(mx, my, mote.size, 0, Math.PI * 2);
          ctx.fill();
        }

        const coreR = easeOutCubic(clamp01((tNow - T_IGNITE * 0.55) / (T_BURST - T_IGNITE * 0.55))) * minDim * 0.09;
        if (coreR > 0) {
          const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(coreR, 1));
          glow.addColorStop(0, "rgba(234, 252, 249, 0.95)");
          glow.addColorStop(0.45, `${colors.accent}88`);
          glow.addColorStop(1, "transparent");
          ctx.globalAlpha = 1;
          ctx.fillStyle = glow;
          ctx.fillRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2);
        }

        if (counterRef.current && barRef.current) {
          counterRef.current.textContent = `${String(Math.round(bootP * 100)).padStart(3, "0")}%`;
          barRef.current.style.transform = `scaleX(${bootP})`;
        }
      } else {
        /* Burst + flight: the boot UI hands over to the particles. */
        if (rootRef.current && !rootRef.current.dataset.burst) {
          rootRef.current.dataset.burst = "true";
        }

        if (!particles) spawnBurst();

        const rt = tNow - T_BURST;
        const ringP = clamp01(rt / 1.05);
        const ringR = easeOutCubic(ringP) * minDim * 0.78;
        ctx.globalAlpha = (1 - ringP) * 0.5;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.6 * (1 - ringP) + 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.stroke();

        const flash = Math.max(0, 0.34 * Math.exp(-rt * 3.4));
        if (flash > 0.004) {
          ctx.globalAlpha = flash;
          ctx.fillStyle = colors.spark;
          ctx.fillRect(0, 0, w, h);
        }

        const converge = clamp01((rt - 0.9) / 1.2);
        const tx = w * targetX;
        const ty = h * targetY;

        for (const p of particles) {
          p.age += dt;
          const drag = Math.exp(-1.45 * dt);
          p.vx *= drag;
          p.vy *= drag;
          if (converge > 0) {
            p.vx += (tx - p.x) * converge * 0.55 * dt;
            p.vy += (ty - p.y) * converge * 0.55 * dt;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          const lifeP = p.age / p.life;
          if (lifeP >= 1) continue;
          ctx.globalAlpha = (1 - lifeP) * 0.85;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - lifeP * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }

        if (!released && tNow >= T_RELEASE) {
          released = true;
          release();
        }
      }

      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(frame);

    const onKey = (event) => {
      if (event.key === "Escape") release();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      /* Word flights are deliberately not cancelled: the overlay is fading
         out at that point, and cancelling would snap the words to their
         unanimated position for a frame before unmount removes them. */
      delete html.dataset.intro;
      setSurfacesInert(false);
    };
  }, [phase, dir, words, release]);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      ref={rootRef}
      className={styles.overlay}
      data-phase={phase}
      data-dir={dir}
      role="dialog"
      aria-modal="true"
      aria-label={skipLabel}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      {phase === "play" ? (
        <>
          <div className={styles.boot} aria-hidden="true">
            <div className={styles.bootInner}>
              <span className={`${styles.glyph} u-mono`}>/</span>
              <span ref={counterRef} className={`${styles.counter} u-mono`}>
                000%
              </span>
              <span className={styles.track}>
                <span ref={barRef} className={styles.bar} />
              </span>
            </div>
          </div>

          <div ref={wordsRef} className={styles.words} aria-hidden="true" />
        </>
      ) : null}

      <button
        type="button"
        ref={skipRef}
        className={`${styles.skip} u-mono`}
        onClick={release}
      >
        {skipLabel}
      </button>
    </div>
  );
}
