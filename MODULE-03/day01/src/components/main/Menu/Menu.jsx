import "./Menu.css";
import Dish from "../../Dish/Dish";
import { dishs } from "../../Dish/dishs";
import foodImg from "../../../assets/food.jpg";

const currentCategory = "mains";

function Menu() {
  const filtered = dishs.filter((dish) => dish.category === currentCategory);

  return (
    <section>
      <h1>Menu — {currentCategory}</h1>

      {filtered.length === 0 ? (
        <p className="menu-empty">
          No dishes found in the &ldquo;{currentCategory}&rdquo; category.
        </p>
      ) : (
        <div className="menu-grid">
          {filtered.map((dish) => (
            <Dish
              key={dish.id}
              name={dish.name}
              price={dish.price}
              spicy={dish.spicy}
              image={foodImg}
              currency="ETB"
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Menu;
