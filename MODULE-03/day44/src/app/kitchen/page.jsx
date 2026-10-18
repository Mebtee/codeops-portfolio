import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrders } from "@/lib/orders";
import { fmt } from "@/lib/format";
import { advanceOrder } from "@/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kitchen board",
  description: "Live order queue for the Addis Eats kitchen team.",
};

const orderTotal = (order) =>
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default async function KitchenPage() {
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/kitchen");
  }
  if (session.user.role !== "staff") {
    notFound();
  }

  const orders = listOrders().sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );

  return (
    <section>
      <h1 className="page-title">Kitchen board</h1>
      <p className="page-sub">
        Staff view — the full queue across every account, newest first.
      </p>

      {orders.length === 0 ? (
        <div className="empty-cart">
          <h2>Nothing in the queue</h2>
          <p>New orders appear here the moment a customer checks out.</p>
        </div>
      ) : (
        <ul className="orders-list kitchen-list">
          {orders.map((order) => {
            const done =
              order.status === "delivered" || order.status === "cancelled";
            return (
              <li key={order.id}>
                <div className="kitchen-row">
                  <b>{order.reference}</b>
                  <span className="status-badge" data-status={order.status}>
                    {order.status}
                  </span>
                  <span>{order.name}</span>
                  <span>{order.subcity}</span>
                  <span>{fmt(orderTotal(order))}</span>
                  {done ? (
                    <span className="kitchen-done">Closed</span>
                  ) : (
                    <form action={advanceOrder.bind(null, order.id)}>
                      <button type="submit" className="link-btn">
                        Advance
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="page-sub">
        Looking for your own receipts? <Link href="/orders">Your orders</Link>.
      </p>
    </section>
  );
}
