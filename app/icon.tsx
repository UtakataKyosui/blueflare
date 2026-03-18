import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  const lightBg = readFileSync(join(process.cwd(), "public", "light.png"));

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
          borderRadius: "20%", // アイコン用の少し丸み
          backgroundColor: "#fff",
        }}
      >
        <img
          src={`data:image/png;base64,${lightBg.toString("base64")}`}
          style={{
            width: "400%",
            height: "400%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
