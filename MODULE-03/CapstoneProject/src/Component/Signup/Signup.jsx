import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './Signup.css';
import { useAuthStore } from '../../store/useAuthStore';

const PREFERENCES = [
  'All Heritage Delicacies',
  'Fasting & Vegan (Tsom)',
  'Halal Certified Meat',
  '100% Pure Teff (Gluten-Free)',
];

const schema = z.object({
  name: z.string().trim().min(3, 'Please enter your full name'),
  phone: z.string().regex(/^\d{9}$/, 'Enter a 9-digit mobile number (e.g., 912345678)'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string(),
  pref: z.string(),
  terms: z.boolean().refine((value) => value, 'You must agree to the Hospitality Terms'),
}).refine((data) => data.confirm === data.password, {
  path: ['confirm'],
  message: 'Passwords do not match',
});

function Signup() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', email: '', password: '', confirm: '', pref: PREFERENCES[0], terms: false },
  });
  const pref = watch('pref');
  const password = watch('password');

  const onSubmit = async (data) => {
    setDone(true);
    login({ name: data.name, phone: data.phone, email: data.email });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    navigate('/');
  };

  return (
    <main className="signup-page">
      <p className="crumbs">/ Account / <b>Join the Mesob Family</b></p>
      <div className="signup-grid">
        <aside className="signup-side">
          <span className="badge gold">🍷 · MEMBER CIRCLE</span>
          <h1>Become an Honored Table Guest</h1>
          <p className="side-copy">Immerse yourself in authentic highland hospitality, where every shared meal honors community, connection, and craft.</p>
          <div className="gift-card"><b>🍷 Welcome Gift: Pure Tej or Buna</b><p>Enjoy a complimentary flask of house-fermented Tej or a personalized Je Buna coffee ceremony with your inaugural banquet booking.</p></div>
          <ul className="perk-list">
            <li>🥇 <b>Communal Gursha Points</b><span>Earn generous loyalty points redeemable for hand-poured pure Teff injera and banquet upgrades.</span></li>
            <li>🔔 <b>Fasting Calendar Alerts</b><span>Timely seasonal notifications for Tsom fasting periods and lenten specialties.</span></li>
            <li>🛵 <b>Express Addis Delivery</b><span>Save Bole, Kazanchis, Old Airport, or Sarbet drop-offs for fast delivery.</span></li>
            <li>🪑 <b>Priority Mesob Table Reservations</b><span>Skip standard waitlists for weekend live Kirar acoustic sets.</span></li>
          </ul>
          <p className="proverb">"Sharing from the same mesob is the ancient covenant of love and trust."<br /><b>— HABESHA PROVERB</b></p>
        </aside>

        <section className="signup-card">
          <h2>Create Your Mesob House Account</h2>
          <p className="auth-sub">Join our culinary heritage circle in less than a minute.</p>
          <div className="social-row">
            <button type="button" className="social-btn">💛 Telebirr Quick Sign</button>
            <button type="button" className="social-btn">🇬 Continue with Google</button>
          </div>
          <p className="divider">——— Or register with your details ———</p>

          {done ? (
            <p className="welcome-msg">🎉 Account created! Welcome to the table.</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="field"><label>Full Name (ሙሉ ስም)</label><input {...register('name')} placeholder="e.g. Mohammed, Mekbib" />{errors.name && <span className="err">{errors.name.message}</span>}</div>
              <div className="field"><label>Ethiopian Mobile Number (ስልክ ቁጥር)</label><div className="phone-wrap"><span className="prefix">📱 +251</span><input {...register('phone')} placeholder="911 234 567" /></div>{errors.phone && <span className="err">{errors.phone.message}</span>}</div>
              <div className="field"><label>Email Address</label><input type="email" {...register('email')} placeholder="guest@mesobhouse.com" />{errors.email && <span className="err">{errors.email.message}</span>}</div>
              <div className="two">
                <div className="field"><label>Password</label><input type="password" {...register('password')} placeholder="Minimum 8 characters" />{errors.password && <span className="err">{errors.password.message}</span>}<small className="hint">{password.length >= 8 ? '✓ 8+ chars' : '· · · · · · · · 8+ chars'}</small></div>
                <div className="field"><label>Confirm Password</label><input type="password" {...register('confirm')} placeholder="Repeat password" />{errors.confirm && <span className="err">{errors.confirm.message}</span>}</div>
              </div>
              <div className="field">
                <label>Primary Dining Preference (Optional)</label>
                <small className="hint" style={{ marginBottom: 8 }}>Helps our chefs customize your banquet platters.</small>
                <div className="pref-chips">{PREFERENCES.map((item) => <button type="button" key={item} className={pref === item ? 'chip active' : 'chip'} onClick={() => setValue('pref', item, { shouldValidate: true })}>{item}</button>)}</div>
              </div>
              <label className="terms-row"><input type="checkbox" {...register('terms')} /><span>I agree to the Mesob House Hospitality Terms and Privacy Guidelines.</span></label>
              {errors.terms && <span className="err" style={{ display: 'block', marginBottom: 8 }}>{errors.terms.message}</span>}
              <button className="btn-red auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating Account...' : 'Create Account & Receive Welcome Gursha →'}</button>
            </form>
          )}
          <p className="auth-switch">Already part of our dining family? <Link to="/login"><b>Sign in here</b></Link></p>
        </section>
      </div>
    </main>
  );
}

export default Signup;
