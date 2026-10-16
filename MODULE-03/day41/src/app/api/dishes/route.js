import { NextResponse } from "next/server";
import { getDishes, queryDishes, PAGE_SIZE } from "@/data/dishes";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const pageParam = searchParams.get("page");
  const sizeParam = searchParams.get("pageSize");

  // Bare /api/dishes keeps the days 38-40 contract: every dish, no paging meta.
  if (!q && pageParam === null && sizeParam === null) {
    const dishes = await getDishes();
    return NextResponse.json({ data: dishes });
  }

  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, Number.parseInt(sizeParam ?? String(PAGE_SIZE), 10) || PAGE_SIZE)
  );

  const result = await queryDishes({ q, page, pageSize });
  return NextResponse.json(result);
}
