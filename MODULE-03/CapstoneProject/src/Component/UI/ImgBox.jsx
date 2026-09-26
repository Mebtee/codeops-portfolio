import foodPhoto from '../../assets/food.jpg';

// Dish photo frame used by the menu, dish detail, cart, and checkout.
// `label` supplies the alt text; `style` still overrides sizing and radius.
function ImgBox({ label = 'dish photo', style }) {
  return (
    <div className="img-box" style={style}>
      <img src={foodPhoto} alt={label} />
    </div>
  );
}

export default ImgBox;
