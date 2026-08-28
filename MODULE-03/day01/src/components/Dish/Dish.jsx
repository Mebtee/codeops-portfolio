import PropTypes from "prop-types";
import Card from "../Card/Card";
import "./Dish.css";

function Dish({ name, price, spicy, image, currency }) {
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
};

Dish.defaultProps = {
  currency: "$",
};

export default Dish;
