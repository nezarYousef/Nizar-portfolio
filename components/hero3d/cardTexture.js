import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from "three";

/*
 * Card faces are drawn once into a 2D canvas and used as a texture, so the
 * cards are real objects in the WebGL scene (depth, fog, occlusion) while
 * their type stays crisp and uses the site's own fonts.
 */

const PX_PER_UNIT = 560;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  const words = text.includes(" / ")
    ? text.split(" / ").map((part, i, parts) => i < parts.length - 1 ? `${part} /` : part)
    : text.split(/\s+/);
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

const MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
const SANS = '"Manrope", system-ui, "Segoe UI", sans-serif';

export function drawModuleCard(module, size, palette, index, compact = false) {
  const [widthUnits, heightUnits] = size;
  const width = Math.round(widthUnits * PX_PER_UNIT);
  const height = Math.round(heightUnits * PX_PER_UNIT);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const radius = 0.12 * PX_PER_UNIT;
  const pad = 0.14 * PX_PER_UNIT;

  const isTerminal = module.kind === "terminal";
  const surface = ctx.createLinearGradient(0, 0, width * 0.45, height);
  surface.addColorStop(0, palette.faceHighlight);
  surface.addColorStop(1, isTerminal ? palette.faceTerminal : palette.face);
  ctx.fillStyle = surface;
  roundRect(ctx, 0, 0, width, height, radius);
  ctx.fill();

  ctx.strokeStyle = palette.hairline;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 1, 1, width - 2, height - 2, radius - 1);
  ctx.stroke();
  ctx.strokeStyle = palette.faceRim;
  roundRect(ctx, 5, 5, width - 10, height - 10, radius - 5);
  ctx.stroke();

  if (isTerminal) {
    const barH = 0.23 * PX_PER_UNIT;
    ctx.fillStyle = palette.hairline;
    ctx.fillRect(pad, barH, width - pad * 2, 1.5);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((color, dot) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pad + dot * 28, barH / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = palette.muted;
    ctx.font = `500 32px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("nizar@portfolio:~$", width / 2 + 25, barH / 2 + 1);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const lineY = barH + 83;
    ctx.font = `500 ${compact ? 64 : 52}px ${MONO}`;
    const prompt = "$ ";
    ctx.fillStyle = palette.line;
    ctx.fillText(prompt, pad, lineY);
    ctx.fillStyle = palette.ink;
    ctx.fillText(module.command, pad + ctx.measureText(prompt).width, lineY);

    ctx.font = `600 ${compact ? 57 : 47}px ${SANS}`;
    ctx.fillStyle = palette.ink;
    wrapText(ctx, module.output, width - pad * 2).forEach((line, i) => {
      ctx.fillText(line, pad, lineY + 75 + i * 62);
    });

    ctx.fillStyle = palette.line;
    ctx.globalAlpha = 0.65;
    ctx.fillRect(width - pad - 14, height - pad - 22, 14, 27);
    ctx.globalAlpha = 1;
  } else {
    const swatch = palette.swatch[module.swatch] ?? palette.line;
    const swatchSize = 27;

    ctx.fillStyle = swatch;
    roundRect(ctx, pad, pad + 5, swatchSize, swatchSize, 7);
    ctx.fill();

    ctx.fillStyle = palette.muted;
    ctx.font = `500 34px ${MONO}`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "right";
    ctx.globalAlpha = 0.65;
    const number = { web: 1, ai: 2, data: 3, systems: 4, vision: 5 }[module.id] ?? index + 1;
    ctx.fillText(String(number).padStart(2, "0"), width - pad, pad + 31);
    ctx.globalAlpha = 1;

    ctx.textAlign = "left";
    ctx.font = `500 ${compact ? 52 : 42}px ${MONO}`;
    ctx.fillStyle = palette.muted;
    ctx.fillText(module.label, pad + swatchSize + 23, pad + 32);

    ctx.font = `700 ${compact ? 86 : 68}px ${SANS}`;
    ctx.fillStyle = palette.ink;
    const lines = wrapText(ctx, module.value, width - pad * 2);
    lines.forEach((line, i) => ctx.fillText(line, pad, pad + 147 + i * (compact ? 100 : 83)));

    // A quiet short rule, with a full-width hairline to register alignment.
    ctx.fillStyle = palette.hairline;
    ctx.fillRect(pad, height - pad + 8, width - pad * 2, 1.5);
    ctx.fillStyle = swatch;
    roundRect(ctx, pad, height - pad + 5, 112, 6, 3);
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export async function waitForSceneFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load(`700 54px ${SANS}`),
      document.fonts.load(`500 32px ${MONO}`),
      document.fonts.load(`600 34px ${MONO}`)
    ]);
  } catch {
    // Fall back to system fonts; the cards stay legible.
  }
}
