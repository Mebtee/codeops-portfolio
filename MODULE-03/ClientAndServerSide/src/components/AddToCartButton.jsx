"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/cart/CartContext";

export default function AddToCartButton({ dish }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleClick() {
    addItem(dish);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      className="add-btn"
      data-state={added ? "added" : "idle"}
      onClick={handleClick}
    >
      {added ? "Added" : "Add"}
    </button>
  );
}
