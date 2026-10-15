"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import fetcher from "@/lib/fetcher";

const money = (value) => "ETB " + Number(value || 0).toLocaleString("en-US");

const STEPS = ["Pending", "Preparing", "On the way", "Delivered"];

const STEP_OF_STATUS = {
  pending: 0,
  preparing: 1,
  "on the way": 2,
  delivered: 3,
};

export default function OrderStatus({ initialOrder }) {
  const { data: order, error, isValidating, mutate } = useSWR(
    `/api/orders/${initialOrder.id}`,
    fetcher,
    {
      fallbackData: initialOrder,
      refreshInterval: 5000,
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      staleTime: 5000,
    }
  );

  const [syncedAt, setSyncedAt] = useState(null);
  const wasValidating = useRef(isValidating);

  useEffect(() => {
    if (wasValidating.current && !isValidating) {
      setSyncedAt(new Date());
    }
    wasValidating.current = isValidating;
  }, [isValidating]);

  const cancelled = order.status === "cancelled";
  const activeStep = cancelled ? -1 : (STEP_OF_STATUS[order.status] ?? 0);
  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const placedAt = order.createdAt.replace("T", " ").slice(0, 16) + " UTC";

  return (
    <section className="order-status">
      <div className="status-card">
        <div className="status-head">
          <div>
            <p className="crumb">Order reference</p>
            <h1>{order.reference}</h1>
          </div>
          <span className="status-badge" data-status={order.status} aria-live="polite">
            {cancelled ? "Cancelled" : order.status}
          </span>
        </div>

        <p className="status-sync">
          <span className="live-dot" data-live={isValidating ? "yes" : "no"} aria-hidden="true" />
          {error
            ? `Live updates unavailable — ${error.message}`
            : !syncedAt
              ? "Seeded from the page render — polling every 5s"
              : isValidating
                ? "Checking for a newer status…"
                : `Last synced ${syncedAt.toLocaleTimeString()}`}
        </p>

        <ol className="status-steps" aria-label="Order progress">
          {STEPS.map((step, index) => (
            <li
              key={step}
              data-state={
                index < activeStep
                  ? "done"
                  : index === activeStep
                    ? "current"
                    : "next"
              }
            >
              {step}
            </li>
          ))}
        </ol>

        <div className="status-section">
          <h2>Items</h2>
          {order.items.map((item) => (
            <div className="summary-item" key={item.slug}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <b>{money(item.price * item.quantity)}</b>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <b>{money(total)}</b>
          </div>
        </div>

        <div className="status-section">
          <h2>Delivery</h2>
          <dl className="status-facts">
            <div>
              <dt>Address</dt>
              <dd>
                {order.street}, {order.subcity}
              </dd>
            </div>
            <div>
              <dt>Landmark</dt>
              <dd>{order.landmark}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>+251 {order.phone}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{order.payment}</dd>
            </div>
            <div>
              <dt>Placed</dt>
              <dd>{placedAt}</dd>
            </div>
            <div>
              <dt>Recipient</dt>
              <dd>{order.name}</dd>
            </div>
          </dl>
        </div>

        <div className="cta-row">
          <button type="button" className="link-btn" onClick={() => mutate()}>
            Refresh now
          </button>
          <Link href="/menu" className="cta">
            Back to the menu
          </Link>
        </div>
      </div>
    </section>
  );
}
