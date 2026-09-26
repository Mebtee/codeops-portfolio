import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './Signup.css';
import { useAuthStore } from '../../store/useAuthStore';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  phone: z
    .string()
    .regex(/^\d{9}$/, 'Enter a 9-digit Ethiopian mobile number (e.g. 911234567)'),
});

export default function Signup() {
  const login = useAuthStore((state) => state.login);
  const [joined, setJoined] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '' },
  });

  const onSubmit = async (data) => {
    login({ name: data.name.trim(), phone: data.phone });
    await new Promise((resolve) => setTimeout(resolve, 700));
    setJoined({ name: data.name.trim(), phone: data.phone });
  };

  return (
    <main className="signup-page">
      <div className="signup-grid">
        <aside className="signup-side">
          <span className="badge gold">MEMBER CIRCLE</span>
          <h1>Become an Honored Table Guest</h1>
          <p className="side-copy">
            Immerse yourself in authentic highland hospitality, where every
            shared meal honors community, connection, and craft.
          </p>

          <div className="gift-card">
            <b>🍷 Welcome Gift: Pure Tej or Buna</b>
            <p>
              Enjoy a complimentary flask of house-fermented Tej (honey wine)
              or a personalized Jebena Buna coffee ceremony with your inaugural
              banquet booking.
            </p>
          </div>

          <ul className="perk-list">
            <li>
              <b>🥇 Communal Gursha Points</b>
              <span>
                Earn generous loyalty points redeemable for hand-poured pure
                Teff injera and banquet upgrades.
              </span>
            </li>
          </ul>
        </aside>

        <section className="signup-card">
          <h2>Create Your Mesob House Account</h2>
          <p className="auth-sub">
            Join our culinary heritage circle in less than a minute.
          </p>

          <div className="social-row">
            <button type="button" className="social-btn">
              💛 Telebirr Quick Sign
            </button>
            <button type="button" className="social-btn">
              🇬 Continue with Google
            </button>
          </div>

          <p className="divider">——— Or register with your details ———</p>

          {joined ? (
            <div className="welcome-msg">
              <p>🎉 Account created! Welcome to the table, {joined.name}.</p>
              <p className="joined-next">
                We sent a 4-digit code to +251 {joined.phone}. Enter it to
                finish verifying your number.
              </p>
              <Link to="/menu" className="btn-ghost">
                Explore the Menu
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="field">
                <label htmlFor="join-name">Full Name (ሙሉ ስም)</label>
                <input
                  id="join-name"
                  {...register('name')}
                  placeholder="eg. Abebe Bikila or Genet Tadesse"
                />
                {errors.name && <span className="err">{errors.name.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="join-phone">
                  Ethiopian Mobile Number (ስልክ ቁጥር)
                </label>
                <div className="phone-wrap">
                  <span className="prefix">🇪🇹 +251</span>
                  <input
                    id="join-phone"
                    inputMode="numeric"
                    maxLength={9}
                    {...register('phone')}
                    placeholder="911234567"
                  />
                </div>
                {errors.phone && (
                  <span className="err">{errors.phone.message}</span>
                )}
                <small className="hint">
                  We will send a 4-digit code to verify your Ethiopian mobile
                  number.
                </small>
              </div>

              <button
                className="btn-red auth-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Join the Mesob Family'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Already part of our dining family? <Link to="/login"><b>Sign in here</b></Link>
          </p>
        </section>
      </div>
    </main>
  );
}
