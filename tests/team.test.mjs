import test from 'node:test';
import assert from 'node:assert/strict';
import site from '../src/content.js';

test('founding team: founder, co-founder and CTO, each with a bio and focus areas', () => {
  assert.deepEqual(site.team.map((p) => p.role), ['Founder', 'Co-founder', 'CTO']);
  for (const p of site.team) { assert.ok(p.name && p.bio.length > 60 && p.focus.length === 3); assert.equal(p.initials, p.name.split(' ').map((w) => w[0]).join('')); }
});
