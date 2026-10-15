import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DISHES,
  CATEGORIES,
  fmt,
  getDishesByCategory,
  getCategoryBySlug,
  getDishBySlug,
} from "@/data/dishes";
import DishList from "@/components/DishList";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamicParams = false;

export function generateStaticParams() {
  const dishes = DISHES.map((dish) => ({ id: dish.slug }));
  const categories = CATEGORIES.filter(
    (category) => category.key !== "all"
  ).map((category) => ({ id: category.key }));

  return [...dishes, ...categories];
}

export default async function MenuSlugPage({ params }) {
  const { id } = await params;

  const dish = getDishBySlug(id);
  if (dish) {
    return (
      <section>
        <Link href="/menu" className="crumb">
          Back to menu
        </Link>
        <div className="detail">
          <div>
            <h1>{dish.name}</h1>
            <div className="dish-meta">
              <span className="dish-price">{fmt(dish.price)}</span>
              <AddToCartButton dish={dish} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const category = getCategoryBySlug(id);
  if (!category || category.key === "all") {
    notFound();
  }

  const dishes = await getDishesByCategory(category.key);

  return (
    <section>
      <Link href="/menu" className="crumb">
        All dishes
      </Link>
      <h1 className="page-title">{category.label}</h1>
      <p className="page-sub">
        {dishes.length} dish{dishes.length === 1 ? "" : "s"} in{" "}
        {category.label}.
      </p>
      <DishList dishes={dishes} />
    </section>
  );
}
