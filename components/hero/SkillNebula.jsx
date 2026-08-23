"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  SRGBColorSpace,
  ShaderMaterial
} from "three";

/* ── The idea ───────────────────────────────────────────────────────────────
   The right side of the hero is not a picture of skills - it is built out of
   them. Real skill names become billboarded sprites orbiting a common centre
   on three differently inclined rings, embedded in a GPU dust disc and tied
   together by faint connection lines. The composition reads as a system with
   structure (rings), relations (lines) and depth (tilt + dust) rather than a
   flat tag cloud.

   Cost profile mirrors the field it replaces: geometry and textures are built
   once, nothing allocates inside the render loop, and the frameloop prop lets
   the parent stop the clock entirely when the tab or section is idle.
   ────────────────────────────────────────────────────────────────────────── */

const FONT_STACK =
  '"JetBrains Mono", "JetBrains Mono Metric Fallback", ui-monospace, monospace';

/* Three rings, three different inclinations - the tilts are what make the
   cloud feel spatial instead of like a wheel facing the viewer. Radii spread
   wide enough that neighbouring words never overlap at the front of an orbit. */
const RINGS = [
  { radius: 0.92, tilt: [-0.52, 0.16], speed: 0.14, dir: 1 },
  { radius: 1.5, tilt: [0.24, -0.38], speed: 0.1, dir: -1 },
  { radius: 2.05, tilt: [-0.06, 0.42], speed: 0.07, dir: 1 }
];

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    const t = Math.imul(s ^ (s >>> 15), 1 | s);
    return ((t ^ (t >>> 13)) >>> 0) / 4294967296;
  };
}

function makeWordTexture(word, ink) {
  const fontSize = 44;
  const pad = 30;
  const measurer = document.createElement("canvas").getContext("2d");
  measurer.font = `500 ${fontSize}px ${FONT_STACK}`;
  const textWidth = Math.ceil(measurer.measureText(word).width);

  const canvas = document.createElement("canvas");
  canvas.width = textWidth + pad * 2;
  canvas.height = fontSize + pad * 2;

  const ctx = canvas.getContext("2d");
  ctx.font = `500 ${fontSize}px ${FONT_STACK}`;
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(53, 214, 198, 0.9)";
  ctx.shadowBlur = 18;
  /* The fill follows the theme's --ink so words read on light and dark
     paper alike; the teal glow stays as the connective tissue. */
  ctx.fillStyle = ink;
  ctx.fillText(word, pad, canvas.height / 2);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { texture, aspect: canvas.width / canvas.height };
}

function makeGlowTexture(colorLow, colorHigh) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(240, 255, 253, 0.85)");
  gradient.addColorStop(0.3, colorHigh);
  gradient.addColorStop(0.6, colorLow);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const dustVertex = /* glsl */ `
  uniform float uTime;
  attribute float aScale;
  attribute float aMix;
  varying float vMix;

  void main() {
    vMix = aMix;
    vec3 p = position;
    p.y += sin(uTime * 0.45 + p.x * 2.3 + p.z * 1.9) * 0.045;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (1.1 + aScale * 2.2) * (10.0 / -mvPosition.z);
  }
`;

const dustFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  varying float vMix;

  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float dist = dot(d, d);
    if (dist > 0.25) discard;

    float fade = smoothstep(0.25, 0.02, dist);
    vec3 color = mix(uColorA, uColorB, vMix);
    gl_FragColor = vec4(color, fade * uOpacity * (0.35 + vMix * 0.65));
  }
`;

/* Points are built once at the maximum count; narrower canvases draw fewer of
   them via drawRange instead of rebuilding the geometry on resize. */
const DUST_MAX = 1400;

function buildDustGeometry() {
  const rand = seeded(4711);
  const positions = new Float32Array(DUST_MAX * 3);
  const scales = new Float32Array(DUST_MAX);
  const mixes = new Float32Array(DUST_MAX);

  for (let i = 0; i < DUST_MAX; i += 1) {
    /* Uniform density across the disc (sqrt), thin gaussian height, plus a
       denser central bulge every fifth point. */
    const bulge = i % 5 === 0;
    const radius = bulge ? rand() * 0.5 : 0.45 + Math.sqrt(rand()) * 1.85;
    const angle = rand() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] =
      (rand() + rand() + rand() - 1.5) * (bulge ? 0.22 : 0.09);
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    scales[i] = rand();
    mixes[i] = radius > 1.5 ? rand() : rand() * 0.25;
  }

  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.setAttribute("aScale", new BufferAttribute(scales, 1));
  geo.setAttribute("aMix", new BufferAttribute(mixes, 1));
  return geo;
}

function Dust({ colorA, colorB }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new Color(colorA) },
          uColorB: { value: new Color(colorB) },
          uOpacity: { value: 0.75 }
        }
      }),
    [colorA, colorB]
  );

  const geometry = useMemo(buildDustGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const ref = useRef(null);
  const { size } = useThree();

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y += delta * 0.045;
  });

  return (
    <points
      ref={ref}
      geometry={geometry}
      material={material}
      /* Recreated points draw fewer particles rather than rebuilding. */
      onUpdate={(self) => self.geometry.setDrawRange(0, size.width < 520 ? 750 : DUST_MAX)}
    />
  );
}

function WordRings({ words, lineColor, wordInk }) {
  const { viewport } = useThree();

  const layout = useMemo(() => {
    const rand = seeded(9001);
    const items = words.map((word, i) => ({
      word,
      ring: i % RINGS.length,
      phase: rand() * Math.PI * 2,
      wobble: 0.94 + rand() * 0.12,
      yOff: (rand() - 0.5) * 0.3,
      breath: 0.5 + rand() * 0.8,
      /* The curated core stack arrives first and reads largest; everything
         after steps down gently, and inner rings sit slightly bolder. */
      base: (i < 8 ? 0.26 : i < 16 ? 0.22 : 0.185) * (1 - (i % RINGS.length) * 0.05)
    }));

    const textures = new Map();
    items.forEach((item) => {
      if (!textures.has(item.word)) {
        textures.set(item.word, makeWordTexture(item.word, wordInk));
      }
    });

    const rings = RING_LAYOUTS(items);
    const lineGeometries = rings.map(({ members }) => {
      const geo = new BufferGeometry();
      geo.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(Math.max(members.length, 2) * 6), 3)
      );
      geo.setDrawRange(0, 0);
      return geo;
    });

    return { items, textures, rings, lineGeometries };
  }, [words, wordInk]);

  useEffect(
    () => () => {
      layout.textures.forEach((entry) => entry.texture.dispose());
      layout.lineGeometries.forEach((geo) => geo.dispose());
    },
    [layout]
  );

  const memberRefs = useRef(layout.rings.map(({ members }) => members.map(() => null)));

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    RINGS.forEach((ring, ringIndex) => {
      const members = memberRefs.current[ringIndex];
      const spec = layout.rings[ringIndex];

      members.forEach((sprite, i) => {
        if (!sprite) return;
        const item = spec.members[i];
        const angle = item.phase + t * ring.speed * ring.dir;
        sprite.position.set(
          Math.cos(angle) * ring.radius * item.wobble,
          item.yOff,
          Math.sin(angle) * ring.radius * item.wobble
        );
        const pulse = 1 + Math.sin(t * item.breath + item.phase) * 0.07;
        const entry = layout.textures.get(item.word);
        sprite.scale.set(entry.aspect * item.base * pulse, item.base * pulse, 1);
      });

      /* Refresh the ring's connection lines from the freshly computed
         positions - a few dozen floats per frame, no allocation. */
      const geo = layout.lineGeometries[ringIndex];
      const attr = geo.getAttribute("position");
      const n = members.length;
      for (let i = 0; i < n; i += 1) {
        const a = members[i]?.position;
        const b = members[(i + 1) % n]?.position;
        if (!a || !b) continue;
        const o = i * 6;
        attr.array[o] = a.x;
        attr.array[o + 1] = a.y;
        attr.array[o + 2] = a.z;
        attr.array[o + 3] = b.x;
        attr.array[o + 4] = b.y;
        attr.array[o + 5] = b.z;
      }
      attr.needsUpdate = true;
      geo.setDrawRange(0, Math.max(n, 2) * 2);
    });
  });

  /* Fit the whole system into whatever slice of the hero the canvas covers,
     with margin for the widest orbiting word. */
  const fit = Math.min(1, viewport.width / 5.0);

  return (
    <group scale={[fit, fit, fit]}>
      {layout.rings.map((spec, ringIndex) => (
        <group key={ringIndex} rotation={[RINGS[ringIndex].tilt[0], 0, RINGS[ringIndex].tilt[1]]}>
          <lineSegments geometry={layout.lineGeometries[ringIndex]}>
            <lineBasicMaterial
              color={lineColor}
              transparent
              opacity={0.13}
              depthWrite={false}
            />
          </lineSegments>

          {spec.members.map((item, positionIndex) => (
            <sprite
              key={`${item.word}-${positionIndex}`}
              ref={(node) => {
                memberRefs.current[ringIndex][positionIndex] = node;
              }}
            >
              <spriteMaterial
                map={layout.textures.get(item.word).texture}
                transparent
                depthWrite={false}
                opacity={0.95}
              />
            </sprite>
          ))}
        </group>
      ))}
    </group>
  );
}

/* Group the flat item list into per-ring member lists once, so the render
   loop never filters anything. */
function RING_LAYOUTS(items) {
  return RINGS.map((_, ringIndex) => ({
    members: items.filter((item) => item.ring === ringIndex)
  }));
}

function Core({ colorLow, colorHigh }) {
  const ref = useRef(null);
  const texture = useMemo(
    () => makeGlowTexture(colorLow, colorHigh),
    [colorLow, colorHigh]
  );
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
    if (ref.current) ref.current.scale.set(1.15 * pulse, 1.15 * pulse, 1);
  });

  return (
    <sprite ref={ref} scale={[1.15, 1.15, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        opacity={0.5}
      />
    </sprite>
  );
}

function Nebula({ words, colorLow, colorHigh, wordInk }) {
  const parallax = useRef(null);
  const px = useRef(0);
  const py = useRef(0);

  useFrame((state, delta) => {
    const lerp = Math.min(1, delta * 2.6);
    px.current += (state.pointer.x - px.current) * lerp;
    py.current += (state.pointer.y - py.current) * lerp;
    if (!parallax.current) return;
    parallax.current.rotation.y =
      state.clock.elapsedTime * 0.05 + px.current * 0.26;
    parallax.current.rotation.x = py.current * 0.13;
    parallax.current.position.y = Math.sin(state.clock.elapsedTime * 0.32) * 0.05;
  });

  return (
    <group ref={parallax}>
      <Core colorLow={colorLow} colorHigh={colorHigh} />
      <Dust colorA={colorLow} colorB={colorHigh} />
      <WordRings words={words} lineColor={colorLow} wordInk={wordInk} />
    </group>
  );
}

export default function SkillNebula({
  words,
  colorLow,
  colorHigh,
  wordInk,
  frameloop = "always"
}) {
  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 1.25]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: false
      }}
      camera={{ position: [0, 0.25, 4.4], fov: 42 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Nebula words={words} colorLow={colorLow} colorHigh={colorHigh} wordInk={wordInk} />
    </Canvas>
  );
}
