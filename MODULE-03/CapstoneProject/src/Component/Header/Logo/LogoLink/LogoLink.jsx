import './LogoLink.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../store/useAuthStore';

function LogoLink() {
  const { isLoggedIn } = useAuth();
  const destination = isLoggedIn ? '/menu' : '/login';

  return (
    <div className="logo-link">
      <Link to={destination}>
        <h1 className="logo-title">Mesob House</h1>
      </Link>
    </div>
  );
}

export default LogoLink;
