import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <section className="welcome">
      <Image
        className="hero-photo"
        src="/images/hero-berbere-table.jpg"
        alt="A table of Ethiopian dishes with berbere spice"
        width={1920}
        height={1080}
        sizes="(max-width: 1080px) calc(100vw - 40px), 1040px"
      />
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
