import { Link } from 'react-router-dom';
import { CoffeeIcon, HeartIcon, ClockIcon, TruckIcon } from '../UI/icons';

const BENEFITS = [
  {
    Icon: CoffeeIcon,
    title: 'Welcome gift',
    body: 'A complimentary flask of house-fermented Tej, or a personalised Jebena Buna ceremony with your first banquet booking.',
  },
  {
    Icon: HeartIcon,
    title: 'Communal Gursha Points',
    body: 'Earn loyalty points redeemable for hand-poured pure teff injera and banquet upgrades.',
  },
  {
    Icon: ClockIcon,
    title: 'Fasting calendar alerts',
    body: 'Timely notifications for Tsom fasting periods and the lenten specialties that come with them.',
  },
  {
    Icon: TruckIcon,
    title: 'Express Addis delivery',
    body: 'Save your Bole, Kazanchis, Old Airport or Sarbet drop-off for fast heat-insulated delivery.',
  },
];

export default function MembershipCTA() {
  return (
    <section className="membership" aria-labelledby="membership-title">
      <div className="membership-inner">
        <div className="membership-copy">
          <span className="badge gold">MEMBER CIRCLE</span>
          <h2 id="membership-title" className="section-title">
            Become an Honored Table Guest
          </h2>
          <p className="section-lede">
            Join our community and enjoy special experiences, dining benefits,
            and invitations from Mesob House.
          </p>
          <Link to="/signup" className="btn-red">
            Join Mesob House
          </Link>
        </div>

        <ul className="membership-list">
          {BENEFITS.map(({ Icon, title, body }) => (
            <li key={title}>
              <span className="membership-icon">
                <Icon size={20} />
              </span>
              <div>
                <b>{title}</b>
                <span>{body}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
