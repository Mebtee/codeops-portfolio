import { useState } from "react";
import PropTypes from "prop-types";
import Card from "../Card/Card";
import "./Dish.css";

function Dish({ name, price, spicy, image, currency, onAdd }) {
  const [count, setCount] = useState(0);

  function handleAdd() {
    const nextCount = count + 1;
    setCount(nextCount);
    if (onAdd) onAdd(price);
  }

  return (
    <Card>
      <div className="menu-card">
        {image && <img className="menu-card-img" src={image} alt={name} />}
        <div className="menu-card-body">
          <h3>{name}</h3>
          <p>
            {currency} {price}
          </p>
          {typeof spicy === "boolean" && spicy && (
            <span className="dish-spicy">🌶️ Spicy</span>
          )}
          <button type="button" onClick={handleAdd}>
            Add
          </button>
          {count > 0 && <p className="dish-count">Added: {count}</p>}
        </div>
      </div>
    </Card>
  );
}

Dish.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  spicy: PropTypes.bool,
  image: PropTypes.string,
  currency: PropTypes.string,
  onAdd: PropTypes.func,
};

Dish.defaultProps = {
  currency: "$",
  onAdd: () => {},
};

export default Dish;
