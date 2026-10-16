"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { orderSchema, fieldErrorsOf } from "@/lib/schema";
import {
  ensureSessionId,
  getSessionId,
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

  await startSession(user.id);
  redirect("/");
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

  const sessionId = await ensureSessionId();
  const order = createOrder(newOrder(parsed.data, sessionId));

  revalidatePath("/checkout");
  revalidatePath("/cart");

  return { status: 201, ok: true, order };
}

export async function cancelOrder(orderId) {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return { status: 401, ok: false, error: "No active session." };
  }

  const order = getOrder(orderId);
  if (!order) {
    return { status: 404, ok: false, error: "Order not found." };
  }
  if (order.sessionId !== sessionId) {
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
