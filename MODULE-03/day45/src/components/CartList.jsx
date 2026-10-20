"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/cart/CartContext";

const money = (value) => "ETB " + Number(value || 0).toLocaleString("en-US");

export default function CartList() {
  const { items, total, count, changeQuantity, removeItem, clearCart } =
    useCart();

  if (!items.length) {
    return (
      <div className="empty-cart">
        <h2>Your mesob is empty</h2>
        <p>Add a few dishes and they will show up here.</p>
        <Link href="/menu" className="cta">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-wrap">
      <ul className="cart-list">
        {items.map((item) => (
          <li className="cart-row" key={item.slug}>
            <Image
              className="cart-thumb"
              src="/images/food.jpg"
              alt={`${item.name} — Addis Eats`}
              width={1408}
              height={768}
              sizes="84px"
            />
            <div className="cart-row-info">
              <Link href={`/menu/${item.slug}`} className="cart-row-name">
                {item.name}
              </Link>
              <span className="cart-row-cat">{item.catLabel}</span>
            </div>
            <span className="qty-controls">
              <button
                type="button"
                aria-label={`Decrease ${item.name}`}
                onClick={() => changeQuantity(item.slug, -1)}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${item.name}`}
                onClick={() => changeQuantity(item.slug, 1)}
              >
                +
              </button>
            </span>
            <span className="cart-row-price">{money(item.quantity * item.price)}</span>
            <button
              type="button"
              className="link-btn cart-remove"
              onClick={() => removeItem(item.slug)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <span>
          {count} item{count === 1 ? "" : "s"} · <b>{money(total)}</b>
        </span>
        <span className="qty-controls">
          <button type="button" className="link-btn" onClick={clearCart}>
            Clear cart
          </button>
          <Link href="/checkout" className="cta">
            Checkout
          </Link>
        </span>
      </div>
    </div>
  );
}
