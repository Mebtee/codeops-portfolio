import Link from "next/link";
import { fmt } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";

export default function DishCard({ dish }) {
  return (
    <article
      className="dish-item"
      data-category={dish.cat}
      data-name={dish.name.toLowerCase()}
    >
      <img
        className="dish-photo"
        src={`/images/dishes/${dish.slug}.jpg`}
        alt={dish.name}
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
