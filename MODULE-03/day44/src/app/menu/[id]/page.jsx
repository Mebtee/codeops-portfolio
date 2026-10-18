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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamicParams = false;

export function generateStaticParams() {
  const dishes = DISHES.map((dish) => ({ id: dish.slug }));
  const categories = CATEGORIES.filter(
    (category) => category.key !== "all"
  ).map((category) => ({ id: category.key }));

  return [...dishes, ...categories];
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  const dish = getDishBySlug(id);
  if (dish) {
    const summary = dish.desc || `Authentic Ethiopian dish from Addis Eats.`;
    const description = `${dish.name} — ${fmt(dish.price)}. ${summary}`;
    return {
      title: dish.name,
      description,
      openGraph: {
        title: dish.name,
        description,
        type: "article",
      },
    };
  }

  const category = getCategoryBySlug(id);
  if (category && category.key !== "all") {
    return {
      title: category.label,
      description: `Browse ${category.label.toLowerCase()} on the Addis Eats menu.`,
    };
  }

  return {};
}

export default async function MenuSlugPage({ params }) {
  const { id } = await params;

  const dish = getDishBySlug(id);
  if (dish) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "MenuItem",
      name: dish.name,
      description: dish.desc,
      image: [
        `${SITE_URL}/images/dishes/${dish.slug}.jpg`,
      ],
      offers: {
        "@type": "Offer",
        price: dish.price,
        priceCurrency: "ETB",
        availability: "https://schema.org/InStock",
      },
      suitableForDiet: dish.isFasting
        ? "https://schema.org/VegetarianDiet"
        : undefined,
      inLanguage: "en",
      url: `${SITE_URL}/menu/${dish.slug}`,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
      </>
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
