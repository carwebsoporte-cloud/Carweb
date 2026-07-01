import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Rastreadores de IA generativa / motores de respuesta. Los permitimos
// EXPLÍCITAMENTE para que CARWEB pueda ser citado como fuente en ChatGPT,
// Perplexity, Gemini, Claude, Copilot, etc. (estrategia GEO).
const AI_BOTS = [
  'GPTBot',          // OpenAI (entrenamiento)
  'OAI-SearchBot',   // OpenAI (búsqueda)
  'ChatGPT-User',    // OpenAI (navegación en vivo)
  'PerplexityBot',   // Perplexity
  'Perplexity-User',
  'ClaudeBot',       // Anthropic
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended', // Gemini / Vertex
  'Applebot-Extended',
  'CCBot',           // Common Crawl (alimenta muchos LLM)
  'cohere-ai',
  'Amazonbot',
  'Meta-ExternalAgent',
];

const DISALLOW = ['/admin', '/api/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
