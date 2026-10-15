import { NextResponse } from "next/server";
import { DISHES } from "@/data/dishes";

export async function GET(_request, { params }) {
  const { id } = await params;
  const dish = DISHES.find((entry) => entry.slug === id || entry.id === id);
  if (!dish) {
    return NextResponse.json({ error: "Dish not found" }, { status: 404 });
  }
  return NextResponse.json({ data: dish });
}
