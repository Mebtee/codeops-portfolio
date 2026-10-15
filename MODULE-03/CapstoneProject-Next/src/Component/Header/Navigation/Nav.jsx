import Link from 'next/link';

const LINKS = [
  { to: '/menu', label: 'Menu' },
  { to: '/future', label: 'Featured Dish' },
  { to: '/orderCart', label: 'Order & Cart' },
  { to: '/delivery', label: 'Delivery & Checkout' },
];

function Nav({ open, onToggle, onNavigate }) {
  return (
    <>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="primary-navigation"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={onToggle}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="primary-navigation"
        className={open ? 'nav-container is-open' : 'nav-container'}
        aria-label="Primary"
      >
        {LINKS.map(({ to, label }) => (
          <Link key={to} href={to} onClick={onNavigate}>
            {label}
          </Link>
        ))}
        <span className="nav-auth">
          <Link href="/login" onClick={onNavigate}>
            Sign In
          </Link>
          <Link href="/signup" onClick={onNavigate}>
            Register
          </Link>
        </span>
      </nav>
    </>
  );
}

export default Nav;
