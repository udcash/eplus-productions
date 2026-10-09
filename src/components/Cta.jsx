import { useRef } from 'react';
import { CONTACT } from '../data.js';
import { ArrowUpRight } from './Icons.jsx';

export default function Cta() {
  const btn = useRef(null);

  const onMove = (e) => {
    const r = btn.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    btn.current.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };
  const onLeave = () => (btn.current.style.transform = '');

  return (
    <section id="contact" className="cta section section--ink" aria-labelledby="cta-title" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="cta__bg" aria-hidden="true">
        <img src="timeline/img_4731.webp" alt="" loading="lazy" />
      </div>
      <div className="container cta__inner">
        <span className="eyebrow">(07) Let's talk</span>
        <h2 id="cta-title" className="cta__title" data-reveal>
          Got a vision?
          <br />
          <em>We've got every step.</em>
        </h2>
        <p className="cta__lede" data-reveal>
          Total peace of mind: we bring your vision to life seamlessly, whether on a live world stage or a closed studio set.
        </p>
        <a ref={btn} href={`mailto:${CONTACT.email}?subject=New%20project`} className="cta__orb">
          <span>Start a project</span>
          <ArrowUpRight size={22} />
        </a>
        <div className="cta__lines">
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          {CONTACT.offices.map((o) => (
            <a key={o.city} href={`tel:${o.tel}`}>
              {o.city} {o.phone}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
