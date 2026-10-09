import { CONTACT, SERVICES } from '../data.js';
import { scrollToHash } from '../hooks.js';
import { Logo } from './Header.jsx';
import { ArrowUpRight } from './Icons.jsx';

const STUDIO = [
  { label: 'Our work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Our team', href: '#team' },
  { label: 'Clients', href: '#clients' },
  { label: 'FAQ', href: '#faq' },
];

const FORMATS = ['Arena tours', 'Corporate spectacles', 'Presidential events', 'Resort & casino shows', 'Broadcast & commercial'];

export default function Footer() {
  const go = (e, href) => {
    e.preventDefault();
    scrollToHash(href);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>Entertainment Plus Productions. Live entertainment for presidents, princes, CEOs and everyone in the room.</p>
          </div>
          <a href={`mailto:${CONTACT.email}`} className="footer__mail">
            {CONTACT.email} <ArrowUpRight size={18} />
          </a>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h3>Disciplines</h3>
            <ul>
              {SERVICES.map((s) => (
                <li key={s.id}><a href="#services" onClick={(e) => go(e, '#services')}>{s.title}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer__col">
            <h3>Studio</h3>
            <ul>
              {STUDIO.map((l) => (
                <li key={l.label}><a href={l.href} onClick={(e) => go(e, l.href)}>{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer__col">
            <h3>Formats</h3>
            <ul>
              {FORMATS.map((f) => (
                <li key={f}><a href="#work" onClick={(e) => go(e, '#work')}>{f}</a></li>
              ))}
            </ul>
          </div>
          {CONTACT.offices.map((o) => (
            <div className="footer__col" key={o.city}>
              <h3>{o.city}</h3>
              <p className="footer__note">{o.label}</p>
              <ul>
                <li><span>{o.street}</span></li>
                <li><span>{o.region}</span></li>
                <li><a href={`tel:${o.tel}`}>{o.phone}</a></li>
              </ul>
            </div>
          ))}
          <div className="footer__col">
            <h3>Talk to us</h3>
            <p className="footer__note">Planning a show? Talk to a real producer, not a ticket queue.</p>
            <ul>
              <li><a href="#contact" onClick={(e) => go(e, '#contact')}>Start a project</a></li>
              {CONTACT.socials.map((s) => (
                <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Entertainment Plus Productions. All rights reserved.</span>
          <span className="footer__loc">Los Angeles · Las Vegas · Worldwide</span>
          <a href="#top" className="footer__top-link" onClick={(e) => go(e, '#top')}>Back to top ↑</a>
        </div>
      </div>

      <div className="footer__word" aria-hidden="true">
        <span>entertainment</span><i>+</i>
      </div>
    </footer>
  );
}
