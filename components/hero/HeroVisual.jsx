"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import NebulaPoster from "./NebulaPoster";
import styles from "./HeroVisual.module.css";

/* The r3f bundle is fetched only once every gate below has passed and the
   hero is actually on screen, so a phone that will fall back to the poster
   never downloads three.js at all. */
const SkillNebula = dynamic(() => import("./SkillNebula"), {
  ssr: false,
  loading: () => <NebulaPoster words={[]} />
});

const MIN_WIDTH = 768;

function canRunLiveVisual() {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  if (window.innerWidth < MIN_WIDTH) return false;

  const connection =
    navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;
  if (connection?.saveData) return false;
  if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory < 4) {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function readThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    colorLow: style.getPropertyValue("--accent-bright").trim() || "#0ea5a4",
    /* Second tone of the same accent family for depth. Amber (--signal) was
       retired from decoration - it is reserved for the availability state. */
    colorHigh: style.getPropertyValue("--accent").trim() || "#0a6b69",
    /* Word sprites must stay legible against the page itself, not the
       canvas backdrop - the ink token flips with the theme. */
    wordInk: style.getPropertyValue("--ink").trim() || "#13191b"
  };
}

export default function HeroVisual({ label, words }) {
  const hostRef = useRef(null);
  const [live, setLive] = useState(false);
  const [inView, setInView] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [colors, setColors] = useState(null);
  /* The host is display:none below 768px, so rendering the poster there put
     312 invisible SVG nodes in the DOM - and in the served HTML - for nothing.
     It mounts only once we know the viewport is wide enough to show it. */
  const [wideEnough, setWideEnough] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const sync = () => setWideEnough(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!canRunLiveVisual()) return undefined;

    setLive(true);
    setColors(readThemeColors());

    // Re-read the palette when the theme toggle flips `data-theme`.
    const themeObserver = new MutationObserver(() => setColors(readThemeColors()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    // A visitor who turns reduced motion on mid-session gets the poster back.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event) => setLive(!event.matches);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    const node = hostRef.current;
    if (!node || !live) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setHasEntered(true);
      },
      { threshold: 0.01 }
    );
    observer.observe(node);

    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [live]);

  /* Once the canvas has been created it stays mounted and is paused with
     frameloop instead of being torn down. Unmounting would destroy and
     recreate the WebGL context on every scroll past the hero, which is far
     more expensive than leaving an idle context in place. */
  const running = live && inView && pageVisible;

  return (
    <div
      className={styles.host}
      ref={hostRef}
      aria-hidden="true"
      role="presentation"
      data-label={label}
    >
      {live && colors && hasEntered ? (
        <Suspense fallback={wideEnough ? <NebulaPoster words={words} /> : null}>
          <SkillNebula
            words={words}
            colorLow={colors.colorLow}
            colorHigh={colors.colorHigh}
            wordInk={colors.wordInk}
            frameloop={running ? "always" : "never"}
          />
        </Suspense>
      ) : null}

      {(!live || !hasEntered) && wideEnough ? <NebulaPoster words={words} /> : null}
    </div>
  );
}
