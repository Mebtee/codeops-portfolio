import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CurrentOrderCart.css';
import ImgBox from '../UI/ImgBox';
import { useCart, COUPON_CODE } from '../../store/useCartStore';
import { fmt } from '../../data/dishes';

function CurrentOrderCart() {
  const cart = useCart();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null); // {ok, text}

  const handleApply = () => {
    const res = cart.applyCoupon(code);
    setCouponMsg(
      res.ok
        ? {
            ok: true,
            text: `✓ ${COUPON_CODE} applied — ETB 200 off your feast.`,
          }
        : { ok: false, text: '✗ Invalid coupon code. Try GURSHA2025.' }
    );
  };

  return (
    <main className="cart-page">
      <p className="kicker">🍲 COMMUNAL FEASTING</p>
      <div className="cart-head">
        <h1>Your Gursha Basket</h1>
        <div className="steps">
          <span className="step active">1 · Review Basket</span> /
          <span className="step">2 · Delivery Details</span> /
          <span className="step">3 · Confirmation</span>
        </div>
      </div>

      <div className="free-bar">
        🛵 <b>Free Highland Delivery:</b> Complimentary delivery across Bole,
        Kazanchis, and Sarbet on orders over {fmt(1200)}!
        <span className={cart.freeDelivery ? 'unlock yes' : 'unlock'}>
          {cart.freeDelivery
            ? '✓ THRESHOLD UNLOCKED'
            : `Add ${fmt(1200 - cart.subtotal)} more to unlock`}
        </span>
      </div>

      {cart.count === 0 ? (
        <div className="empty-cart">
          <h2>Your mesob is empty</h2>
          <p>Add some handcrafted wats before checkout.</p>
          <Link
            to="/menu"
            className="btn-red"
            style={{
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: 16,
            }}
          >
            Explore the Menu →
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <section className="cart-items">
            <div className="items-head">
              <h2>
                Clay Pot Stews & Provisions{' '}
                <small>({cart.count} handcrafted selections)</small>
              </h2>
              <button className="link-btn" onClick={cart.clearCart}>
                ♺ Clear Table
              </button>
            </div>

            {cart.items.map((i) => (
              <article className="cart-item" key={i.id + (i.option || '')}>
                <ImgBox
                  label={i.name + ' photo'}
                  style={{ minHeight: 90, width: 110 }}
                />
                <div className="item-info">
                  <h3>{i.name}</h3>
                  {i.option && <span className="item-opt">{i.option}</span>}
                  <span className="item-unit">{fmt(i.unitPrice)} each</span>
                </div>
                <div className="item-controls">
                  <b>{fmt(i.lineTotal)}</b>
                  <div className="stepper">
                    <button
                      onClick={() => cart.updateQty(i.id, i.option, i.qty - 1)}
                    >
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button
                      onClick={() => cart.updateQty(i.id, i.option, i.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="trash"
                    title="Remove"
                    onClick={() => cart.removeItem(i.id, i.option)}
                  >
                    🗑
                  </button>
                </div>
              </article>
            ))}

            <div className="etiquette">
              <h3>🫱 Gursha Hospitality & Dining Etiquette</h3>
              <div className="etiquette-grid">
                <div>
                  <b>🟥 Include Traditional Handwash Basin</b>
                  <p>
                    Scented warm lemon towels and hand-rinsing urn presentation.
                  </p>
                </div>
                <div>
                  <b>🟥 No Cutlery Needed (True Gursha)</b>
                  <p>
                    We embrace the communal joy of eating with fresh Injera
                    rolls.
                  </p>
                </div>
              </div>
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label>
                Kitchen Chef Note / Injera Separation Preference{' '}
                <span style={{ textTransform: 'none' }}>(Optional)</span>
              </label>
              <textarea
                rows="3"
                placeholder="E.g., Please wrap extra Teff rolls in heat-retaining gold foil separately from the Doro Wat pot..."
                value={cart.orderNote}
                onChange={(e) => cart.setOrderNote(e.target.value)}
              />
            </div>
          </section>

          {/* ---------- ledger ---------- */}
          <aside className="ledger">
            <div className="ledger-head">
              <h2>Basket Ledger</h2>
              <span className="badge gold">Birr (ETB)</span>
            </div>

            <div className="ledger-line">
              <span>Items Subtotal ({cart.count} items)</span>
              <b>{fmt(cart.subtotal)}</b>
            </div>
            <div className="ledger-line">
              <span>Insulated Traditional Clay-Pak</span>
              <b>{fmt(cart.packaging)}</b>
            </div>
            <div className="ledger-line">
              <span>🛵 Delivery Fee (Bole Zone)</span>
              <b className={cart.delivery === 0 ? 'free' : ''}>
                {cart.delivery === 0 ? 'FREE' : fmt(cart.delivery)}
              </b>
            </div>
            <div className="ledger-line">
              <span>City VAT & Tourism Levy (15%)</span>
              <b>{fmt(cart.vat)}</b>
            </div>

            {cart.coupon && (
              <div className="ledger-line discount">
                <span>🎟 {cart.coupon} APPLIED</span>
                <b>− {fmt(cart.discount)}</b>
              </div>
            )}

            <div className="coupon-row">
              <input
                placeholder="Have another coupon code?"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCouponMsg(null);
                }}
              />
              <button className="btn-ghost" onClick={handleApply}>
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={couponMsg.ok ? 'coupon-msg ok' : 'coupon-msg bad'}>
                {couponMsg.text}
              </p>
            )}

            <div className="grand-row">
              <div>
                <small>GRAND TOTAL</small>
                <b>Grand Total</b>
              </div>
              <b className="grand">{fmt(cart.grand)}</b>
            </div>
            <small className="tax-note">Taxes included</small>

            <button
              className="btn-red proceed"
              onClick={() => navigate('/Delibery')}
            >
              Proceed to Delivery Checkout →
            </button>
            <Link to="/menu" className="back-link">
              🍴 Explore more dishes from our Menu
            </Link>

            <ul className="ledger-perks">
              <li>🔥 Piping Warm Delivery in woven Mesob packaging</li>
              <li>💳 Telebirr, CBE Birr, Cash & Card on delivery</li>
              <li>🔒 Encrypted checkout & real-time dispatcher SMS</li>
            </ul>
          </aside>
        </div>
      )}

      <div className="meaning">
        <b>💛 The Meaning of Gursha (ጉርሻ)</b>
        <p>
          In Habesha dining culture, placing a savory morsel directly into a
          companion's mouth with love cements friendship, trust, and shared
          celebration. Every platter at Mesob House is prepared ready for
          Gursha.
        </p>
      </div>
    </main>
  );
}

export default CurrentOrderCart;
