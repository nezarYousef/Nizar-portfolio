"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Object3D
} from "three";

/*
 * The v1 hero had a small 2D "Neural Network · live visualization" orb. Here it
 * becomes the core of the 3D system: nodes on a sphere, nearest-neighbour
 * synapses, and a few signals travelling along them.
 */

const scratch = new Object3D();

function fibonacciSphere(count, radius) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]);
  }
  return points;
}

function buildNetwork(count, radius) {
  const nodes = fibonacciSphere(count, radius);
  const edges = [];
  const seen = new Set();
  const adjacency = nodes.map(() => []);

  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => ({
        j,
        d: (node[0] - other[0]) ** 2 + (node[1] - other[1]) ** 2 + (node[2] - other[2]) ** 2
      }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);

    nearest.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) return;
      seen.add(key);
      adjacency[i].push(edges.length);
      adjacency[j].push(edges.length);
      edges.push([i, j]);
    });
  });

  const positions = [];
  edges.forEach(([i, j]) => positions.push(...nodes[i], ...nodes[j]));
  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));

  return { nodes, edges, adjacency, lineGeometry };
}

export default function NeuralCore({ palette, compact, reducedMotion, progressRef, radius = 1.05 }) {
  const count = compact ? 46 : 72;
  const pulseCount = compact ? 6 : 11;
  const groupRef = useRef(null);
  const innerRef = useRef(null);
  const nodesRef = useRef(null);
  const pulsesRef = useRef(null);
  const shrink = useRef(0);

  const network = useMemo(() => buildNetwork(count, radius), [count, radius]);
  const nodeGeometry = useMemo(() => new IcosahedronGeometry(0.036, 1), []);
  const pulseGeometry = useMemo(() => new IcosahedronGeometry(0.03, 1), []);
  const innerGeometry = useMemo(() => new IcosahedronGeometry(radius * 0.46, 1), [radius]);

  const pulses = useMemo(
    () =>
      Array.from({ length: pulseCount }, (_, k) => ({
        edge: (k * 7) % network.edges.length,
        forward: k % 2 === 0,
        t: (k * 0.37) % 1,
        speed: 0.45 + ((k * 13) % 7) * 0.06
      })),
    [network, pulseCount]
  );

  useEffect(() => {
    const mesh = nodesRef.current;
    if (!mesh) return;
    const a = new Color(palette.nodeA);
    const b = new Color(palette.nodeB);
    network.nodes.forEach((node, i) => {
      scratch.position.set(node[0], node[1], node[2]);
      scratch.scale.setScalar(i % 5 === 0 ? 1.35 : 1);
      scratch.updateMatrix();
      mesh.setMatrixAt(i, scratch.matrix);
      mesh.setColorAt(i, i % 3 === 0 ? b : a);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [network, palette]);

  useEffect(
    () => () => {
      network.lineGeometry.dispose();
      nodeGeometry.dispose();
      pulseGeometry.dispose();
      innerGeometry.dispose();
    },
    [network, nodeGeometry, pulseGeometry, innerGeometry]
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (groupRef.current) {
      if (!reducedMotion) groupRef.current.rotation.y += dt * 0.1;
      // In the exploded view the core steps back so the caption stays legible.
      const target = progressRef?.current ?? 0;
      shrink.current += (target - shrink.current) * (1 - Math.exp(-dt * 6));
      groupRef.current.scale.setScalar(1 - shrink.current * 0.22);
      groupRef.current.position.z = -shrink.current * 0.45;
    }
    if (innerRef.current && !reducedMotion) {
      innerRef.current.rotation.y -= dt * 0.18;
      innerRef.current.rotation.x += dt * 0.06;
    }

    const mesh = pulsesRef.current;
    if (!mesh) return;
    pulses.forEach((pulse, k) => {
      if (!reducedMotion) pulse.t += dt * pulse.speed;
      if (pulse.t >= 1) {
        // Walk the graph: continue from the node this signal just reached.
        const [i, j] = network.edges[pulse.edge];
        const reached = pulse.forward ? j : i;
        const options = network.adjacency[reached];
        const next = options[(k + Math.floor(pulse.speed * 100)) % options.length];
        pulse.forward = network.edges[next][0] === reached;
        pulse.edge = next;
        pulse.t = 0;
      }
      const [i, j] = network.edges[pulse.edge];
      const from = network.nodes[pulse.forward ? i : j];
      const to = network.nodes[pulse.forward ? j : i];
      scratch.position.set(
        from[0] + (to[0] - from[0]) * pulse.t,
        from[1] + (to[1] - from[1]) * pulse.t,
        from[2] + (to[2] - from[2]) * pulse.t
      );
      scratch.scale.setScalar(1);
      scratch.updateMatrix();
      mesh.setMatrixAt(k, scratch.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  /*
   * The core is the supporting layer, not the subject: the headline is. Every
   * material here is deliberately held below the cards so the eye reads
   * headline, then cards, then network.
   */
  return (
    <group ref={groupRef}>
      <lineSegments geometry={network.lineGeometry}>
        <lineBasicMaterial color={palette.edge} transparent opacity={0.17} depthWrite={false} />
      </lineSegments>

      <instancedMesh ref={nodesRef} args={[nodeGeometry, undefined, network.nodes.length]}>
        <meshStandardMaterial roughness={0.5} metalness={0.05} transparent opacity={0.62} />
      </instancedMesh>

      <instancedMesh ref={pulsesRef} args={[pulseGeometry, undefined, pulseCount]}>
        <meshBasicMaterial color={palette.pulse} toneMapped={false} transparent opacity={0.7} />
      </instancedMesh>

      <lineSegments ref={innerRef}>
        <wireframeGeometry args={[innerGeometry]} />
        <lineBasicMaterial color={palette.nodeB} transparent opacity={0.12} depthWrite={false} />
      </lineSegments>

      <mesh>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color={palette.nodeA} roughness={0.4} metalness={0.1} transparent opacity={0.72} />
      </mesh>
    </group>
  );
}
