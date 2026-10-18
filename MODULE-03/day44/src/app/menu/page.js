import { queryDishes } from "@/data/dishes";
import DishList from "@/components/DishList";
import SearchBox from "./SearchBox";

export const revalidate = 3600;

export const metadata = {
  title: "Menu",
  description:
    "Every dish on the Addis Eats menu — traditional wat, sizzling tibs, fasting plates, breakfast bites and tej.",
};

export default async function MenuPage() {
  const initial = await queryDishes({ page: 1 });

  return (
    <section>
      <SearchBox initial={initial}>
        <DishList dishes={initial.data} />
      </SearchBox>
    </section>
  );
}
