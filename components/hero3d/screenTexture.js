import { CanvasTexture, SRGBColorSpace } from "three";

// Actual editor UI, rasterised once onto the laptop's display mesh.
export function drawScreen() {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 880;
  const ctx = canvas.getContext("2d");
  const mono = '"JetBrains Mono", monospace';
  ctx.fillStyle = "#102d33";
  ctx.fillRect(0, 0, 1400, 880);
  ctx.fillStyle = "#193c43";
  ctx.fillRect(0, 0, 1400, 65);
  ["#ef9197", "#e8cb7d", "#8ad6b3"].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(30 + i * 31, 32, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = `22px ${mono}`;
  ctx.fillStyle = "#b7d5d6";
  ctx.textAlign = "center";
  ctx.fillText("nizar-portfolio / workspace", 720, 40);
  ctx.textAlign = "left";
  ctx.fillStyle = "#15343a";
  ctx.fillRect(0, 65, 295, 707);
  ctx.fillStyle = "#7da4a9";
  ctx.font = `18px ${mono}`;
  ctx.fillText("EXPLORER", 30, 110);
  ctx.font = `23px ${mono}`;
  ["portfolio/", "  src/", "    components/", "    pages/", "    api/", "    vision/", "  README.md"].forEach((line, i) => {
    if (i === 2) {
      ctx.fillStyle = "#205059";
      ctx.fillRect(15, 208, 265, 44);
    }
    ctx.fillStyle = i === 0 ? "#80e1d4" : "#a2c4c8";
    ctx.fillText(line, 30, 170 + i * 50);
  });
  ctx.fillStyle = "#20454c";
  ctx.fillRect(295, 65, 360, 61);
  ctx.fillStyle = "#7de0d6";
  ctx.fillRect(295, 65, 360, 3);
  ctx.font = `22px ${mono}`;
  ctx.fillText("  portfolio.tsx", 315, 104);

  const rows = [
    [["// Thoughtfully engineered.", "#769b9f"]],
    [["export default ", "#c2a4e0"], ["function ", "#a9c8f1"], ["Portfolio() {", "#d1e6e6"]],
    [["  return ", "#c2a4e0"], ["(", "#d1e6e6"]],
    [["    <Workspace", "#7de0d6"]],
    [["      focus", "#b3c9f0"], ["=", "#c6dfe1"], ['"AI + Web Engineering"', "#e3d5a1"]],
    [["    >", "#7de0d6"]],
    [["      <Interface />", "#7de0d6"]],
    [["      <Intelligence />", "#7de0d6"]],
    [["      <Architecture />", "#7de0d6"]],
    [["    </Workspace>", "#7de0d6"]],
    [["  );", "#d1e6e6"]],
    [["}", "#d1e6e6"]]
  ];
  ctx.font = `30px ${mono}`;
  rows.forEach((tokens, index) => {
    const y = 177 + index * 39;
    ctx.fillStyle = "#62878c";
    ctx.fillText(String(index + 1).padStart(2, " "), 320, y);
    let x = 385;
    tokens.forEach(([token, color]) => {
      ctx.fillStyle = color;
      ctx.fillText(token, x, y);
      x += ctx.measureText(token).width;
    });
  });
  ctx.fillStyle = "#0d262c";
  ctx.fillRect(295, 670, 1105, 170);
  ctx.fillStyle = "#789fa5";
  ctx.font = `18px ${mono}`;
  ctx.fillText("TERMINAL   OUTPUT", 325, 704);
  ctx.font = `23px ${mono}`;
  ctx.fillStyle = "#83dfcc";
  ctx.fillText("$ npm run build", 325, 750);
  ctx.fillStyle = "#b6d5d6";
  ctx.fillText("  Ready. Let's build something meaningful.", 325, 794);
  ctx.fillStyle = "#23636a";
  ctx.fillRect(0, 840, 1400, 40);
  ctx.fillStyle = "#c1ece5";
  ctx.font = `18px ${mono}`;
  ctx.fillText("  main*    0 errors    0 warnings", 15, 867);
  ctx.fillText("TypeScript JSX    UTF-8", 1080, 867);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function drawKeyboard(palette) {
  const canvas = document.createElement("canvas");
  canvas.width = 1040;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = palette.keyInk;
  ctx.font = '500 21px "JetBrains Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const rows = [
    ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"],
    ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "ret"],
    ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "up", "del"],
    ["fn", "ctrl", "alt", "cmd", "", "", "", "", "", "alt", "left", "down", "right"]
  ];
  rows.forEach((row, y) => row.forEach((key, x) => {
    ctx.fillText(key, (x + 0.5) * 80, (y + 0.5) * 60);
  }));
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function drawProcessor() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 384;
  const ctx = canvas.getContext("2d");
  const fill = ctx.createLinearGradient(0, 0, 384, 384);
  fill.addColorStop(0, "#123e49");
  fill.addColorStop(0.5, "#176b73");
  fill.addColorStop(1, "#103640");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 384, 384);
  ctx.strokeStyle = "#6ec6bd";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 336, 336);
  ctx.strokeStyle = "rgba(143, 231, 219, 0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const d = 45 + i * 11;
    ctx.strokeRect(d, d, 384 - d * 2, 384 - d * 2);
  }
  // Fine lithography, quieter than a glowing slab.
  for (let i = 0; i < 12; i++) {
    const y = 56 + i * 23;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(48 + (i % 3) * 8, y);
    ctx.lineTo(60 + (i % 3) * 8, y + 10);
    ctx.moveTo(354, y);
    ctx.lineTo(336 - (i % 3) * 8, y);
    ctx.lineTo(324 - (i % 3) * 8, y + 10);
    ctx.stroke();
  }
  ctx.fillStyle = "#b8e6de";
  ctx.font = '500 65px "JetBrains Mono", monospace';
  ctx.textAlign = "center";
  ctx.fillText(">_", 192, 214);
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText("NIZAR / COMPUTE", 192, 321);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
