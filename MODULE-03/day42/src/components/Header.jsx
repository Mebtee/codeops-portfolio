import Link from "next/link";
import CartBadge from "@/components/CartBadge";
import AccountMenu from "@/components/AccountMenu";

export default function Header() {
  return (
    <header className="site-header">
      <div className="shell">
        <Link href="/" className="brand">
          Addis <span>Eats</span>
        </Link>
        <nav className="main-nav">
          <Link href="/menu">Menu</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/checkout">Checkout</Link>
          <Link href="/orders">Orders</Link>
        </nav>
        <AccountMenu />
        <CartBadge />
      </div>
    </header>
  );
}
