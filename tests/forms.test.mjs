import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPANY_SIZES, ORG_TYPES, PROGRESS, TOPICS, USE_CASES, blankContact, blankPilot, contactPayload, hubspot, pilotPayload, validateContact, validatePilot} from '../src/forms.js';
import {ACROSS, SERVICES, STAGES} from '../src/aws.js';

const ctx = {pageUri: 'https://supportpilot.space/', pageName: 'SupportPilot'};

test('pilot request needs company size, organisation type and use case', () => {
  const f = {...blankPilot(), name: 'Ada Obi', email: 'ada@example.com', company: 'Obi & Co', consent: true};
  assert.deepEqual(Object.keys(validatePilot(f)).sort(), ['kind', 'size', 'useCase']);
  const ok = {...f, size: COMPANY_SIZES[1], kind: ORG_TYPES[0], useCase: USE_CASES[0], detail: 'x'};
  assert.deepEqual(validatePilot(ok), {});
  const names = pilotPayload(ok, ctx).fields.map((x) => x.name);
  for (const n of ['firstname', 'lastname', 'email', 'company', 'company_size', 'organisation_type', 'primary_use_case', 'support_detail']) assert.ok(names.includes(n), n);
});

test('contact form has a topic and its own HubSpot form', () => {
  assert.ok(validateContact(blankContact()).topic);
  const m = {...blankContact(), name: 'Tunde', email: 't@example.com', topic: TOPICS[0], message: 'A question about pilots.', consent: true};
  assert.deepEqual(validateContact(m), {});
  assert.equal(contactPayload(m, ctx).fields.find((x) => x.name === 'contact_topic').value, TOPICS[0]);
  assert.equal(hubspot('contact', {VITE_HUBSPOT_PORTAL_ID: '1', VITE_HUBSPOT_FORM_GUID: 'p'}), null);
  assert.deepEqual(hubspot('contact', {VITE_HUBSPOT_PORTAL_ID: '1', VITE_HUBSPOT_CONTACT_FORM_GUID: 'c'}), {portal: '1', form: 'c'});
});

test('AWS section: every stage and cross-stage service is explained, progress ends with what is next', () => {
  const listed = new Set(SERVICES.map(([n]) => n));
  for (const [, svcs] of STAGES) for (const s of svcs) assert.ok(listed.has(s), s);
  for (const [s] of ACROSS) assert.ok(listed.has(s), s);
  assert.equal(PROGRESS.at(-1)[0], 'Next');
});
