// SupportPilot — site facts used by the pages, the prerender step and the tests.
// A proposed product: features, integrations and AWS services are planned until implemented and verified.
const site = {
  name: 'SupportPilot',
  slug: 'supportpilot',
  tagline: 'Resolve routine questions. Empower support teams.',
  about: 'SupportPilot is a proposed AI customer service platform that would help businesses organise customer inquiries, retrieve answers from approved knowledge sources with references, and support human agents with repetitive tasks — escalating to a person whenever an answer is uncertain.',
  url: 'https://supportpilot.top',
  email: 'victor@supportpilot.top',
  team: [
    {name: 'Victor Adebayo', role: 'Founder', initials: 'VA', bio: 'Victor founded SupportPilot after watching support teams answer the same password and billing questions hundreds of times a week while complex cases waited. Victor leads product, customers and every pilot, with a focus on grounded answers and clear hand-offs to people.', focus: ['Product', 'Grounded support automation', 'Customer pilots']},
    {name: "Yetunde Akande", role: "Co-founder", initials: "YA", bio: "Yetunde leads customer success at SupportPilot: onboarding support teams, shaping escalation rules with support managers and turning agent feedback into product changes.", focus: ["Customer experience", "Pilot onboarding", "Escalation design"]},
    {name: "Kelechi Eze", role: "CTO", initials: "KE", bio: "Kelechi leads engineering: retrieval from approved knowledge, citations and confidence, ticket categorisation and routing, summaries and the AWS platform it runs on.", focus: ["Platform architecture", "Retrieval and NLP", "AWS infrastructure"]},
  ],
  app: {
    title: 'Support console',
    subtitle: 'A fictional product’s approved knowledge base and twelve tickets: test conversations with citations, categorisation and routing, drafts for agents, an escalation queue, recurring issues and analytics.',
  },
};
export default site;
