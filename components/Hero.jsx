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
    console.warn("Hero 3D disabled:", error);
    this.props.onUnavailable?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function splitName(name) {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return [name, ""];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

export default function Hero({ copy, theme, dir, enable3d = true }) {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const copyRef = useRef(null);

  const canPin = useCanPin();
  const reducedMotion = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 1023px)", false);

  const [sceneState, setSceneState] = useState("pending"); // pending | webgl | fallback
  const [sceneReady, setSceneReady] = useState(false);
  const [active, setActive] = useState(true);
  const pinned = canPin && sceneState !== "fallback";

  const onProgress = useCallback((p) => {
    progressRef.current = p;
    // Faded hero links must not keep intercepting clicks or keyboard focus.
    if (copyRef.current) copyRef.current.inert = pinned && p >= 0.36;
  }, [pinned]);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const onUnavailable = useCallback(() => setSceneState("fallback"), []);

  useScrollProgress(sectionRef, {
    mode: pinned ? "pin" : "exit",
    onChange: onProgress,
    disabled: reducedMotion,
    resetTo: 0
  });

  useEffect(() => {
    // Held back while the intro plays: three.js initialisation would starve
    // the intro's animations of main-thread time.
    if (!enable3d) return;
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
      const supported = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      setSceneState(supported ? "webgl" : "fallback");
    } catch {
      setSceneState("fallback");
    }
  }, [enable3d]);

  // Only render the 3D loop while the hero is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      setActive(!document.hidden && rect.bottom > -80 && rect.top < window.innerHeight + 80);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new IntersectionObserver(schedule, {
      rootMargin: "80px 0px"
    });
    observer.observe(section);
    // Recheck geometry after viewport/direction changes as well: a sticky
    // element can retain a stale intersection entry across those changes.
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      cancelAnimationFrame(frame);
    };
  }, [dir, canPin, compact]);

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
      data-pin={pinned ? "true" : "false"}
      aria-labelledby="hero-title"
    >
      <div className={styles.stage}>
        <div
          className={styles.visual}
          data-cursor="cross"
          data-ready="true"
        >
          {sceneState === "webgl" ? (
            <SceneBoundary fallback={<HeroFallback />} onUnavailable={onUnavailable}>
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
                  onUnavailable={onUnavailable}
                />
              </Suspense>
            </SceneBoundary>
          ) : null}
          {!sceneReady || sceneState === "fallback" ? <HeroFallback /> : null}
        </div>

        <div className={styles.copyLayer} ref={copyRef}>
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
