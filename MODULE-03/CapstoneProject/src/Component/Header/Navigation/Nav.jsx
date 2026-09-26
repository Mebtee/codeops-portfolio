import './Nav.css';
import { Link } from 'react-router-dom';

function Nav() {
  return (
    <div className="nav-container">
      <Link to={"/"}><p>House</p></Link>
      <Link to={"/menu"}><p>Dish</p></Link>
      <Link to={"/orderCart"}><p>Cart</p></Link>
      <Link to={"/delivery"}><p>Checkout</p></Link>
    </div>
  );
}

export default Nav;
