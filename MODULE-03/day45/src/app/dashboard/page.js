import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { fmt } from "@/lib/format";
import RevenueChart, { OrdersPerDayChart } from "./RevenueChart";
import OrderTable from "../orders/OrderTable";

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
  const daily = new Map();

  for (const order of orders) {
    const area = order.subcity || "Unknown";
    const total = orderTotal(order);
    const bucket = areas.get(area) ?? { area, revenue: 0, orders: 0 };
    bucket.revenue += total;
    bucket.orders += 1;
    areas.set(area, bucket);

    const day = order.createdAt.slice(0, 10);
    daily.set(day, (daily.get(day) ?? 0) + 1);
  }

  const days = [...daily.keys()].sort();
  const from = days[0];
  const to = days[days.length - 1];
  const byDay = [];
  for (let stamp = Date.parse(from); stamp <= Date.parse(to); stamp += 86400000) {
    const day = new Date(stamp).toISOString().slice(0, 10);
    byDay.push({ day, orders: daily.get(day) ?? 0 });
  }

  return {
    orders: orders.length,
    revenue,
    average: Math.round(revenue / orders.length),
    areas: areas.size,
    byArea: [...areas.values()].sort((a, b) => b.revenue - a.revenue),
    byDay,
    range: { from, to },
  };
}

function shortDay(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function rangeLabel(range) {
  return `${shortDay(range.from)} – ${shortDay(range.to)} ${range.to.slice(0, 4)}`;
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

          <figure className="chart-block">
            <h2 id="daily-heading">
              Orders per day, {rangeLabel(summary.range)} (orders)
            </h2>
            <OrdersPerDayChart data={summary.byDay} labelledBy="daily-heading" />
            <figcaption>
              The same counts as the chart, spelled out underneath for anyone
              the SVG does not reach.
            </figcaption>
            <div className="chart-table-wrap">
              <table className="chart-table">
                <caption>
                  Orders per day, {rangeLabel(summary.range)} (orders)
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byDay.map((day) => (
                    <tr key={day.day}>
                      <th scope="row">{shortDay(day.day)}</th>
                      <td>{day.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>

          <OrderTable orders={orders} searchParams={params} basePath="/dashboard" />
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
