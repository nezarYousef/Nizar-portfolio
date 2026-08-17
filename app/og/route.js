import { ImageResponse } from "next/og";
import { portfolioCopy } from "@/data/portfolio";

/* A plain route rather than the opengraph-image file convention: the
   convention hashes its URL and scopes it to one route group, so /ar could
   not reference it. This lives at a stable /og for both locales.

   One shared card for both languages - generating Arabic here would mean
   shipping an Arabic font binary purely for social previews. */

export const runtime = "nodejs";

const size = { width: 1200, height: 630 };

export function GET() {
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
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 23, letterSpacing: 3, color: "#35d6c6" }}>
            {hero.eyebrow.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 80, lineHeight: 1.05 }}>
            {hero.name}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              fontSize: 29,
              lineHeight: 1.4,
              color: "#c4cecb"
            }}
          >
            {hero.title}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {skills.coreStack.slice(0, 8).map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                padding: "7px 17px",
                border: "1px solid #38423f",
                borderRadius: 999,
                fontSize: 21,
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
