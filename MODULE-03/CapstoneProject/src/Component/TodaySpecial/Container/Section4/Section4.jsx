import '../../TodaySpecial.css'; // page-level css lives one folder up
import { useCart } from '../../../../store/useCartStore';
import { fmt } from '../../../../data/dishes';

// Clay Je Buna ceremony info + Extra injera add-on card
function Section4() {
  const { addItem } = useCart();
  return (
    <section className="buna-sec">
      <div>
        <p
          className="kicker"
          style={{
            fontSize: 11,
            letterSpacing: 2,
            color: 'var(--gold)',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          ☕ AUTHENTIC CLAY JE BUNA CEREMONY
        </p>
        <h2>Every Day at 4:00 PM</h2>
        <p className="copy">
          Frankincense fills our courtyard as green Sidama beans are
          hand-roasted on iron, ground fresh, and brewed in traditional clay Je
          Buna pots. Served in three rounds — Abol, Tona, Baraka — with popcorn
          and ceremony.
        </p>
      </div>

      <article className="injera-card">
        <span className="badge gold">100% TEFF</span>
        <h3>Extra Teff Injera Rolls (Basket of 3)</h3>
        <p>
          Naturally gluten-friendly ancient grain, fermented 3 days for airy
          eyes and a gentle sour finish.
        </p>
        <div className="row">
          <b>{fmt(90)}</b>
          <button className="btn-red" onClick={() => addItem('injera-3')}>
            + Add Extra
          </button>
        </div>
      </article>
    </section>
  );
}

export default Section4;
