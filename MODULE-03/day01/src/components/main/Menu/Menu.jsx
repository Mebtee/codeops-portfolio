import './Menu.css'
import Dish from '../../Dish/Dish'
import { dishs } from '../../Dish/dishs'
import foodImg from '../../../assets/food.jpg'

function Menu() {
  return (
    <section>
      <h1>Menu</h1>
      <div className="menu-grid">
        {dishs.map((dish) => (
          <Dish key={dish.id} name={dish.name} price={dish.price} image={foodImg} />
        ))}
      </div>
    </section>
  )
}

export default Menu
