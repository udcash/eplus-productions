import { CLIENTS } from '../data.js';

const rows = [CLIENTS.slice(0, 20), CLIENTS.slice(20)];

export default function Clients() {
  return (
    <section id="clients" className="clients section section--paper" aria-labelledby="clients-title">
      <div className="container clients__head">
        <span className="eyebrow">(02) Our clients</span>
        <h2 id="clients-title" className="h-display" data-reveal>
          When presidents, princes and CEOs want to thrill their audience, <em>they trust us.</em>
        </h2>
      </div>

      <div className="clients__rows">
        {rows.map((row, r) => (
          <div key={r} className={`marquee marquee--logos ${r === 1 ? 'marquee--reverse' : ''}`}>
            {[0, 1].map((k) => (
              <ul className="marquee__track" key={k} aria-hidden={k === 1 ? true : undefined}>
                {row.map((c) => (
                  <li key={c.name} className={`logo-tile ${c.dark ? 'logo-tile--dark' : ''}`}>
                    <img src={c.src} alt={k === 0 ? c.name : ''} loading="lazy" width="180" height="180" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
