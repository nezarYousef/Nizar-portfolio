import styles from "./HeroVisual.module.css";

/* Static stand-in for the Skill Nebula: the same skill words arranged on a
   spiral with connection lines, rendered as SVG so it costs nothing and works
   everywhere the live canvas is refused (small viewports, reduced motion,
   saveData, low memory, no WebGL). Deterministic layout - no randomness at
   render time. */

const GOLDEN = 137.508;

function spiralLayout(words) {
  return words.map((word, i) => {
    const angle = ((i * GOLDEN) % 360) * (Math.PI / 180);
    const radius = 74 + (i / Math.max(words.length - 1, 1)) * 132;
    return {
      word,
      x: 240 + Math.cos(angle) * radius * 1.12,
      y: 240 + Math.sin(angle) * radius * 0.86,
      size: i < 8 ? 15 : i < 16 ? 12.5 : 11,
      opacity: i < 8 ? 0.95 : i < 16 ? 0.75 : 0.55
    };
  });
}

export default function NebulaPoster({ words }) {
  const placed = spiralLayout(words);

  return (
    <svg
      className={styles.poster}
      viewBox="0 0 480 480"
      role="presentation"
      focusable="false"
    >
      <defs>
        <radialGradient id="nebula-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--accent-bright)", stopOpacity: 0.5 }} />
          <stop offset="45%" style={{ stopColor: "var(--accent-bright)", stopOpacity: 0.14 }} />
          <stop offset="100%" style={{ stopColor: "var(--accent-bright)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <circle cx="240" cy="240" r="150" fill="url(#nebula-core)" />

      <g style={{ stroke: "var(--accent-line)", strokeWidth: 0.6, opacity: 0.4 }}>
        {placed.map((point, i) => {
          const next = placed[(i + 1) % placed.length];
          return (
            <line
              key={`l-${i}`}
              x1={point.x}
              y1={point.y}
              x2={next.x}
              y2={next.y}
            />
          );
        })}
      </g>

      {placed.map((point, i) => (
        <circle
          key={`d-${i}`}
          cx={point.x}
          cy={point.y}
          r={2}
          style={{ fill: "var(--accent-bright)", opacity: point.opacity }}
        />
      ))}

      {placed.map((point, i) => (
        <text
          key={`t-${i}`}
          x={point.x}
          y={point.y - 9}
          textAnchor="middle"
          fontSize={point.size}
          style={{
            fill: "var(--ink-muted)",
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            opacity: point.opacity
          }}
        >
          {point.word}
        </text>
      ))}
    </svg>
  );
}
