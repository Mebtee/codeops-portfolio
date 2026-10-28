import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: { absolute: "Addis Eats — Ethiopian food delivery" },
  description:
    "Authentic Ethiopian cooking delivered across Addis Ababa. Browse injera, wat, tibs and tej, then order to your door.",
};

export default function HomePage() {
  return (
    <section className="welcome">
      <div className="hero-copy">
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
      </div>
      <div className="hero-media">
        <Image
          className="hero-photo"
          src="/images/food.jpg"
          alt="A spread of freshly cooked Ethiopian dishes from Addis Eats"
          width={1408}
          height={768}
          sizes="(max-width: 860px) calc(100vw - 40px), 460px"
          priority
        />
      </div>
    </section>
  );
}
