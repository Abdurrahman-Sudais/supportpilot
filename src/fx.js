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
  root.classList.add(`${o.prefix}-js`, 'fx-flow');
  autoFlow(document.getElementById('main'));

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

// Flow: the WearInterval-style scroll choreography. Headings, their eyebrows and intros, and the items of every
// card grid fade, rise and sharpen into place one after another as they enter the viewport. Only data attributes
// and a CSS variable are touched (never classes or text), so React's hydration and later renders are unaffected.
function autoFlow(main) {
  if (!main) return;
  const SKIP = 'header, footer, form, nav, [role="tablist"], [aria-hidden="true"], svg, table, .fm, [data-noflow]';
  const ok = (el) => el && !el.hasAttribute('data-r') && !el.closest('[data-r]') && !el.closest(SKIP) && !el.hasAttribute('data-fx');
  const targets = [];
  const add = (el, d) => { if (ok(el)) { el.setAttribute('data-fx', 'wait'); el.style.setProperty('--fx-d', `${d}ms`); targets.push(el); } };
  // 1. Section headings with the eyebrow just above them and the paragraphs just below.
  main.querySelectorAll('section h2').forEach((h) => {
    if (h.closest('#main > section:first-child') && !h.closest('.sec, [id]')) return;
    const prev = h.previousElementSibling; let d = 0;
    if (prev && prev.tagName !== 'H2' && prev.textContent.trim().length < 80 && !prev.querySelector('h2')) { add(prev, d); d += 80; }
    add(h, d); d += 110;
    let n = h.nextElementSibling; let k = 0;
    while (n && k < 3 && ['P', 'PRE', 'UL', 'OL', 'DL'].includes(n.tagName)) { add(n, d); d += 90; n = n.nextElementSibling; k += 1; }
  });
  // 2. The items of card grids and wrapping rows, staggered left to right.
  main.querySelectorAll('section *').forEach((box) => {
    if (box.closest(SKIP) || box.closest('[data-r]') || box.children.length < 2 || box.children.length > 16) return;
    const cs = getComputedStyle(box);
    const isGrid = cs.display === 'grid' || cs.display === 'inline-grid' || (cs.display === 'flex' && cs.flexWrap === 'wrap');
    if (!isGrid) return;
    const kids = [...box.children].filter((c) => !['BUTTON', 'A', 'INPUT', 'LABEL', 'SELECT', 'OPTION', 'SPAN', 'B', 'I', 'EM', 'SMALL'].includes(c.tagName));
    if (kids.length < 2 || kids.some((c) => c.hasAttribute('data-r') || c.querySelector('[data-r]'))) return;
    if (kids.some((c) => c.querySelector('section'))) return;
    kids.forEach((c, i) => add(c, (i % 6) * 85));
  });
  if (!targets.length) return;
  const settle = (el) => setTimeout(() => el.setAttribute('data-fx', 'done'), 1400 + (parseFloat(el.style.getPropertyValue('--fx-d')) || 0));
  const show = (el) => { if (el.getAttribute('data-fx') === 'wait') { el.setAttribute('data-fx', 'in'); settle(el); } };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), {rootMargin: '0px 0px -6% 0px', threshold: 0.06});
  targets.forEach((el) => io.observe(el));
  // Fast scrolling or anchor jumps can skip an intersection: reveal anything already above the viewport bottom.
  let raf = 0;
  const sweep = () => { raf = 0; targets.forEach((el) => { if (el.getAttribute('data-fx') === 'wait' && el.getBoundingClientRect().top < innerHeight) { show(el); io.unobserve(el); } }); };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sweep); }, {passive: true});
  setTimeout(sweep, 350);
}
