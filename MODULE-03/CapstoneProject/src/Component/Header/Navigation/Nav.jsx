import './Nav.css';
import { Link } from 'react-router-dom';

function Nav() {
  return (
    <div className="nav-container">
      <Link to={"menu"}><p>Menu</p></Link>
      <Link to={"future"}><p>Featured Dish</p></Link>
      <Link to={"orderCart"}><p>Order & Cart</p></Link>
      <Link to={"Delibery"}><p>Delivery & Checkout</p></Link>
    </div>
  );
}

export default Nav;
