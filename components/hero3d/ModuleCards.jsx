"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Shape,
  ShapeGeometry,
  Vector3
} from "three";
import { drawModuleCard } from "./cardTexture";
import { CARD_SIZE, TERMINAL_SIZE, cardProgress, getLayout } from "./choreography";

function roundedShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function buildCardGeometry([width, height]) {
  const radius = 0.09;
  const depth = 0.05;
  const shape = roundedShape(width, height, radius);

  const body = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 6
  });
  body.translate(0, 0, -depth);

  // Front face with UVs normalised to the card so the canvas maps 1:1.
  const face = new ShapeGeometry(shape, 6);
  const pos = face.attributes.position;
  const uv = [];
  for (let i = 0; i < pos.count; i += 1) {
    uv.push((pos.getX(i) + width / 2) / width, (pos.getY(i) + height / 2) / height);
  }
  face.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  face.translate(0, 0, 0.0135);

  return { body, face };
}

const tmp = new Vector3();
const dir = new Vector3();

export default function ModuleCards({
  modules,
  palette,
  compact,
  reducedMotion,
  progressRef,
  fontsReady,
  coreRadius = 1.05
}) {
  const cardRefs = useRef([]);
  const lineRef = useRef(null);
  const smoothed = useRef(progressRef.current);

  const geometries = useMemo(
    () => ({ card: buildCardGeometry(CARD_SIZE), terminal: buildCardGeometry(TERMINAL_SIZE) }),
    []
  );

  const textures = useMemo(() => {
    if (!fontsReady) return [];
    return modules.map((module, index) =>
      drawModuleCard(
        module,
        module.kind === "terminal" ? TERMINAL_SIZE : CARD_SIZE,
        palette,
        index
      )
    );
  }, [modules, palette, fontsReady]);

  const lineGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(modules.length * 6), 3)
    );
    return geometry;
  }, [modules.length]);

  useEffect(() => () => textures.forEach((texture) => texture.dispose()), [textures]);
  useEffect(
    () => () => {
      Object.values(geometries).forEach(({ body, face }) => {
        body.dispose();
        face.dispose();
      });
      lineGeometry.dispose();
    },
    [geometries, lineGeometry]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    // The hand drives the target; the scene glides toward it (no stutter from
    // uneven wheel events).
    const target = progressRef.current;
    smoothed.current += (target - smoothed.current) * (1 - Math.exp(-dt * 16));
    const p = reducedMotion ? target : smoothed.current;
    const time = state.clock.elapsedTime;
    const positions = lineGeometry.attributes.position;

    modules.forEach((module, index) => {
      const card = cardRefs.current[index];
      if (!card) return;
      const layout = getLayout(module.id, compact);
      const e = cardProgress(p, index);
      const floatAmount = reducedMotion ? 0 : 0.055 * (1 - e * 0.6);
      const phase = index * 1.37;

      card.position.set(
        layout.a[0] + (layout.b[0] - layout.a[0]) * e,
        layout.a[1] + (layout.b[1] - layout.a[1]) * e + Math.sin(time * 0.75 + phase) * floatAmount,
        layout.a[2] + (layout.b[2] - layout.a[2]) * e
      );
      card.rotation.set(
        layout.ra[0] + (layout.rb[0] - layout.ra[0]) * e + Math.sin(time * 0.5 + phase) * floatAmount * 0.35,
        layout.ra[1] + (layout.rb[1] - layout.ra[1]) * e,
        layout.ra[2] + (layout.rb[2] - layout.ra[2]) * e
      );

      // Leader line: from the core surface toward the card.
      dir.copy(card.position).normalize();
      tmp.copy(dir).multiplyScalar(coreRadius * 1.02);
      positions.setXYZ(index * 2, tmp.x, tmp.y, tmp.z);
      positions.setXYZ(index * 2 + 1, card.position.x, card.position.y, card.position.z - 0.03);
    });

    positions.needsUpdate = true;
    if (lineRef.current) {
      lineRef.current.computeLineDistances();
      lineRef.current.material.opacity = Math.min(1, Math.max(0, (p - 0.08) / 0.5)) * 0.7;
    }
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineDashedMaterial
          color={palette.line}
          dashSize={0.07}
          gapSize={0.055}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>

      {modules.map((module, index) => {
        const geometry = module.kind === "terminal" ? geometries.terminal : geometries.card;
        return (
          <group key={module.id} ref={(node) => (cardRefs.current[index] = node)}>
            <mesh geometry={geometry.body}>
              <meshStandardMaterial color={palette.body} roughness={0.62} metalness={0.02} />
            </mesh>
            {textures[index] ? (
              <mesh geometry={geometry.face}>
                <meshBasicMaterial map={textures[index]} toneMapped={false} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
