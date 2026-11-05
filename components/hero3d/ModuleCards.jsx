"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  CanvasTexture,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Shape,
  ShapeGeometry
} from "three";
import { drawModuleCard } from "./cardTexture";
import { CARD_SIZE, TERMINAL_SIZE, cardProgress, getLayout } from "./choreography";
import { smoothRange } from "./laptopGeometry";

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
  const radius = 0.12;
  const depth = 0.022;
  const shape = roundedShape(width, height, radius);

  const body = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
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

const SEGMENTS = 20;

function cardShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.shadowColor = "rgba(13, 65, 78, 0.3)";
  ctx.shadowBlur = 23;
  ctx.shadowOffsetY = 9;
  ctx.fillStyle = "#163c4d";
  ctx.beginPath();
  ctx.roundRect(42, 32, 172, 64, 12);
  ctx.fill();
  return new CanvasTexture(canvas);
}

export default function ModuleCards({
  modules,
  palette,
  compact,
  reducedMotion,
  progressRef,
  fontsReady
}) {
  const cardRefs = useRef([]);
  const lineRef = useRef(null);
  const shadow = useMemo(cardShadow, []);

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
        index,
        compact
      )
    );
  }, [modules, palette, fontsReady, compact]);

  const lineGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(modules.length * SEGMENTS * 6), 3)
    );
    return geometry;
  }, [modules.length]);

  useEffect(() => () => textures.forEach((texture) => texture.dispose()), [textures]);
  useEffect(() => () => shadow.dispose(), [shadow]);
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

  useFrame((state) => {
    const p = progressRef.current;
    const time = state.clock.elapsedTime;
    const positions = lineGeometry.attributes.position;

    modules.forEach((module, index) => {
      const card = cardRefs.current[index];
      if (!card) return;
      const layout = getLayout(module.id, compact);
      const e = cardProgress(p, index);
      const floatAmount = reducedMotion ? 0 : 0.018 * (1 - e);
      const phase = index * 1.37;

      card.position.set(
        layout.a[0] + (layout.b[0] - layout.a[0]) * e,
        layout.a[1] + (layout.b[1] - layout.a[1]) * e + Math.sin(time * 0.75 + phase) * floatAmount,
        layout.a[2] + (layout.b[2] - layout.a[2]) * e
      );
      card.rotation.set(
        Math.sin(time * 0.5 + phase) * floatAmount * 0.25,
        (index % 2 ? -1 : 1) * 0.055 * (1 - e),
        0
      );
      if (module.kind === "terminal") {
        const alpha = smoothRange(p, 0.52, 0.82);
        card.visible = alpha > 0.002;
        card.children.forEach((mesh) => {
          const material = mesh.material;
          material.userData.restOpacity ??= material.opacity;
          material.opacity = material.userData.restOpacity * alpha;
        });
      }

      // Quiet curved connections, behind the hardware and card faces.
      const terminalHidden = module.kind === "terminal" && p < 0.52;
      const side = card.position.x < 0 ? -1 : 1;
      const startX = side * 0.46;
      const startY = 0.12;
      const endX = card.position.x - side * (CARD_SIZE[0] / 2 + 0.015);
      const endY = card.position.y;
      const controlX = startX + (endX - startX) * 0.5;
      const controlY = endY;
      for (let segment = 0; segment < SEGMENTS; segment++) {
        for (let end = 0; end < 2; end++) {
          const t = (segment + end) / SEGMENTS;
          const inv = 1 - t;
          positions.setXYZ((index * SEGMENTS + segment) * 2 + end,
            terminalHidden ? 0 : inv * inv * startX + 2 * inv * t * controlX + t * t * endX,
            terminalHidden ? 0 : inv * inv * startY + 2 * inv * t * controlY + t * t * endY,
            -0.2
          );
        }
      }
    });

    positions.needsUpdate = true;
    if (lineRef.current) {
      lineRef.current.material.opacity = smoothRange(p, 0.18, 0.75) * 0.23;
    }
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={palette.line}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>

      {modules.map((module, index) => {
        const geometry = module.kind === "terminal" ? geometries.terminal : geometries.card;
        return (
          <group key={module.id} ref={(node) => { cardRefs.current[index] = node; }}>
            <mesh position={[0, -0.035, -0.08]} renderOrder={4}>
              <planeGeometry args={[CARD_SIZE[0] * 1.4, CARD_SIZE[1] * 1.7]} />
              <meshBasicMaterial map={shadow} transparent opacity={0.14} depthTest={false} depthWrite={false} />
            </mesh>
            <mesh geometry={geometry.body} renderOrder={5}>
              <meshStandardMaterial color={palette.body} metalness={0.12} roughness={0.32}
                transparent opacity={0.22} depthTest={false} depthWrite={false} />
            </mesh>
            {textures[index] ? (
              <mesh geometry={geometry.face} renderOrder={6}>
                <meshBasicMaterial map={textures[index]} toneMapped={false} transparent depthTest={false} depthWrite={false} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
