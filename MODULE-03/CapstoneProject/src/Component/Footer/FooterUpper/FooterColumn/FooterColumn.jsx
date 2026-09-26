import './FooterColumn.css';
import { Link } from 'react-router-dom';
import { DineIcon, DeviceIcon, ShareIcon } from '../../FooterIcons';

const isExternal = (href) => /^(tel:|mailto:|https?:)/.test(href);

function FooterColumn({ title, items, showSocialIcons }) {
  return (
    <div className="footer-card footer-column">
      <h2 className="footer-column-title">{title}</h2>

      <ul className="footer-column-list">
        {items.map(({ text, href, highlight, emphasis }) => {
          const className = highlight
            ? 'is-highlight'
            : emphasis
              ? 'is-emphasis'
              : undefined;

          return (
            <li key={text}>
              {!href ? (
                <span className={className}>{text}</span>
              ) : isExternal(href) ? (
                <a href={href} className={className}>
                  {text}
                </a>
              ) : (
                <Link to={href} className={className}>
                  {text}
                </Link>
              )}
            </li>
          );
        })}
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
