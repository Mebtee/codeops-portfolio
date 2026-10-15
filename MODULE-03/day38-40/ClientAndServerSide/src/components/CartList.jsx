"use client";

import Link from "next/link";
import { useCart } from "@/cart/CartContext";

export default function CartList() {
  const { items, total, count, changeQuantity, removeItem, clearCart } =
    useCart();

  if (!items.length) {
    return null;
  }

  return (
    <div>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Dish</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Subtotal</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.slug}>
              <td>{item.name}</td>
              <td>{item.catLabel}</td>
              <td>
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
              </td>
              <td>ETB {item.quantity * item.price}</td>
              <td>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => removeItem(item.slug)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <span>
          {count} item{count === 1 ? "" : "s"} · ETB {total}
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
