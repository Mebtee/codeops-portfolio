import './Menu.css'
import Dish from '../../Dish/Dish'
import { dishs } from '../../Dish/dishs'
import heroImg from '../../../assets/food.jpg'

function Menu() {
  return (
    <section>
      <div className="menu-grid">
        {dishs.map((dish) => (
          <Dish key={dish.id} name={dish.name} price={dish.price} image={heroImg} />
        ))}
      </div>
    </section>
  )
}

export default Menu
