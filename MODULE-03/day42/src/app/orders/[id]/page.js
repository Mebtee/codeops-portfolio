import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrder } from "@/lib/orders";
import OrderStatus from "./OrderStatus";

export const dynamic = "force-dynamic";

async function ownedOrder(id) {
  const session = await getSession();
  if (!session) {
    return null;
  }
  const order = getOrder(id);
  if (!order || order.sessionId !== session.user.id) {
    return null;
  }
  return order;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const order = await ownedOrder(id);
  return {
    title: order
      ? `Order ${order.reference} — Addis Eats`
      : "Order not found — Addis Eats",
  };
}

export default async function OrderStatusPage({ params }) {
  const { id } = await params;
  const order = await ownedOrder(id);
  if (!order) {
    notFound();
  }

  return (
    <section>
      <OrderStatus initialOrder={order} />
    </section>
  );
}
