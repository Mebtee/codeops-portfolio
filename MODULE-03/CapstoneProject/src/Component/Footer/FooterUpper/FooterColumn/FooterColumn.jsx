import './FooterColumn.css';
import { DineIcon, DeviceIcon, ShareIcon } from '../../FooterIcons';

function FooterColumn({ title, items, showSocialIcons }) {
  return (
    <div className="footer-card footer-column">
      <h2 className="footer-column-title">{title}</h2>

      <ul className="footer-column-list">
        {items.map(({ text, href, highlight, emphasis }) => (
          <li key={text}>
            {href ? (
              <a
                href={href}
                className={
                  highlight ? 'is-highlight' : emphasis ? 'is-emphasis' : ''
                }
              >
                {text}
              </a>
            ) : (
              <span className={highlight ? 'is-highlight' : emphasis ? 'is-emphasis' : ''}>
                {text}
              </span>
            )}
          </li>
        ))}
      </ul>

      {showSocialIcons && (
        <div className="footer-column-icons">
          <DineIcon />
          <DeviceIcon />
          <ShareIcon />
        </div>
      )}
    </div>
  );
}

export default FooterColumn;
