"use client";

import Link from "next/link";
import { useCart } from "@/cart/CartContext";

export default function CartBadge() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="cart-badge" aria-label={`${count} items in cart`}>
      Cart <span>{count}</span>
    </Link>
  );
}
