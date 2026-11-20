// Fictional knowledge base and tickets for the support-console prototype. "Nimbus Notes" is an invented product;
// customers, emails and order details are made up.

export const PRODUCT = 'Nimbus Notes (fictional)';

const A = (id, title, approved, updated, body) => ({id, title, approved, updated, body});
export const articles = [
  A('KB-01', 'Reset your password', true, '2026-06-02', 'To reset your password, choose “Forgot password” on the sign-in page and enter your account email. We send a reset link that expires after 30 minutes. If the email does not arrive, check your spam folder or ask your workspace admin to resend the invite.'),
  A('KB-02', 'Change or upgrade your plan', true, '2026-05-18', 'Workspace owners can change plan under Settings → Billing → Plan. Upgrades take effect immediately and are prorated on the next invoice. Downgrades take effect at the end of the current billing period.'),
  A('KB-03', 'Refund policy', true, '2026-04-30', 'Annual plans can be refunded in full within 14 days of purchase. Monthly plans are not refunded, but you can cancel at any time to stop future charges. If you were charged twice for the same invoice, we refund the duplicate charge within 5 business days.'),
  A('KB-04', 'Export your notes', true, '2026-06-10', 'You can export all notes as Markdown or PDF from Settings → Data → Export. Large workspaces are exported in the background and we email you a download link that is valid for 7 days.'),
  A('KB-05', 'Two-factor authentication', true, '2026-03-22', 'Turn on two-factor authentication under Profile → Security. You can use an authenticator app or a security key. If you lose your device, use one of your backup codes to sign in, then set up two-factor authentication again.'),
  A('KB-06', 'Cancel your subscription', true, '2026-05-02', 'Workspace owners can cancel under Settings → Billing → Cancel subscription. Your workspace stays active until the end of the paid period and then becomes read-only for 30 days before deletion.'),
  A('KB-07', 'Download invoices', true, '2026-06-14', 'Invoices are available under Settings → Billing → Invoices. Each invoice can be downloaded as a PDF. To add a VAT number or company address to future invoices, edit your billing details on the same page.'),
  A('KB-08', 'Add team members', true, '2026-02-11', 'Admins can invite team members from Settings → Members → Invite. Each member uses one seat on your plan. Invites expire after 7 days and can be resent.'),
  A('KB-09', 'API rate limits', true, '2026-01-28', 'The public API allows 100 requests per minute per workspace. Requests above the limit receive a 429 response; wait for the time in the Retry-After header before retrying.'),
  A('KB-10', 'Offline mode (draft)', false, '2026-07-01', 'Offline mode lets you edit notes without a connection and syncs changes when you reconnect. This article is a draft and has not been approved.'),
];

const T = (id, from, channel, subject, body, minsAgo) => ({id, from, channel, subject, body, minsAgo});
export const tickets = [
  T('T-1201', 'ada@example.com', 'email', 'Charged twice this month', 'Hi, I was charged twice for my June invoice. Can I get the duplicate charge refunded?', 12),
  T('T-1202', 'kunle@example.org', 'chat', 'Password reset link not arriving', 'I asked for a password reset but the email never came. I need to get into my account today.', 18),
  T('T-1203', 'mina@example.com', 'email', 'How do I export everything?', 'We are moving teams and want to export all of our notes. Is there a way to download everything?', 25),
  T('T-1204', 'tobi@example.net', 'chat', 'Invoice with VAT number', 'Where can I download invoices and add our VAT number for accounting?', 31),
  T('T-1205', 'grace@example.com', 'email', 'App crashes when I paste images', 'The desktop app crashes every time I paste an image into a note. Version 4.2 on Windows. This is urgent for our team.', 40),
  T('T-1206', 'femi@example.org', 'email', 'Refund for annual plan', 'We bought the annual plan 5 days ago but it is not right for us. Can we get a refund?', 52),
  T('T-1207', 'zara@example.com', 'chat', 'Lost my phone, cannot log in', 'I lost my phone and now I cannot get past two-factor. What should I do?', 64),
  T('T-1208', 'obi@example.net', 'email', 'Cancel subscription', 'Please cancel our subscription. What happens to our notes afterwards?', 75),
  T('T-1209', 'lola@example.com', 'chat', 'Do you work offline?', 'Can I use Nimbus Notes on a plane without internet?', 90),
  T('T-1210', 'sam@example.org', 'email', 'Getting 429 errors from the API', 'Our integration keeps getting 429 responses from your API since this morning.', 110),
  T('T-1211', 'ife@example.com', 'email', 'Invoice download broken?', 'I cannot find where to download last month’s invoice as a PDF.', 130),
  T('T-1212', 'dayo@example.net', 'chat', 'Charged twice?', 'Looks like my card was charged twice for the same invoice. Please help.', 150),
];

export const roles = [
  {id: 'agent', label: 'Support Agent', can: ['send', 'escalate']},
  {id: 'manager', label: 'Support Manager', can: ['send', 'escalate', 'kb', 'policy']},
  {id: 'viewer', label: 'Operations Viewer', can: []},
];
export const people = {agent: 'Bisi Lawal', manager: 'Emeka Nwosu', viewer: 'Ops viewer'};
