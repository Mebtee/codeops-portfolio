import Signup from '../../Signup/Signup';
import Login from '../../Login/Login';
import './CartForm.css';
import { Link } from 'react-router-dom';
import { useCart } from '../../../store/useCartStore';
import { fmt } from '../../../data/dishes';
import { useAuth } from '../../../store/useAuthStore';

function CartForm() {
  const { logout, user } = useAuth();
  const { count, subtotal } = useCart();
  const subTotalWithFormats = fmt(subtotal);
  return (
    <div className="cart-form">
      <div className="cart-container">
        <Link to={'orderCart'}>
          <div className="cart-inner-holder">
            <div className="count">
              {{ count } && (
                <div>
                  <p>{count}</p>
                  <p>Item</p>
                </div>
              )}
            </div>

            <div className="total">
              {{ subtotal } && (
                <div>
                  <p>{subTotalWithFormats}</p>
                </div>
              )}
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
            <Link to="/login">Login</Link>
            <Link to="/signup">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default CartForm;
