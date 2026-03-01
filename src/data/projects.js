const projects = [
  {
    id: 0,
    name: 'Brew Dashboard',
    tagline: 'Real-time analytics for café chains',
    description:
      'A full-stack analytics platform that ingests POS data from multiple café locations, visualises sales trends with interactive D3 charts, and surfaces AI-driven inventory recommendations — cutting waste by 18%.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'D3.js', 'OpenAI API'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com',
    color: '#c8a97e',   // latte
  },
  {
    id: 1,
    name: 'Roast Router',
    tagline: 'Logistics optimisation for bean importers',
    description:
      'A route-optimisation service built with Python and OR-Tools that reduces delivery distances for specialty coffee importers. Provides a map UI for dispatchers and exports GPX routes for drivers.',
    tech: ['Python', 'FastAPI', 'OR-Tools', 'React', 'MapLibre GL'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com',
    color: '#a0522d',   // sienna
  },
  {
    id: 2,
    name: 'Crema CMS',
    tagline: 'Headless CMS for coffee-brand blogs',
    description:
      'A lightweight headless CMS with a Notion-like editor, asset pipeline, and GraphQL API. Powers five specialty-coffee brand websites with sub-100ms TTFB via edge CDN caching.',
    tech: ['TypeScript', 'Next.js', 'GraphQL', 'Prisma', 'Vercel'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com',
    color: '#6f4e37',   // coffee
  },
  {
    id: 3,
    name: 'Barista Bot',
    tagline: 'AI order assistant for smart kiosks',
    description:
      'A voice-enabled ordering assistant deployed on café kiosks. Uses Whisper for speech-to-text, a fine-tuned LLM for menu reasoning, and TTS synthesis — reducing order errors by 32%.',
    tech: ['Python', 'Whisper', 'LangChain', 'React', 'Raspberry Pi'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com',
    color: '#3d2b1f',   // espresso
  },
  {
    id: 4,
    name: 'SteamPipe',
    tagline: 'IoT firmware for espresso machines',
    description:
      'Embedded firmware for a Raspberry Pi Pico that controls brew temperature via PID, logs extraction data over BLE, and exposes a WebSocket API consumed by a companion React Native app.',
    tech: ['C++', 'MicroPython', 'BLE', 'React Native', 'WebSocket'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com',
    color: '#8b9dc3',   // steel blue
  },
]

export default projects
