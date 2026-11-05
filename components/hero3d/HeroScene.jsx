"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import ModuleCards from "./ModuleCards";
import GlassLaptop from "./GlassLaptop";
import { smoothRange } from "./laptopGeometry";
import { waitForSceneFonts } from "./cardTexture";
import { scenePalette } from "./palette";

/*
 * Camera + group rig. Reads the hero's scroll progress and pointer position
 * from refs (never React state), so scrolling costs one rAF update, not a
 * render.
 */
function Rig({ children, progressRef, pointerRef, compact, dir, reducedMotion }) {
  const group = useRef(null);
  const smoothed = useRef({ x: 0, y: 0 });
  const { viewport, camera, size } = useThree();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = 1 - Math.exp(-dt * 5);
    const s = smoothed.current;
    s.x = reducedMotion ? 0 : s.x + ((pointerRef.current?.x ?? 0) - s.x) * k;
    s.y = reducedMotion ? 0 : s.y + ((pointerRef.current?.y ?? 0) - s.y) * k;

    const p = progressRef.current;
    const aspect = size.width / Math.max(1, size.height);

    // Wide screens: the system sits in the free half beside the copy, then
    // drifts toward centre as the copy leaves and the glass layers separate.
    const side = dir === "rtl" ? -1 : 1;
    const baseX = compact ? 0 : side * viewport.width * (aspect > 1.9 ? 0.25 : 0.235);
    const scale = compact
      ? Math.min(viewport.width / 5.25, viewport.height / 5.5)
      : Math.min(1.05, viewport.height / 5.6, viewport.width / 13.6);
    // Reserve real vertical space for the header and caption, including on
    // wide, short laptops. A width-only scale clips the terminal at 640px tall.
    const finalScale = compact ? scale : Math.min(
      scale * 1.2,
      viewport.height * 0.46 / 3.15
    );

    if (group.current) {
      // Centre the system after the copy leaves.
      const centre = smoothRange(p, 0.16, 0.67);
      group.current.position.x = baseX * (1 - centre);
      const rise = smoothRange(p, 0.58, 0.89);
      group.current.position.y = compact ? 0.1 : 0.05 + rise * viewport.height * 0.095;
      group.current.scale.setScalar(scale + (finalScale - scale) * centre);
      group.current.rotation.y =
        s.x * 0.045 * (1 - p * 0.5) +
        (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.2) * 0.006) * (1 - p);
      group.current.rotation.x = -s.y * 0.025;
    }

    camera.position.z = 8.4 - smoothRange(p, 0.1, 0.85) * 0.2;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);
  });

  return <group ref={group}>{children}</group>;
}

function ReadySignal({ onReady }) {
  const fired = useRef(false);
  const frames = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  useFrame(() => {
    if (fired.current) return;
    // useFrame runs before rendering. Keep the fallback through the first
    // draw so shader compilation and texture upload finish before reveal.
    if (++frames.current < 2) {
      invalidate();
      return;
    }
    fired.current = true;
    onReady?.();
  });
  return null;
}

function Reflections() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    const previous = scene.environment;
    scene.environment = target.texture;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      target.dispose();
    };
  }, [gl, scene]);
  return null;
}

function ContextGuard({ onUnavailable }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event) => {
      event.preventDefault();
      onUnavailable?.();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, [gl, onUnavailable]);
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
  onReady,
  onUnavailable
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

  return (
    <Canvas
      camera={{ position: [0, 0, 8.4], fov: 34, near: 0.1, far: 40 }}
      dpr={[1, compact ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={reducedMotion ? "demand" : active ? "always" : "never"}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <Reflections />
      <ContextGuard onUnavailable={onUnavailable} />
      <ambientLight intensity={theme === "dark" ? 0.45 : 0.6} />
      <directionalLight position={[-3, 5, 5]} intensity={2.1} color="#e9f5ff" />
      <directionalLight position={[4, 1, -3]} intensity={1.1} color="#9cdbdf" />
      <directionalLight position={[2, -2, 5]} intensity={0.35} color="#b9d6eb" />

      <Rig
        progressRef={progressRef}
        pointerRef={pointerRef}
        compact={compact}
        dir={dir}
        reducedMotion={reducedMotion}
      >
        <GlassLaptop
          palette={palette}
          compact={compact}
          reducedMotion={reducedMotion}
          progressRef={progressRef}
          fontsReady={fontsReady}
        />
        <ModuleCards
          modules={modules}
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
