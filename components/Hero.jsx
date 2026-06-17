"use client";

import {
  BrainCircuit,
  Code2,
  Database,
  Mail,
  Network,
  Server,
  Terminal,
  Cpu,
  Layers,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NAME_HOLD_MS = 4200;
const NAME_RETYPE_PAUSE_MS = 320;
const NAME_TYPE_MS = 72;
const NAME_ERASE_MS = 34;

const terminalRows = [
  { command: "whoami", output: "Computer Engineer - Palestine 🇵🇸" },
  { command: "cat focus.txt", output: "Web interfaces · AI systems · clean architecture" },
  { command: "ls stack/", output: "python java c react next.js pycaret computer-vision" },
  { command: "status", output: "available for software, web, and AI opportunities" }
];

const labCards = [
  { className: "lab-card-web", icon: Code2, label: "Interface Layer", value: "React / Next.js" },
  { className: "lab-card-ai", icon: BrainCircuit, label: "Intelligence", value: "ML / CNN / PyCaret" },
  { className: "lab-card-systems", icon: Server, label: "Systems Core", value: "C / Linux / OOP" },
  { className: "lab-card-data", icon: Database, label: "Data Flow", value: "APIs / Models" }
];

const projectSignals = ["Restaurant OS", "Expense Flow", "Unix Shell", "Vision Lab"];

const FLOATING_SYMBOLS = [
  "const", "def", "class", "async", "await", "import", "return",
  "∑", "∂", "λ", "∇", "π", "→", "⊕",
  "if __name__", "useState", "useEffect", "neural.fit()",
  "CNN.forward()", "model.predict()", ".map()", ".filter()",
  "{ }", "[ ]", "( )", "=>", "===", "!==",
  "0x4E", "0xFF", "0b1010", "malloc()", "free()",
  "git push", "npm run", "python3", "gcc -o"
];

function useRetypedText(text) {
  const [visibleText, setVisibleText] = useState(text);
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) { setVisibleText(text); return undefined; }
    let timeoutId;
    const typeName = (index) => {
      setVisibleText(text.slice(0, index));
      if (index < text.length) { timeoutId = window.setTimeout(() => typeName(index + 1), NAME_TYPE_MS); return; }
      timeoutId = window.setTimeout(() => eraseName(text.length), NAME_HOLD_MS);
    };
    const eraseName = (index) => {
      setVisibleText(text.slice(0, index));
      if (index > 0) { timeoutId = window.setTimeout(() => eraseName(index - 1), NAME_ERASE_MS); return; }
      timeoutId = window.setTimeout(() => typeName(0), NAME_RETYPE_PAUSE_MS);
    };
    setVisibleText(text);
    timeoutId = window.setTimeout(() => eraseName(text.length), NAME_HOLD_MS);
    return () => window.clearTimeout(timeoutId);
  }, [text]);
  return visibleText;
}

function FloatingCodeParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const isDark = () => document.documentElement.dataset.theme === "dark";

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.symbol = FLOATING_SYMBOLS[Math.floor(Math.random() * FLOATING_SYMBOLS.length)];
        this.speed = 0.18 + Math.random() * 0.32;
        this.opacity = 0;
        this.maxOpacity = 0.08 + Math.random() * 0.14;
        this.fadeDir = 1;
        this.life = 0;
        this.maxLife = 180 + Math.random() * 240;
        this.fontSize = 10 + Math.floor(Math.random() * 6);
        this.drift = (Math.random() - 0.5) * 0.4;
        this.color = Math.random() > 0.5
          ? (isDark() ? "#28d7c4" : "#0ea5a4")
          : (isDark() ? "#75a7ff" : "#3d73d9");
      }
      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.life++;
        if (this.life < 40) this.opacity = Math.min(this.maxOpacity, this.opacity + this.maxOpacity / 40);
        else if (this.life > this.maxLife - 40) this.opacity = Math.max(0, this.opacity - this.maxOpacity / 40);
        if (this.life > this.maxLife || this.y < -20) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = `${this.fontSize}px SFMono-Regular, Consolas, monospace`;
        ctx.fillText(this.symbol, this.x, this.y);
        ctx.restore();
      }
    }

    for (let i = 0; i < 40; i++) {
      const p = new Particle();
      p.life = Math.random() * p.maxLife;
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0
      }}
      aria-hidden="true"
    />
  );
}

function ThreeDLabPanel({ copy }) {
  const panelRef = useRef(null);
  const [rotation, setRotation] = useState({ x: -4, y: 6 });
  const [isHovered, setIsHovered] = useState(false);
  const animFrameRef = useRef(null);
  const targetRef = useRef({ x: -4, y: 6 });
  const currentRef = useRef({ x: -4, y: 6 });

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleMove = (e) => {
      const rect = panel.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = e.clientX - cx;
      const my = e.clientY - cy;
      targetRef.current = {
        x: -my / rect.height * 22,
        y: mx / rect.width * 22
      };
    };

    const handleLeave = () => {
      targetRef.current = { x: -4, y: 6 };
      setIsHovered(false);
    };

    const handleEnter = () => setIsHovered(true);

    panel.addEventListener("mousemove", handleMove);
    panel.addEventListener("mouseleave", handleLeave);
    panel.addEventListener("mouseenter", handleEnter);

    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.07);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.07);
      setRotation({ ...currentRef.current });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      panel.removeEventListener("mousemove", handleMove);
      panel.removeEventListener("mouseleave", handleLeave);
      panel.removeEventListener("mouseenter", handleEnter);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className="hero-visual page-enter-delayed"
      style={{ perspective: "1200px", perspectiveOrigin: "center center" }}
    >
      <div
        className="lab-panel-3d"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(0)`,
          transition: isHovered ? "none" : "transform 1.2s ease",
          transformStyle: "preserve-3d",
          willChange: "transform"
        }}
        aria-label="Nizar engineering lab board"
      >
        <div className="lab-panel">
          <div className="lab-topbar">
            <code>portfolio.lab</code>
            <span>build: ready</span>
          </div>

          <div className="identity-chip">
            <span className="identity-mark">NA</span>
            <div>
              <strong>Nizar Alqerem</strong>
              <small>Computer Engineer</small>
            </div>
          </div>

          <div className="signal-track" aria-hidden="true">
            <span /><span /><span /><span />
          </div>

          <div className="lab-card-grid">
            {labCards.map(({ className, icon: Icon, label, value }) => (
              <article className={`lab-card ${className}`} key={label}>
                <Icon size={19} />
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>

          <div className="project-signal-strip" aria-label="Featured project signals">
            {projectSignals.map((signal, index) => (
              <span key={signal}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {signal}
              </span>
            ))}
          </div>

          <div className="build-meter" aria-label="Portfolio build meter">
            <div>
              <Network size={17} />
              <span>system health</span>
            </div>
            <strong>97%</strong>
            <meter min="0" max="100" value="97">97%</meter>
          </div>
        </div>

        <div className="panel-3d-face panel-3d-left" aria-hidden="true" />
        <div className="panel-3d-face panel-3d-bottom" aria-hidden="true" />
      </div>
    </div>
  );
}

function AIBrainOrb() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;
    let animId;

    const W = 200, H = 200;
    canvas.width = W;
    canvas.height = H;

    const nodes = Array.from({ length: 18 }, (_, i) => ({
      angle: (i / 18) * Math.PI * 2,
      radius: 30 + Math.random() * 40,
      speed: 0.003 + Math.random() * 0.008,
      phase: Math.random() * Math.PI * 2
    }));

    const isDark = () => document.documentElement.dataset.theme === "dark";

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const accent = isDark() ? "#28d7c4" : "#0ea5a4";
      const blue = isDark() ? "#75a7ff" : "#3d73d9";
      const alpha = isDark() ? 0.35 : 0.25;

      const positions = nodes.map(n => ({
        x: cx + Math.cos(n.angle + t * n.speed) * n.radius,
        y: cy + Math.sin(n.angle + t * n.speed + n.phase) * n.radius * 0.65
      }));

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.save();
            ctx.strokeStyle = accent;
            ctx.globalAlpha = alpha * (1 - dist / 80);
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      positions.forEach((pos, i) => {
        ctx.save();
        ctx.fillStyle = i % 3 === 0 ? blue : accent;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.save();
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      grd.addColorStop(0, accent + "44");
      grd.addColorStop(1, accent + "00");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      t++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", opacity: 0.88 }}
      aria-hidden="true"
    />
  );
}

export default function Hero({ copy }) {
  const typedName = useRetypedText(copy.name);

  return (
    <section className="hero-section" id="hero" style={{ position: "relative", overflow: "hidden" }}>
      <div className="hero-backdrop" aria-hidden="true" />
      <FloatingCodeParticles />

      <div className="section-inner hero-grid" style={{ position: "relative", zIndex: 1 }}>
        <div className="hero-copy page-enter">
          <div className="hero-command" aria-label="Portfolio boot command">
            <span>00</span>
            <i aria-hidden="true" />
            <code className="boot-command" style={{ "--chars": "24" }}>
              <span>$ ./boot-nizar-portfolio</span>
            </code>
          </div>

          <p className="availability-line">
            <span aria-hidden="true" />
            {copy.status}
          </p>

          <h1 className="hero-title" aria-label={copy.name}>
            <span className="name-typebox">
              <span className="name-size-lock" aria-hidden="true">{copy.name}</span>
              <span className="name-live-text" aria-hidden="true">{typedName}</span>
            </span>
          </h1>

          <p className="hero-headline">
            <span aria-hidden="true">&gt;</span>
            <strong>{copy.typedRole ?? "AI + Web Engineering"}</strong>
          </p>

          <p className="hero-description">{copy.description}</p>

          <div className="hero-ai-orb-strip">
            <div className="hero-ai-orb-wrap">
              <AIBrainOrb />
            </div>
            <div className="hero-ai-orb-text">
              <span className="hero-ai-label">Neural Network</span>
              <span className="hero-ai-sub">Live visualization · CNN patterns</span>
            </div>
          </div>

          <div className="hero-code-ribbon" aria-label="Animated code line">
            <code style={{ "--chars": "30" }}>
              <span>build({`{ web, ai, systems }`});</span>
            </code>
          </div>

          <div className="hero-stats" aria-label="Portfolio highlights">
            {copy.stats.map((stat) => (
              <div className="stat-item stat-item-3d" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href="#projects">
              <Terminal size={18} />
              <span>{copy.primaryAction}</span>
            </a>
            <a className="button button-secondary" href="#contact">
              <Mail size={18} />
              <span>{copy.secondaryAction}</span>
            </a>
          </div>

          <div className="terminal-card" aria-label="Developer terminal summary">
            <div className="terminal-bar">
              <span /><span /><span />
              <code>nizar@portfolio:~$</code>
            </div>
            <div className="terminal-body">
              {terminalRows.map(({ command, output }, index) => (
                <div className="terminal-row" key={command} style={{ "--row-delay": `${index * 1450}ms` }}>
                  <code
                    className="typing-line"
                    style={{
                      "--chars": String(`nizar@portfolio:~$ ${command}`.length),
                      "--typing-delay": `${index * 1450}ms`
                    }}
                  >
                    <span>nizar@portfolio:~$ {command}</span>
                  </code>
                  <p
                    className="typing-line"
                    style={{
                      "--chars": String(output.length),
                      "--typing-delay": `${index * 1450 + 760}ms`
                    }}
                  >
                    <span>{output}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ThreeDLabPanel copy={copy} />
      </div>
    </section>
  );
}
