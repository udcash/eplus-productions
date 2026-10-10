import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

let lenis = null;

const query = (q) => (typeof window !== 'undefined' ? window.matchMedia(q) : null);
const reduceQuery = query('(prefers-reduced-motion: reduce)');
const coarseQuery = query('(pointer: coarse)');

export const prefersReducedMotion = () => !!reduceQuery?.matches;
/** Touch-first device (phones, tablets): scroll is native finger/momentum scrolling. */
export const isTouch = () => !!coarseQuery?.matches;

/* --------------------------------------------------------------------------
   One shared animation loop for every scroll effect.
   - Drives Lenis (desktop wheel smoothing) and then all scroll effects in the same frame.
   - Effects run only when the scroll position changed or one of them is still settling.
   - Effects write styles straight to the DOM, so scrolling never re-renders React.
   -------------------------------------------------------------------------- */
const frameSubs = new Set();
const layoutSubs = new Set();
let loopId = 0;
let lastY = NaN;
let needsFrame = true;
let vh = 0;
let probe = null;
let lastW = 0;
let lastVh = 0;

/**
 * Stable viewport height for scroll maths. window.innerHeight changes while a phone's address bar
 * shows and hides; 100svh (the small viewport) does not, so progress no longer jumps mid-scroll.
 * On desktop this equals window.innerHeight.
 */
export const viewportHeight = () => vh || window.innerHeight;

function measureViewport() {
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    // the second height wins where svh is supported; older browsers keep 100vh
    probe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
  }
  vh = probe.offsetHeight || window.innerHeight;
}

/** Re-measure cached geometry. Skipped when only the address bar moved (width and svh unchanged). */
export function requestLayout(force = false) {
  measureViewport();
  const w = window.innerWidth;
  if (!force && w === lastW && vh === lastVh) return;
  lastW = w;
  lastVh = vh;
  layoutSubs.forEach((fn) => fn());
  needsFrame = true;
}

function frame(t) {
  lenis?.raf(t);
  const y = window.scrollY;
  if (y !== lastY || needsFrame) {
    lastY = y;
    needsFrame = false;
    frameSubs.forEach((fn) => {
      if (fn(y) === true) needsFrame = true; // effect is still easing toward its target
    });
  }
  loopId = requestAnimationFrame(frame);
}

let listening = false;
function ensureLoop() {
  if (!listening) {
    listening = true;
    measureViewport();
    window.addEventListener('resize', () => requestLayout());
    window.addEventListener('orientationchange', () => requestLayout(true));
    window.addEventListener('load', () => requestLayout(true));
    document.fonts?.ready.then(() => requestLayout(true));
    // content above an effect changed height (images, fonts, accordions): re-measure positions
    if ('ResizeObserver' in window) new ResizeObserver(() => requestLayout(true)).observe(document.body);
  }
  if (!loopId) loopId = requestAnimationFrame(frame);
}

/**
 * Register a scroll effect. `setup` returns { layout?, frame?, cleanup? }:
 * layout() caches measurements, frame(scrollY) writes styles and may return true to ask for another frame.
 */
export function useScrollEffect(setup, deps = []) {
  useEffect(() => {
    const fx = setup();
    if (!fx) return undefined;
    ensureLoop();
    if (fx.layout) {
      layoutSubs.add(fx.layout);
      fx.layout();
    }
    if (fx.frame) frameSubs.add(fx.frame);
    needsFrame = true;
    return () => {
      layoutSubs.delete(fx.layout);
      frameSubs.delete(fx.frame);
      fx.cleanup?.();
    };
  }, deps);
}

/* The team deck (touch only) scrolls the page back and forth while it spins; the header reads this
   range to stay put instead of hiding and re-showing on every drag. */
let deckRange = null;
export const setDeckRange = (range) => {
  deckRange = range;
};
export const inDeckRange = (y) => !!deckRange && y >= deckRange[0] && y <= deckRange[1];

export function useSmoothScroll() {
  useEffect(() => {
    ensureLoop();
    if (prefersReducedMotion()) return undefined;
    // Wheel/trackpad only. Touch keeps the browser's native finger + momentum scrolling (syncTouch off):
    // it is what iOS/Android users expect, it never fights the address bar or rubber-banding, and it
    // keeps CSS scroll-snap working. The scroll-linked effects smooth themselves on touch instead.
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    return () => {
      lenis.destroy();
      lenis = null;
    };
  }, []);
}

export function scrollToHash(hash) {
  const el = hash === '#top' ? document.body : document.querySelector(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: hash === '#top' ? 0 : -72, duration: 1.4 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Scroll to an absolute position, through Lenis when it is active. */
export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 0.9 });
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/**
 * Calls onProgress(0..1) as an element travels through the viewport, from the shared loop.
 * Positions are cached on layout, so a frame does no layout reads, only arithmetic.
 */
export function useScrollProgress(ref, { start = 'top bottom', end = 'bottom top' } = {}, onProgress) {
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useScrollEffect(() => {
    const el = ref.current;
    if (!el) return null;
    let top = 0;
    let height = 0;
    let last = -1;
    const edge = (spec, y, h) => {
      const [elEdge, vpEdge] = spec.split(' ');
      const t = top - y;
      const elPos = elEdge === 'top' ? t : elEdge === 'bottom' ? t + height : t + height / 2;
      const vpPos = vpEdge === 'top' ? 0 : vpEdge === 'bottom' ? h : h / 2;
      return elPos - vpPos;
    };
    return {
      layout: () => {
        const r = el.getBoundingClientRect();
        top = r.top + window.scrollY;
        height = r.height;
        last = -1;
      },
      frame: (y) => {
        const h = viewportHeight();
        const a = edge(start, y, h);
        const b = edge(end, y, h);
        const p = Math.min(1, Math.max(0, a / (a - b)));
        if (last < 0 || Math.abs(p - last) > 0.0005) {
          last = p;
          cb.current(p);
        }
      },
    };
  }, [ref, start, end]);
}

/** Adds `is-in` to any [data-reveal] element once it enters the viewport. */
export function useRevealAll() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -10% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), options);
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}
