// ============================================
// CodeMentor AI — Multi-Provider AI Controller
// Fallback chain: Groq → Gemini
// ============================================

const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const { generatePrompt } = require('../utils/generatePrompt');

const prisma = new PrismaClient();

// ── System prompt shared across all providers ──
const SYSTEM_PROMPT =
  'You are CodeMentor AI, an expert programming assistant. ' +
  'Provide clear, well-structured, and actionable responses. ' +
  'Use markdown formatting with code blocks, headings, and bullet points. ' +
  'Be thorough but concise.';

// Valid actions the user can request
const VALID_ACTIONS = ['explain', 'debug', 'optimize', 'convert'];

// ────────────────────────────────────────────────
// Provider 1: GROQ  (Llama 3.3 70B — fast & free)
// ────────────────────────────────────────────────
let groqClient = null;

function getGroq() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// Models to try on Groq (in order)
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

async function callGroq(promptText) {
  const groq = getGroq();
  if (!groq) throw new Error('GROQ_API_KEY not configured');

  let lastError = null;

  for (const model of GROQ_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`🟢 Groq: Trying ${model} (attempt ${attempt + 1}/2)...`);

        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: promptText },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        });

        const text = completion.choices?.[0]?.message?.content;
        if (!text) throw new Error('Empty response from Groq');

        console.log(`✅ Groq ${model} succeeded!`);
        return { text, provider: `Groq (${model})` };
      } catch (err) {
        lastError = err;

        // Model not found → skip to next model
        if (err.status === 404 || err.message?.includes('not found')) {
          console.log(`❌ Groq ${model} not available, skipping...`);
          break;
        }

        // Rate limit → wait and retry
        if (isRateLimitError(err)) {
          const delay = [3000, 8000][attempt] || 8000;
          console.log(`⏳ Groq rate limited. Waiting ${delay / 1000}s...`);
          await sleep(delay);
        } else {
          console.log(`❌ Groq ${model} error: ${err.message}`);
          break; // Non-retryable → skip model
        }
      }
    }
  }

  throw lastError || new Error('All Groq models exhausted');
}

// ────────────────────────────────────────────────
// Provider 2: GEMINI  (Google — fallback)
// ────────────────────────────────────────────────
let genAI = null;

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function callGemini(promptText) {
  const ai = getGenAI();
  if (!ai) throw new Error('GEMINI_API_KEY not configured');

  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    const model = ai.getGenerativeModel({ model: modelName });

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🔵 Gemini: Trying ${modelName} (attempt ${attempt + 1}/3)...`);

        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: SYSTEM_PROMPT + '\n\n' + promptText }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.3,
          },
        });

        const text = result.response.text();
        if (!text) throw new Error('Empty response from Gemini');

        console.log(`✅ Gemini ${modelName} succeeded!`);
        return { text, provider: `Gemini (${modelName})` };
      } catch (err) {
        lastError = err;

        if (err.status === 404 || err.message?.includes('not found')) {
          console.log(`❌ Gemini ${modelName} not available, skipping...`);
          break;
        }

        if (isRateLimitError(err)) {
          const delay = [5000, 15000, 30000][attempt] || 30000;
          console.log(`⏳ Gemini rate limited. Waiting ${delay / 1000}s...`);
          await sleep(delay);
        } else {
          throw err;
        }
      }
    }
    console.log(`⚠️ Gemini ${modelName} exhausted, trying next...`);
  }

  throw lastError || new Error('All Gemini models exhausted');
}

// ────────────────────────────────────────────────
// Multi-Provider Orchestrator
// ────────────────────────────────────────────────

/**
 * Providers ordered by preference.
 * Each entry: { name, call, available }
 */
function getProviders() {
  const providers = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({ name: 'Groq', call: callGroq });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: 'Gemini', call: callGemini });
  }

  return providers;
}

async function callAI(promptText) {
  const providers = getProviders();

  if (providers.length === 0) {
    throw new Error(
      'No AI provider configured. Set GROQ_API_KEY or GEMINI_API_KEY in environment variables.'
    );
  }

  let lastError = null;

  for (const provider of providers) {
    try {
      console.log(`\n🚀 Attempting AI call via ${provider.name}...`);
      const result = await provider.call(promptText);
      console.log(`✅ AI call succeeded via ${result.provider}`);
      return result;
    } catch (err) {
      lastError = err;
      console.log(`⚠️ ${provider.name} failed: ${err.message}. Trying next provider...`);
    }
  }

  // All providers failed
  throw lastError;
}

// ────────────────────────────────────────────────
// Shared Utilities
// ────────────────────────────────────────────────

function isRateLimitError(err) {
  const msg = (err.message || '') + (err.statusText || '');
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('Resource has been exhausted') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    err.status === 429
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ────────────────────────────────────────────────
// POST /api/ai — Process code with multi-provider AI
// ────────────────────────────────────────────────

exports.processCode = async (req, res) => {
  try {
    const { code, language, action } = req.body;

    // ── Input Validation ──────────────────────
    if (!code || !language || !action) {
      return res.status(400).json({
        error: 'Missing required fields: code, language, and action.',
      });
    }

    if (!VALID_ACTIONS.includes(action)) {
      return res.status(400).json({
        error: `Invalid action "${action}". Must be one of: ${VALID_ACTIONS.join(', ')}`,
      });
    }

    // ── Build Prompt & Call AI ─────────────────
    const prompt = generatePrompt(code, language, action);
    const { text: response, provider } = await callAI(prompt);

    // ── Persist Query to Database ─────────────
    let queryRecord = null;
    try {
      const userId = req.user?.id || null;
      queryRecord = await prisma.query.create({
        data: { code, language, action, response, userId },
      });
    } catch (dbErr) {
      // Don't fail the request if DB is down — still return the AI response
      console.error('⚠️ Database save failed (non-fatal):', dbErr.message);
    }

    res.json({
      response,
      provider, // Let the frontend know which AI responded
      queryId: queryRecord?.id || null,
    });
  } catch (err) {
    console.error('AI processing error:', err);

    if (err.message?.includes('API key') || err.message?.includes('not configured')) {
      return res.status(500).json({
        error: 'AI service not configured. Contact the administrator.',
      });
    }

    if (isRateLimitError(err)) {
      return res.status(429).json({
        error: 'All AI providers are temporarily busy. Please wait about 30 seconds and try again.',
      });
    }

    res.status(500).json({
      error: 'Failed to process your code. Please try again.',
    });
  }
};
