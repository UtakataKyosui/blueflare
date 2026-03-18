import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const darkBg = readFileSync(join(process.cwd(), "public", "dark.png"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={`data:image/png;base64,${darkBg.toString("base64")}`}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "relative",
            fontSize: 160,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            backgroundImage: "linear-gradient(135deg, #e0eaf5 0%, #8ba3c2 40%, #ffffff 50%, #4a6382 60%, #1e2b3c 100%)",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.8))",
          }}
        >
          Blueflare
        </div>
      </div>
    ),
    { ...size }
  );
}
