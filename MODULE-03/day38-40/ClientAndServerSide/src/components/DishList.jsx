import Link from "next/link";
import { fmt } from "@/data/dishes";
import AddToCartButton from "@/components/AddToCartButton";

export default function DishList({ dishes }) {
  if (!dishes.length) {
    return <p className="no-results">No dishes in this category yet.</p>;
  }

  return (
    <div className="menu-grid">
      {dishes.map((dish) => (
        <article
          key={dish.slug}
          className="dish-item"
          data-category={dish.cat}
          data-name={dish.name.toLowerCase()}
        >
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
      ))}
    </div>
  );
}
