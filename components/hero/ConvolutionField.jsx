"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Vector2
} from "three";

/* ── The idea ───────────────────────────────────────────────────────────────
   A lattice of points stands in for an image plane. Every frame the vertex
   shader samples a procedural source field at the point and at four
   neighbours, then applies a 5-tap kernel whose weights interpolate between
   a blur (all taps positive) and an edge detector (centre positive,
   neighbours negative). The point is displaced by the response, so what you
   are looking at is an image plane turning into a feature map - the thing
   AidSign and the Gaza Sky Geeks computer-vision track are actually about.

   Cost: one BufferGeometry, one draw call, one ShaderMaterial. Positions are
   uploaded once and never touched again; per frame we write three uniforms.
   No allocation happens inside the render loop.
   ────────────────────────────────────────────────────────────────────────── */

/* 84 x 48 = 4,032 points. Halving the count from the first pass cost nothing
   visible at the size the field is displayed, and bought back most of the
   frame-rate gap measured under CPU throttling. */
const COLUMNS = 84;
const ROWS = 48;
const SPACING = 0.072;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uKernel;      // 0 = blur, 1 = edge
  uniform float uPointerGain;
  uniform float uPixelRatio;

  attribute vec2 aCell;

  varying float vResponse;

  // Procedural stand-in for the source image: a few summed waves, cheap and
  // smooth enough that the kernel response is meaningful rather than noise.
  float field(vec2 p) {
    float t = uTime * 0.16;
    float a = sin(p.x * 2.7 + t) * cos(p.y * 2.1 - t * 0.8);
    float b = sin((p.x + p.y) * 1.7 - t * 1.3);
    float c = cos(length(p * 1.4) * 3.1 - t * 1.1);
    return (a + b * 0.6 + c * 0.5) / 2.1;
  }

  void main() {
    vec2 p = aCell;
    float step = ${SPACING.toFixed(3)} * 2.2;

    float centre = field(p);
    float up     = field(p + vec2(0.0,  step));
    float down   = field(p + vec2(0.0, -step));
    float left   = field(p + vec2(-step, 0.0));
    float right  = field(p + vec2( step, 0.0));

    // Blur kernel:  [0.2 0.2 0.2 0.2 0.2]
    // Edge kernel:  [ -1 -1  4 -1 -1 ] normalised
    float blur = (centre + up + down + left + right) * 0.2;
    float edge = (centre * 4.0 - up - down - left - right) * 0.25;
    float response = mix(blur, edge, uKernel);

    // The pointer acts as the kernel's focus: response is amplified near it.
    float focus = exp(-dot(p - uPointer, p - uPointer) * 6.0) * uPointerGain;
    response *= 1.0 + focus * 2.2;

    vResponse = response;

    vec3 displaced = vec3(p.x, p.y, response * 0.34);

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize =
      (1.4 + abs(response) * 2.6 + focus * 1.6) * uPixelRatio *
      (10.0 / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uColorLow;
  uniform vec3  uColorHigh;
  uniform float uOpacity;

  varying float vResponse;

  void main() {
    // Round point sprite without a texture.
    vec2 d = gl_PointCoord - vec2(0.5);
    float dist = dot(d, d);
    if (dist > 0.25) discard;

    float edgeFade = smoothstep(0.25, 0.02, dist);
    float energy = clamp(abs(vResponse) * 1.6, 0.0, 1.0);
    vec3 color = mix(uColorLow, uColorHigh, energy);

    gl_FragColor = vec4(color, edgeFade * uOpacity * (0.32 + energy * 0.68));
  }
`;

function Lattice({ colorLow, colorHigh, opacity }) {
  const pointer = useRef(new Vector2(0, 0));
  const target = useRef(new Vector2(0, 0));
  const gain = useRef(0);
  const { size, viewport } = useThree();

  const geometry = useMemo(() => {
    const count = COLUMNS * ROWS;
    const positions = new Float32Array(count * 3);
    const cells = new Float32Array(count * 2);

    let i = 0;
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLUMNS; x += 1) {
        const px = (x - (COLUMNS - 1) / 2) * SPACING;
        const py = (y - (ROWS - 1) / 2) * SPACING;
        positions[i * 3] = px;
        positions[i * 3 + 1] = py;
        positions[i * 3 + 2] = 0;
        cells[i * 2] = px;
        cells[i * 2 + 1] = py;
        i += 1;
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aCell", new BufferAttribute(cells, 2));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new Vector2(0, 0) },
          uKernel: { value: 0 },
          uPointerGain: { value: 0 },
          uPixelRatio: { value: 1 },
          uColorLow: { value: new Color(colorLow) },
          uColorHigh: { value: new Color(colorHigh) },
          uOpacity: { value: opacity }
        }
      }),
    [colorLow, colorHigh, opacity]
  );

  useFrame((state, delta) => {
    const uniforms = material.uniforms;
    uniforms.uTime.value += delta;

    // The pointer arrives in normalised device coords; map it into the same
    // units the lattice is laid out in.
    target.current.set(
      state.pointer.x * viewport.width * 0.5,
      state.pointer.y * viewport.height * 0.5
    );

    // Reused vectors, lerped in place - nothing is allocated here.
    pointer.current.lerp(target.current, Math.min(1, delta * 3.2));
    uniforms.uPointer.value.copy(pointer.current);

    const wantsGain = state.pointer.x !== 0 || state.pointer.y !== 0 ? 1 : 0;
    gain.current += (wantsGain - gain.current) * Math.min(1, delta * 2.4);
    uniforms.uPointerGain.value = gain.current;

    // Kernel drifts blur -> edge -> blur, so the plane keeps resolving into
    // a feature map and dissolving back.
    uniforms.uKernel.value = 0.5 + 0.5 * Math.sin(uniforms.uTime.value * 0.22);
    uniforms.uPixelRatio.value = Math.min(state.viewport.dpr ?? 1, 1.5);
  });

  // Keep the lattice filling the frame on any aspect ratio.
  const scale = useMemo(() => {
    const fitWidth = viewport.width / (COLUMNS * SPACING);
    const fitHeight = viewport.height / (ROWS * SPACING);
    return Math.max(fitWidth, fitHeight) * 1.08;
  }, [viewport.width, viewport.height]);

  return (
    <points
      geometry={geometry}
      material={material}
      scale={[scale, scale, 1]}
      key={`${size.width}x${size.height}`}
    />
  );
}

export default function ConvolutionField({
  colorLow,
  colorHigh,
  opacity = 0.9,
  frameloop = "always"
}) {
  return (
    <Canvas
      frameloop={frameloop}
      /* 1.25 rather than 1.5: this is an out-of-focus decorative field, and
         the extra pixels were pure fill-rate cost. */
      dpr={[1, 1.25]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: false
      }}
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Lattice colorLow={colorLow} colorHigh={colorHigh} opacity={opacity} />
    </Canvas>
  );
}
