import Link from "next/link";
import Image from "next/image";
import { fmt } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";

export default function DishCard({ dish }) {
  return (
    <article
      className="dish-item"
      data-category={dish.cat}
      data-name={dish.name.toLowerCase()}
    >
      <Image
        className="dish-photo"
        src="/images/food.jpg"
        alt={`${dish.name} — Addis Eats`}
        width={1408}
        height={768}
        sizes="(max-width: 555px) calc(100vw - 40px), (max-width: 821px) calc((100vw - 56px) / 2), calc((min(100vw, 1080px) - 72px) / 3)"
      />
      <div className="dish-title">
        <h3>
          <Link href={`/menu/${dish.slug}`}>{dish.name}</Link>
        </h3>
      </div>
      <div className="dish-meta">
        <span className="dish-price">{fmt(dish.price)}</span>
        <AddToCartButton dish={dish} />
      </div>
    </article>
  );
}
