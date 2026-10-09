import { useEffect, useRef, useState } from 'react';
import { CONTACT, FORMATS, NAV, SERVICES } from '../data.js';
import { lockScroll, scrollToHash } from '../hooks.js';
import { Arrow, Chevron, Globe, ICONS, Play } from './Icons.jsx';

export function Logo({ compact = false }) {
  return (
    <span className={`logo ${compact ? 'logo--compact' : ''}`}>
      <img src="logo-mark.png" alt="" width="46" height="28" />
      <span className="logo__word">
        Entertainment<b>Plus</b>
      </span>
    </span>
  );
}

export default function Header({ onReel }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [offices, setOffices] = useState(false);
  const [menu, setMenu] = useState(false);
  const megaTimer = useRef();
  const officesRef = useRef();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 480);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (hidden) {
      setMega(false);
      setOffices(false);
    }
  }, [hidden]);

  useEffect(() => {
    lockScroll(menu);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenu(false);
        setMega(false);
        setOffices(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  useEffect(() => {
    if (!offices) return;
    const onDown = (e) => !officesRef.current?.contains(e.target) && setOffices(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [offices]);

  const go = (e, href) => {
    e.preventDefault();
    setMega(false);
    setMenu(false);
    setOffices(false);
    scrollToHash(href);
  };

  const openMega = () => {
    clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    megaTimer.current = setTimeout(() => setMega(false), 140);
  };

  const state = [scrolled && 'is-scrolled', hidden && !menu && 'is-hidden', menu && 'is-menu'].filter(Boolean).join(' ');

  return (
    <header className={`header ${state}`}>
      <div className="header__bar container">
        <a href="#top" className="header__logo" aria-label="Entertainment Plus Productions, back to top" onClick={(e) => go(e, '#top')}>
          <Logo />
        </a>

        <nav className="header__nav" aria-label="Primary">
          <ol>
            {NAV.map((item, i) =>
              item.mega ? (
                <li key={item.label} className="has-mega" onMouseEnter={openMega} onMouseLeave={closeMega}>
                  <button
                    type="button"
                    className="nav-link"
                    aria-expanded={mega}
                    aria-controls="mega-services"
                    onClick={() => setMega((v) => !v)}
                    onFocus={openMega}
                  >
                    <span className="nav-link__num">0{i + 1}</span>
                    {item.label}
                    <Chevron />
                  </button>
                  <div id="mega-services" className={`mega ${mega ? 'is-open' : ''}`} inert={mega ? undefined : ''}>
                    <div className="mega__card">
                      <div className="mega__col">
                        <h3 className="mega__heading">Disciplines</h3>
                        <ul className="mega__grid">
                          {SERVICES.map((s) => (
                            <li key={s.id}>
                              <a href="#services" className="mega__item" onClick={(e) => go(e, '#services')}>
                                <span className="mega__icon" style={{ color: s.tint }}>
                                  {ICONS[s.id]}
                                </span>
                                <span>
                                  <span className="mega__title">{s.title}</span>
                                  <span className="mega__sub">{s.short}</span>
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mega__col mega__col--formats">
                        <h3 className="mega__heading">Formats</h3>
                        <ul className="mega__list">
                          {FORMATS.map((f) => (
                            <li key={f.title}>
                              <a href="#work" onClick={(e) => go(e, '#work')}>
                                {f.title}
                                <span>{f.sub}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        className="mega__feature"
                        onClick={() => {
                          setMega(false);
                          onReel();
                        }}
                      >
                        <img src="timeline/img_0809.webp" alt="" loading="lazy" />
                        <span className="mega__feature-body">
                          <span className="mega__feature-play">
                            <Play size={12} />
                          </span>
                          <span className="mega__feature-title">Watch the teaser reel</span>
                          <span className="mega__feature-sub">A taste of our work, in 90 seconds</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={item.label}>
                  <a className="nav-link" href={item.href} onClick={(e) => go(e, item.href)}>
                    <span className="nav-link__num">0{i + 1}</span>
                    {item.label}
                  </a>
                </li>
              )
            )}
          </ol>
        </nav>

        <div className="header__actions">
          <div className="offices" ref={officesRef}>
            <button
              type="button"
              className="pill pill--ghost"
              aria-expanded={offices}
              aria-haspopup="dialog"
              onClick={() => setOffices((v) => !v)}
            >
              <Globe />
              <span>LA · Vegas</span>
            </button>
            <div className={`offices__pop ${offices ? 'is-open' : ''}`} role="dialog" aria-label="Our offices" inert={offices ? undefined : ''}>
              {CONTACT.offices.map((o) => (
                <div key={o.city} className="offices__item">
                  <span className="eyebrow">{o.label}</span>
                  <strong>{o.city}</strong>
                  <span>{o.street}</span>
                  <span>{o.region}</span>
                  <a href={`tel:${o.tel}`}>{o.phone}</a>
                </div>
              ))}
            </div>
          </div>
          <a href="#contact" className="pill pill--accent header__cta" onClick={(e) => go(e, '#contact')}>
            Start a project <Arrow size={14} />
          </a>
          <button
            type="button"
            className={`burger ${menu ? 'is-open' : ''}`}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`overlay ${menu ? 'is-open' : ''}`} inert={menu ? undefined : ''}>
        <div className="overlay__inner container">
          <ol className="overlay__links">
            {NAV.map((item, i) => (
              <li key={item.label} style={{ '--i': i }}>
                <a href={item.href} onClick={(e) => go(e, item.href)}>
                  <span className="overlay__num">0{i + 1}</span>
                  {item.label}
                </a>
              </li>
            ))}
            <li style={{ '--i': NAV.length }}>
              <a href="#contact" onClick={(e) => go(e, '#contact')}>
                <span className="overlay__num">0{NAV.length + 1}</span>
                Contact
              </a>
            </li>
          </ol>
          <div className="overlay__meta">
            {CONTACT.offices.map((o) => (
              <div key={o.city}>
                <span className="eyebrow">{o.city}</span>
                <a href={`tel:${o.tel}`}>{o.phone}</a>
              </div>
            ))}
            <div>
              <span className="eyebrow">Follow</span>
              <div className="overlay__socials">
                {CONTACT.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
