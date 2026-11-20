# SupportPilot

**Resolve routine questions. Empower support teams.**

SupportPilot is a proposed AI customer service platform for B2B SaaS companies, ecommerce businesses and subscription service providers. It would retrieve answers from approved knowledge sources with references, categorise, summarise and route inquiries, and escalate to human agents whenever an answer is uncertain.

> SupportPilot is a proposed product. Features, integrations and AWS services are planned until implemented and verified. Pricing is illustrative, and the prototype uses fictional data. Founder: **Victor Adebayo**. Website: `supportpilot.space` · contact: `victor@supportpilot.space`.

## Design

The look is warm and conversational: butter-yellow paper, cocoa ink, tangerine and sky accents, chat-bubble shapes throughout, Bricolage Grotesque headlines, Figtree text and Spline Sans Mono for sources.

- **Hero:** a working chat widget. Ask anything or tap a suggestion; answers come from the approved knowledge base with a cited source and confidence, and uncertain questions are handed to a person.
- **Core features:** all seven as a conversation; each customer question pops in, followed by the feature as the reply.
- **Grounded answers (the differentiator):** an answer next to its source article, with the quoted passage highlighted.
- **Human escalation:** a threshold slider that re-sorts five sample questions into answered or sent to an agent.
- **Recurring issues:** clusters found in the sample tickets.
- **Who it's for:** target customers and decision-makers.
- **Pricing:** monthly or annual, a seat stepper and a volume slider.
- **Technology:** the planned AWS architecture (Bedrock, Bedrock Knowledge Bases, S3, DynamoDB, Lambda, API Gateway) with each service's role and the AWS Activate description.
- **Closing sections:** founder, progress and the demo-request form, FAQ, contact form with a topic picker, and a friendly footer.
- **Interactions:** a speech-bubble cursor that shows typing dots over links, springy buttons, magnetic CTAs and a gradient scroll-progress bar.

## Prototype (`/app`)

The support console uses a fictional product's knowledge base (nine approved articles and one draft) and twelve tickets.

- **Inbox:** every ticket is categorised, prioritised and routed (Billing team, Tier 1, Engineering, Retention), with a summary and, when an approved article covers it, a cited draft the agent can edit and send. Agents can also escalate to any team or resolve with a note. Bug reports always go to Engineering.
- **Escalations:** queues per team with the reason each ticket needs a person.
- **Test chat:** conversations answered only from currently approved articles, with a manager-controlled escalation threshold.
- **Knowledge:** managers approve or unapprove articles; approving the draft article changes answers immediately.
- **Recurring issues and analytics:** clusters of related tickets, plus drafted, sent, edited and escalated counts by category, and an activity log.
- **Roles:** Support Agent, Support Manager and Operations Viewer.

Every decision in the prototype is made by a person and written to a log. Changes persist in the browser's `localStorage`, and motion is skipped for visitors who prefer reduced motion. All pages are server-rendered and readable without JavaScript.

## Structure

```
src/content.js      site facts and founder
src/data.js         fictional data and roles
src/engine.js       the prototype's rules (pure functions, tested)
src/aws.js          the planned AWS architecture shown on the home page
src/forms.js        demo-request and contact form rules and HubSpot payloads (tested)
src/fx.js           interaction layer: reveals, cursor, magnetic and tilt effects, progress bar
src/App.jsx         marketing pages · src/Console.jsx the prototype
docs/architecture.md  planned AWS architecture and design rules
docs/crm-plan.md      HubSpot forms, properties and pipeline
```

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build   # Vite build, server render, static prerender of /, /app, /privacy, /terms and 404.html
npm test        # node --test
```

The output in `dist/` is fully static. Configs are included for Netlify/Cloudflare (`public/_headers`, `public/_redirects`) and Vercel (`vercel.json`).

Until HubSpot is configured, the forms keep requests in the browser and open a pre-filled email. To connect it, set `VITE_HUBSPOT_PORTAL_ID`, `VITE_HUBSPOT_FORM_GUID` and `VITE_HUBSPOT_CONTACT_FORM_GUID` (see `.env.example`), and update the privacy notice first.
