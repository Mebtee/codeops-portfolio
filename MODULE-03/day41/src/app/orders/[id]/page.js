import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import OrderStatus from "./OrderStatus";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const order = getOrder(id);
  return {
    title: order
      ? `Order ${order.reference} — Addis Eats`
      : "Order not found — Addis Eats",
  };
}

export default async function OrderStatusPage({ params }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) {
    notFound();
  }

  return (
    <section>
      <OrderStatus initialOrder={order} />
    </section>
  );
}
