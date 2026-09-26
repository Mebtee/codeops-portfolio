import { Link } from 'react-router-dom';
import ImgBox from '../UI/ImgBox';
import { fmt } from '../../data/dishes';
import { useMenuData } from '../../api';
import { useCart } from '../../store/useCartStore';

export default function FeaturedDishes() {
  const { dishes, specials, loading, fromApi } = useMenuData();
  const { addItem } = useCart();

  // Prefer the curated specials list; fall back to the first dishes so the
  // section is never empty once the menu has loaded.
  const featured = (specials.length ? specials : dishes).slice(0, 6);

  return (
    <section className="featured" aria-labelledby="featured-title">
      <div className="section-inner">
        <header className="section-head">
          <div>
            <p className="section-kicker">Featured</p>
            <h2 id="featured-title" className="section-title">
              From Our Kitchen
            </h2>
            <p className="section-lede">
              Traditional Ethiopian flavors prepared with care and served with
              heart.
            </p>
          </div>
          <Link to="/menu" className="btn-ghost">
            View full menu
          </Link>
        </header>

        {loading ? (
          <p className="section-status">Loading the kitchen…</p>
        ) : featured.length === 0 ? (
          <div className="section-empty">
            <h3>No dishes to show yet</h3>
            <p>
              Our menu is being prepared. Please check back shortly, or call us
              to hear what is cooking today.
            </p>
          </div>
        ) : (
          <>
            {!fromApi && (
              <p className="section-status">
                Showing our offline menu. Reconnect to see live availability.
              </p>
            )}
            <ul className="dish-grid">
              {featured.map((dish) => (
                <li key={dish.id} className="dish-card">
                  <div className="dish-card-media">
                    <ImgBox
                      label={`${dish.name} photo`}
                      style={{ minHeight: 190, borderRadius: '14px 14px 0 0' }}
                    />
                    {dish.tag && <span className="dish-tag">{dish.tag}</span>}
                    {dish.isFasting && (
                      <span className="dish-tag fasting">Tsom</span>
                    )}
                  </div>
                  <div className="dish-card-body">
                    <div className="dish-card-head">
                      <h3>
                        <Link to={`/menu/${dish.id}`}>{dish.name}</Link>
                      </h3>
                      <b className="dish-price">{fmt(dish.price)}</b>
                    </div>
                    <p className="dish-desc">{dish.desc}</p>
                    <div className="dish-card-foot">
                      <small>{dish.servings}</small>
                      <button
                        type="button"
                        className="btn-red btn-sm"
                        onClick={() => addItem(dish.id)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
