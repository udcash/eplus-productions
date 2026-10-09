import { useRef } from 'react';
import { WORK } from '../data.js';
import { ArrowUpRight, Play } from './Icons.jsx';

function WorkCard({ item, index }) {
  const video = useRef(null);
  const play = () => {
    const v = video.current;
    if (!v) return;
    if (!v.src) v.src = item.video;
    v.play().catch(() => {});
  };
  const stop = () => video.current?.pause();

  return (
    <article className={`work-card work-card--${index}`} onMouseEnter={play} onMouseLeave={stop} onFocus={play} onBlur={stop} data-reveal>
      <div className="work-card__media">
        <img src={item.image} alt="" loading="lazy" />
        <video ref={video} muted loop playsInline preload="none" aria-hidden="true" />
      </div>
      <div className="work-card__body">
        <span className="work-card__index">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>{item.title}</h3>
          <p>{item.sub}</p>
        </div>
        <ul className="work-card__tags">
          {item.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <span className="work-card__hint" aria-hidden="true">
        <Play size={10} /> Hover to play
      </span>
    </article>
  );
}

export default function Work({ onReel }) {
  return (
    <section id="work" className="work section section--ink" aria-labelledby="work-title">
      <div className="container">
        <div className="work__head">
          <div>
            <span className="eyebrow">(04) A taste of our work</span>
            <h2 id="work-title" className="h-display" data-reveal>
              Shows people <em>still talk about.</em>
            </h2>
          </div>
          <button type="button" className="btn btn--outline" onClick={onReel}>
            Watch the full teaser reel <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="work__grid">
          {WORK.map((item, i) => (
            <WorkCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
