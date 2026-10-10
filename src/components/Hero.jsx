import { useRef } from 'react';
import { prefersReducedMotion, scrollToHash, useScrollProgress } from '../hooks.js';
import { Arrow, Play } from './Icons.jsx';

const PLACES = ['Los Angeles', 'China', 'The White House', 'Las Vegas', 'Arena Tours', 'Presidential Galas', 'Broadcast'];

export default function Hero({ onReel }) {
  const ref = useRef(null);
  const media = useRef(null);
  const content = useRef(null);
  useScrollProgress(ref, { start: 'top top', end: 'bottom top' }, (p) => {
    // parallax is the classic motion-sickness trigger, so it is the one effect Reduce Motion drops
    if (!prefersReducedMotion()) media.current.style.transform = `translate3d(0, ${p * 18}%, 0) scale(${1 + p * 0.08})`;
    content.current.style.opacity = String(1 - p * 1.4);
  });

  return (
    <section id="top" ref={ref} className="hero" aria-label="Introduction">
      <div ref={media} className="hero__media">
        <video src="projects/reel.mp4" poster="timeline/img_0809.webp" autoPlay muted loop playsInline preload="auto" />
      </div>
      <div className="hero__shade" />

      <div ref={content} className="hero__content container">
        <p className="hero__eyebrow">
          <span className="dot" /> Live entertainment · Since day one in Los Angeles
        </p>

        <h1 className="hero__title">
          <span className="line"><span>We are</span></span>
          <span className="line"><span><em>entertainment</em><i className="plus">+</i></span></span>
        </h1>

        <div className="hero__foot">
          <p className="hero__lede">
            From Los Angeles to China, from the White House to Las Vegas. When presidents, princes and CEOs want to thrill
            their audience, they trust us.
          </p>
          <div className="hero__ctas">
            <button type="button" className="btn btn--light" onClick={onReel}>
              <span className="btn__icon"><Play size={11} /></span> Watch the reel
            </button>
            <a href="#contact" className="btn btn--outline" onClick={(e) => { e.preventDefault(); scrollToHash('#contact'); }}>
              Get in touch <Arrow size={15} />
            </a>
          </div>
        </div>
      </div>

      <div className="hero__ticker" aria-hidden="true">
        <div className="marquee">
          {[0, 1].map((k) => (
            <div className="marquee__track" key={k}>
              {PLACES.map((pl) => (
                <span key={pl} className="hero__place">{pl}<i>✦</i></span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
