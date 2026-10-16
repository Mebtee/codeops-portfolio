"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { orderSchema, fieldErrorsOf } from "@/lib/schema";
import {
  getSession,
  safeNextPath,
  startSession,
  endSession,
} from "@/lib/session";
import { findUserByEmail, verifyPassword } from "@/lib/auth";
import {
  createOrder,
  getOrder,
  newOrder,
  updateOrder,
} from "@/lib/orders";

export async function signIn(_prevState, formData) {
  const user = findUserByEmail(formData.get("email"));
  if (!user || !verifyPassword(user, formData.get("password"))) {
    return {
      status: 401,
      ok: false,
      error: "Wrong email or password.",
    };
  }

  const next = formData.get("next");
  await startSession(user.id);
  redirect(safeNextPath(next));
}

export async function signOut() {
  await endSession();
  redirect("/");
}

function parseItems(raw) {
  try {
    const value = JSON.parse(raw || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export async function placeOrder(_prevState, formData) {
  const session = await getSession();
  if (!session) {
    return {
      status: 401,
      ok: false,
      error: "Please sign in to place an order.",
    };
  }

  const payload = Object.fromEntries(formData.entries());
  payload.items = parseItems(payload.items);

  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      status: 422,
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsOf(parsed.error),
    };
  }

  const order = createOrder(newOrder(parsed.data, session.user.id));

  revalidatePath("/checkout");
  revalidatePath("/cart");

  return { status: 201, ok: true, order };
}

export async function cancelOrder(orderId) {
  const session = await getSession();
  if (!session) {
    return { status: 401, ok: false, error: "No active session." };
  }

  const order = getOrder(orderId);
  if (!order) {
    return { status: 404, ok: false, error: "Order not found." };
  }
  if (order.sessionId !== session.user.id) {
    return { status: 403, ok: false, error: "You do not own this order." };
  }
  if (order.status === "cancelled") {
    return { status: 200, ok: true, order };
  }

  const updated = updateOrder(orderId, { status: "cancelled" });
  revalidatePath("/checkout");
  revalidatePath("/cart");
  return { status: 200, ok: true, order: updated };
}

const ORDER_STAGES = ["pending", "preparing", "on the way", "delivered"];

export async function advanceOrder(orderId, _formData) {
  const session = await getSession();
  if (!session) {
    return { status: 401, ok: false, error: "No active session." };
  }
  if (session.user.role !== "staff") {
    return { status: 403, ok: false, error: "Staff only." };
  }

  const order = getOrder(orderId);
  if (!order) {
    return { status: 404, ok: false, error: "Order not found." };
  }
  if (order.status === "cancelled") {
    return { status: 409, ok: false, error: "Cancelled orders cannot advance." };
  }

  const index = ORDER_STAGES.indexOf(order.status);
  if (index === -1 || index === ORDER_STAGES.length - 1) {
    return { status: 200, ok: true, order };
  }

  const updated = updateOrder(orderId, { status: ORDER_STAGES[index + 1] });
  revalidatePath("/kitchen");
  return { status: 200, ok: true, order: updated };
}
