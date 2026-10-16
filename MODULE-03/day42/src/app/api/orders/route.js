import { NextResponse } from "next/server";
import { orderSchema, fieldErrorsOf } from "@/lib/schema";
import { ensureSessionId, getSessionId } from "@/lib/session";
import { createOrder, listOrders, newOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: fieldErrorsOf(parsed.error) },
      { status: 422 }
    );
  }

  const sessionId = await ensureSessionId();
  const order = createOrder(newOrder(parsed.data, sessionId));
  return NextResponse.json({ data: order }, { status: 201 });
}

export async function GET() {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }
  const orders = listOrders().filter((order) => order.sessionId === sessionId);
  return NextResponse.json({ data: orders });
}
