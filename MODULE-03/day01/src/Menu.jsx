import { useState, useMemo } from "react";
import useFetch from "./hooks/useFetch";
import { useCart } from "./cart/useCart";
import Dish from "./components/Dish/Dish";
import Card from "./components/Card/Card";
import CategoryBar from "./components/main/CategoryBar/CategoryBar";
import "./components/main/Menu/Menu.css";
import foodImg from "./assets/food.jpg";

function Menu() {
  const { data: dishs, loading, error } = useFetch("/menu.json");
  const [category, setCategory] = useState("all");
  const { items, dispatch, totalPrice } = useCart();

  const categories = useMemo(() => {
    if (!dishs) return [];
    return ["all", ...new Set(dishs.map((dish) => dish.category))];
  }, [dishs]);

  const filtered = useMemo(() => {
    if (!dishs) return [];
    if (category === "all") return dishs;
    return dishs.filter((dish) => dish.category === category);
  }, [dishs, category]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  function handleAdd(dish) {
    dispatch({ type: "add", payload: dish });
  }

  function handleRemove(dish) {
    dispatch({ type: "remove", payload: dish });
  }

  function handleClear() {
    dispatch({ type: "clear" });
  }

  if (loading) return <p style={{ textAlign: "center" }}>Loading menu...</p>;
  if (error) return <p style={{ textAlign: "center" }}>Error: {error}</p>;

  return (
    <section>
      <h1>
        Menu
        {itemCount > 0 && (
          <span
            style={{
              marginLeft: "12px",
              background: "#fff",
              color: "green",
              borderRadius: "999px",
              padding: "2px 12px",
              fontSize: "0.9rem",
              fontWeight: "bold",
            }}
          >
            {itemCount} {itemCount === 1 ? "item" : "items"} in cart
          </span>
        )}
      </h1>

      <CategoryBar
        categories={categories}
        selected={category}
        onSelect={setCategory}
      />

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
              onAdd={() => handleAdd(dish)}
            />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <Card>
          <div className="cart-checkout">
            <h2>Cart</h2>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>
                    {item.currency || "ETB"}{" "}
                    {(item.price * item.quantity).toFixed(0)}
                  </span>
                  <button type="button" onClick={() => handleRemove(item)}>
                    -
                  </button>
                  <button type="button" onClick={() => handleAdd(item)}>
                    +
                  </button>
                </li>
              ))}
            </ul>
            <p>
              <strong>Total: ETB {totalPrice}</strong>
            </p>
            <button type="button" onClick={handleClear}>
              Clear Cart
            </button>
          </div>
        </Card>
      )}
    </section>
  );
}

export default Menu;
