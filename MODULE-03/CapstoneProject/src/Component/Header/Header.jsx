import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from './Navigation/Nav';
import CartForm from './CartForm/CartForm';
import './Header.css';

const BRAND = 'Mesob House';
const BRAND_TAG = 'Addis Ababa · Est. Bole Medhanialem';

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Never leave a menu open behind a page change.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1180) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-brand" onClick={close}>
          <span className="header-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M3 10h14v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M17 11.5h1.6a2.4 2.4 0 0 1 0 4.8H17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M8 4v2.5M12 4v2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="header-brand-text">
            <b>{BRAND}</b>
            <small>{BRAND_TAG}</small>
          </span>
        </Link>

        <Nav
          open={open}
          onToggle={() => setOpen((v) => !v)}
          onNavigate={close}
        />

        <div className="header-actions">
          <CartForm />
        </div>
      </div>
    </header>
  );
}

export default Header;
