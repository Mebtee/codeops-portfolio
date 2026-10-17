import DishCard from "@/app/menu/DishCard";

export default function DishList({ dishes }) {
  if (!dishes.length) {
    return <p className="no-results">No dishes in this category yet.</p>;
  }

  return (
    <div className="menu-grid">
      {dishes.map((dish) => (
        <DishCard key={dish.slug} dish={dish} />
      ))}
    </div>
  );
}
