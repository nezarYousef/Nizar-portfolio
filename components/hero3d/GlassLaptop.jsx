"use client";

import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { BoxGeometry, BufferGeometry, CanvasTexture, Color, Float32BufferAttribute, Matrix4 } from "three";
import { roundedSolid, smoothRange } from "./laptopGeometry";
import { drawKeyboard, drawProcessor, drawScreen } from "./screenTexture";

function fadeGroup(group, alpha) {
  if (!group) return;
  group.visible = alpha > 0.002;
  group.traverse((object) => {
    if (!object.isMesh && !object.isLineSegments) return;
    const material = object.material;
    if (material.userData.restOpacity === undefined) material.userData.restOpacity = material.opacity;
    material.opacity = material.userData.restOpacity * alpha;
  });
}

function Keys({ geometry, palette }) {
  const columns = 13;
  const rows = 5;
  // Initialise on attachment: R3F may reconstruct an instanced mesh when its
  // material changes, without remounting this React component.
  const attach = useCallback((mesh) => {
    if (!mesh) return;
    const matrix = new Matrix4();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        matrix.makeTranslation((col - 6) * 0.26, 0.85 - row * 0.19, -0.12);
        if (row === 4) {
          // One real spacebar, flanked by modifier and arrow keys.
          if ([4, 5, 7, 8].includes(col)) matrix.scale({ x: 0, y: 0, z: 0 });
          else if (col === 6) matrix.scale({ x: 5.4, y: 1, z: 1 });
        }
        mesh.setMatrixAt(row * columns + col, matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, []);
  return (
    <instancedMesh ref={attach} args={[geometry, null, columns * rows]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshPhysicalMaterial color={palette.keys} metalness={0.08} roughness={0.58}
        transparent opacity={1} clearcoat={0.12} envMapIntensity={0.25} />
    </instancedMesh>
  );
}

function ProcessorPins({ geometry }) {
  const attach = useCallback((mesh) => {
    if (!mesh) return;
    const matrix = new Matrix4();
    for (let i = 0; i < 24; i++) {
      matrix.makeTranslation(i < 12 ? -0.5 : 0.5, -0.02, (i % 12 - 5.5) * 0.067);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, []);
  return (
    <instancedMesh ref={attach} args={[geometry, null, 24]}>
      <meshStandardMaterial color="#bdede5" metalness={0.7} roughness={0.25} />
    </instancedMesh>
  );
}

export default function GlassLaptop({ palette, progressRef, reducedMotion, fontsReady }) {
  const root = useRef(null);
  const lid = useRef(null);
  const shell = useRef(null);
  const display = useRef(null);
  const lidDetails = useRef(null);
  const deck = useRef(null);
  const deckPlate = useRef(null);
  const bottom = useRef(null);
  const processor = useRef(null);
  const chassis = useRef(null);
  const circuit = useRef(null);
  const glow = useRef(null);
  const screenRim = useRef(null);
  const geometries = useMemo(() => ({
    base: roundedSolid(4.05, 2.5, 0.06, 0.13),
    lid: roundedSolid(3.97, 2.42, 0.055, 0.1),
    display: roundedSolid(3.73, 2.18, 0.008, 0.055),
    rim: roundedSolid(3.83, 2.29, 0.012, 0.07),
    key: roundedSolid(0.215, 0.142, 0.025, 0.024),
    well: roundedSolid(3.55, 1.08, 0.02, 0.07),
    trackpad: roundedSolid(1.28, 0.54, 0.008, 0.045),
    trackpadInset: roundedSolid(1.24, 0.5, 0.006, 0.035),
    chip: roundedSolid(0.98, 0.98, 0.045, 0.045),
    die: roundedSolid(0.76, 0.76, 0.018, 0.035),
    substrate: roundedSolid(1.18, 1.18, 0.025, 0.055),
    pins: new BoxGeometry(0.08, 0.045, 0.022)
  }), []);
  const texture = useMemo(() => fontsReady ? drawScreen() : null, [fontsReady]);
  const legends = useMemo(() => fontsReady ? drawKeyboard(palette) : null, [fontsReady, palette]);
  const dieTexture = useMemo(() => fontsReady ? drawProcessor() : null, [fontsReady]);
  const colors = useMemo(() => ({ metal: new Color(palette.metal), glass: new Color(palette.glass) }), [palette]);
  const shadow = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    gradient.addColorStop(0, "rgba(26, 72, 82, 0.34)");
    gradient.addColorStop(0.45, "rgba(26, 110, 120, 0.12)");
    gradient.addColorStop(1, "rgba(12, 133, 139, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
  }, []);
  const traces = useMemo(() => {
    const positions = [];
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 7; i++) {
        const z = -0.42 + i * 0.14;
        const x = side * (1.25 + (i % 3) * 0.18);
        positions.push(side * 0.4, -0.25, z + 0.32, x, -0.25, z + 0.32);
        positions.push(x, -0.25, z + 0.32, x, -0.25, -0.82 + i * 0.09);
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);
  useEffect(() => () => traces.dispose(), [traces]);
  useEffect(() => () => texture?.dispose(), [texture]);
  useEffect(() => () => legends?.dispose(), [legends]);
  useEffect(() => () => dieTexture?.dispose(), [dieTexture]);
  useEffect(() => () => shadow.dispose(), [shadow]);

  useFrame((state) => {
    // One progress publisher also drives the rig, cards, and HTML caption.
    const p = progressRef.current;
    const reveal = smoothRange(p, 0.08, 0.32);
    const lift = smoothRange(p, 0.28, 0.67);
    const morph = smoothRange(p, 0.38, 0.86);
    const fold = smoothRange(p, 0.35, 0.85);
    const idle = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.65) * 0.018 * (1 - morph);

    root.current.rotation.set(0.42 + morph * 0.36, -0.5, 0);
    root.current.position.y = -0.29 + morph * 0.19 + idle;
    // Transform about the display centre, so its outline follows a short arc
    // rather than flying upward around a distant hinge pivot.
    lid.current.position.set(0, 0.96 + lift * 0.1 + fold * 0.54, -1.293 * (1 - fold));
    lid.current.rotation.x = -0.18 - fold * (Math.PI / 2 - 0.18);
    lid.current.scale.set(1 - fold * 0.65, 1 - fold * 0.65, 1);
    shell.current.opacity = 0.98 - morph * 0.57;
    shell.current.color.lerpColors(colors.metal, colors.glass, morph);
    shell.current.metalness = 0.65 - morph * 0.4;
    display.current.material.opacity = 1 - smoothRange(p, 0.44, 0.79);
    display.current.visible = display.current.material.opacity > 0.002;
    fadeGroup(screenRim.current, 1 - smoothRange(p, 0.5, 0.83));
    fadeGroup(lidDetails.current, 1 - smoothRange(p, 0.44, 0.79));
    fadeGroup(deck.current, 1 - smoothRange(p, 0.34, 0.76));
    bottom.current.scale.set(1 - morph * 0.53, 1 - morph * 0.39, 1);
    bottom.current.position.y = -0.30 - lift * 0.28;
    chassis.current.opacity = 0.74 - reveal * 0.22;
    deckPlate.current.scale.set(1 - morph * 0.57, 1 - morph * 0.47, 1);
    deckPlate.current.position.y = -0.2 + lift * 0.06;
    deckPlate.current.material.opacity = 0.42 - reveal * 0.18 + morph * 0.17;
    processor.current.position.y = -0.265 + lift * 0.625;
    processor.current.position.z = 0.3 * (1 - morph);
    processor.current.scale.setScalar(0.66 + morph * 0.42);
    circuit.current.material.opacity = (0.16 + reveal * 0.2) * (1 - morph);
    glow.current.emissiveIntensity = 0.04 + reveal * 0.08;
  });

  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]}>
        <planeGeometry args={[5.5, 3.8]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} opacity={0.8} />
      </mesh>
      <mesh ref={bottom} geometry={geometries.base} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <meshPhysicalMaterial ref={chassis} color={palette.glass} metalness={0.22} roughness={0.25}
          transparent opacity={0.74} depthWrite={false} clearcoat={0.65} envMapIntensity={palette.reflection} />
      </mesh>

      <mesh ref={deckPlate} geometry={geometries.base} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <meshPhysicalMaterial color={palette.glass} metalness={0.1} roughness={0.25}
          transparent opacity={0.42} depthWrite={false} clearcoat={0.65} envMapIntensity={palette.reflection} />
      </mesh>

      <group ref={deck}>
        <mesh geometry={geometries.well} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -0.47]}>
          <meshStandardMaterial color={palette.keyWell} roughness={0.42} metalness={0.3} transparent />
        </mesh>
        <Keys geometry={geometries.key} palette={palette} />
        {legends ? <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.089, -0.47]}>
          <planeGeometry args={[3.38, 0.95]} />
          <meshBasicMaterial map={legends} transparent depthWrite={false} toneMapped={false} />
        </mesh> : null}
        <mesh geometry={geometries.trackpad} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0.9]}>
          <meshPhysicalMaterial color={palette.metal} metalness={0.55} roughness={0.3} transparent opacity={0.9} />
        </mesh>
        <mesh geometry={geometries.trackpadInset} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.104, 0.9]}>
          <meshPhysicalMaterial color={palette.glass} metalness={0.1} roughness={0.38} transparent opacity={0.85} clearcoat={0.3} />
        </mesh>
        {[-1.27, 1.27].map((x) => (
          <mesh key={x} position={[x, -0.21, -1.12]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.052, 0.052, 0.68, 20]} />
            <meshStandardMaterial color={palette.metal} metalness={0.9} roughness={0.18} transparent />
          </mesh>
        ))}
        <mesh position={[0, -0.285, 1.255]}>
          <boxGeometry args={[0.48, 0.028, 0.015]} />
          <meshStandardMaterial color={palette.bezel} metalness={0.55} roughness={0.3} transparent />
        </mesh>
      </group>

      <group ref={lid} position={[0, 0.988, -1.293]} rotation={[-0.14, 0, 0]}>
        <mesh geometry={geometries.lid}>
          <meshPhysicalMaterial ref={shell} color={palette.metal} metalness={0.65} roughness={0.2}
            transparent opacity={0.96} depthWrite={false} clearcoat={0.65} envMapIntensity={palette.reflection} />
        </mesh>
        <group ref={screenRim}>
          <mesh geometry={geometries.rim} position={[0, 0, 0.052]}>
            <meshStandardMaterial color={palette.bezel} metalness={0.48} roughness={0.23} transparent />
          </mesh>
        </group>
        <mesh ref={display} geometry={geometries.display} position={[0, 0, 0.077]}>
          <meshBasicMaterial map={texture} color={texture ? "white" : "#163c43"} transparent toneMapped={false} />
        </mesh>
        <group ref={lidDetails}>
          <mesh position={[0, 1.15, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.008, 12]} />
            <meshBasicMaterial color="#143c42" transparent />
          </mesh>
          <mesh position={[0.05, 1.15, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.008, 8]} />
            <meshBasicMaterial color="#84d8c9" transparent />
          </mesh>
        </group>
      </group>

      <lineSegments ref={circuit} geometry={traces}>
        <lineBasicMaterial color={palette.edge} transparent opacity={0.28} depthWrite={false} />
      </lineSegments>

      <group ref={processor} position={[0, -0.265, 0.3]}>
        <mesh geometry={geometries.substrate} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
          <meshStandardMaterial color={palette.chipBase} metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh geometry={geometries.chip} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial ref={glow} color={palette.metal} metalness={0.65} roughness={0.28}
            emissive={palette.edge} emissiveIntensity={0.04} />
        </mesh>
        <mesh geometry={geometries.die} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.043, 0]}>
          <meshBasicMaterial color={dieTexture ? "#ffffff" : palette.die} map={dieTexture} toneMapped={false} />
        </mesh>
        <ProcessorPins geometry={geometries.pins} />
      </group>

    </group>
  );
}
