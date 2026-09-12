"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import ModuleCards from "./ModuleCards";
import NeuralCore from "./NeuralCore";
import { COMPACT_IDS } from "./choreography";
import { waitForSceneFonts } from "./cardTexture";
import { scenePalette } from "./palette";

/*
 * Camera + group rig. Reads the hero's scroll progress and pointer position
 * from refs (never React state), so scrolling costs one rAF update, not a
 * render.
 */
function Rig({ children, progressRef, pointerRef, compact, dir, reducedMotion }) {
  const group = useRef(null);
  const smoothed = useRef({ p: progressRef.current, x: 0, y: 0 });
  const { viewport, camera, size } = useThree();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = 1 - Math.exp(-dt * 5);
    const s = smoothed.current;
    s.p += (progressRef.current - s.p) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 16));
    s.x += ((pointerRef.current?.x ?? 0) - s.x) * k;
    s.y += ((pointerRef.current?.y ?? 0) - s.y) * k;

    const p = s.p;
    const aspect = size.width / Math.max(1, size.height);

    // Wide screens: the system sits in the free half beside the copy, then
    // drifts toward centre as the copy leaves and the view explodes.
    const side = dir === "rtl" ? -1 : 1;
    const baseX = compact ? 0 : side * viewport.width * (aspect > 1.9 ? 0.26 : 0.24);
    const scale = compact
      ? Math.min(1.45, viewport.width / 3.35, viewport.height / 3.9)
      : Math.min(0.95, Math.max(0.6, Math.min(viewport.height / 6.2, viewport.width / 10)));

    if (group.current) {
      // Centre the system while the copy leaves (done by p = 0.6).
      const centre = Math.min(1, p / 0.6);
      group.current.position.x = baseX * (1 - centre * centre * (3 - 2 * centre));
      group.current.position.y = compact ? 0 : -0.1 + p * 0.1;
      group.current.scale.setScalar(scale);
      group.current.rotation.y =
        s.x * 0.2 * (1 - p * 0.5) +
        (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.2) * 0.035) -
        side * 0.12 * (1 - p);
      group.current.rotation.x = -s.y * 0.1 + 0.04 * (1 - p);
    }

    camera.position.z = 8.4 - p * 0.45;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);
  });

  return <group ref={group}>{children}</group>;
}

function ReadySignal({ onReady }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    requestAnimationFrame(() => onReady?.());
  });
  return null;
}

export default function HeroScene({
  modules,
  theme,
  dir,
  compact,
  reducedMotion,
  active,
  progressRef,
  pointerRef,
  onReady
}) {
  const palette = scenePalette[theme === "dark" ? "dark" : "light"];
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    waitForSceneFonts().then(() => !cancelled && setFontsReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleModules = useMemo(
    () => (compact ? modules.filter((module) => COMPACT_IDS.includes(module.id)) : modules),
    [compact, modules]
  );

  return (
    <Canvas
      camera={{ position: [0, 0, 8.4], fov: 34, near: 0.1, far: 40 }}
      dpr={[1, compact ? 1.5 : 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={reducedMotion ? "demand" : active ? "always" : "never"}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <fog attach="fog" args={[palette.ground, 7.6, 15]} />
      <ambientLight intensity={theme === "dark" ? 0.55 : 0.95} />
      <directionalLight position={[3.5, 5, 6]} intensity={theme === "dark" ? 1.1 : 1.35} />
      <directionalLight position={[-5, -2, 2]} intensity={0.35} color={palette.nodeB} />

      <Rig
        progressRef={progressRef}
        pointerRef={pointerRef}
        compact={compact}
        dir={dir}
        reducedMotion={reducedMotion}
      >
        <NeuralCore
          palette={palette}
          compact={compact}
          reducedMotion={reducedMotion}
          progressRef={progressRef}
        />
        <ModuleCards
          modules={visibleModules}
          palette={palette}
          compact={compact}
          reducedMotion={reducedMotion}
          progressRef={progressRef}
          fontsReady={fontsReady}
        />
      </Rig>

      {fontsReady ? <ReadySignal onReady={onReady} /> : null}
    </Canvas>
  );
}
