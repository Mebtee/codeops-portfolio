import { Link } from 'react-router-dom';
import ImgBox from '../UI/ImgBox';
import { ArrowRightIcon } from '../UI/icons';
import { useMenuData } from '../../api';

export default function Hero() {
  const { dishes } = useMenuData();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-kicker">Addis Ababa · Bole Medhanialem</p>
          <h1 id="hero-title" className="hero-title">
            Experience the Heart of Ethiopian Hospitality
          </h1>
          <p className="hero-sub">
            Traditional flavors, generous hospitality, and unforgettable
            moments — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn-red hero-btn">
              Explore Our Menu <ArrowRightIcon />
            </Link>
            <a href="#visit" className="btn-ghost hero-btn">
              Reserve a Table
            </a>
          </div>
          <ul className="hero-facts">
            <li>
              <b>{dishes.length}</b>
              <span>Dishes on the menu</span>
            </li>
            <li>
              <b>4:00 PM</b>
              <span>Daily clay Jebena Buna</span>
            </li>
            <li>
              <b>Tsom</b>
              <span>Fasting &amp; vegan friendly</span>
            </li>
          </ul>
        </div>

        <div className="hero-media">
          <ImgBox
            label="Mesob House communal dining"
            style={{ minHeight: 460, borderRadius: 18 }}
          />
          <div className="hero-media-note">
            <b>Gursha</b>
            <span>Every platter arrives ready for sharing.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
