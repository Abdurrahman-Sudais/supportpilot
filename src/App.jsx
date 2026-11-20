import React, {useEffect, useRef, useState} from 'react';
import site from './content.js';
import {articles, tickets} from './data.js';
import {answer, recurring} from './engine.js';
import {ACROSS, SERVICES, STAGES, WHY} from './aws.js';
import {PROGRESS} from './forms.js';
import Console from './Console.jsx';
import PilotForm from './PilotForm.jsx';
import ContactForm from './ContactForm.jsx';

export function Logo({size = 30}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M6 9a5 5 0 0 1 5-5h18a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H17l-8 7v-7.4A5 5 0 0 1 6 23z" fill="#ff7a1a" stroke="#2b1d14" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="14" cy="16" r="2.2" fill="#2b1d14" /><circle cx="20" cy="16" r="2.2" fill="#2b1d14" /><circle cx="26" cy="16" r="2.2" fill="#2b1d14" />
    </svg>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['Try it', '/#try'], ['Features', '/#features'], ['Escalation', '/#escalation'], ['Pricing', '/#pricing'], ['Technology', '/#technology'], ['Contact', '/#contact']];
  return (
    <header className="hd">
      <a href="/" className="brand" aria-label="SupportPilot home"><Logo /><span>SupportPilot</span></a>
      <nav id="nav" className={open ? 'nav open' : 'nav'} aria-label="Main">
        {links.map(([t, h]) => <a key={t} href={h} onClick={() => setOpen(false)}>{t}</a>)}
        <a className="nav-app" href="/app" onClick={() => setOpen(false)}>Open the support console</a>
      </nav>
      <a className="hd-cta" href="#demo" data-magnetic data-cursor="hi!">Request a demo</a>
      <button className="menu" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
    </header>
  );
}

const SUGGEST = ['I was charged twice, can I get a refund?', 'How do I reset my password?', 'Can I use it offline on a plane?', 'Where do I download invoices?'];
const title = (id) => articles.find((a) => a.id === id)?.title;

export function Chat({compact = false, threshold = 0.45, kb = articles}) {
  const [msgs, setMsgs] = useState([{who: 'bot', text: 'Hi! I answer from Nimbus Notes’ approved help articles, with sources. If I’m not sure, I’ll hand you to a person.'}]);
  const [q, setQ] = useState('');
  const [typing, setTyping] = useState(false);
  const end = useRef(null);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } end.current?.scrollIntoView({block: 'nearest', behavior: 'smooth'}); }, [msgs, typing]);
  const ask = (text) => {
    const t = text.trim(); if (!t || typing) return;
    setMsgs((m) => [...m, {who: 'me', text: t}]); setQ(''); setTyping(true);
    const r = answer(t, {articles: kb, threshold});
    setTimeout(() => { setTyping(false); setMsgs((m) => [...m, r.escalate ? {who: 'bot', esc: true, text: `I’m not confident I can answer that from our approved articles, so I’ve passed it to a support agent with a summary. ${r.reason}.`, conf: r.confidence} : {who: 'bot', text: r.text, cites: r.cites, conf: r.confidence}]); }, 650);
  };
  return (
    <div className={compact ? 'chat compact' : 'chat'}>
      <div className="chat-head"><Logo size={22} /><b>Nimbus support</b><span className="on">answers from approved sources</span></div>
      <div className="chat-body" aria-live="polite">
        {msgs.map((m, i) => <div key={i} className={`msg ${m.who}${m.esc ? ' esc' : ''}`}><p>{m.text}</p>{m.cites && <p className="cite">Source: <b>{m.cites[0]}</b> · {title(m.cites[0])} <span>{Math.round(m.conf * 100)}% confident</span></p>}{m.esc && <p className="cite">→ escalated to a person <span>{Math.round(m.conf * 100)}% confident</span></p>}</div>)}
        {typing && <div className="msg bot typing" aria-label="Typing"><i /><i /><i /></div>}
        <span ref={end} />
      </div>
      <div className="chips">{SUGGEST.map((s) => <button key={s} type="button" onClick={() => ask(s)}>{s}</button>)}</div>
      <form className="chat-in" onSubmit={(e) => { e.preventDefault(); ask(q); }}><label className="sr" htmlFor={compact ? 'cq2' : 'cq'}>Ask a question</label><input id={compact ? 'cq2' : 'cq'} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about billing, passwords, exports…" /><button className="btn sm" type="submit">Send</button></form>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="hello" data-r><span className="wave" aria-hidden="true">👋</span> Customer support, grounded in your knowledge</p>
        <h1 data-r>Resolve routine questions. <span className="u">Empower</span> support teams.</h1>
        <p className="lede" data-r style={{'--d': '150ms'}}>SupportPilot is a proposed AI support platform that answers routine questions from your approved help content — always with the source — sorts and routes every ticket, and hands anything uncertain to a person with a summary.</p>
        <div className="cta" data-r style={{'--d': '230ms'}}><a className="btn" href="#demo" data-magnetic data-cursor="hi!">Request a demo</a><a className="btn ghost" href="/app">Open the console</a></div>
      </div>
      <div className="hero-chat" id="try" data-r data-tilt><Chat /></div>
    </section>
  );
}

const FEATURES = [
  ['Can it answer our customers?', 'Knowledge-based support assistant', 'Answers come only from articles your team has approved, quoting the relevant passage and citing it.'],
  ['Who handles this ticket?', 'Automated ticket categorisation', 'Billing, access, data, bugs, cancellations — each ticket gets a category and a priority the moment it arrives.'],
  ['What happened in this thread?', 'Conversation summaries', 'A short summary of the request and the key details, so agents never start from scratch.'],
  ['Where should it go?', 'Intelligent ticket routing', 'Billing questions to billing, bugs to engineering, cancellations to retention — rules you can read and change.'],
  ['And when it isn’t sure?', 'Human escalation workflows', 'Below your confidence threshold, or for anything sensitive, a person takes over with the context attached.'],
  ['Are we seeing the same problem?', 'Recurring issue identification', 'Spots clusters — four tickets about invoices this morning — before they become a backlog.'],
  ['Is it working?', 'Support performance analytics', 'Drafted, sent, edited and escalated, by category — measured honestly so you can trust the numbers.'],
];
function Features() {
  return (
    <section className="sec" id="features" aria-labelledby="f-title">
      <div className="sec-head"><p className="eyebrow">Core features</p><h2 id="f-title">Seven questions support leaders ask us.</h2></div>
      <div className="thread">{FEATURES.map(([q, t, a], i) => <div key={t} className="pair" data-r style={{'--d': `${(i % 2) * 80}ms`}}><p className="bub q">{q}</p><div className="bub a"><b>{t}</b><p>{a}</p></div></div>)}</div>
    </section>
  );
}

function Grounded() {
  const r = answer('Can I get a refund on my annual plan?');
  const art = articles.find((a) => a.id === r.cites[0]);
  return (
    <section className="sec" aria-labelledby="g-title">
      <div className="split">
        <div><p className="eyebrow">The differentiator</p><h2 id="g-title">Every answer shows where it came from.</h2><p className="intro">Knowledge-grounded support automation with source references, and human escalation when answers are uncertain. No guessing, no invented policies.</p></div>
        <div className="ground" data-r>
          <div className="bub a"><p>{r.text}</p><p className="cite">Source: <b>{art.id}</b> · {art.title}</p></div>
          <div className="src-card"><p className="mono">{art.id} · approved · updated {art.updated}</p><h3>{art.title}</h3><p>{art.body.split(r.text).map((part, i, arr) => <React.Fragment key={i}>{part}{i < arr.length - 1 && <mark>{r.text}</mark>}</React.Fragment>)}</p></div>
        </div>
      </div>
    </section>
  );
}

function Escalation() {
  const [th, setTh] = useState(0.45);
  const qs = ['How do I reset my password?', 'Can I get a refund on my annual plan?', 'Lost my phone, cannot log in', 'Is there a student discount?', 'Can I use it offline on a plane?'];
  return (
    <section className="sec" id="escalation" aria-labelledby="e-title">
      <div className="sec-head"><p className="eyebrow">Human escalation</p><h2 id="e-title">You decide when a person steps in.</h2><p className="intro">Set the confidence threshold. Questions below it go straight to your team with a summary. Move the slider and see which of these would be answered automatically.</p></div>
      <div className="esc" data-r>
        <label className="rng"><span>Escalate below <b>{Math.round(th * 100)}% confidence</b></span><input type="range" min="0.2" max="0.9" step="0.05" value={th} onChange={(e) => setTh(Number(e.target.value))} /></label>
        <ul className="esc-list">{qs.map((q) => { const r = answer(q, {threshold: th}); return <li key={q} className={r.escalate ? 'h' : 'b'}><span className="q">“{q}”</span><span className="meter"><i style={{'--c': r.confidence}} /></span><span className="dest">{r.escalate ? '→ agent' : `answered · ${r.cites[0]}`}</span></li>; })}</ul>
      </div>
    </section>
  );
}

function Recurring() {
  const groups = recurring(tickets).slice(0, 3);
  return (
    <section className="sec" aria-labelledby="r-title">
      <div className="split">
        <div><p className="eyebrow">Recurring issues</p><h2 id="r-title">Spot the pattern before it’s a backlog.</h2><p className="intro">From twelve sample tickets this morning, SupportPilot groups the ones that share a topic, so a manager can fix the cause — or update the help article.</p></div>
        <ul className="rec" data-r>{groups.map((g) => <li key={g.term}><b>{g.tickets.length}</b><div><span>{g.category} · “{g.term === 'charg' ? 'charged' : g.term}”</span><small>{g.tickets.join(' · ')}</small></div></li>)}</ul>
      </div>
    </section>
  );
}

function Who() {
  return (
    <section className="sec" aria-labelledby="who-title">
      <div className="sec-head center"><p className="eyebrow">Who it’s for</p><h2 id="who-title">For teams who live in the inbox.</h2></div>
      <div className="who">{[['B2B SaaS companies', 'How-to questions, access issues and billing — answered from your docs.', '☁️'], ['Ecommerce businesses', 'Orders, refunds and returns policies, routed to the right people fast.', '🛍️'], ['Subscription services', 'Plan changes, cancellations and invoices, handled consistently.', '🔁']].map(([t, d, e], i) => <article key={t} data-r data-tilt style={{'--d': `${i * 90}ms`}}><span className="emo" aria-hidden="true">{e}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      <p className="decision">Decision-makers: customer experience directors · support managers · operations executives</p>
    </section>
  );
}

function Pricing() {
  const [seats, setSeats] = useState(6);
  const [conv, setConv] = useState(3);
  const [annual, setAnnual] = useState(true);
  const monthly = seats * 39 + conv * 60; const price = annual ? Math.round(monthly * 0.83) : monthly;
  return (
    <section className="sec" id="pricing" aria-labelledby="p-title">
      <div className="split">
        <div><p className="eyebrow">Business model</p><h2 id="p-title">Priced by agent seats and support volume.</h2><p className="intro">Monthly or annual subscriptions based on support volume and agent seats. Illustrative pricing for a proposed product.</p></div>
        <div className="price" data-r>
          <div className="toggle" role="group" aria-label="Billing period"><button className={!annual ? 'on' : ''} aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button><button className={annual ? 'on' : ''} aria-pressed={annual} onClick={() => setAnnual(true)}>Annual <em>save 17%</em></button></div>
          <div className="steps"><span>Agent seats</span><div><button aria-label="Fewer seats" onClick={() => setSeats(Math.max(1, seats - 1))}>−</button><output aria-live="polite">{seats}</output><button aria-label="More seats" onClick={() => setSeats(seats + 1)}>+</button></div></div>
          <label className="rng"><span>Conversations a month <b>{(conv * 1000).toLocaleString()}</b></span><input type="range" min="1" max="20" value={conv} onChange={(e) => setConv(Number(e.target.value))} /></label>
          <p className="total"><b>${price.toLocaleString()}</b> / month{annual ? ', billed annually' : ''}</p>
          <a className="btn" href="#demo" data-magnetic>Request a demo</a>
        </div>
      </div>
    </section>
  );
}

function Technology() {
  return (
    <section className="sec" id="technology" aria-labelledby="tech-title">
      <div className="sec-head"><p className="eyebrow">Planned AWS infrastructure</p><h2 id="tech-title">How we use Amazon Web Services.</h2><p className="intro">{WHY}</p></div>
      <ol className="pipe">{STAGES.map(([t, svcs, d], i) => <li key={t} data-r style={{'--d': `${i * 70}ms`}}><span className="n">{i + 1}</span><h3>{t}</h3><p className="svcs">{svcs.map((s) => <span key={s}>{s}</span>)}</p><p>{d}</p></li>)}</ol>
      <div className="across" data-r><p className="eyebrow">Across every stage</p><ul>{ACROSS.map(([a, b]) => <li key={a}><b>{a}</b> {b}</li>)}</ul></div>
      <h3 className="sub">Services and their role in SupportPilot</h3>
      <dl className="svc">{SERVICES.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
      <div className="activate" data-r><p className="eyebrow">AWS Activate · company description</p><p>SupportPilot is a proposed AI customer support automation platform for SaaS companies, ecommerce businesses and subscription services. The planned application will retrieve answers from approved knowledge sources, categorise customer inquiries, summarise conversations and route complex cases to human support agents. We plan to use Amazon Bedrock and Amazon Bedrock Knowledge Bases for grounded response generation, Amazon S3 for knowledge documents and Amazon DynamoDB for ticket records. AWS Lambda and Amazon API Gateway will support processing and integrations. Support teams will approve knowledge sources and configure escalation policies.</p></div>
      <p className="fine">Planned, not yet deployed. This website and the support console run in your browser on fictional data.</p>
    </section>
  );
}

function Team() {
  const p = site.team[0];
  return <section className="sec" id="team" aria-labelledby="team-title"><div className="team" data-r><span className="av" aria-hidden="true">{p.initials}</span><div><p className="eyebrow">Founder</p><h2 id="team-title">{p.name}</h2><p>{p.bio}</p><ul className="tags">{p.focus.map((f) => <li key={f}>{f}</li>)}</ul></div></div></section>;
}

function Demo() {
  return (
    <section className="sec" id="demo" aria-labelledby="demo-title">
      <div className="split top">
        <div><p className="eyebrow">Progress & demos</p><h2 id="demo-title">See your help centre answer back.</h2><p className="intro">SupportPilot is a proposed product in its building stage. A demo walks through knowledge upload, test conversations, ticket classification, drafts and the escalation queue. The MVP covers knowledge-base uploads, test conversations, ticket classification, response drafts and human escalation queues.</p>
          <ol className="progress">{PROGRESS.map(([st, t, d]) => <li key={t} className={st === 'Next' ? 'next' : ''}><span>{st}</span><div><b>{t}</b><p>{d}</p></div></li>)}</ol></div>
        <div className="formcard" data-r><PilotForm submitLabel="Request a demo" /></div>
      </div>
    </section>
  );
}

const FAQ = [['Will it make up answers?', 'It is designed not to. Answers come only from approved sources and cite them; when no approved source covers a question, or confidence is low, it escalates to a person.'], ['Do agents lose control?', 'No. Teams can require approval for every draft, edit before sending, and set the escalation threshold and routing rules.'], ['Which helpdesks does it work with?', 'The planned product connects through APIs to common helpdesk and chat tools. The prototype runs on its own with fictional tickets.'], ['Is SupportPilot live?', 'Not yet. It is a proposed product; the support console is a prototype running in your browser on a fictional knowledge base.']];
function Faq() { return <section className="sec" aria-labelledby="faq-title"><div className="sec-head center"><p className="eyebrow">FAQ</p><h2 id="faq-title">You asked. We answered (with sources).</h2></div><div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>; }

function Contact() {
  return (
    <section className="sec" id="contact" aria-labelledby="contact-title">
      <div className="split top"><div><p className="eyebrow">Contact</p><h2 id="contact-title">Talk to a human at SupportPilot.</h2><p className="intro">Questions about the product, helpdesk integrations, data handling, or partnerships. Messages go directly to the founder.</p><p className="mail"><a href={`mailto:${site.email}`}>{site.email}</a></p></div><div className="formcard" data-r><ContactForm /></div></div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ft">
      <p className="ft-big" aria-hidden="true">Need a hand? <span>We’ve got you.</span></p>
      <div className="ft-row"><a href="/" className="brand" aria-label="SupportPilot home"><Logo /><span>SupportPilot</span></a><nav aria-label="Footer"><a href="/app">Support console</a><a href="/#technology">Technology (AWS)</a><a href="/#pricing">Pricing</a><a href="/#contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></div>
      <p className="fine">© 2026 SupportPilot · {site.email} · Founded by {site.team[0].name}. A proposed product: features, integrations and AWS services are planned, pricing is illustrative and the console uses a fictional knowledge base.</p>
    </footer>
  );
}

function Home() { return (<><Hero /><Features /><Grounded /><Escalation /><Recurring /><Who /><Pricing /><Technology /><Team /><Demo /><Faq /><Contact /></>); }

const LEGAL = {
  privacy: ['Privacy notice', [['This website', 'SupportPilot is a proposed product. This website and the support console run in your browser on fictional data.'], ['Chat preview and console', 'Questions you type are answered in your browser and never sent anywhere. The console keeps its changes in local storage (key supportpilot-console-v1).'], ['Forms', `Until a form service is connected, the demo and contact forms open a pre-filled email to ${site.email}; nothing is sent until you send it.`], ['Cookies & analytics', 'None.']]],
  terms: ['Terms of use', [['A proposed product', 'Nothing here is an offer of service. Pricing is illustrative.'], ['Demonstration only', 'The chat preview and console answer from a fictional knowledge base for an invented product.'], ['People stay in charge', 'SupportPilot drafts and routes; support teams approve knowledge and configure escalation.']]],
};
function Legal({kind}) { const [t, items] = LEGAL[kind]; return <section className="sec legal"><p className="eyebrow">Review draft</p><h1>{t}</h1>{items.map(([h, d]) => <div key={h}><h2>{h}</h2><p>{d}</p></div>)}</section>; }
function NotFound() { return <section className="sec legal"><p className="eyebrow">404</p><h1>We couldn’t find an approved answer for that page.</h1><p>So we’re handing you back to the home page.</p><p><a className="btn" href="/">Back to SupportPilot</a></p></section>; }

export default function App({path = '/'}) {
  if (path.startsWith('/app')) return <Console />;
  const page = path === '/' ? <Home /> : path === '/privacy' ? <Legal kind="privacy" /> : path === '/terms' ? <Legal kind="terms" /> : <NotFound />;
  return (<><a className="skip" href="#main">Skip to content</a><Header /><main id="main">{page}</main><Footer /></>);
}
