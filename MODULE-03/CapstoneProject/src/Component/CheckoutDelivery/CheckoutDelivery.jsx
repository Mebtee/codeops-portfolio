import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './CheckoutDelivery.css';
import ImgBox from '../UI/ImgBox';
import { useCartStore, selectCart } from '../../store/useCartStore';
import { fmt } from '../../data/dishes';

const schema = z.object({
  name: z.string().trim().min(2, 'Recipient name is required'),
  phone: z.string().regex(/^\d{9,10}$/, 'Enter a valid 9–10 digit mobile number'),
  email: z.string().email('Enter a valid email for the digital receipt'),
  subcity: z.string().min(1),
  street: z.string().trim().min(5, 'Enter your street, building and flat number'),
  landmark: z.string().trim().min(3, 'Add a landmark or gate instruction'),
  timing: z.enum(['immediate', 'schedule']),
  scheduleTime: z.string().optional(),
  payment: z.enum(['telebirr', 'cbe', 'cash', 'amole']),
  telebirrPhone: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.timing === 'schedule' && !data.scheduleTime?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['scheduleTime'], message: 'Choose a dispatch time' });
  }
  if (data.payment === 'telebirr' && !/^\d{9,10}$/.test(data.telebirrPhone || '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['telebirrPhone'], message: 'Enter a valid 9–10 digit Telebirr number' });
  }
});

const defaultValues = {
  name: 'Mohammed Yasin',
  phone: '911457890',
  email: 'mame.b@example.com',
  subcity: 'Bole Medhanialem (Near Mesob House)',
  street: 'Behind Edna Mall, House No. 402, 3rd Floor',
  landmark: 'Opposite to Boston Day Spa, entrance through dark green gate',
  timing: 'immediate',
  scheduleTime: '7:30 PM',
  payment: 'telebirr',
  telebirrPhone: '911457890',
};

function CheckoutDelivery() {
  const cart = useCartStore(useShallow(selectCart));
  const clearCart = useCartStore((state) => state.clearCart);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [placed, setPlaced] = useState(null);

  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  const payment = watch('payment');
  const timing = watch('timing');

  const handleVerify = async () => {
    const phone = watch('telebirrPhone');
    if (!/^\d{9,10}$/.test(phone || '')) {
      setError('telebirrPhone', { message: 'Enter a valid 9–10 digit Telebirr number' });
      return;
    }
    setVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setVerifying(false);
    setVerified(true);
    clearErrors('telebirrPhone');
  };

  const confirmOrder = async (data) => {
    if (data.payment === 'telebirr' && !verified) {
      setError('payment', { message: 'Please verify your Telebirr number first' });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
    const orderNo = `MH-${Date.now().toString().slice(-6)}`;
    clearCart();
    setPlaced({ orderNo, phone: data.phone });
    window.scrollTo(0, 0);
  };

  if (cart.count === 0 && !placed) {
    return (
      <main className="checkout-page">
        <div className="empty-cart">
          <h1>Your mesob is empty</h1>
          <p>Add dishes before continuing to delivery.</p>
          <Link to="/menu" className="btn-red">Explore the Menu →</Link>
        </div>
      </main>
    );
  }

  if (placed) {
    return (
      <main className="checkout-page">
        <div className="confirm-box">
          <span className="confirm-icon">🧺</span>
          <h1>Order Confirmed — Ameseginalehu!</h1>
          <p className="order-no">Order <b>{placed.orderNo}</b></p>
          <p className="confirm-copy">Your clay pots are being sealed now. Estimated arrival: <b>35–45 minutes</b>. A dispatcher SMS is on its way to +251 {placed.phone}.</p>
          <div className="confirm-actions">
            <Link to="/" className="btn-red">Return to Today's Specials</Link>
            <Link to="/menu" className="btn-ghost">Explore Full Menu</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-steps">
        <Link to="/orderCart" className="done">✓ STEP 1 · Review Order</Link>
        <span className="current">2 · Delivery & Payment</span>
        <span className="todo">3 · Confirmation</span>
      </div>

      <form onSubmit={handleSubmit(confirmOrder)} className="checkout-grid" noValidate>
        <div className="checkout-forms">
          <div className="mode-pills"><span className="pill active">🛵 Prompt Delivery across Addis</span><span className="pill">🍽 Dine-in Pickup (Bole)</span></div>

          <section className="form-card">
            <h2>🪪 1. Contact & Guest Details <span className="mini-badge">Habesha Hospitality</span></h2>
            <div className="two-col">
              <div className="field"><label>Recipient Name</label><input {...register('name')} />{errors.name && <span className="err">{errors.name.message}</span>}</div>
              <div className="field"><label>Phone (Calls & Telegram SMS)</label><div className="phone-wrap"><span className="prefix">🇪🇹 +251</span><input {...register('phone')} /></div>{errors.phone && <span className="err">{errors.phone.message}</span>}</div>
            </div>
            <div className="field"><label>Email for Digital Receipt</label><input {...register('email')} />{errors.email && <span className="err">{errors.email.message}</span>}</div>
          </section>

          <section className="form-card">
            <h2>📍 2. Delivery Location in Addis Ababa <span className="mini-badge">♨ Insulated Mesob Carrier</span></h2>
            <div className="two-col">
              <div className="field"><label>Sub-city / Neighborhood</label><select {...register('subcity')}><option>Bole Medhanialem (Near Mesob House)</option><option>Kazanchis</option><option>Sarbet</option><option>Old Airport</option><option>CMC</option></select></div>
              <div className="field"><label>Street, Building, Flat No.</label><input {...register('street')} />{errors.street && <span className="err">{errors.street.message}</span>}</div>
            </div>
            <div className="field"><label>Specific Landmark / Gate Instructions</label><input {...register('landmark')} />{errors.landmark && <span className="err">{errors.landmark.message}</span>}</div>
            <div className="field">
              <label>Desired Dispatch Timing</label>
              <div className="timing-row">
                <label className={timing === 'immediate' ? 'radio-card selected' : 'radio-card'}><input type="radio" value="immediate" {...register('timing')} /><span><b>Immediate Dispatch</b><small>Fresh & hot off clay stove (~35–45 min)</small></span></label>
                <label className={timing === 'schedule' ? 'radio-card selected' : 'radio-card'}><input type="radio" value="schedule" {...register('timing')} /><span><b>Schedule for Dinner</b><small>Set for evening feast</small></span></label>
              </div>
              {timing === 'schedule' && <><input style={{ marginTop: 10, maxWidth: 220 }} {...register('scheduleTime')} placeholder="e.g., 7:30 PM" />{errors.scheduleTime && <span className="err">{errors.scheduleTime.message}</span>}</>}
            </div>
            <div className="route-banner">🛵 <b>Direct Kitchen-to-Door Route</b><small>Dispatched with heated earthen tray covers</small><span>Bole Zone Priority</span></div>
          </section>

          <section className="form-card">
            <h2>💳 3. Payment Method <span className="mini-badge">Encrypted & Direct</span></h2>
            <label className={payment === 'telebirr' ? 'radio-card selected' : 'radio-card'}><input type="radio" value="telebirr" {...register('payment')} onChange={() => { setValue('payment', 'telebirr'); setVerified(false); }} /><span className="pay-title"><b>Telebirr (ቴሌብር)</b><small>Instant SuperApp QR prompt or USSD confirmation</small></span></label>
            {payment === 'telebirr' && <div className="telebirr-box"><p><b>Telebirr Quick Merchant Pay</b></p><p className="tb-sub">Merchant ID: MESOB-7781. Enter your registered phone to authorize instant debit.</p><div className="tb-row"><input {...register('telebirrPhone')} onChange={(e) => { setValue('telebirrPhone', e.target.value); setVerified(false); clearErrors('payment'); }} placeholder="0911 234 567" /><button type="button" className="btn-red" onClick={handleVerify} disabled={verifying || verified}>{verified ? '✓ Verified' : verifying ? 'Verifying…' : 'Verify'}</button></div>{errors.telebirrPhone && <span className="err">{errors.telebirrPhone.message}</span>}{errors.payment && <span className="err">{errors.payment.message}</span>}</div>}
            {[['cbe','CBE','CBE Birr / CBE Mobile Banking'],['cash','POS','Cash or Card on Delivery'],['amole','AB','Amole / Awash Birr']].map(([key, logo, name]) => <label key={key} className={payment === key ? 'radio-card selected' : 'radio-card'} style={{ marginTop: 10 }}><input type="radio" value={key} {...register('payment')} onChange={() => { setValue('payment', key); setVerified(false); clearErrors('payment'); }} /><span className="pay-logo">{logo}</span><span><b>{name}</b><small>Secure settlement option</small></span></label>)}
          </section>
          <div className="promise">🍽 <b>The Mesob House Promise</b><p>Every communal platter arrives with extra pure teff injera, warm wet towels, and Mitmita spice on the side.</p></div>
        </div>

        <aside className="summary">
          <p className="kicker">HABESHA FEAST</p><div className="summary-head"><h2>Order Summary</h2><Link to="/orderCart" className="link-btn">Edit Cart</Link></div>
          {cart.items.map((item) => <div className="summary-item" key={item.id + (item.option || '')}><ImgBox label={item.name} style={{ minHeight: 54, width: 54, borderRadius: 8 }} /><div><b>{item.name}</b>{item.option && <small>{item.option}</small>}<small>Qty: {item.qty}</small></div><b className="line-price">{fmt(item.lineTotal)}</b></div>)}
          <div className="deliver-to"><small>📍 DELIVERING TO · 🟢 Active Corridor</small><b>{watch('subcity').split(' (')[0]}, Edna Mall area</b><span>Estimated arrival: ~35–45 mins</span></div>
          <div className="ledger-line"><span>Items Subtotal</span><b>{fmt(cart.subtotal)}</b></div>
          <div className="ledger-line"><span>Express Delivery</span><b className={cart.delivery === 0 ? 'free' : ''}>{cart.delivery === 0 ? 'FREE' : fmt(cart.delivery)}</b></div>
          <div className="ledger-line"><span>Clay Stew Thermal Packaging</span><b>{cart.packaging === 0 ? 'FREE' : fmt(cart.packaging)}</b></div>
          <div className="ledger-line"><span>City VAT (15%)</span><b>{fmt(cart.vat)}</b></div>
          {cart.coupon && <div className="ledger-line"><span>🎟 {cart.coupon}</span><b>− {fmt(cart.discount)}</b></div>}
          <div className="grand-row"><div><small>GRAND TOTAL</small><b>Grand Total</b></div><b className="grand">{fmt(cart.grand)}</b></div>
          <button className="btn-red checkout-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Confirming Order...' : 'Confirm & Place Order →'}</button>
        </aside>
      </form>
    </main>
  );
}

export default CheckoutDelivery;
