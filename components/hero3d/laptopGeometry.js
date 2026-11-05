import { ExtrudeGeometry, Float32BufferAttribute, Shape } from "three";

// Shared, bevelled solids. The same glass plates survive the entire journey.
export function roundedSolid(width, height, depth, radius = 0.1) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.018,
    bevelThickness: 0.012,
    curveSegments: 7
  });
  geometry.translate(0, 0, -depth / 2);
  // ExtrudeGeometry's default UVs use world units; screen textures need 0–1.
  const positions = geometry.attributes.position;
  const uv = [];
  for (let i = 0; i < positions.count; i++) {
    uv.push((positions.getX(i) + width / 2) / width, (positions.getY(i) + height / 2) / height);
  }
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  return geometry;
}

export const smoothRange = (p, start, end) => {
  const t = Math.max(0, Math.min(1, (p - start) / (end - start)));
  return t * t * (3 - 2 * t);
};
