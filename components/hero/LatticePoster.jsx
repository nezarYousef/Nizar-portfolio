import styles from "./HeroVisual.module.css";

/* Static poster shown whenever the live canvas is not appropriate: no WebGL,
   reduced motion, save-data / low-memory devices, or small screens. Drawn as
   inline SVG rather than a raster so it stays sharp, follows the theme
   tokens, and costs about a kilobyte instead of a network request. */

const COLUMNS = 34;
const ROWS = 18;

function cells() {
  const out = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLUMNS; x += 1) {
      // Same shape of maths as the shader, frozen at t = 0.
      const px = (x - (COLUMNS - 1) / 2) * 0.19;
      const py = (y - (ROWS - 1) / 2) * 0.19;
      const a = Math.sin(px * 2.7) * Math.cos(py * 2.1);
      const b = Math.sin((px + py) * 1.7);
      const c = Math.cos(Math.hypot(px, py) * 3.1);
      const response = (a + b * 0.6 + c * 0.5) / 2.1;
      const energy = Math.min(1, Math.abs(response) * 1.6);
      out.push({
        key: `${x}-${y}`,
        cx: (x + 0.5) * (100 / COLUMNS),
        cy: (y + 0.5) * (100 / ROWS),
        r: 0.28 + energy * 0.62,
        opacity: 0.2 + energy * 0.62
      });
    }
  }
  return out;
}

export default function LatticePoster() {
  return (
    <svg
      className={styles.poster}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {cells().map(({ key, cx, cy, r, opacity }) => (
        <circle key={key} cx={cx} cy={cy} r={r} opacity={opacity} />
      ))}
    </svg>
  );
}
