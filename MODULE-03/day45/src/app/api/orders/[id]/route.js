import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }

  const { id } = await params;
  const order = getOrder(id);
  if (!order || order.sessionId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ data: order });
}
