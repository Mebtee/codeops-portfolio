import { ImageResponse } from "next/og";
import { getDishBySlug, getCategoryBySlug, fmt } from "@/data/dishes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Addis Eats — menu";

export default async function MenuOpengraphImage({ params }) {
  const { id } = await params;
  const dish = getDishBySlug(id);
  const category = dish ? null : getCategoryBySlug(id);

  const title = dish?.name ?? category?.label ?? "Addis Eats";
  const eyebrow = dish?.catLabel ?? category?.label ?? "Ethiopian menu";
  const price = dish ? fmt(dish.price) : null;
  const summary =
    dish?.desc ??
    (category
      ? `${category.label} from Addis Eats.`
      : "Authentic Ethiopian cooking delivered across Addis Ababa.");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #f6e6cd 0%, #efd7b4 55%, #e6c69a 100%)",
          color: "#2c0b07",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#7d2016",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#7d2016",
            }}
          >
            Addis Eats
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 940,
            }}
          >
            {title}
          </div>
          {price ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginTop: 24,
                padding: "12px 28px",
                borderRadius: 999,
                background: "#7d2016",
                color: "#f6e6cd",
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              {price}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            lineHeight: 1.35,
            color: "#3d1a12",
            maxWidth: 1000,
          }}
        >
          {summary}
        </div>
      </div>
    ),
    { ...size }
  );
}
