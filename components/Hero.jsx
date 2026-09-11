"use client";

import { Mail, SquareTerminal } from "lucide-react";
import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import HeroFallback from "@/components/HeroFallback";
import { heroModules } from "@/data/portfolio";
import { useScrollProgress } from "@/lib/scrollProgress";
import { useCanPin, useMediaQuery, usePrefersReducedMotion } from "@/lib/useMedia";
import styles from "./Hero.module.css";

const HeroScene = lazy(() => import("@/components/hero3d/HeroScene"));

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") console.warn("Hero 3D disabled:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function splitName(name) {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return [name, ""];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

export default function Hero({ copy, theme, dir }) {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  const canPin = useCanPin();
  const reducedMotion = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 1023px)", false);

  const [sceneState, setSceneState] = useState("pending"); // pending | webgl | fallback
  const [sceneReady, setSceneReady] = useState(false);
  const [active, setActive] = useState(true);

  const onProgress = useCallback((p) => {
    progressRef.current = p;
  }, []);
  const onSceneReady = useCallback(() => setSceneReady(true), []);

  useScrollProgress(sectionRef, {
    mode: canPin ? "pin" : "exit",
    onChange: onProgress,
    disabled: reducedMotion,
    resetTo: 0
  });

  useEffect(() => {
    setSceneState(supportsWebGL() ? "webgl" : "fallback");
  }, []);

  // Only render the 3D loop while the hero is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "80px 0px"
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Gentle pointer parallax on devices with a precise pointer.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || reducedMotion) return undefined;
    const onMove = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  const [firstName, lastName] = splitName(copy.name);
  const roleChars = Array.from(copy.typedRole ?? "").length;

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={styles.hero}
      data-pin={canPin ? "true" : "false"}
      aria-labelledby="hero-title"
    >
      <div className={styles.stage}>
        <div className={styles.visual} data-ready={sceneReady || sceneState === "fallback"}>
          {sceneState === "webgl" ? (
            <SceneBoundary fallback={<HeroFallback />}>
              <Suspense fallback={null}>
                <HeroScene
                  modules={heroModules}
                  theme={theme}
                  dir={dir}
                  compact={compact}
                  reducedMotion={reducedMotion}
                  active={active}
                  progressRef={progressRef}
                  pointerRef={pointerRef}
                  onReady={onSceneReady}
                />
              </Suspense>
            </SceneBoundary>
          ) : null}
          {sceneState === "fallback" ? <HeroFallback /> : null}
        </div>

        <div className={styles.copyLayer}>
          <div className={`container ${styles.copyInner}`}>
            <div className={styles.copy}>
              <p className={styles.boot} dir="ltr">
                <span aria-hidden="true">$</span> ./boot-nizar-portfolio
              </p>

              <p className={styles.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                {copy.status}
              </p>

              <h1 className={styles.name} id="hero-title">
                <span className={styles.nameLine}>{firstName}</span>{" "}
                <span className={styles.nameLine}>
                  {lastName}
                  <span className={styles.caret} aria-hidden="true" />
                </span>
              </h1>

              <p className={styles.role}>
                <span className={styles.prompt} aria-hidden="true">
                  &gt;
                </span>
                <span className={styles.typed} style={{ "--chars": roleChars }}>
                  {copy.typedRole}
                </span>
              </p>

              <p className={styles.description}>{copy.description}</p>

              <div className={styles.actions}>
                <a className="btn btn-primary" href="#projects">
                  <SquareTerminal size={18} aria-hidden="true" />
                  <span>{copy.primaryAction}</span>
                </a>
                <a className="btn btn-ghost" href="#contact">
                  <Mail size={18} aria-hidden="true" />
                  <span>{copy.secondaryAction}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.beatLayer}>
          <div className={`container ${styles.beat}`}>
            <p className={styles.beatEyebrow}>{copy.eyebrow}</p>
            <p className={styles.beatTitle}>{copy.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
