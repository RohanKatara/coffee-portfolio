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
    name: 'Automate Pro',
    title: 'Automate Pro: AI Lead Gatekeeper',
    description: [
      'Built an automated pipeline using n8n and Google Gemini 1.5 Pro to instantly score, qualify, and route agency leads — saving 20+ hours a week of manual filtering.',
      'Engineered an LLM scoring engine that analyzes project scope, budget signals, and urgency to assign each lead a quality score out of 10 in real-time.',
      'Implemented a smart routing system that escalates VIP leads directly to Slack while placing low-budget prospects into a segmented Google Sheets nurture queue.',
      'Developed a custom React frontend with dynamic forms and behavioral tracking to capture high-value prospect data at the top of the funnel.',
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
