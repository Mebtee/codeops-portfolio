"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/cart/CartContext";
import { placeOrder } from "@/actions";

const money = (value) => "ETB " + Number(value || 0).toLocaleString("en-US");

const initialState = { status: 0, ok: false, fieldErrors: {} };

export default function CheckoutForm() {
  const { items, total, count, clearCart } = useCart();
  const [state, formAction, isPending] = useActionState(placeOrder, initialState);

  useEffect(() => {
    if (state.ok) {
      clearCart();
    }
  }, [state.ok, clearCart]);

  if (state.ok) {
    return (
      <div className="confirm-box">
        <h2>Order confirmed — Ameseginalehu!</h2>
        <p>
          Reference <b>{state.order.reference}</b>
        </p>
        <p className="confirm-copy">
          We will call +251 {state.order.phone} to confirm delivery.
        </p>
        <div className="cta-row" style={{ justifyContent: "center" }}>
          <Link href={`/orders/${state.order.id}`} className="cta">
            Track this order
          </Link>
          <Link href="/menu" className="cta secondary">
            Explore the menu
          </Link>
        </div>
      </div>
    );
  }

  if (!count) {
    return (
      <div className="empty-cart">
        <h2>Your mesob is empty</h2>
        <p>Add dishes before continuing to checkout.</p>
        <Link href="/menu" className="cta">
          Explore the menu
        </Link>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const err = (name) => errors[name]?.[0] ?? null;

  return (
    <form action={formAction} className="checkout-form" noValidate>
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map(({ slug, name, price, quantity }) => ({
            slug,
            name,
            price,
            quantity,
          }))
        )}
      />

      <div className="checkout-grid">
        <div className="checkout-fields">
          <div className="field">
            <label htmlFor="name">Recipient name</label>
            <input id="name" name="name" defaultValue="TAMENE BEHAILU" />
            {err("name") && <span className="err">{err("name")}</span>}
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" defaultValue="0929843572" />
            {err("phone") && <span className="err">{err("phone")}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Email for the digital receipt</label>
            <input id="email" name="email" defaultValue="tamenebehailu@gmail.com" />
            {err("email") && <span className="err">{err("email")}</span>}
          </div>

          <div className="field">
            <label htmlFor="subcity">Sub-city</label>
            <select id="subcity" name="subcity" defaultValue="Bole">
              <option>Bole</option>
              <option>Kazanchis</option>
              <option>Sarbet</option>
              <option>Old Airport</option>
              <option>CMC</option>
            </select>
            {err("subcity") && <span className="err">{err("subcity")}</span>}
          </div>

          <div className="field">
            <label htmlFor="street">Street, building and flat</label>
            <input
              id="street"
              name="street"
              defaultValue="Behind Edna Mall, House 402"
            />
            {err("street") && <span className="err">{err("street")}</span>}
          </div>

          <div className="field">
            <label htmlFor="landmark">Landmark / gate instruction</label>
            <input
              id="landmark"
              name="landmark"
              defaultValue="Opposite Boston Day Spa"
            />
            {err("landmark") && <span className="err">{err("landmark")}</span>}
          </div>

          <div className="field">
            <label htmlFor="timing">Dispatch timing</label>
            <select id="timing" name="timing" defaultValue="immediate">
              <option value="immediate">Immediate</option>
              <option value="schedule">Schedule for later</option>
            </select>
            {err("timing") && <span className="err">{err("timing")}</span>}
          </div>

          <div className="field">
            <label htmlFor="scheduleTime">Scheduled time (optional)</label>
            <input id="scheduleTime" name="scheduleTime" placeholder="7:30 PM" />
            {err("scheduleTime") && (
              <span className="err">{err("scheduleTime")}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="payment">Payment method</label>
            <select id="payment" name="payment" defaultValue="cash">
              <option value="cash">Cash on delivery</option>
              <option value="telebirr">Telebirr</option>
              <option value="cbe">CBE Birr</option>
              <option value="amole">Amole</option>
            </select>
            {err("payment") && <span className="err">{err("payment")}</span>}
          </div>

          <div className="field">
            <label htmlFor="telebirrPhone">Telebirr number (if paying by Telebirr)</label>
            <input id="telebirrPhone" name="telebirrPhone" />
            {err("telebirrPhone") && (
              <span className="err">{err("telebirrPhone")}</span>
            )}
          </div>
        </div>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          {items.map((item) => (
            <div className="summary-item" key={item.slug}>
              <Image
                className="summary-thumb"
                src="/images/food.jpg"
                alt={`${item.name} — Addis Eats`}
                width={1408}
                height={768}
                sizes="56px"
              />
              <div className="summary-item-info">
                <b>{item.name}</b>
                <small>
                  {item.catLabel} · Qty {item.quantity}
                </small>
              </div>
              <b className="line-price">
                {money(item.price * item.quantity)}
              </b>
            </div>
          ))}
          <div className="summary-total">
            <span>
              {count} item{count === 1 ? "" : "s"}
            </span>
            <b>{money(total)}</b>
          </div>

          {err("items") && <span className="err">{err("items")}</span>}
          {state.error && !Object.keys(errors).length && (
            <span className="err">{state.error}</span>
          )}

          <button type="submit" className="cta" disabled={isPending}>
            {isPending ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </div>
    </form>
  );
}
