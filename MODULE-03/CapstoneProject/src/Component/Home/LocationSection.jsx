import ImgBox from '../UI/ImgBox';
import { MapPinIcon, PhoneIcon, ClockIcon } from '../UI/icons';
import { ADDRESS, PHONE, PHONE_HREF, HOURS, BRAND_NAME } from '../../data/footerLinks';

export default function LocationSection() {
  return (
    <section className="visit" id="visit" aria-labelledby="visit-title">
      <div className="section-inner visit-inner">
        <div className="visit-media">
          <ImgBox
            label="Mesob House location in Bole Medhanialem"
            style={{ minHeight: 320, borderRadius: 18 }}
          />
        </div>

        <div className="visit-copy">
          <p className="section-kicker">Find Us</p>
          <h2 id="visit-title" className="section-title">
            {BRAND_NAME}
          </h2>

          <ul className="visit-details">
            <li>
              <MapPinIcon size={20} />
              <div>
                <b>Address</b>
                <span>{ADDRESS}, with express delivery across the city.</span>
              </div>
            </li>
            <li>
              <PhoneIcon size={20} />
              <div>
                <b>Phone</b>
                <a href={PHONE_HREF}>{PHONE}</a>
              </div>
            </li>
            <li>
              <ClockIcon size={20} />
              <div>
                <b>Opening hours</b>
                <span>{HOURS[0]}</span>
                <span>{HOURS[1]}</span>
              </div>
            </li>
          </ul>

          <a href={PHONE_HREF} className="btn-red">
            <PhoneIcon size={18} /> Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
