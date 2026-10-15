import { getDishes } from "@/data/dishes";
import CategoryBar from "./CategoryBar";
import DishList from "@/components/DishList";

export const revalidate = 3600;

export const metadata = {
  title: "Menu — Addis Eats",
};

export default async function MenuPage() {
  const dishes = await getDishes();

  return (
    <section>
      <CategoryBar>
        <DishList dishes={dishes} />
      </CategoryBar>
    </section>
  );
}
