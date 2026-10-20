import Link from "next/link";
import { fmt } from "@/lib/format";

export const PAGE_SIZE = 8;

const COLUMNS = [
  { key: "reference", label: "Order" },
  { key: "date", label: "Placed" },
  { key: "area", label: "Neighbourhood" },
  { key: "items", label: "Items" },
  { key: "total", label: "Total" },
  { key: "status", label: "Status" },
];

const DEFAULT_DIR = {
  reference: "asc",
  date: "desc",
  area: "asc",
  items: "desc",
  total: "desc",
  status: "asc",
};

const orderTotal = (order) =>
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const itemCount = (order) =>
  order.items.reduce((sum, item) => sum + item.quantity, 0);

function whenPlaced(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function hrefWith(basePath, params, next) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) query.set(key, value);
  }
  for (const [key, value] of Object.entries(next)) {
    if (value === null || value === undefined || value === "") {
      query.delete(key);
    } else {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function sortOrders(rows, sort, dir) {
  const factor = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let left;
    let right;
    switch (sort) {
      case "reference":
        left = a.reference;
        right = b.reference;
        break;
      case "area":
        left = a.area;
        right = b.area;
        break;
      case "status":
        left = a.status;
        right = b.status;
        break;
      case "items":
        left = a.items;
        right = b.items;
        break;
      case "total":
        left = a.total;
        right = b.total;
        break;
      default:
        left = Date.parse(a.date);
        right = Date.parse(b.date);
    }
    if (left < right) return -1 * factor;
    if (left > right) return 1 * factor;
    return a.reference < b.reference ? -1 : 1;
  });
}

export default function OrderTable({ orders, searchParams, basePath = "/dashboard" }) {
  const params = {};
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (typeof value === "string") params[key] = value;
  }

  const sort = COLUMNS.some((column) => column.key === params.sort)
    ? params.sort
    : "date";
  const dir = params.dir === "asc" || params.dir === "desc" ? params.dir : DEFAULT_DIR[sort];

  const rows = orders.map((order) => ({
    id: order.id,
    reference: order.reference,
    date: order.createdAt,
    area: order.subcity || "Unknown",
    items: itemCount(order),
    total: orderTotal(order),
    status: order.status,
  }));

  const sorted = sortOrders(rows, sort, dir);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(params.page, 10) || 1), totalPages);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sortLabel = COLUMNS.find((column) => column.key === sort).label;
  const dirWord = dir === "asc" ? "ascending" : "descending";

  return (
    <div>
      <table className="cart-table orders-table">
        <caption>
          {sorted.length} orders — sorted by {sortLabel}, {dirWord} first
        </caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const active = column.key === sort;
              return (
                <th
                  scope="col"
                  key={column.key}
                  aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <Link
                    className="th-sort"
                    href={hrefWith(basePath, params, {
                      sort: column.key,
                      dir: active ? (dir === "asc" ? "desc" : "asc") : DEFAULT_DIR[column.key],
                      page: null,
                    })}
                  >
                    {column.label}
                    {active && (
                      <span aria-hidden="true">{dir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.id}>
              <td>
                <b>{row.reference}</b>
              </td>
              <td>{whenPlaced(row.date)}</td>
              <td>{row.area}</td>
              <td className="num">{row.items}</td>
              <td className="num">{fmt(row.total)}</td>
              <td>
                <span className="status-badge" data-status={row.status}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav className="pager" aria-label="Order table pages">
        {page > 1 ? (
          <Link href={hrefWith(basePath, params, { page: page - 1 === 1 ? null : page - 1 })}>
            ← Previous
          </Link>
        ) : (
          <span className="pager-disabled" aria-disabled="true">
            ← Previous
          </span>
        )}
        <span className="page-of">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={hrefWith(basePath, params, { page: page + 1 })}>Next →</Link>
        ) : (
          <span className="pager-disabled" aria-disabled="true">
            Next →
          </span>
        )}
        <span className="pager-count">{sorted.length} orders in total</span>
      </nav>
    </div>
  );
}
