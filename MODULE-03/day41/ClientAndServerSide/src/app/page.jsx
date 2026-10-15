import Link from "next/link";

export default function HomePage() {
  return (
    <section className="welcome">
      <h1>
        Addis <span>Eats</span>
      </h1>
      <p>
        Authentic Ethiopian cooking delivered across Addis Ababa. Berbere,
        niter kibbeh and injera made fresh every morning.
      </p>
      <div className="cta-row">
        <Link href="/menu" className="cta">
          Browse the menu
        </Link>
        <Link href="/checkout" className="cta secondary">
          Checkout
        </Link>
      </div>
    </section>
  );
}
