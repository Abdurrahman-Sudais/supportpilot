// SupportPilot rules: retrieve answers only from approved knowledge (TF-IDF over sentences), cite the source,
// score confidence and escalate below a threshold; categorise, prioritise and route tickets; summarise; and find
// recurring issues. Drafts are suggestions for agents.
import {articles as ALL} from './data.js';

export const can = (roles, roleId, perm) => !!roles.find((r) => r.id === roleId)?.can.includes(perm);
const STOP = new Set('a an the and or to of for in on at is are was were be been it its i my me we our you your can how do does did what where when why with this that from as by not no please hi hello help get got need want there any all so if into about have has just use using way there would like know tell able nimbus note notes work without'.split(' '));
const STEM = (w) => w.replace(/(ing|ed|es|s)$/, '');
export const tokens = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(STEM);
const SYN = {charg: ['refund', 'duplicate', 'invoice'], login: ['sign', 'password'], 'log': ['sign'], phone: ['device', 'two-factor'], download: ['export'], cancel: ['subscription'], crash: ['bug'], offline: ['offline'], plane: ['offline'], internet: ['offline', 'connection'], '429': ['rate', 'limit']};

function index(articles) {
  const docs = articles.flatMap((a) => a.body.split(/(?<=\.)\s+/).map((s, i) => ({a, i, s, t: tokens(`${a.title} ${s}`)})));
  const df = {}; docs.forEach((d) => new Set(d.t).forEach((w) => { df[w] = (df[w] || 0) + 1; }));
  return {docs, idf: (w) => Math.log(1 + docs.length / (df[w] || 0.5)), df};
}

/** Answer a question from approved articles only. Returns the answer, citations, confidence and whether to escalate. */
export function answer(q, {articles = ALL, threshold = 0.45} = {}) {
  const approved = articles.filter((a) => a.approved);
  const {docs, idf, df} = index(approved);
  let qt = tokens(q); qt = [...new Set([...qt, ...qt.flatMap((w) => SYN[w] || [])])];
  if (!qt.length) return {text: null, cites: [], confidence: 0, escalate: true, reason: 'No question detected'};
  const scored = docs.map((d) => ({...d, sc: qt.reduce((s, w) => s + (d.t.includes(w) ? idf(w) : 0), 0)}));
  const byArticle = {}; scored.forEach((d) => { byArticle[d.a.id] = (byArticle[d.a.id] || 0) + d.sc; });
  const ranked = Object.entries(byArticle).sort((a, b) => b[1] - a[1]);
  const [topId, top] = ranked[0] || [null, 0]; const second = ranked[1]?.[1] || 0;
  const known = qt.filter((w) => df[w]).length / qt.length;
  const margin = top ? (top - second) / top : 0;
  const confidence = Math.max(0, Math.min(0.97, (top > 0 ? 0.25 : 0) + 0.45 * known + 0.3 * margin));
  const art = approved.find((a) => a.id === topId);
  if (!art || confidence < threshold) return {text: null, cites: art && top > 0 ? [art.id] : [], confidence, escalate: true, reason: !art || top === 0 ? 'No approved source covers this question' : 'Confidence below the escalation threshold'};
  // The best sentence, plus the next best only if it is nearly as relevant.
  const best = scored.filter((d) => d.a.id === topId && d.sc > 0).sort((a, b) => b.sc - a.sc);
  const sents = best.filter((d, i) => i === 0 || (i === 1 && d.sc >= 0.6 * best[0].sc)).sort((a, b) => a.i - b.i);
  return {text: sents.map((d) => d.s).join(' '), cites: [art.id], title: art.title, confidence, escalate: false};
}

const CATS = [['Billing', ['charg', 'refund', 'invoice', 'vat', 'plan', 'billing', 'payment', 'card']], ['Account access', ['password', 'login', 'log', 'two-factor', 'phone', 'sign', 'locked']], ['Data & export', ['export', 'download everything', 'backup', 'move']], ['Bug report', ['crash', 'error', 'broken', 'bug', '429', 'fail']], ['Cancellation', ['cancel', 'close account']], ['Product question', ['offline', 'feature', 'work', 'use']]];
const ROUTE = {Billing: 'Billing team', 'Account access': 'Tier 1', 'Data & export': 'Tier 1', 'Bug report': 'Engineering', Cancellation: 'Retention', 'Product question': 'Tier 1', Other: 'Tier 1'};

export function categorise(t) {
  const text = `${t.subject} ${t.body}`.toLowerCase();
  const scores = CATS.map(([c, keys]) => [c, keys.filter((k) => text.includes(k)).length]).sort((a, b) => b[1] - a[1]);
  const category = scores[0][1] ? scores[0][0] : 'Other';
  const priority = /urgent|today|crash|charged twice|cannot (get|log)|locked out|since this morning/.test(text) ? 'High' : /cancel|refund/.test(text) ? 'Medium' : 'Normal';
  return {category, priority, route: ROUTE[category]};
}

/** Extractive summary: the request, the category and any key details found. */
export function summarise(t) {
  const first = t.body.split(/(?<=[.?!])\s+/).find((s) => /\?|can|please|need|cannot|keeps|crash/i.test(s)) || t.body.split(/(?<=[.?!])\s+/)[0];
  const details = [...t.body.matchAll(/\b(version [\d.]+|windows|mac|annual plan|monthly plan|\d+ days ago|429)\b/gi)].map((m) => m[0]);
  return `${t.from.split('@')[0]} (${t.channel}): ${first.trim()}${details.length ? ` Details: ${[...new Set(details)].join(', ')}.` : ''}`;
}

/** Recurring issues: groups of tickets sharing a category and a key term. */
export function recurring(tickets) {
  const groups = {};
  tickets.forEach((t) => {
    const c = categorise(t).category;
    const terms = tokens(`${t.subject} ${t.body}`).filter((w) => ['charg', 'twice', 'invoice', 'password', 'export', 'crash', 'refund', '429', 'cancel'].includes(w));
    terms.forEach((w) => { const k = `${c}|${w}`; (groups[k] ||= new Set()).add(t.id); });
  });
  return Object.entries(groups).map(([k, s]) => ({category: k.split('|')[0], term: k.split('|')[1], tickets: [...s]})).filter((g) => g.tickets.length >= 2).sort((a, b) => b.tickets.length - a.tickets.length)
    .filter((g, i, arr) => arr.findIndex((h) => h.tickets.join() === g.tickets.join()) === i);
}

export function triage(t, opts) {
  const c = categorise(t); const a = answer(`${t.subject}. ${t.body}`, opts);
  const bug = c.category === 'Bug report';
  return {...c, ...a, summary: summarise(t), escalate: a.escalate || bug, reason: bug ? 'Bug reports always go to Engineering (the draft is a suggestion for the agent)' : a.reason};
}

export function initial(roles, articles) { return {threshold: 0.45, approved: Object.fromEntries(articles.map((a) => [a.id, a.approved])), status: {}, edits: {}, log: [], role: roles[0].id}; }
const now = () => new Date().toISOString();

export function act(state, a, {roles, actor}) {
  const fail = (error) => ({state, ok: false, error});
  if (a.type === 'role') return {state: {...state, role: a.role}, ok: true};
  const allow = (p) => can(roles, state.role, p);
  const log = (ref, summary, patch) => ({ok: true, state: {...state, ...patch, log: [{at: now(), actor, ref, summary}, ...state.log]}});
  switch (a.type) {
    case 'send': {
      if (!allow('send')) return fail('Only agents and managers send replies.');
      if (!a.text || a.text.trim().length < 10) return fail('The reply is empty.');
      if (!a.cites?.length) return fail('Replies must cite an approved source; escalate instead.');
      const edited = a.text.trim() !== (a.draft || '').trim();
      return log(a.id, `Reply sent${edited ? ' (edited)' : ''} citing ${a.cites.join(', ')}`, {status: {...state.status, [a.id]: {s: edited ? 'sent-edited' : 'sent', by: actor}}, edits: {...state.edits, [a.id]: a.text.trim()}});
    }
    case 'escalate':
      if (!allow('escalate')) return fail('Only agents and managers escalate.');
      return log(a.id, `Escalated to ${a.to}`, {status: {...state.status, [a.id]: {s: 'escalated', to: a.to, by: actor}}});
    case 'resolve':
      if (!allow('escalate')) return fail('Only agents and managers resolve tickets.');
      if ((a.note || '').trim().length < 8) return fail('Add a resolution note (at least 8 characters).');
      return log(a.id, `Resolved — ${a.note.trim()}`, {status: {...state.status, [a.id]: {s: 'resolved', by: actor, note: a.note.trim()}}});
    case 'approve':
      if (!allow('kb')) return fail('Only the support manager approves knowledge.');
      return log(a.id, `${a.value ? 'Approved' : 'Unapproved'} article`, {approved: {...state.approved, [a.id]: !!a.value}});
    case 'threshold':
      if (!allow('policy')) return fail('Only the support manager sets the escalation threshold.');
      if (a.value < 0.2 || a.value > 0.9) return fail('Choose a threshold between 0.20 and 0.90.');
      return log('policy', `Escalation threshold → ${a.value.toFixed(2)}`, {threshold: a.value});
    default: return fail('Unknown action.');
  }
}
