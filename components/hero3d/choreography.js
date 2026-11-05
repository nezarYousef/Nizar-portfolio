import { smoothRange } from "./laptopGeometry";

export const CARD_SIZE = [1.72, 0.88];
export const TERMINAL_SIZE = CARD_SIZE;

// The same cards travel from the laptop into its architecture.
const full = {
  web: { a: [-2.18, 1.88, 0.3], b: [-2.38, 1.06, 0.35] },
  ai: { a: [2.18, 1.88, 0.3], b: [2.38, 1.06, 0.35] },
  systems: { a: [2.3, -0.57, 0.3], b: [2.38, -0.05, 0.35] },
  data: { a: [-2.3, -0.57, 0.3], b: [-2.38, -0.05, 0.35] },
  vision: { a: [-1.75, -1.68, 0.3], b: [-2.38, -1.16, 0.35] },
  terminal: { a: [1.75, -1.68, 0.3], b: [2.38, -1.16, 0.35] }
};

// Mobile keeps all five domains with less depth and no pinning.
const compact = {
  web: { a: [-1.6, 1.9, 0], b: [-1.6, 1.1, 0.1] },
  ai: { a: [1.6, 1.9, 0], b: [1.6, 1.1, 0.1] },
  systems: { a: [1.6, -1.3, 0.1], b: [1.6, 0, 0.1] },
  data: { a: [-1.6, -1.3, 0.1], b: [-1.6, 0, 0.1] },
  vision: { a: [0, -2.05, 0], b: [-1.6, -1.1, 0.1] },
  terminal: { a: [1.6, -2.05, 0], b: [1.6, -1.1, 0.1] }
};

export function getLayout(id, isCompact) {
  return (isCompact ? compact : full)[id];
}

export function cardProgress(progress, index) {
  return smoothRange(progress, 0.25 + index * 0.004, 0.84 + index * 0.004);
}
