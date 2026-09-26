import './FooterBrand.css';
import { CoffeeIcon } from '../../FooterIcons';
import { FOOTER_BRAND } from '../../../../data/footerLinks';

function FooterBrand() {
  const { title, tagline, note } = FOOTER_BRAND;

  return (
    <div className="footer-card footer-brand">
      <h1 className="footer-brand-title">{title}</h1>

      <div className="footer-brand-tagline">
        {tagline.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="footer-brand-note">
        <CoffeeIcon />
        <p>{note}</p>
      </div>
    </div>
  );
}

export default FooterBrand;
