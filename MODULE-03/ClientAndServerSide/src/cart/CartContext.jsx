import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((dish) => {
    setItems((current) => {
      const existing = current.find((item) => item.slug === dish.slug);
      if (existing) {
        return current.map((item) =>
          item.slug === dish.slug
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...dish, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((slug) => {
    setItems((current) => current.filter((item) => item.slug !== slug));
  }, []);

  const changeQuantity = useCallback((slug, delta) => {
    setItems((current) =>
      current
        .map((item) =>
          item.slug === slug
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    return { items, count, total, addItem, removeItem, changeQuantity, clearCart };
  }, [items, addItem, removeItem, changeQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return cart;
}
