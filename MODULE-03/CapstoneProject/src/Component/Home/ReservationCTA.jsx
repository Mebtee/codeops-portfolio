import { Link } from 'react-router-dom';
import { PhoneIcon } from '../UI/icons';
import { PHONE_HREF } from '../../data/footerLinks';

export default function ReservationCTA() {
  return (
    <section className="reservation" aria-labelledby="reservation-title">
      <div className="reservation-inner">
        <div>
          <p className="section-kicker">Reservations</p>
          <h2 id="reservation-title" className="section-title">
            Your Table Is Waiting
          </h2>
          <p className="section-lede">
            Gather your people and enjoy an authentic Ethiopian dining
            experience.
          </p>
        </div>
        <div className="reservation-actions">
          <a href={PHONE_HREF} className="btn-red">
            <PhoneIcon size={18} /> Reserve a Table
          </a>
          <Link to="/menu" className="btn-ghost">
            View Menu
          </Link>
          <small>
            Tables are confirmed by phone during opening hours. Online booking
            is not yet available.
          </small>
        </div>
      </div>
    </section>
  );
}
