import { NextResponse } from "next/server";
import { getDishes } from "@/data/dishes";

export const dynamic = "force-dynamic";

export async function GET() {
  const dishes = await getDishes();
  return NextResponse.json({ data: dishes });
}
