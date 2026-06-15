"use client";

import {
  BrainCircuit,
  Code2,
  Database,
  Mail,
  Network,
  Server,
  Terminal
} from "lucide-react";
import { useEffect, useState } from "react";

const NAME_HOLD_MS = 4200;
const NAME_RETYPE_PAUSE_MS = 320;
const NAME_TYPE_MS = 72;
const NAME_ERASE_MS = 34;

const terminalRows = [
  { command: "whoami", output: "Computer Engineer - Palestine" },
  { command: "cat focus.txt", output: "Web interfaces - AI systems - clean architecture" },
  { command: "ls stack/", output: "python java c react next.js pycaret computer-vision" },
  { command: "status", output: "available for software, web, and AI opportunities" }
];

const labCards = [
  {
    className: "lab-card-web",
    icon: Code2,
    label: "Interface Layer",
    value: "React / Next"
  },
  {
    className: "lab-card-ai",
    icon: BrainCircuit,
    label: "Intelligence",
    value: "ML / CNN / PyCaret"
  },
  {
    className: "lab-card-systems",
    icon: Server,
    label: "Systems Core",
    value: "C / Linux / OOP"
  },
  {
    className: "lab-card-data",
    icon: Database,
    label: "Data Flow",
    value: "APIs / Models"
  }
];

const projectSignals = ["Restaurant OS", "Expense Flow", "Unix Shell", "Vision Lab"];

function useRetypedText(text) {
  const [visibleText, setVisibleText] = useState(text);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      setVisibleText(text);
      return undefined;
    }

    let timeoutId;

    const typeName = (index) => {
      setVisibleText(text.slice(0, index));

      if (index < text.length) {
        timeoutId = window.setTimeout(() => typeName(index + 1), NAME_TYPE_MS);
        return;
      }

      timeoutId = window.setTimeout(() => eraseName(text.length), NAME_HOLD_MS);
    };

    const eraseName = (index) => {
      setVisibleText(text.slice(0, index));

      if (index > 0) {
        timeoutId = window.setTimeout(() => eraseName(index - 1), NAME_ERASE_MS);
        return;
      }

      timeoutId = window.setTimeout(() => typeName(0), NAME_RETYPE_PAUSE_MS);
    };

    setVisibleText(text);
    timeoutId = window.setTimeout(() => eraseName(text.length), NAME_HOLD_MS);

    return () => window.clearTimeout(timeoutId);
  }, [text]);

  return visibleText;
}

export default function Hero({ copy }) {
  const typedName = useRetypedText(copy.name);

  return (
    <section className="hero-section" id="hero">
      <div className="hero-backdrop" aria-hidden="true" />

      <div className="section-inner hero-grid">
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
              <span className="name-size-lock" aria-hidden="true">
                {copy.name}
              </span>
              <span className="name-live-text" aria-hidden="true">
                {typedName}
              </span>
            </span>
          </h1>
          <p className="hero-headline">
            <span aria-hidden="true">&gt;</span>
            <strong>{copy.typedRole ?? "AI + Web Engineering"}</strong>
          </p>
          <p className="hero-description">{copy.description}</p>

          <div className="hero-code-ribbon" aria-label="Animated code line">
            <code style={{ "--chars": "30" }}>
              <span>build({`{ web, ai, systems }`});</span>
            </code>
          </div>

          <div className="hero-stats" aria-label="Portfolio highlights">
            {copy.stats.map((stat) => (
              <div className="stat-item" key={stat.label}>
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
              <span />
              <span />
              <span />
              <code>nizar@portfolio:~$</code>
            </div>
            <div className="terminal-body">
              {terminalRows.map(({ command, output }, index) => (
                <div
                  className="terminal-row"
                  key={command}
                  style={{ "--row-delay": `${index * 1450}ms` }}
                >
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

        <div className="hero-visual page-enter-delayed">
          <div className="lab-panel" aria-label="Nizar engineering lab board">
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
              <span />
              <span />
              <span />
              <span />
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
              <meter min="0" max="100" value="97">
                97%
              </meter>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
