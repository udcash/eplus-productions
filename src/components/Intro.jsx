import { useRef } from 'react';
import { useScrollProgress } from '../hooks.js';

const STATEMENT =
  'Virtually every day, somewhere around the world, people are being wowed by an Entertainment Plus Production. Directors, choreographers, designers, technicians, performers and costumes under one roof.';

export default function Intro() {
  const textRef = useRef(null);
  const mediaRef = useRef(null);
  const wordEls = useRef([]);
  const lit = useRef(0);
  const words = STATEMENT.split(' ');

  // light words up to the scroll position, touching only the words whose state changed
  useScrollProgress(textRef, { start: 'top bottom', end: 'bottom center' }, (t) => {
    const count = Math.min(words.length, Math.max(0, Math.ceil(t * words.length * 1.15)));
    for (let i = Math.min(count, lit.current); i < Math.max(count, lit.current); i++) {
      wordEls.current[i]?.classList.toggle('is-on', i < count);
    }
    lit.current = count;
  });
  useScrollProgress(mediaRef, { start: 'top bottom', end: 'center center' }, (m) => {
    mediaRef.current.style.clipPath = `inset(0 ${(1 - m) * 14}%)`;
  });

  return (
    <section className="intro section section--paper" aria-labelledby="intro-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">(01) Who we are</span>
          <h2 id="intro-title" className="sr-only">Who we are</h2>
        </div>
        <p ref={textRef} className="intro__statement">
          {words.map((w, i) => (
            <span key={i} ref={(el) => (wordEls.current[i] = el)}>
              {w}{' '}
            </span>
          ))}
        </p>

        <div className="intro__row">
          <p className="intro__aside" data-reveal>
            A full-service live entertainment company with a Los Angeles headquarters and a Las Vegas production warehouse.
            One call gets you the creative, the crew, the cast and the costumes.
          </p>
          <ul className="intro__facts" data-reveal>
            <li><strong>LA + Vegas</strong><span>Headquarters & warehouse</span></li>
            <li><strong>In-house</strong><span>Wardrobe, props & staging</span></li>
            <li><strong>Worldwide</strong><span>Crews that travel anywhere</span></li>
          </ul>
        </div>
      </div>

      <div ref={mediaRef} className="intro__media" style={{ clipPath: 'inset(0 14%)' }}>
        <video src="projects/about.mp4" poster="timeline/dsc_0261_2.webp" autoPlay muted loop playsInline preload="metadata" />
        <span className="intro__caption">Behind the curtain — Las Vegas</span>
      </div>
    </section>
  );
}
