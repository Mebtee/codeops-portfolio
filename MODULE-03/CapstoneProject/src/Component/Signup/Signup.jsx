import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './Signup.css';
import ImgBox from '../UI/ImgBox';
import {
  CoffeeIcon,
  HeartIcon,
  ClockIcon,
  TruckIcon,
  GatherIcon,
  PhoneIcon,
  GoogleIcon,
} from '../UI/icons';
import { useAuthStore } from '../../store/useAuthStore';

const BENEFITS = [
  {
    Icon: CoffeeIcon,
    title: 'Welcome Gift: Pure Tej or Buna',
    body: 'Enjoy a complimentary flask of house-fermented Tej (or honey-wine) or a personalized Jebena Buna coffee ceremony with your inaugural banquet booking.',
  },
  {
    Icon: HeartIcon,
    title: 'Communal Gursha Points',
    body: 'Earn generous loyalty points redeemable for hand-poured pure Tej flasks, prime Siga Tibs, and bespoke banquet upgrades.',
  },
  {
    Icon: ClockIcon,
    title: 'Feasting Calendar Alerts',
    body: "Timely seasonal notifications for Tsom fasting periods, Chef's Bayenets, and excellent seasonal specialties.",
  },
  {
    Icon: TruckIcon,
    title: 'Express Addis Delivery',
    body: 'Save Buna, Kacchasi, Old Airport, or Sarbet drop-offs for fast day-to-temperature delivery straight to your door.',
  },
  {
    Icon: GatherIcon,
    title: 'Priority Mesob Table Reservations',
    body: 'Skip standard waits before weekend events and reserve premium tables for intimate gatherings.',
  },
];

const PREFERENCES = [
  'All Heritage Delicacies',
  'Fasting & Vegan (Tsom)',
  'Halal Certified Meat',
  '100% Pure Tej (Gluten-Free)',
];

const schema = z
  .object({
    name: z.string().trim().min(3, 'Please enter your full name'),
    phone: z
      .string()
      .regex(/^[\d\s]{9,14}$/, 'Enter a 9-digit mobile number (e.g., 911 234 567)'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Minimum 8 characters'),
    confirm: z.string(),
    pref: z.string(),
    terms: z.boolean().refine((value) => value, 'You must agree to the Hospitality Terms'),
  })
  .refine((data) => data.confirm === data.password, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

function Signup() {
  const login = useAuthStore((state) => state.login);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirm: '',
      pref: PREFERENCES[0],
      terms: false,
    },
  });

  const pref = watch('pref');
  const password = watch('password') || '';

  const onSubmit = (data) => {
    login({
      name: data.name,
      phone: data.phone.replace(/\s/g, ''),
      email: data.email,
    });
    setDone(true);
  };

  return (
    <main className="signup-page">
      <p className="crumbs">
        / Account / <b>Join the Mesob Family</b>
      </p>

      <div className="signup-grid">
        <div className="signup-col-left">
          <aside className="signup-side">
            <span className="badge gold">MEMBER CIRCLE</span>
            <h1>
              Become an Honored
              <br />
              Table Guest
            </h1>
            <p className="side-copy">
              Immerse yourself in authentic highland hospitality, where every
              shared meal honors community, connection, and craft.
            </p>

            <ul className="benefit-list">
              {BENEFITS.map(({ Icon, title, body }) => (
                <li key={title}>
                  <span className="benefit-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <b>{title}</b>
                    <span>{body}</span>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <figure className="tradition-card">
            <ImgBox
              label="Ethiopian food shared on a mesob"
              style={{ minHeight: 150, borderRadius: '12px 0 0 12px' }}
            />
            <figcaption>
              <span className="tradition-label">TRADITION IN EVERY BITE</span>
              <p>
                Sharing from the same mesob is the ancient covenant of love and
                trust.
              </p>
              <small>— Haile Selassie</small>
            </figcaption>
          </figure>
        </div>

        <section className="signup-card">
          <h2>Create Your Mesob House Account</h2>
          <p className="auth-sub">
            Join our culinary heritage circle in less than a minute.
          </p>

          <div className="social-row">
            <button type="button" className="social-btn">
              <PhoneIcon size={16} /> Telebirr Quick Sign
            </button>
            <button type="button" className="social-btn">
              <GoogleIcon size={16} /> Continue with Google
            </button>
          </div>

          <p className="divider">
            <span>Or register with your details</span>
          </p>

          {done ? (
            <div className="welcome-msg">
              <b>Welcome to the table.</b>
              <p className="joined-next">
                Your Mesob House membership is ready.
              </p>
              <Link to="/menu" className="btn-red">
                Continue to the menu
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="field">
                <label htmlFor="signup-name">Full Name (ሙሉ ስም)</label>
                <input
                  id="signup-name"
                  {...register('name')}
                  placeholder="e.g. Abebe Bekila or Genet Tadesse"
                />
                {errors.name && <span className="err">{errors.name.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="signup-phone">
                  Ethiopian Mobile Number (ስልክ ቁጥር)
                </label>
                <div className="phone-wrap">
                  <span className="prefix">+251</span>
                  <input
                    id="signup-phone"
                    inputMode="tel"
                    {...register('phone')}
                    placeholder="911 234 567"
                  />
                </div>
                <small className="helper">
                  We'll send a code to verify your Ethiopian mobile number.
                </small>
                {errors.phone && <span className="err">{errors.phone.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="signup-email">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  {...register('email')}
                  placeholder="guest@mesobhouse.com"
                />
                {errors.email && <span className="err">{errors.email.message}</span>}
              </div>

              <div className="two">
                <div className="field">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    {...register('password')}
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && (
                    <span className="err">{errors.password.message}</span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="signup-confirm">Confirm Password</label>
                  <input
                    id="signup-confirm"
                    type="password"
                    {...register('confirm')}
                    placeholder="Repeat password"
                  />
                  {errors.confirm && (
                    <span className="err">{errors.confirm.message}</span>
                  )}
                </div>
              </div>
              <div className="char-meter" aria-live="polite">
                <span className={password.length >= 8 ? 'meter-dots is-met' : 'meter-dots'}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <i key={i} className={i < password.length ? 'on' : ''} />
                  ))}
                </span>
                <small>{password.length >= 8 ? '8 chars' : `${password.length}/8 chars`}</small>
              </div>

              <div className="field">
                <label>Primary Dining Preference (Optional)</label>
                <small className="helper">
                  Helps us curate your welcome banquet and fasting
                  recommendations.
                </small>
                <div className="pref-chips">
                  {PREFERENCES.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={pref === item ? 'chip active' : 'chip'}
                      aria-pressed={pref === item}
                      onClick={() => setValue('pref', item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <label className="terms-row">
                <input type="checkbox" {...register('terms')} />
                <span>
                  I agree to the Mesob House Hospitality{' '}
                  <Link to="/signup" className="terms-link">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link to="/signup" className="terms-link">
                    Privacy Guidelines
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <span className="err" style={{ display: 'block', marginBottom: 8 }}>
                  {errors.terms.message}
                </span>
              )}

              <button className="btn-red auth-submit" type="submit">
                Create Account &amp; Receive Welcome Gursha →
              </button>
            </form>
          )}

          <p className="auth-switch">
            Already part of our dining family?{' '}
            <Link to="/login">
              <b>Sign in here</b>
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Signup;
