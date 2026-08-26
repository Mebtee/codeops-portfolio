import './Dish.css'

function Dish({ name, price, image }) {
  return (
    <div className="menu-card">
      {image && <img className="menu-card-img" src={image} alt={name} />}
      <div className="menu-card-body">
        <h3>{name}</h3>
        <p>{price} ETB</p>
      </div>
    </div>
  )
}

export default Dish
