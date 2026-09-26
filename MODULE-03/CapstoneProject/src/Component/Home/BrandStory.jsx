import { Link } from 'react-router-dom';
import ImgBox from '../UI/ImgBox';
import { ArrowRightIcon, CoffeeIcon } from '../UI/icons';
import { FOOTER_BRAND } from '../../data/footerLinks';

export default function BrandStory() {
  return (
    <section className="story" aria-labelledby="story-title">
      <div className="story-inner">
        <div className="story-media">
          <ImgBox
            label="Injera and shared platters at Mesob House"
            style={{ minHeight: 380, borderRadius: 18 }}
          />
        </div>

        <div className="story-copy">
          <p className="section-kicker">Our Story</p>
          <h2 id="story-title" className="section-title">
            Gather Around the Mesob
          </h2>
          <p className="section-lede">
            At Mesob House, every meal is an invitation to connect. We bring
            the warmth of Ethiopian hospitality together with traditional
            flavors, shared plates, and memorable experiences.
          </p>
          <p className="section-body">
            Dining with us is unhurried by design. Platters arrive on warm
            injera, portions are made for the table rather than the
            individual, and a clay Jebena Buna is brewed in the courtyard while
            you settle in.
          </p>

          <div className="story-note">
            <CoffeeIcon size={22} />
            <div>
              <b>{FOOTER_BRAND.note}</b>
              <span>Served in three rounds — Abol, Tona, Baraka.</span>
            </div>
          </div>

          <Link to="/future" className="link-arrow">
            Our Story <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
