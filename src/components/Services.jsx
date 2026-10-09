import { useState } from 'react';
import { SERVICES } from '../data.js';
import { ICONS } from './Icons.jsx';

export default function Services() {
  const [active, setActive] = useState(0);

  return (
    <section id="services" className="services section section--ink" aria-labelledby="services-title">
      <div className="container services__grid">
        <div className="services__aside">
          <span className="eyebrow">(03) What we do</span>
          <h2 id="services-title" className="h-display" data-reveal>
            Six disciplines. <em>One crew.</em>
          </h2>
          <p className="services__lede" data-reveal>
            Every department a world-class show needs, under one roof and on one call sheet.
          </p>
          <div className="services__preview" aria-hidden="true">
            {SERVICES.map((s, i) => (
              <img key={s.id} src={s.image} alt="" loading="lazy" className={i === active ? 'is-active' : ''} />
            ))}
            <span className="services__preview-tag" style={{ '--tint': SERVICES[active].tint }}>
              {String(active + 1).padStart(2, '0')} / {SERVICES[active].title}
            </span>
          </div>
        </div>

        <ol className="services__list">
          {SERVICES.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.id} className={`service ${on ? 'is-active' : ''}`} style={{ '--tint': s.tint }} onMouseEnter={() => setActive(i)}>
                <button type="button" className="service__head" aria-expanded={on} aria-controls={`svc-${s.id}`} onClick={() => setActive(i)} onFocus={() => setActive(i)}>
                  <span className="service__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="service__title">{s.title}</span>
                  <span className="service__icon">{ICONS[s.id]}</span>
                </button>
                <div id={`svc-${s.id}`} className="service__body" role="region">
                  <div>
                    <img src={s.image} alt="" loading="lazy" className="service__img" />
                    <p>{s.description}</p>
                    <span className="service__short">{s.short}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
