import test from 'node:test';
import assert from 'node:assert/strict';
import site from '../src/content.js';
import {articles, people, roles, tickets} from '../src/data.js';
import {act, answer, categorise, initial, recurring, summarise, triage} from '../src/engine.js';

test('answers quote approved articles and cite them', () => {
  const r = answer('I was charged twice, can I get a refund?');
  assert.equal(r.escalate, false); assert.deepEqual(r.cites, ['KB-03']);
  assert.ok(articles.find((a) => a.id === 'KB-03').body.includes(r.text), 'the answer is a passage from the source');
  assert.match(r.text, /duplicate charge/);
});

test('unknown or unapproved topics escalate instead of guessing', () => {
  assert.equal(answer('What is the weather in Lagos?').escalate, true);
  assert.equal(answer('Can I use it offline on a plane?').escalate, true, 'the offline article is still a draft');
  const kb = articles.map((a) => (a.id === 'KB-10' ? {...a, approved: true} : a));
  const r = answer('Can I use it offline on a plane?', {articles: kb});
  assert.equal(r.escalate, false); assert.deepEqual(r.cites, ['KB-10']);
});

test('a higher threshold escalates more', () => {
  const qs = ['How do I reset my password?', 'lost my phone cannot log in', 'how to download invoice pdf'];
  const lo = qs.filter((q) => answer(q, {threshold: 0.3}).escalate).length; const hi = qs.filter((q) => answer(q, {threshold: 0.9}).escalate).length;
  assert.ok(hi > lo);
});

test('tickets are categorised, prioritised, routed and summarised; bugs always reach engineering', () => {
  const by = Object.fromEntries(tickets.map((t) => [t.id, categorise(t)]));
  assert.deepEqual([by['T-1201'].category, by['T-1201'].route, by['T-1201'].priority], ['Billing', 'Billing team', 'High']);
  assert.equal(by['T-1205'].route, 'Engineering');
  assert.equal(by['T-1208'].route, 'Retention');
  assert.equal(triage(tickets.find((t) => t.id === 'T-1210')).escalate, true);
  assert.match(summarise(tickets[4]), /Version 4.2/i);
});

test('recurring issues group related tickets', () => {
  const g = recurring(tickets);
  assert.ok(g[0].tickets.length >= 3 && g[0].category === 'Billing');
});

test('replies must cite a source; only managers approve knowledge or change the threshold', () => {
  const ctx = (s) => ({roles, actor: people[s.role]});
  let s = initial(roles, articles);
  assert.match(act(s, {type: 'send', id: 'T-1209', text: 'We think it works offline.', cites: []}, ctx(s)).error, /cite/);
  s = act(s, {type: 'send', id: 'T-1201', text: 'Hi Ada, we refund duplicate charges within 5 business days.', draft: 'x', cites: ['KB-03']}, ctx(s)).state;
  assert.equal(s.status['T-1201'].s, 'sent-edited');
  assert.equal(act(s, {type: 'approve', id: 'KB-10', value: true}, ctx(s)).ok, false);
  const m = act(s, {type: 'role', role: 'manager'}, ctx(s)).state;
  assert.equal(act(m, {type: 'approve', id: 'KB-10', value: true}, ctx(m)).state.approved['KB-10'], true);
  assert.equal(act(m, {type: 'threshold', value: 0.95}, ctx(m)).ok, false);
});

test('founder and contact', () => {
  assert.equal(site.team[0].name, 'Victor Adebayo');
  assert.equal(site.email, 'victor@supportpilot.top');
});
