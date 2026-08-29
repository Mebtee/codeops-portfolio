import "./CategoryBar.css";
import { dishs } from "../../Dish/dishs";

const categories = [
  "all",
  ...new Set(dishs.map((dish) => dish.category)),
];

function CategoryBar({ selected, onSelect }) {
  return (
    <div className="category-bar">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`category-chip${category === selected ? " active" : ""}`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryBar;
