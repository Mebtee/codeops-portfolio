import './FooterLower.css';
import { FOOTER_LEGAL_LINKS } from '../../../data/footerLinks';

function FooterLower() {
  const year = new Date().getFullYear();

  return (
    <div className="footer-lower">
      <p className="footer-lower-copyright">
        © {year} Mesob House Habesha Dining. Authentic Ethiopian &amp; Eritrean Heritage.
      </p>

      <ul className="footer-lower-links">
        {FOOTER_LEGAL_LINKS.map(({ text, href }) => (
          <li key={text}>
            <a href={href}>{text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FooterLower;
