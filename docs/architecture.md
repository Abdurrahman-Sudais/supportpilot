# Architecture

Status: **proposed**. The website and the prototype run entirely in the browser on fictional data. None of the AWS services below are deployed or connected.

## Today: browser-only prototype

- Vite + React, server-rendered to static HTML for every route (`scripts/prerender.mjs`).
- A fictional knowledge base and tickets live in `src/data.js`; retrieval, confidence, citation, categorisation, routing, summaries and recurring-issue rules are pure functions in `src/engine.js`, tested with `node --test`.
- Changes persist in `localStorage`; roles are switched in the UI, not authenticated.

## Why AWS

SupportPilot is a proposed customer support platform for B2B SaaS companies, ecommerce businesses and subscription services. It must answer from each customer’s own approved knowledge, cite its sources, and keep ticket records reliable for agents and analytics. Designing on AWS lets it use managed retrieval over approved documents, generate grounded drafts and process tickets as they arrive.

## Proposed production service

| Stage | Services | What happens |
|---|---|---|
| 1. Knowledge in | Amazon S3 | Support teams upload approved help articles, policies and macros as knowledge documents. |
| 2. Retrieve | Amazon Bedrock Knowledge Bases | Questions are matched to passages from approved content only, with their source references. |
| 3. Draft & summarise | Amazon Bedrock | Grounded response drafts and conversation summaries are generated from the retrieved passages. |
| 4. Process tickets | AWS Lambda, Amazon API Gateway | Tickets arrive from helpdesk and chat integrations, are categorised, routed and escalated by rule. |
| 5. Records | Amazon DynamoDB | Tickets, drafts, citations, agent actions and outcomes are stored for queues and analytics. |
| Across every stage | AWS Lambda, AWS KMS, Amazon Cognito, AWS CloudTrail | AWS Lambda runs ticket processing; AWS KMS encrypts tickets and knowledge; Amazon Cognito separates agent, manager and viewer roles; AWS CloudTrail records administrative access |

### Services and their role

- **Amazon Bedrock** — Generates grounded response drafts and conversation summaries.
- **Amazon Bedrock Knowledge Bases** — Retrieves passages from approved content with source references.
- **Amazon S3** — Stores knowledge documents.
- **Amazon DynamoDB** — Stores support ticket records, drafts and outcomes.
- **AWS Lambda** — Processes, categorises and routes tickets.
- **Amazon API Gateway** — Provides the application and integration APIs.
- **AWS KMS** — Encrypts tickets and knowledge documents.
- **Amazon Cognito** — Authenticates users and enforces roles.
- **AWS CloudTrail** — Keeps an audit trail of administrative actions.

The same lists live in `src/aws.js` and are shown on the home page (`#technology`).

### Design rules

1. **Approved sources only.** Answers come only from knowledge the support team has approved, and every answer cites it.
2. **Unsure means human.** Below the confidence threshold, the conversation goes to an agent with a summary.
3. **Agents stay in charge.** Drafts can be reviewed, edited or rejected; escalation rules are set by the support team.
4. **Measured honestly.** Analytics separate drafted, sent, edited and escalated conversations.

## Website lead capture

The pilot and contact forms post to HubSpot (see `docs/crm-plan.md`). If a server-side intake is needed later, Amazon API Gateway + AWS Lambda can validate submissions and Amazon SES can notify the founder.
