import { ImageResponse } from "next/og";

export const alt = "Addis Eats — Ethiopian food delivery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 88,
          background:
            "linear-gradient(135deg, #7d2016 0%, #4a130c 55%, #2c0b07 100%)",
          color: "#f6e6cd",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#e0a24a",
          }}
        >
          Addis Ababa · delivered fresh
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 800,
            marginTop: 20,
            lineHeight: 1,
          }}
        >
          Addis Eats
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            marginTop: 28,
            color: "#f6e6cd",
            maxWidth: 980,
            lineHeight: 1.3,
          }}
        >
          Authentic Ethiopian cooking — berbere, niter kibbeh &amp; injera made
          fresh every morning.
        </div>
      </div>
    ),
    { ...size }
  );
}
