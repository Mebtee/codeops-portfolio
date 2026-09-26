import './Footer.css';
import FooterLower from './FooterLower/FooterLower';
import FooterUpper from './FooterUpper/FooterUpper';

function Footer() {
  return (
    <div className="footer">
      <div className='footer-container'>
        <FooterUpper/>
        <FooterLower/>
      </div>
    </div>
  );
}

export default Footer;
