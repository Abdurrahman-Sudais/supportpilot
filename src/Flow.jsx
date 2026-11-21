import React, {useEffect, useRef, useState} from 'react';

// Flow components shared by every site. Each renders its final state on the server (so prerendered HTML and
// hydration match) and only animates in the browser.
const still = () => typeof window === 'undefined' || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

/** Splits string children into words that rise in one after another; elements animate as single units. */
export function Words({children, start = 0}) {
  let i = start;
  const out = [];
  React.Children.forEach(children, (c, k) => {
    if (typeof c === 'string') {
      c.split(/(\s+)/).forEach((w, j) => { if (!w) return; if (/^\s+$/.test(w)) out.push(w); else out.push(<span key={`${k}-${j}`} className="fw" style={{'--i': i++}}>{w}</span>); });
    } else if (React.isValidElement(c)) {
      out.push(<span key={k} className="fwi" style={{'--i': i++}}>{c}</span>);
    } else if (c != null) out.push(c);
  });
  return out;
}

/** Cycles through items every few seconds. */
export function Cycle({items, ms = 2600, lead}) {
  const [i, setI] = useState(0);
  useEffect(() => { if (still()) return undefined; const t = setInterval(() => setI((n) => (n + 1) % items.length), ms); return () => clearInterval(t); }, [items.length, ms]);
  return <span className="fcycle">{lead && <span>{lead}</span>}<b key={i} aria-live="polite">{items[i]}</b></span>;
}

/** Counts up to `to` the first time it scrolls into view. Renders the final value until then. */
export function Count({to, decimals = 0, prefix = '', suffix = '', ms = 1500}) {
  const ref = useRef(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || still() || typeof IntersectionObserver === 'undefined') return undefined;
    let raf = 0; let started = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started) return; started = true; io.disconnect();
      const t0 = performance.now();
      const tick = (now) => { const p = Math.min(1, (now - t0) / ms); setV(to * (1 - (1 - p) ** 3)); if (p < 1) raf = requestAnimationFrame(tick); };
      setV(0); raf = requestAnimationFrame(tick);
    }, {threshold: 0.4});
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, ms]);
  return <span ref={ref}>{prefix}{v.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}{suffix}</span>;
}

/** A slow, hover-pausable band of words (duplicated so the loop is seamless). */
export function Marquee({items, label}) {
  return (
    <div className="fmq" role="region" aria-label={label}>
      <div className="fmq-track">{[0, 1].map((r) => items.map((t) => <span key={`${r}-${t}`} aria-hidden={r === 1 ? 'true' : undefined}>{t}</span>))}</div>
    </div>
  );
}

/** A strip of count-up figures about the prototype. */
export function Stats({items, label = 'The prototype at a glance', note = 'Figures from the prototype’s sample data.'}) {
  return (
    <section className="fstats-wrap" aria-label={label}>
      <dl className="fstats">{items.map(([v, l, pre = '', suf = '']) => <div key={l}><dt>{l}</dt><dd><Count to={v} prefix={pre} suffix={suf} /></dd></div>)}</dl>
      <p className="fstats-note">{note}</p>
    </section>
  );
}
