import { useRef, useState } from 'react';
import { TEAM } from '../data.js';
import { isTouch, prefersReducedMotion, setDeckRange, useScrollEffect, viewportHeight } from '../hooks.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

function TeamCard({ person, cardRef, onPick }) {
  const inner = useRef(null);
  const pointer = useRef('mouse');

  // the 3D tilt follows a mouse or pen only; a finger on the card is scrolling the page
  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
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
      <div
        ref={inner}
        className="fan-card__inner"
        tabIndex={0}
        onPointerDown={(e) => (pointer.current = e.pointerType)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        // touch: tapping a card rotates it to the front (desktop clicks keep their current behaviour)
        onClick={() => pointer.current === 'touch' && onPick()}
      >
        <img src={person.image} alt={`${person.name}, ${person.role}`} loading="lazy" decoding="async" draggable="false" />
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
  const sticky = useRef(null);
  const head = useRef(null);
  const fan = useRef(null);
  const cards = useRef([]);
  const deck = useRef({ go: () => {} }); // touch: move the deck to a card
  const [current, setCurrent] = useState(0);

  useScrollEffect(() => {
    const n = TEAM.length;
    const reduced = prefersReducedMotion();
    const touch = isTouch();
    let geo = { small: false, R: 1600, step: 9.5, w: 273, reach: 0.95, turn: 0.9, fade: [48, 22] };
    let secTop = 0;
    let secH = 1;
    let shown = -1; // progress currently drawn (eased toward the scroll position on touch)
    let stops = [];
    let lastCurrent = -1;
    const hidden = []; // cards that were fully faded on the last draw

    const draw = (p) => {
      const { R, step, reach, turn, fade } = geo;
      // Reduce Motion: no stacking intro and no 3D turn; cards still travel along the curve
      const spread = reduced ? 1 : ease(clamp(p / 0.28));
      const range = (step * (n - 1)) / 2;
      const sweep = range * reach - clamp((p - 0.12) / 0.83) * range * 2 * reach;

      let best = 0;
      let bestA = Infinity;
      cards.current.forEach((card, i) => {
        if (!card) return;
        const base = (i - (n - 1) / 2) * step;
        const a = (base + sweep) * spread;
        const abs = Math.abs(a);
        const o = clamp(1 - (abs - fade[0]) / fade[1]);
        if (abs < bestA) {
          bestA = abs;
          best = i;
        }
        // a card that was fully faded and still is needs no style writes this frame
        if (o === 0 && hidden[i]) return;
        hidden[i] = o === 0;
        const s = 1 - Math.min(abs, 60) / 260;
        const rad = (a * Math.PI) / 180;
        const x = R * Math.sin(rad);
        if (reduced) {
          card.style.transform = `translate3d(${x}px, ${R * (1 - Math.cos(rad))}px, 0) rotateZ(${a}deg) scale(${s})`;
        } else {
          const stack = 1 - spread;
          const jitter = ((i % 3) - 1) * 4 * stack;
          const y = R * (1 - Math.cos(rad)) + stack * (i - n / 2) * -2;
          const z = -abs * 7;
          card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${a + jitter}deg) rotateY(${-a * turn}deg) scale(${s})`;
        }
        card.style.zIndex = String(200 - Math.round(abs * 2));
        card.style.opacity = String(o);
        card.style.visibility = o > 0 ? '' : 'hidden'; // fully faded cards skip painting
      });
      if (best !== lastCurrent) {
        lastCurrent = best;
        setCurrent(best);
      }
    };

    // Size cards from the room the fan actually has (height and width), and scale the
    // arc radius with the card so the fan keeps the same proportions at every size.
    const layout = () => {
      const sec = section.current;
      const st = sticky.current;
      const hd = head.current;
      const fn = fan.current;
      if (!sec || !st || !hd || !fn) return;
      const vw = window.innerWidth;
      const vh = viewportHeight();
      const small = vw < 760;
      const desktop = vw >= 1100;

      // phones: the heading scrolls away while the cards stay pinned, so the cards get the screen
      const offset = small ? hd.offsetTop + hd.offsetHeight : 0;
      st.style.top = offset ? `${-offset}px` : '';
      st.style.height = offset ? `${Math.round(vh + offset)}px` : '';

      // phones: keep clear of the site header, which stays shown while the deck is pinned
      const reserve = small ? (document.querySelector('.header__bar')?.offsetHeight || 76) + 8 : 0;
      const room = fn.clientHeight - reserve - 48; // hover lift + arc drop
      const frac = small ? 0.52 : vw < 1100 ? 0.38 : 0.19;
      const w = Math.round(Math.max(150, Math.min(vw * frac, room * 0.643, 340)));
      const h = w / 0.643;
      // phones: a semicircle (radius ~1.9 card widths, 22° apart) so the cards visibly swing
      // down and around the curve like a fanned hand; tablets keep the wide desktop-style arc
      const R = w * (small ? 1.9 : 5.86);
      const step = small ? 22 : 9.5;
      // centre the fan including how far the outermost on-screen card drops along the arc
      // (phones: only the cards actually on screen count, the next ones round the curve are mostly off-edge)
      const span = vw / 2 / (R * Math.sin((step * Math.PI) / 180));
      const reach = small ? Math.max(1, Math.floor(span)) : Math.ceil(span);
      const drop = R * (1 - Math.cos((Math.min(reach * step, 90) * Math.PI) / 180));
      const top = reserve + (fn.clientHeight - reserve - h - drop) / 2 - 12;
      if (desktop) {
        // desktop keeps its original fan exactly: CSS card width (clamp 170–300px, 19vw), fixed radius
        fn.style.removeProperty('--card-w');
        fn.style.removeProperty('--stage-top');
        geo = { small, R: 1600, step, w: Math.min(300, Math.max(170, vw * 0.19)), reach: 0.95, turn: 0.9, fade: [48, 22] };
      } else {
        fn.style.setProperty('--card-w', `${w}px`);
        fn.style.setProperty('--stage-top', `${Math.round(Math.max(12, top))}px`);
        // phones/tablets sweep the full deck so the first and last cards also stop centred
        // on the semicircle the side cards stay visible further round, and turn less so faces stay readable
        geo = small
          ? { small, R, step, w, reach: 1, turn: 0.35, fade: [62, 30] }
          : { small, R, step, w, reach: 1, turn: 0.9, fade: [48, 22] };
      }

      // document scroll positions where each card sits centred (touch stepping + tap-to-front)
      secTop = sec.getBoundingClientRect().top + window.scrollY;
      secH = sec.offsetHeight;
      const travel = Math.max(1, secH - vh);
      const range = (step * (n - 1)) / 2;
      const k = geo.reach;
      stops = TEAM.map((_, i) => {
        const q = clamp((range * k + (i - (n - 1) / 2) * step) / (range * 2 * k));
        return Math.round(secTop + (0.12 + 0.83 * q) * travel);
      });
      shown = -1;
      hidden.length = 0;
      // the scroll range where the deck is pinned on screen (header holds still in here)
      if (touch) setDeckRange([secTop + offset - 2, secTop + secH - vh + 2]);
    };

    const frame = (y) => {
      const vh = viewportHeight();
      const top = secTop - y;
      if (top + secH < -100 || top > vh + 100) return false;
      const target = clamp(-top / Math.max(1, secH - vh));
      // touch scrolling is native (not smoothed by Lenis), so ease the drawn progress toward it;
      // desktop draws the exact position as before, because Lenis already smooths the wheel
      if (shown < 0 || !touch) shown = target;
      else shown += (target - shown) * 0.4;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      draw(shown);
      return shown !== target;
    };

    if (!touch) return { layout, frame };

    /* ------------------------------------------------------------------
       Touch: the deck follows the finger while it is pinned.
       Dragging spins the cards live; on release the deck glides (fast) to
       a card, carried further by a flick. CSS scroll-snap can't do this
       reliably, so gestures that start inside the deck are handled here;
       past the first or last card the browser's native scrolling resumes.
       ------------------------------------------------------------------ */
    let touching = false;
    let engaged = false;
    let decided = false;
    let startY = 0;
    let startScroll = 0;
    let startIdx = 0;
    let gain = 2;
    let dy = 0;
    let samples = []; // recent finger positions, for flick velocity
    let target = null; // scroll position we are gliding to
    let tween = 0;
    let lastY = window.scrollY;
    let settle = 0;

    const nearest = (y) => stops.reduce((b, s, i) => (Math.abs(s - y) < Math.abs(stops[b] - y) ? i : b), 0);
    const inDeck = (y) => stops.length > 0 && y >= stops[0] - 2 && y <= stops[n - 1] + 2;
    const locked = () => document.documentElement.style.overflow === 'hidden'; // menu or reel open
    // continuous card index for a scroll position (2.5 = halfway between cards 3 and 4)
    const indexAt = (y) => {
      if (y <= stops[0]) return 0;
      for (let i = 0; i < n - 1; i++) if (y <= stops[i + 1]) return i + (y - stops[i]) / Math.max(1, stops[i + 1] - stops[i]);
      return n - 1;
    };
    const stopGlide = () => {
      cancelAnimationFrame(tween);
      tween = 0;
      target = null;
    };
    // quick ease-out glide (≈0.25–0.45s) instead of the browser's slower smooth scroll
    const go = (i, instant = false) => {
      if (!stops.length) return;
      stopGlide();
      const to = stops[clamp(Math.round(i), 0, n - 1)];
      const from = window.scrollY;
      if (instant || reduced || Math.abs(to - from) < 2) {
        window.scrollTo(0, to);
        return;
      }
      target = to;
      const dur = clamp(240 + Math.abs(to - from) * 0.12, 240, 460);
      const t0 = performance.now();
      const step = (now) => {
        const t = clamp((now - t0) / dur);
        window.scrollTo(0, from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) tween = requestAnimationFrame(step);
        else {
          tween = 0;
          target = null;
        }
      };
      tween = requestAnimationFrame(step);
    };
    deck.current.go = go;

    const onStart = (e) => {
      if (locked() || e.touches.length > 1) return;
      stopGlide();
      touching = true;
      decided = false;
      dy = 0;
      startY = e.touches[0].clientY;
      startScroll = window.scrollY;
      startIdx = nearest(startScroll);
      engaged = inDeck(startScroll);
      samples = [{ t: e.timeStamp, y: startY }];
      // about 15% of the screen height of finger travel moves one card
      if (stops.length > 1) gain = (stops[1] - stops[0]) / (viewportHeight() * 0.15);
    };
    const onMove = (e) => {
      if (!engaged || !touching) return;
      const fy = e.touches[0].clientY;
      dy = startY - fy; // > 0: moving forward through the deck
      if (!decided) {
        if (Math.abs(dy) < 4) return;
        decided = true;
        // swiping out past the first or last card releases the page to normal scrolling
        if ((dy > 0 && startScroll >= stops[n - 1] - 2) || (dy < 0 && startScroll <= stops[0] + 2)) {
          engaged = false;
          return;
        }
      }
      if (e.cancelable) e.preventDefault();
      window.scrollTo(0, clamp(startScroll + dy * gain, stops[0], stops[n - 1]));
      samples.push({ t: e.timeStamp, y: fy });
      if (samples.length > 6) samples.shift();
    };
    const onEnd = (e) => {
      if (!touching) return;
      touching = false;
      if (engaged && decided) {
        engaged = false;
        // flick velocity over the last ~100ms, in screen-heights per second (> 0: forward)
        const last = samples[samples.length - 1];
        const first = samples.find((p) => last.t - p.t < 100) || samples[0];
        const v = last.t > first.t ? (first.y - last.y) / (last.t - first.t) / viewportHeight() * 1000 : 0;
        const at = indexAt(window.scrollY);
        // only a real flick (over ~1.2 screen-heights/s) carries the deck on, by up to 3 extra cards;
        // ordinary swipes land on the card the finger dragged to
        const speed = Math.abs(v);
        const carry = speed > 1.2 ? Math.sign(v) * Math.min(3, (speed - 1.2) * 1.2 + 0.5) : 0;
        let to = Math.round(at + carry);
        // a deliberate swipe always moves at least one card, even if it didn't drag halfway
        if (to === startIdx && Math.abs(dy) > 24 && Math.abs(v) > 0.3) to += Math.sign(dy);
        go(to);
      } else if (inDeck(window.scrollY) && e?.type !== 'touchcancel') {
        go(nearest(window.scrollY));
      }
      engaged = false;
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (!touching && target === null && stops.length) {
        // momentum carried the page into the deck: stop on the first/last card instead of flying past
        if (lastY < stops[0] - 2 && y >= stops[0] - 2) go(0, true);
        else if (lastY > stops[n - 1] + 2 && y <= stops[n - 1] + 2) go(n - 1, true);
      }
      lastY = window.scrollY;
      // a scroll that ends between two cards settles on the nearest one
      clearTimeout(settle);
      settle = setTimeout(() => {
        const yy = window.scrollY;
        if (!touching && target === null && inDeck(yy) && Math.abs(stops[nearest(yy)] - yy) > 2) go(nearest(yy));
      }, 140);
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return {
      layout,
      frame,
      cleanup: () => {
        setDeckRange(null);
        clearTimeout(settle);
        stopGlide();
        window.removeEventListener('touchstart', onStart);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
        window.removeEventListener('touchcancel', onEnd);
        window.removeEventListener('scroll', onScroll);
      },
    };
  }, []);

  const pick = (i) => deck.current.go(i);

  const person = TEAM[current];

  return (
    <section id="team" ref={section} className="team section--paper" aria-labelledby="team-title">
      <div ref={sticky} className="team__sticky">
        <div ref={head} className="container team__head">
          <span className="eyebrow">(05) The team</span>
          <h2 id="team-title" className="h-display">
            The crew <em>behind the curtain.</em>
          </h2>
          <p className="team__lede">
            A world-class team of creators and producers. Hover or tap a card to meet them.
          </p>
        </div>

        <div ref={fan} className="fan" aria-label="Team members">
          <ul className="fan__stage">
            {TEAM.map((p, i) => (
              <TeamCard key={p.name} person={p} cardRef={(el) => (cards.current[i] = el)} onPick={() => pick(i)} />
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
