// Interaction layer: scroll reveals, magnetic buttons, tilt cards, pointer spotlights, a custom cursor and a
// scroll-progress bar. Everything is progressive: content is fully visible without JavaScript, nothing is added
// inside the React root (so hydration is never disturbed), and all motion is skipped for reduced-motion users.
export function startFx(opts = {}) {
  if (typeof window === 'undefined' || window.__fx) return;
  window.__fx = true;
  const o = {cursor: 'dot', prefix: 'fx', progress: true, magnet: 0.3, tilt: 8, ...opts};
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;
  const root = document.documentElement;
  if (reduced || typeof IntersectionObserver === 'undefined') { root.classList.add(`${o.prefix}-static`); return; }
  root.classList.add(`${o.prefix}-js`);

  // Reveal: [data-r] gains .in when it enters the viewport; children can stagger with --i.
  const els = [...document.querySelectorAll('[data-r]')];
  const show = (el) => el.classList.add('in');
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
  els.forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${(i % 4) * 80}ms`); io.observe(el); });
  let st = 0;
  addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => els.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) show(el); }), 160); }, {passive: true});

  // Scroll progress bar (outside the React root).
  if (o.progress) {
    const bar = document.createElement('div'); bar.className = `${o.prefix}-progress`; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    const upd = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
    addEventListener('scroll', upd, {passive: true}); upd();
  }

  if (!fine) return;

  // Pointer-driven effects, delegated so they also work on elements rendered later.
  let raf = 0; let px = innerWidth / 2; let py = innerHeight / 2;
  addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY;
    const spot = e.target.closest?.('[data-spot]');
    if (spot) { const r = spot.getBoundingClientRect(); spot.style.setProperty('--mx', `${e.clientX - r.left}px`); spot.style.setProperty('--my', `${e.clientY - r.top}px`); }
    const tilt = e.target.closest?.('[data-tilt]');
    if (tilt) { const r = tilt.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; tilt.style.transform = `perspective(900px) rotateY(${x * o.tilt}deg) rotateX(${-y * o.tilt}deg)`; }
    const mag = e.target.closest?.('[data-magnetic]');
    if (mag) { const r = mag.getBoundingClientRect(); mag.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * o.magnet}px, ${(e.clientY - r.top - r.height / 2) * o.magnet}px)`; }
  }, {passive: true});
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest?.('[data-tilt], [data-magnetic]');
    if (t && !t.contains(e.relatedTarget)) t.style.transform = '';
  });

  // Custom cursor: a follower that grows over interactive elements and can show a label from data-cursor.
  if (o.cursor) {
    const c = document.createElement('div'); c.className = `${o.prefix}-cursor ${o.prefix}-cursor--${o.cursor}`; c.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); c.appendChild(label); document.body.appendChild(c);
    let cx = px; let cy = py;
    const loop = () => { cx += (px - cx) * 0.2; cy += (py - cy) * 0.2; c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest?.('a, button, [data-cursor], input, select, textarea, summary, label');
      c.classList.toggle('is-hover', !!t);
      const l = t?.getAttribute?.('data-cursor') || '';
      label.textContent = l; c.classList.toggle('has-label', !!l);
    });
    document.addEventListener('pointerleave', () => c.classList.add('is-gone'));
    document.addEventListener('pointerenter', () => c.classList.remove('is-gone'));
    addEventListener('pointerdown', () => c.classList.add('is-down'));
    addEventListener('pointerup', () => c.classList.remove('is-down'));
  }
}

/** Run a state change inside a View Transition where supported. */
export const vt = (fn) => (typeof document !== 'undefined' && document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches ? document.startViewTransition(fn) : fn());
