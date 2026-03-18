const projects = [
  {
    id: 0,
    name: 'MockTalk',                               // short label — floating buttons
    title: 'MockTalk: Real-Time AI Interview Simulator',
    description: [
      'Architected and developed a low-latency, voice-to-voice web application using Next.js and the OpenAI Realtime API to simulate high-pressure behavioral interviews.',
      'Engineered secure, bidirectional WebSocket connections to process and stream audio in real-time, handling complex chunking and base64 encoding via native browser APIs (MediaRecorder and Web Audio).',
      'Designed specialized LLM system prompts to roleplay as a strict hiring manager evaluating candidates for Relationship Manager positions, complete with dynamic pacing and conversational interruptions.',
      'Streamlined development by utilizing Claude Code CLI for agentic workflow automation, rapid prototyping of complex React hooks, and serverless route configuration.',
    ],
    color: '#c8a97e',   // latte
  },
  {
    id: 1,
    name: 'Krishna.AI',
    title: 'Krishna.AI',
    description: [
      'AI-powered web platform that provides personalized life guidance inspired by the Bhagavad Gita.',
      'Designed to help users apply ancient wisdom to modern problems such as financial stress, ethical dilemmas, and personal decision-making.',
      'Implemented prompt engineering with ChatGPT API and created an accessible, interactive interface allowing busy individuals to gain insights without reading the full scripture.',
    ],
    color: '#a0522d',   // sienna
  },
  {
    id: 2,
    name: 'CRM Pipeline',
    title: 'Intelligent CRM & Lead Qualification Pipeline',
    description: [
      'Architected an automated lead qualification pipeline utilizing Make.com to seamlessly integrate Google Forms, OpenAI, Gmail, and Slack.',
      'Engineered an intelligent routing system leveraging OpenAI\'s API to analyze incoming client queries in real-time, instantly categorizing leads by intent and budget.',
      'Streamlined client relationship management by automating personalized email follow-ups for standard inquiries, entirely eliminating manual inbox sorting.',
      'Developed a priority alert mechanism using custom Slack webhooks to instantly notify the team of high-ticket VIP clients, drastically optimizing the speed-to-lead response time.',
    ],
    color: '#6f4e37',   // coffee
  },
  {
    id: 3,
    name: 'Content Engine',
    title: 'AI Content Multiplier & Syndication Engine',
    description: [
      'Engineered an automated content repurposing system using Generative AI to instantly transform long-form core content into platform-specific short-form copy.',
      'Streamlined digital marketing workflows by integrating API-driven automation to format and prepare content for distribution across multiple social channels.',
      'Leveraged advanced prompt engineering to ensure the AI maintained a consistent brand voice and optimized messaging for maximum audience engagement on different platforms.',
      'Scaled digital presence and content output capacity, drastically reducing manual copywriting hours while simultaneously increasing cross-platform visibility.',
    ],
    color: '#3d2b1f',   // espresso
  },
]

export default projects
