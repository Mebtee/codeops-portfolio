import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrders } from "@/lib/orders";
import { fmt } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your orders",
  description: "Track the status of your past and current Addis Eats orders.",
};

const orderTotal = (order) =>
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/orders");
  }

  const orders = listOrders()
    .filter((order) => order.sessionId === session.user.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <section>
      <h1 className="page-title">Your orders</h1>
      <p className="page-sub">
        Signed in as {session.user.name} — only orders placed by this account
        are ever loaded.
      </p>

      {orders.length === 0 ? (
        <div className="empty-cart">
          <h2>No orders yet</h2>
          <p>Your receipts will collect here after your first checkout.</p>
          <Link href="/menu" className="cta">
            Explore the menu
          </Link>
        </div>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`}>
                <b>{order.reference}</b>
                <span className="status-badge" data-status={order.status}>
                  {order.status}
                </span>
                <span>{fmt(orderTotal(order))}</span>
                <span>{order.createdAt.slice(0, 10)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
