import { useEffect, useRef, useState } from 'react';
import { TEAM } from '../data.js';
import { prefersReducedMotion } from '../hooks.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

function TeamCard({ person, cardRef }) {
  const inner = useRef(null);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    inner.current.style.setProperty('--rx', `${-y * 14}deg`);
    inner.current.style.setProperty('--ry', `${x * 16}deg`);
    inner.current.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    inner.current.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    inner.current.style.setProperty('--rx', '0deg');
    inner.current.style.setProperty('--ry', '0deg');
  };

  return (
    <li ref={cardRef} className="fan-card">
      <div ref={inner} className="fan-card__inner" tabIndex={0} onPointerMove={onMove} onPointerLeave={onLeave}>
        <img src={person.image} alt={`${person.name}, ${person.role}`} loading="lazy" draggable="false" />
        <span className="fan-card__glare" aria-hidden="true" />
        <div className="fan-card__info">
          <strong>{person.name}</strong>
          <span>{person.role}</span>
          {person.place && <em>{person.place}</em>}
        </div>
      </div>
    </li>
  );
}

export default function Team() {
  const section = useRef(null);
  const cards = useRef([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const n = TEAM.length;
    const reduced = prefersReducedMotion();
    let raf;
    let lastCurrent = -1;

    const tick = () => {
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const visible = rect.bottom > -100 && rect.top < vh + 100;

      if (visible) {
        const p = clamp(-rect.top / Math.max(1, rect.height - vh));
        const small = vw < 760;
        const R = small ? 1050 : 1600;
        const step = small ? 15 : 9.5;
        const spread = reduced ? 1 : ease(clamp(p / 0.28));
        const range = (step * (n - 1)) / 2;
        const sweep = reduced ? 0 : range * 0.95 - clamp((p - 0.12) / 0.83) * range * 1.9;

        let best = 0;
        let bestA = Infinity;
        cards.current.forEach((card, i) => {
          if (!card) return;
          const base = (i - (n - 1) / 2) * step;
          const a = (base + sweep) * spread;
          const rad = (a * Math.PI) / 180;
          const stack = 1 - spread;
          const jitter = ((i % 3) - 1) * 4 * stack;
          const x = R * Math.sin(rad);
          const y = R * (1 - Math.cos(rad)) + stack * (i - n / 2) * -2;
          const abs = Math.abs(a);
          const z = -abs * 7;
          const s = 1 - Math.min(abs, 60) / 260;
          card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${a + jitter}deg) rotateY(${-a * 0.9}deg) scale(${s})`;
          card.style.zIndex = String(200 - Math.round(abs * 2));
          card.style.opacity = String(clamp(1 - (abs - 48) / 22));
          if (abs < bestA) {
            bestA = abs;
            best = i;
          }
        });
        if (best !== lastCurrent) {
          lastCurrent = best;
          setCurrent(best);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const person = TEAM[current];

  return (
    <section id="team" ref={section} className="team section--paper" aria-labelledby="team-title">
      <div className="team__sticky">
        <div className="container team__head">
          <span className="eyebrow">(05) The team</span>
          <h2 id="team-title" className="h-display">
            The crew <em>behind the curtain.</em>
          </h2>
          <p className="team__lede">
            A world-class team of creators and producers. Hover or tap a card to meet them.
          </p>
        </div>

        <div className="fan" aria-label="Team members">
          <ul className="fan__stage">
            {TEAM.map((p, i) => (
              <TeamCard key={p.name} person={p} cardRef={(el) => (cards.current[i] = el)} />
            ))}
          </ul>
        </div>

        <div className="container team__now" aria-live="polite">
          <span className="team__count">
            {String(current + 1).padStart(2, '0')} <i>/ {String(TEAM.length).padStart(2, '0')}</i>
          </span>
          <span className="team__name">
            <strong>{person.name}</strong> — {person.role}
          </span>
        </div>
      </div>
    </section>
  );
}
