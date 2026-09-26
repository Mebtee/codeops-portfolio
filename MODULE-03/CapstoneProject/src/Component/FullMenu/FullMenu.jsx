import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './FullMenu.css';
import ImgBox from '../UI/ImgBox';
import { CATEGORIES, fmt } from '../../data/dishes';
import { useCart } from '../../store/useCartStore';
import { useMenuData } from '../../api';

function FullMenu() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const { addItem, count, subtotal } = useCart();
  const { dishes, loading } = useMenuData();

  const visible = dishes.filter((d) => {
    const matchCat = cat === 'all' || d.cat === cat;
    const matchText = d.name.toLowerCase().includes(query.toLowerCase());
    // console.log(d)
    return matchCat && matchText;
  });

  const countFor = (key) =>
    key === 'all' ? dishes.length : dishes.filter((d) => d.cat === key).length;

  return (
    <main className="menu-page">
      <header className="menu-head">
        <p className="kicker">🌶 HANDCRAFTED GONDAR & ADDIS SPICES</p>
        <h1>Our Complete Culinary Heritage</h1>
        <p className="sub">
          Every dish is prepared daily from scratch using sun-dried spices,
          stone-ground legume flours, and clarified herbal butter sourced
          directly from highland farm cooperatives.
        </p>

        <div className="menu-tools">
          <input
            className="menu-search"
            placeholder="Search dishes by name (e.g. Kitfo, Shiro, Tibs, Doro Wat)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="menu-tags">
            <span>🌾 100% Pure Teff Injera</span>
            <span>🌿 Fasting / Tsom Friendly</span>
            <span>🌶 Berbere Spiced</span>
          </div>
        </div>

        <div className="menu-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={cat === c.key ? 'chip active' : 'chip'}
              onClick={() => setCat(c.key)}
            >
              {c.label} ({countFor(c.key)})
            </button>
          ))}
        </div>
      </header>

      <section className="menu-grid">
        {visible.map((d) => (
          <article className="menu-card" key={d.id}>
            <div className="menu-card-img">
              <ImgBox
                label={d.name + ' photo'}
                style={{ minHeight: 170, borderRadius: '12px 12px 0 0' }}
              />
              <span className="badge menu-tag">{d.tag}</span>
              <span className="spice-chip">🌶 {d.spice}</span>
            </div>
            <div className="menu-card-body">
              <div className="menu-card-title">
                <h3>
                  <Link to={d.id}>{d.name}</Link>
                </h3>
                <b>{fmt(d.price)}</b>
              </div>
              <p className="menu-desc">{d.desc}</p>
              <button className="btn-red add-btn" onClick={() => addItem(d.id)}>
                + Add
              </button>
            </div>
          </article>
        ))}
        {!loading && visible.length === 0 && (
          <p className="no-results">
            No dishes match “{query}”. Try another name.
          </p>
        )}
      </section>

      <div className="menu-cart-bar">
        <span>
          🧺 Selected: <b>{count} items</b> · {fmt(subtotal)}
        </span>
        <Link to="/orderCart" className="btn-red bar-btn">
          Proceed to Cart →
        </Link>
      </div>
    </main>
  );
}

export default FullMenu;
