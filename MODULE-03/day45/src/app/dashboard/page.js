import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { fmt } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
  description:
    "Revenue, order volume and neighbourhood performance for Addis Eats.",
};

export function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function summarise(orders) {
  const revenue = orders.reduce((sum, order) => sum + orderTotal(order), 0);
  const areas = new Set(orders.map((order) => order.subcity).filter(Boolean));

  return {
    orders: orders.length,
    revenue,
    average: Math.round(revenue / orders.length),
    areas: areas.size,
  };
}

function EmptyDashboard() {
  return (
    <div className="empty-cart">
      <h2>No orders yet</h2>
      <p>
        This is the state every new installation shows. The charts, the
        neighbourhood breakdown and the order table appear here as soon as the
        first order is placed.
      </p>
      <Link href="/menu" className="cta">
        Open the menu
      </Link>
    </div>
  );
}

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const state = typeof params.state === "string" ? params.state : "data";

  const orders = state === "empty" ? [] : listOrders();

  return (
    <section>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">
        Order volume and revenue across Addis Ababa — aggregated on the server,
        so only summary numbers leave this route.
      </p>

      {orders.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <DashboardStats summary={summarise(orders)} />
      )}
    </section>
  );
}

function DashboardStats({ summary }) {
  const cards = [
    { label: "Orders", value: summary.orders, hint: "all time" },
    { label: "Revenue", value: fmt(summary.revenue), hint: "all time" },
    { label: "Average order", value: fmt(summary.average), hint: "per order" },
    { label: "Neighbourhoods", value: summary.areas, hint: "delivering to" },
  ];

  return (
    <div className="stat-grid">
      {cards.map((card) => (
        <div className="stat-card" key={card.label}>
          <div className="stat-label">{card.label}</div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-hint">{card.hint}</div>
        </div>
      ))}
    </div>
  );
}
