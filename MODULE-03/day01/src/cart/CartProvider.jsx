import { useReducer, useMemo } from "react";
import PropTypes from "prop-types";
import { CartContext } from "./cartContext";
import { cartReducer } from "./cartReducer";

export default function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, dispatch, totalPrice }),
    [items, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};