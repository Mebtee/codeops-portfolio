import { Link } from 'react-router-dom';
import './Header.css';
import Logo from './Logo/Logo';
import Nav from './Navigation/Nav';
import CartForm from './CartForm/CartForm';
import { useAuth } from '../../store/useAuthStore';

function Header() {
  const { logout, user } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Logo />
        <Nav />
        <CartForm />
        
      </div>
    </header>
  );
}

export default Header;
