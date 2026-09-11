/*
 * Two states for every module card: "assembled" (the system at rest, cards
 * clustered around the neural core) and "exploded" (an engineering exploded
 * view: cards pulled out and toward the viewer, joined to the core by dashed
 * leader lines). Scroll progress blends between them with a per-card stagger.
 */

export const CARD_SIZE = [1.34, 0.8];
export const TERMINAL_SIZE = [1.74, 0.8];

const full = {
  web: {
    a: [-1.3, 0.92, 0.8],
    ra: [0.05, 0.32, -0.04],
    b: [-2.78, 1.18, 0.85],
    rb: [0, 0.16, 0.01]
  },
  ai: {
    a: [1.35, 1.02, -0.35],
    ra: [0.08, -0.3, 0.05],
    b: [2.72, 1.24, 0.7],
    rb: [0.02, -0.16, 0]
  },
  systems: {
    a: [1.45, -0.55, 0.7],
    ra: [-0.04, -0.36, 0.03],
    b: [2.72, -0.98, 0.85],
    rb: [0, -0.18, -0.01]
  },
  data: {
    a: [-1.4, -0.82, -0.25],
    ra: [-0.06, 0.3, 0.04],
    b: [-2.78, -1.02, 0.75],
    rb: [0, 0.16, 0]
  },
  vision: {
    a: [0.05, -1.45, 0.35],
    ra: [-0.24, 0.02, -0.02],
    b: [0, -1.86, 0.9],
    rb: [-0.1, 0, 0]
  },
  terminal: {
    a: [-0.1, 1.78, -0.85],
    ra: [0.2, 0.05, 0],
    b: [0, 1.85, 0.5],
    rb: [0.08, 0, 0]
  }
};

const compact = {
  web: {
    a: [-0.7, 1.0, 0.6],
    ra: [0.05, 0.28, -0.04],
    b: [-0.74, 1.4, 0.75],
    rb: [0, 0.1, 0]
  },
  ai: {
    a: [0.8, 0.62, -0.3],
    ra: [0.08, -0.28, 0.05],
    b: [0.84, 0.72, 0.5],
    rb: [0, -0.1, 0]
  },
  systems: {
    a: [0.78, -0.92, 0.55],
    ra: [-0.05, -0.3, 0.03],
    b: [0.84, -1.3, 0.75],
    rb: [0, -0.1, 0]
  },
  terminal: {
    a: [-0.6, -1.12, -0.2],
    ra: [-0.1, 0.22, 0],
    b: [-0.66, -0.62, 0.55],
    rb: [-0.04, 0.08, 0]
  }
};

export const COMPACT_IDS = ["web", "ai", "systems", "terminal"];

export function getLayout(id, isCompact) {
  return (isCompact ? compact : full)[id];
}

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Card i starts later than card i-1 so the explosion reads as a sequence. */
export function cardProgress(progress, index) {
  // Explosion runs over roughly p 0.04 → 0.74; the rest of the pin holds the
  // finished diagram while its caption arrives.
  return easeInOutCubic(clamp01((progress - 0.04 - index * 0.045) / 0.48));
}
