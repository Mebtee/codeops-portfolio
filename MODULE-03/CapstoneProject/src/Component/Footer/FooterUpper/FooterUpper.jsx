import './FooterUpper.css';
import FooterBrand from './FooterBrand/FooterBrand';
import FooterColumn from './FooterColumn/FooterColumn';
import { FOOTER_COLUMNS } from '../../../data/footerLinks';

function FooterUpper() {
  return (
    <div className="footer-upper">
      <FooterBrand />
      {FOOTER_COLUMNS.map((column) => (
        <FooterColumn key={column.title} {...column} />
      ))}
    </div>
  );
}

export default FooterUpper;
