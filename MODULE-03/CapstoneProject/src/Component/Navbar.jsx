import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';

export const Navbar = () => {
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <h1>Addis Eats</h1>
      <div className="nav-links">
        <Link to="/">Menu</Link>
        <Link to="/cart">Cart ({totalItems})</Link>
        <Link to="/checkout">Checkout</Link>
      </div>
    </nav>
  );
};
