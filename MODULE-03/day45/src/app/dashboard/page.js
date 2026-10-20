import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { fmt } from "@/lib/format";
import RevenueChart from "./RevenueChart";

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
  const areas = new Map();

  for (const order of orders) {
    const area = order.subcity || "Unknown";
    const total = orderTotal(order);
    const bucket = areas.get(area) ?? { area, revenue: 0, orders: 0 };
    bucket.revenue += total;
    bucket.orders += 1;
    areas.set(area, bucket);
  }

  return {
    orders: orders.length,
    revenue,
    average: Math.round(revenue / orders.length),
    areas: areas.size,
    byArea: [...areas.values()].sort((a, b) => b.revenue - a.revenue),
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
  const summary = orders.length > 0 ? summarise(orders) : null;

  return (
    <section>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">
        Order volume and revenue across Addis Ababa — aggregated on the server,
        so only summary numbers leave this route.
      </p>

      {summary === null ? (
        <EmptyDashboard />
      ) : (
        <>
          <DashboardStats summary={summary} />

          <figure className="chart-block">
            <h2 id="revenue-heading">Revenue by neighbourhood (ETB)</h2>
            <RevenueChart data={summary.byArea} labelledBy="revenue-heading" />
            <figcaption>
              Bars read from the aggregated summary array — the raw order
              objects never cross into the client.
            </figcaption>
          </figure>
        </>
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
