import { useRef } from 'react';
import { useScrollProgress } from '../hooks.js';

const STATEMENT =
  'Virtually every day, somewhere around the world, people are being wowed by an Entertainment Plus Production. Directors, choreographers, designers, technicians, performers and costumes under one roof.';

export default function Intro() {
  const textRef = useRef(null);
  const mediaRef = useRef(null);
  const t = useScrollProgress(textRef, { start: 'top bottom', end: 'bottom center' });
  const m = useScrollProgress(mediaRef, { start: 'top bottom', end: 'center center' });
  const words = STATEMENT.split(' ');
  const inset = (1 - m) * 14;

  return (
    <section className="intro section section--paper" aria-labelledby="intro-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">(01) Who we are</span>
          <h2 id="intro-title" className="sr-only">Who we are</h2>
        </div>
        <p ref={textRef} className="intro__statement">
          {words.map((w, i) => {
            const on = t * words.length * 1.15 > i;
            return (
              <span key={i} className={on ? 'is-on' : ''}>
                {w}{' '}
              </span>
            );
          })}
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

      <div ref={mediaRef} className="intro__media" style={{ clipPath: `inset(0 ${inset}%)` }}>
        <video src="projects/about.mp4" poster="timeline/dsc_0261_2.webp" autoPlay muted loop playsInline preload="metadata" />
        <span className="intro__caption">Behind the curtain — Las Vegas</span>
      </div>
    </section>
  );
}
