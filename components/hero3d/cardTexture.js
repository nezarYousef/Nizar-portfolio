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

function fitText(ctx, text, maxWidth, size, weight, family) {
  let fontSize = size;
  ctx.font = `${weight} ${fontSize}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && fontSize > size * 0.6) {
    fontSize -= 2;
    ctx.font = `${weight} ${fontSize}px ${family}`;
  }
  return fontSize;
}

const MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
const SANS = '"Archivo", system-ui, "Segoe UI", sans-serif';

export function drawModuleCard(module, size, palette, index) {
  const [widthUnits, heightUnits] = size;
  const width = Math.round(widthUnits * PX_PER_UNIT);
  const height = Math.round(heightUnits * PX_PER_UNIT);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const radius = 0.09 * PX_PER_UNIT;
  const pad = 0.12 * PX_PER_UNIT;

  const isTerminal = module.kind === "terminal";
  ctx.fillStyle = isTerminal ? palette.faceTerminal : palette.face;
  roundRect(ctx, 0, 0, width, height, radius);
  ctx.fill();

  ctx.strokeStyle = palette.hairline;
  ctx.lineWidth = 3;
  roundRect(ctx, 1.5, 1.5, width - 3, height - 3, radius - 1.5);
  ctx.stroke();

  if (isTerminal) {
    const barH = 0.2 * PX_PER_UNIT;
    ctx.fillStyle = palette.hairline;
    ctx.fillRect(0, barH, width, 3);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((color, dot) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pad + dot * 36, barH / 2, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = palette.muted;
    ctx.font = `500 26px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("nizar@portfolio:~$", width / 2 + 30, barH / 2 + 1);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const lineY = barH + 0.26 * PX_PER_UNIT;
    ctx.font = `600 34px ${MONO}`;
    ctx.fillStyle = palette.ink;
    const prompt = "nizar@portfolio:~$ ";
    ctx.fillStyle = palette.line;
    ctx.fillText(prompt, pad, lineY);
    ctx.fillStyle = palette.ink;
    ctx.fillText(module.command, pad + ctx.measureText(prompt).width, lineY);

    const outSize = fitText(ctx, module.output, width - pad * 2, 32, 500, MONO);
    ctx.font = `500 ${outSize}px ${MONO}`;
    ctx.fillStyle = palette.muted;
    ctx.fillText(module.output, pad, lineY + 58);

    ctx.fillStyle = palette.line;
    ctx.fillRect(pad, lineY + 86, 18, 38);
  } else {
    const swatch = palette.swatch[module.swatch] ?? palette.line;
    const swatchSize = 0.1 * PX_PER_UNIT;

    ctx.fillStyle = swatch;
    roundRect(ctx, pad, pad, swatchSize, swatchSize, 8);
    ctx.fill();

    ctx.fillStyle = palette.muted;
    ctx.font = `500 30px ${MONO}`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "right";
    ctx.fillText(String(index + 1).padStart(2, "0"), width - pad, pad + swatchSize * 0.78);

    ctx.textAlign = "left";
    ctx.font = `500 32px ${MONO}`;
    ctx.fillStyle = palette.muted;
    ctx.fillText(module.label, pad, height - pad - 92);

    const valueSize = fitText(ctx, module.value, width - pad * 2, 54, 700, SANS);
    ctx.font = `700 ${valueSize}px ${SANS}`;
    ctx.fillStyle = palette.ink;
    ctx.fillText(module.value, pad, height - pad - 30);

    // v1's coloured underline under each module value
    ctx.fillStyle = swatch;
    roundRect(ctx, pad, height - pad - 8, width - pad * 2, 7, 3.5);
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
