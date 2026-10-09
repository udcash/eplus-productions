import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

let lenis = null;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
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

export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/** Progress (0..1) of an element travelling through the viewport, updated each frame while visible. */
export function useScrollProgress(ref, { start = 'top bottom', end = 'bottom top' } = {}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const edge = (spec, rect, vh) => {
      const [elEdge, vpEdge] = spec.split(' ');
      const elPos = elEdge === 'top' ? rect.top : elEdge === 'bottom' ? rect.bottom : rect.top + rect.height / 2;
      const vpPos = vpEdge === 'top' ? 0 : vpEdge === 'bottom' ? vh : vh / 2;
      return elPos - vpPos;
    };
    let raf;
    let last = -1;
    const tick = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const a = edge(start, rect, vh);
      const b = edge(end, rect, vh);
      const p = Math.min(1, Math.max(0, a / (a - b)));
      if (Math.abs(p - last) > 0.0005) {
        last = p;
        setProgress(p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ref, start, end]);
  return progress;
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
