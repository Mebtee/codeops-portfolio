import './NotFound404.css'

import { Link, useNavigate } from 'react-router-dom';
import './NotFound404.css';
import ImgBox from '../UI/ImgBox';
import { useCart } from '../../store/useCartStore';
import { useMenuData } from '../../api';
import { fmt } from '../../data/dishes';

const FAV_IDS = ['doro-wat', 'siga-derek-tibs', 'shiro-tegamino'];

function NotFound404() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { dishes } = useMenuData();

  const favorites = FAV_IDS.map((id) => dishes.find((d) => d.id === id)).filter(
    Boolean
  );

  const orderNow = (id) => {
    addItem(id);
    navigate('/orderCart');
  };

  return (
    <main className="nf-page">
      <div className="nf-hero">
        <div className="empty-mesob">
          <ImgBox
            label="Empty Mesob"
            style={{ minHeight: 130, width: 130, borderRadius: '50%' }}
          />
        </div>
        <h1 className="nf-code">404</h1>
        <p className="nf-title">TABLE NOT SET · ERROR</p>
        <p className="nf-msg">
          Looks like this dish has already been enjoyed or never made it to the
          kitchen!
        </p>
        <p className="nf-sub">
          Even the best Gursha sometimes slips! Don't let your appetite wait —
          our Addis kitchen has hot clay pot wats and freshly rolled teff injera
          ready for your table right now.
        </p>
        <div className="nf-actions">
          <Link to="/" className="btn-red" style={{ textDecoration: 'none' }}>
            🍴 Return to Today's Specials
          </Link>
          <Link
            to="/menu"
            className="btn-ghost"
            style={{ textDecoration: 'none' }}
          >
            📖 Explore Full Menu
          </Link>
          <Link
            to="/orderCart"
            className="btn-ghost"
            style={{ textDecoration: 'none' }}
          >
            🧺 Check Current Order
          </Link>
        </div>
      </div>

      <section className="nf-favs">
        <div className="nf-favs-head">
          <div>
            <p className="kicker">🍲 HOUSE FAVORITES</p>
            <h2>Hungry? Here's What Our Guests Love Today</h2>
          </div>
          <Link to="/menu" className="view-all">
            View all dishes →
          </Link>
        </div>
        <div className="nf-grid">
          {favorites.map((f) => (
            <article className="nf-card" key={f.id}>
              <div className="nf-card-img">
                <ImgBox
                  label={f.name + ' photo'}
                  style={{ minHeight: 150, borderRadius: '12px 12px 0 0' }}
                />
                <span className="badge nf-tag">
                  {f.isFasting ? '🌿 ' : ''}
                  {f.tagline || f.tag}
                </span>
              </div>
              <div className="nf-card-body">
                <div className="nf-card-title">
                  <h3>{f.name}</h3>
                  <b>{fmt(f.price)}</b>
                </div>
                <p>{f.desc}</p>
                <div className="nf-card-foot">
                  <small>{f.servings}</small>
                  <button className="btn-ghost" onClick={() => orderNow(f.id)}>
                    Order Now +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default NotFound404;
