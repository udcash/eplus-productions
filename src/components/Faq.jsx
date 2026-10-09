import { useState } from 'react';
import { CONTACT, FAQ } from '../data.js';

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="faq section section--paper" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <div className="faq__aside">
          <span className="eyebrow">(06) FAQ</span>
          <h2 id="faq-title" className="h-display" data-reveal>
            Good <em>questions.</em>
          </h2>
          <p>
            Still wondering? Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> and a producer will get back to you.
          </p>
        </div>
        <ul className="faq__list">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className={`faq__item ${on ? 'is-open' : ''}`}>
                <h3>
                  <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                    <span className="faq__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="faq__q">{f.q}</span>
                    <span className="faq__toggle" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-${i}`} className="faq__a" role="region">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
