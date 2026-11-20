import React, {useEffect, useState} from 'react';
import {flushSync} from 'react-dom';
import site from './content.js';
import {PRODUCT, articles, people, roles, tickets} from './data.js';
import {act, can, initial, recurring, triage} from './engine.js';
import {vt} from './fx.js';
import {Chat, Logo} from './App.jsx';

const KEY = 'supportpilot-console-v1';
const TEAMS = ['Tier 1', 'Billing team', 'Engineering', 'Retention'];

export default function Console() {
  const [state, setState] = useState(() => initial(roles, articles));
  const [tab, setTab] = useState('inbox');
  const [sel, setSel] = useState('T-1201');
  const [drafts, setDrafts] = useState({});
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s?.approved) setState(s); } catch { /* ignore */ } }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);

  const actor = people[state.role];
  const allow = (p) => can(roles, state.role, p);
  const run = (a, after) => { const r = act(state, a, {roles, actor}); setMsg(r.ok ? '' : r.error); if (r.ok) { setState(r.state); after?.(); } };
  const go = (t) => vt(() => flushSync(() => { setTab(t); setMsg(''); }));
  const pick = (id) => vt(() => flushSync(() => { setSel(id); setNote(''); setMsg(''); }));
  const kb = articles.map((a) => ({...a, approved: !!state.approved[a.id]}));
  const rows = tickets.map((t) => ({t, r: triage(t, {articles: kb, threshold: state.threshold})}));
  const cur = rows.find((x) => x.t.id === sel);
  const draftText = (x) => drafts[x.t.id] ?? (x.r.text ? `Hi ${x.t.from.split('@')[0]},\n\n${x.r.text}\n\nSource: ${x.r.cites[0]} · ${x.r.title}` : '');
  const st = (id) => state.status[id]?.s || 'open';
  const esc = rows.filter((x) => st(x.t.id) === 'escalated' || (st(x.t.id) === 'open' && x.r.escalate));
  const rec = recurring(tickets);
  const count = (f) => rows.filter(f).length;

  return (
    <div className="cs">
      <header className="cs-top">
        <a href="/" className="brand" aria-label="Back to the SupportPilot website"><Logo size={26} /><span>SupportPilot</span></a>
        <span className="mono">{PRODUCT} · escalate below {Math.round(state.threshold * 100)}%</span>
        <label className="cs-role">Signed in as <select value={state.role} onChange={(e) => run({type: 'role', role: e.target.value})}>{roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
        <button className="btn ghost sm" onClick={() => { setState(initial(roles, articles)); setDrafts({}); setMsg(''); }}>Reset</button>
      </header>
      <p className="cs-banner">Fictional product, knowledge base and customers · drafts answer only from approved articles · agents review before sending</p>
      <main className="cs-main">
        <div className="cs-head"><h1>{site.app.title}</h1><div className="cs-tabs" role="tablist">{[['inbox', 'Inbox'], ['esc', `Escalations · ${esc.length}`], ['test', 'Test chat'], ['kb', 'Knowledge'], ['rec', 'Recurring'], ['stats', 'Analytics']].map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => go(id)}>{l}</button>)}</div></div>
        {msg && <p className="cs-err" role="alert">{msg}</p>}

        {tab === 'inbox' && (<div className="cs-grid">
          <aside className="panel"><h2>Inbox <small>{count((x) => st(x.t.id) === 'open')} open</small></h2><ul className="tix">{rows.map(({t, r}) => <li key={t.id}><button className={t.id === sel ? 'on' : ''} onClick={() => pick(t.id)}><span className={`pri p-${r.priority.toLowerCase()}`}>{r.priority}</span><span><b>{t.subject}</b><small>{t.id} · {r.category} → {r.route} · {st(t.id)}</small></span><span className={r.escalate ? 'flag h' : 'flag b'} title={r.escalate ? 'Needs a person' : 'Draft ready'}>{r.escalate ? '👤' : '✓'}</span></button></li>)}</ul></aside>
          <section className="panel" style={{viewTransitionName: 'tk'}}>
            <p className="mono">{cur.t.id} · {cur.t.channel} · {cur.t.from} · {cur.t.minsAgo} min ago</p>
            <h2>{cur.t.subject}</h2>
            <div className="bub q big">{cur.t.body}</div>
            <dl className="meta"><div><dt>Category</dt><dd>{cur.r.category}</dd></div><div><dt>Priority</dt><dd>{cur.r.priority}</dd></div><div><dt>Route</dt><dd>{cur.r.route}</dd></div><div><dt>Confidence</dt><dd>{Math.round(cur.r.confidence * 100)}%</dd></div></dl>
            <p className="summary"><b>Summary</b> {cur.r.summary}</p>
          </section>
          <aside className="panel"><h2>Reply</h2>
            {st(cur.t.id) !== 'open' ? <p className="done">{st(cur.t.id) === 'escalated' ? `Escalated to ${state.status[cur.t.id].to}` : st(cur.t.id) === 'resolved' ? `Resolved: “${state.status[cur.t.id].note}”` : `Sent${st(cur.t.id) === 'sent-edited' ? ' (edited)' : ''} by ${state.status[cur.t.id].by}`}</p> : <>
              {cur.r.escalate && <p className="warn">{cur.r.reason}.{cur.r.text ? ' A suggested answer is shown for the agent.' : ''}</p>}
              {cur.r.text ? <><label className="lbl">Draft · grounded in {cur.r.cites[0]}<textarea rows="8" value={draftText(cur)} onChange={(e) => setDrafts({...drafts, [cur.t.id]: e.target.value})} disabled={!allow('send')} /></label>
                <button className="btn sm" disabled={!allow('send')} onClick={() => run({type: 'send', id: cur.t.id, text: draftText(cur), draft: `Hi ${cur.t.from.split('@')[0]},\n\n${cur.r.text}\n\nSource: ${cur.r.cites[0]} · ${cur.r.title}`, cites: cur.r.cites})}>Approve and send</button></> : <p className="fine">No approved article covers this ticket, so there is no draft.</p>}
              <div className="acts">{TEAMS.map((tm) => <button key={tm} className={`btn ghost sm${tm === cur.r.route ? ' sug' : ''}`} disabled={!allow('escalate')} onClick={() => run({type: 'escalate', id: cur.t.id, to: tm})}>Escalate → {tm}</button>)}</div>
              <label className="lbl">Resolve with a note<input value={note} onChange={(e) => setNote(e.target.value)} disabled={!allow('escalate')} placeholder="e.g. Answered by phone" /></label>
              <button className="btn ghost sm" disabled={!allow('escalate')} onClick={() => run({type: 'resolve', id: cur.t.id, note}, () => setNote(''))}>Resolve</button></>}
            {!allow('send') && <p className="fine">The {roles.find((r) => r.id === state.role).label} role can view only.</p>}
          </aside>
        </div>)}

        {tab === 'esc' && (<div className="teams">{TEAMS.map((tm) => { const list = esc.filter((x) => (state.status[x.t.id]?.to || x.r.route) === tm); return <section key={tm} className="panel"><h2>{tm} <small>{list.length}</small></h2>{list.length ? <ul className="eq">{list.map(({t, r}) => <li key={t.id}><button className="link" onClick={() => { setSel(t.id); go('inbox'); }}>{t.id}</button> <b>{t.subject}</b><small>{r.summary}</small><span className="why">{state.status[t.id]?.s === 'escalated' ? `Escalated by ${state.status[t.id].by}` : r.reason}</span></li>)}</ul> : <p className="fine">Nothing waiting.</p>}</section>; })}</div>)}

        {tab === 'test' && (<div className="test"><Chat compact threshold={state.threshold} kb={kb} /><section className="panel"><h2>Test conversations</h2><p>Ask anything about the fictional product. The assistant answers only from articles currently approved in the Knowledge tab, cites them, and escalates below the threshold.</p>
          <label className="rng"><span>Escalate below <b>{Math.round(state.threshold * 100)}%</b></span><input type="range" min="0.2" max="0.9" step="0.05" value={state.threshold} disabled={!allow('policy')} onChange={(e) => run({type: 'threshold', value: Number(e.target.value)})} /></label>
          {!allow('policy') && <p className="fine">Only the support manager changes the threshold.</p>}<p className="fine">Try approving the draft “Offline mode” article, then ask about using the app offline.</p></section></div>)}

        {tab === 'kb' && (<section className="panel"><h2>Approved knowledge</h2><p className="fine">Only approved articles are used for answers and drafts.{allow('kb') ? '' : ' Only the support manager approves articles.'}</p>
          <ul className="kb">{kb.map((a) => <li key={a.id} className={a.approved ? '' : 'draft'}><div><p className="mono">{a.id} · updated {a.updated}</p><b>{a.title}</b><p>{a.body}</p></div><label className="sw"><input type="checkbox" checked={a.approved} disabled={!allow('kb')} onChange={(e) => run({type: 'approve', id: a.id, value: e.target.checked})} /><span>{a.approved ? 'Approved' : 'Not approved'}</span></label></li>)}</ul></section>)}

        {tab === 'rec' && (<section className="panel"><h2>Recurring issues</h2><ul className="rec">{rec.map((g) => <li key={g.term}><b>{g.tickets.length}</b><div><span>{g.category} · “{g.term === 'charg' ? 'charged' : g.term}”</span><small>{g.tickets.map((id) => tickets.find((t) => t.id === id).subject).join(' · ')}</small></div></li>)}</ul><p className="fine">Groups of two or more tickets that share a category and a key term.</p></section>)}

        {tab === 'stats' && (<div className="stats">
          <section className="panel"><h2>This queue</h2><dl className="kpis"><div><dt>Tickets</dt><dd>{rows.length}</dd></div><div><dt>Draft ready</dt><dd>{count((x) => !x.r.escalate)}</dd></div><div><dt>Needs a person</dt><dd>{count((x) => x.r.escalate)}</dd></div><div><dt>Sent</dt><dd>{count((x) => st(x.t.id).startsWith('sent'))}</dd></div><div><dt>Edited before sending</dt><dd>{count((x) => st(x.t.id) === 'sent-edited')}</dd></div><div><dt>Escalated</dt><dd>{count((x) => st(x.t.id) === 'escalated')}</dd></div></dl></section>
          <section className="panel"><h2>By category</h2><ul className="bars">{[...new Set(rows.map((x) => x.r.category))].map((c) => { const n = count((x) => x.r.category === c); return <li key={c}><span>{c}</span><i style={{'--w': `${(n / rows.length) * 100}%`}} /><b>{n}</b></li>; })}</ul></section>
          <section className="panel"><h2>Activity</h2><ul className="log">{state.log.map((l, i) => <li key={i}><time>{new Date(l.at).toLocaleTimeString()}</time> <b>{l.actor}</b> · {l.ref} · {l.summary}</li>)}{!state.log.length && <li className="fine">Send, escalate or resolve a ticket to see it here.</li>}</ul></section>
        </div>)}
      </main>
    </div>
  );
}
