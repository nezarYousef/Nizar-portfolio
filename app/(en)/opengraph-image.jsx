import { ImageResponse } from "next/og";
import { portfolioCopy } from "@/data/portfolio";

export const alt = "Nizar Yousef Alqerem - Computer Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* One shared card for both locales: the name and stack read the same in a
   link preview, and generating Arabic here would mean shipping an extra
   Arabic font binary purely for social cards. */
export default function OpengraphImage() {
  const { hero, skills } = portfolioCopy.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0b0f11",
          color: "#f1f5f3"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#35d6c6"
            }}
          >
            {hero.eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05 }}>
            {hero.name}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 880,
              fontSize: 30,
              lineHeight: 1.4,
              color: "#c4cecb"
            }}
          >
            {hero.title}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {skills.coreStack.slice(0, 8).map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                padding: "8px 18px",
                border: "1px solid #38423f",
                borderRadius: 999,
                fontSize: 22,
                color: "#93a09c"
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
