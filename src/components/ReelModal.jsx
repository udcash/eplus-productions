import { useEffect, useRef } from 'react';
import { lockScroll } from '../hooks.js';

export default function ReelModal({ open, onClose }) {
  const video = useRef(null);
  const closeBtn = useRef(null);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    closeBtn.current?.focus();
    video.current?.play().catch(() => {});
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      video.current?.pause();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`reel ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Teaser reel" inert={open ? undefined : ''} onClick={onClose}>
      <div className="reel__frame" onClick={(e) => e.stopPropagation()}>
        {open && <video ref={video} src="projects/reel.mp4" controls playsInline poster="timeline/img_0809.webp" />}
      </div>
      <button ref={closeBtn} type="button" className="reel__close" onClick={onClose}>
        Close <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
