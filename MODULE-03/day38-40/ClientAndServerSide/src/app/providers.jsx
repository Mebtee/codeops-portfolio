"use client";

import { CartProvider } from "@/cart/CartContext";

export default function Providers({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
