import { useState } from "react";
import "./Menu.css";
import CategoryBar from "../CategoryBar/CategoryBar";
import OrderForm from "../OrderForm/OrderForm";
import Dish from "../../Dish/Dish";
import { dishs } from "../../Dish/dishs";
import foodImg from "../../../assets/food.jpg";

function Menu() {
  const [category, setCategory] = useState("all");
  const [total, setTotal] = useState(0);

  console.log("Menu state:", { category, total });

  const filtered =
    category === "all"
      ? dishs
      : dishs.filter((dish) => dish.category === category);

  function handleAdd(price) {
    setTotal((prev) => prev + price);
  }

  return (
    <section>
      <h1>Menu</h1>

      <CategoryBar selected={category} onSelect={setCategory} />

      <div className="menu-total">
        Order Total: <strong>{total} ETB</strong>
      </div>

      {filtered.length === 0 ? (
        <p className="menu-empty">
          No dishes found in the &ldquo;{category}&rdquo; category.
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
              onAdd={handleAdd}
            />
          ))}
        </div>
      )}

      <OrderForm />
    </section>
  );
}

export default Menu;
