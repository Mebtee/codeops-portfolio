import './CartForm.css';
import { Link } from 'react-router-dom';
import { useCart } from '../../../store/useCartStore';
import { fmt } from '../../../data/dishes';
import { useAuth } from '../../../store/useAuthStore';

function CartForm() {
  const { logout, user } = useAuth();
  const { count, subtotal } = useCart();

  return (
    <div className="cart-form">
      <div className="cart-container">
        <Link to="/orderCart" aria-label={`Cart, ${count} items, ${fmt(subtotal)}`}>
          <div className="cart-inner-holder">
            <div className="count">
              <div>
                <p>{count}</p>
                <p>Item</p>
              </div>
            </div>
            <div className="total">
              <p>{fmt(subtotal)}</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="account-container">
        {user ? (
          <>
            <span className="account-name">{user.name || user.phone}</span>
            <button className="link-btn" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/signup" className="register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default CartForm;
