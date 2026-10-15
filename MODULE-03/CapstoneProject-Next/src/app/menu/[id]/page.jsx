import RoyalDish from "@/Component/RoyalDish/RoyalDish";
import { getDishBySlug, getMenuSlugs } from "@/lib/dishes-server";

export function generateStaticParams() {
  return getMenuSlugs().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = getDishBySlug(id);
  return { title: `${dish?.name || id} — Mesob House` };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = getDishBySlug(id);
  return <RoyalDish initialDish={dish} />;
}
