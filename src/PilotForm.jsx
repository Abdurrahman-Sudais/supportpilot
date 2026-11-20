import React, {useState} from 'react';
import site from './content.js';
import {COMPANY_SIZES, ORG_TYPES, USE_CASES, blankPilot, hubspot, pilotPayload, send, validatePilot} from './forms.js';

const ID = 'pf';
const opts = (list) => [<option key="" value="">Choose…</option>, ...list.map((x) => <option key={x}>{x}</option>)];

/** Pilot request. Posts to HubSpot when configured; otherwise keeps the request in this browser and offers a pre-filled email. */
export default function PilotForm({submitLabel = 'Request a demo'}) {
  const [f, setF] = useState(blankPilot);
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(null);
  const set = (k, v) => setF((x) => ({...x, [k]: v}));
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validatePilot(f); setErr(e);
    if (Object.keys(e).length) { document.getElementById(`${ID}-${Object.keys(e)[0]}`)?.focus(); return; }
    if (f.website) { setSent('local'); return; }
    const hs = hubspot('pilot');
    if (hs) { try { if (await send(hs, pilotPayload(f, {pageUri: location.href, pageName: document.title}))) { setSent('hubspot'); return; } } catch { /* fall back to email */ } }
    try { const k = 'supportpilot-pilot-requests'; localStorage.setItem(k, JSON.stringify([...JSON.parse(localStorage.getItem(k) || '[]'), {...f, website: undefined, at: new Date().toISOString()}])); } catch { /* storage unavailable */ }
    setSent('local');
  };
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`SupportPilot demo request — ${f.company}`)}&body=${encodeURIComponent(`Name: ${f.name}\nEmail: ${f.email}\nCompany: ${f.company}\nCompany size: ${f.size}\nType: ${f.kind}\nUse case: ${f.useCase}\nSupport volume and team: ${f.detail}\n\n${f.message}`)}`;
  const field = (k) => ({id: `${ID}-${k}`, 'aria-invalid': err[k] ? true : undefined, 'aria-describedby': err[k] ? `${ID}-${k}-e` : undefined});
  const E = ({k}) => (err[k] ? <span className="fm-err" id={`${ID}-${k}-e`} role="alert">{err[k]}</span> : null);
  if (sent) return (
    <div className="fm-sent" role="status">
      <h3>Thank you, {f.name.split(' ')[0] || 'there'}.</h3>
      {sent === 'hubspot' ? <p>Your request is on its way. {site.team[0].name.split(' ')[0]} will reply personally.</p> : <><p>Your request is saved in this browser. Send it as an email so it reaches us — it is pre-filled.</p><a className="btn" href={mailto}>Email {site.email}</a></>}
      <button type="button" className="fm-link" onClick={() => setSent(null)}>Edit request</button>
    </div>
  );
  return (
    <form noValidate onSubmit={submit} className="fm" aria-label="Request a demo">
      <label>Full name *<input {...field('name')} autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} /><E k="name" /></label>
      <label>Work email *<input {...field('email')} type="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} /><E k="email" /></label>
      <label>Company *<input {...field('company')} autoComplete="organization" value={f.company} onChange={(e) => set('company', e.target.value)} /><E k="company" /></label>
      <label>Company size *<select {...field('size')} value={f.size} onChange={(e) => set('size', e.target.value)}>{opts(COMPANY_SIZES)}</select><E k="size" /></label>
      <label>Business type *<select {...field('kind')} value={f.kind} onChange={(e) => set('kind', e.target.value)}>{opts(ORG_TYPES)}</select><E k="kind" /></label>
      <label>Primary use case *<select {...field('useCase')} value={f.useCase} onChange={(e) => set('useCase', e.target.value)}>{opts(USE_CASES)}</select><E k="useCase" /></label>
      <label className="fm-wide">Support volume and team (optional)<input value={f.detail} placeholder={"e.g. ~3,000 tickets a month · 8 agents · Zendesk"} onChange={(e) => set('detail', e.target.value)} /></label>
      <label className="fm-wide">Message (optional)<textarea {...field('message')} rows="3" value={f.message} onChange={(e) => set('message', e.target.value)} /><E k="message" /></label>
      <div className="fm-hp" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} /></label></div>
      <label className="fm-check fm-wide"><input type="checkbox" {...field('consent')} checked={f.consent} onChange={(e) => set('consent', e.target.checked)} /> <span>SupportPilot may contact me about this request. *</span><E k="consent" /></label>
      <button className="btn fm-wide" type="submit">{submitLabel}</button>
      <p className="fm-fine fm-wide">We use these details only to respond to your request. See the <a href="/privacy">privacy notice</a>.</p>
    </form>
  );
}
