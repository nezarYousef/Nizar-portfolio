"use client";

import { useEffect, useRef } from "react";
import styles from "./AmbientCode.module.css";

/*
 * The v1 hero had code fragments drifting in its background. Here they live
 * behind the whole page and answer the scroll: a slow drift at rest, and when
 * you scroll they fly past at a rate set by each fragment's depth, with a
 * short streak on fast flicks. Pure canvas, one rAF, paused off-screen.
 */

const SYMBOLS = [
  "const", "def", "class", "async", "await", "import", "return",
  "∑", "∂", "λ", "∇", "π", "→", "⊕",
  "if __name__", "useState", "useEffect", "neural.fit()",
  "CNN.forward()", "model.predict()", ".map()", ".filter()",
  "{ }", "[ ]", "( )", "=>", "===", "!==",
  "0x4E", "0xFF", "0b1010", "malloc()", "free()",
  "git push", "npm run", "python3", "gcc -o"
];

const PALETTE = {
  light: ["#0ea5a4", "#3d73d9", "#12977f"],
  dark: ["#28d7c4", "#75a7ff", "#34d399"]
};

export default function AmbientCode({ theme = "light", enabled = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return undefined;

    const context = canvas.getContext("2d");
    const isDark = theme === "dark";
    const colors = PALETTE[isDark ? "dark" : "light"];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let frame = 0;
    let lastScroll = window.scrollY;
    let velocity = 0;

    const count = () => (window.innerWidth < 700 ? 10 : window.innerWidth < 1200 ? 16 : 24);

    // Fragments live in the margins, not over the reading column: the mask in
    // the stylesheet fades the middle out, and spawning follows it so nothing
    // is wasted drawing under text.
    const edgeX = () => {
      const band = width * 0.3;
      return Math.random() < 0.5 ? Math.random() * band : width - Math.random() * band;
    };

    const spawn = (seeded = false) => ({
      x: edgeX(),
      y: seeded ? Math.random() * height : height + 40,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      depth: 0.35 + Math.random() * 0.95,
      size: 10 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 0.18,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: seeded ? Math.random() : 0,
      span: 0.0012 + Math.random() * 0.0016,
      alphaMax: (isDark ? 0.15 : 0.11) + Math.random() * 0.08
    });

    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length !== count()) {
        particles = Array.from({ length: count() }, () => spawn(true));
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const onScroll = () => {
      const now = window.scrollY;
      velocity += now - lastScroll;
      lastScroll = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const font = (size) => `${size}px "JetBrains Mono", ui-monospace, Consolas, monospace`;

    const draw = (particle, alpha, offset) => {
      context.globalAlpha = alpha;
      context.fillStyle = particle.color;
      context.fillText(particle.symbol, particle.x, particle.y + offset);
    };

    const render = () => {
      frame = requestAnimationFrame(render);
      if (document.hidden) return;

      context.clearRect(0, 0, width, height);
      // Scroll energy decays quickly, so a flick reads as a gust.
      const gust = velocity;
      velocity *= 0.82;
      if (Math.abs(velocity) < 0.05) velocity = 0;

      particles.forEach((particle, index) => {
        particle.life += particle.span;
        particle.y -= 0.1 + particle.depth * 0.3;
        particle.y += gust * particle.depth * 0.55;
        particle.x += particle.drift + gust * particle.depth * 0.02;

        if (particle.life >= 1 || particle.y < -60 || particle.y > height + 90) {
          particles[index] = spawn(particle.y > height);
          return;
        }
        if (particle.x < -80) particle.x = width + 40;
        if (particle.x > width + 80) particle.x = -40;

        const fade = Math.sin(Math.min(1, particle.life) * Math.PI);
        const alpha = particle.alphaMax * fade;
        context.font = font(particle.size);

        // Streak: a couple of ghosts along the travel direction.
        if (Math.abs(gust) > 14) {
          draw(particle, alpha * 0.28, -gust * particle.depth * 0.22);
          draw(particle, alpha * 0.14, -gust * particle.depth * 0.44);
        }
        draw(particle, alpha, 0);
      });

      context.globalAlpha = 1;
    };

    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [theme, enabled]);

  if (!enabled) return null;

  return <canvas className={styles.ambient} ref={canvasRef} aria-hidden="true" />;
}
