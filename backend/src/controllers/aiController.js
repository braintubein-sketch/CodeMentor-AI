// ============================================
// CodeMentor AI — AI Processing Controller (Gemini)
// ============================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const { generatePrompt } = require('../utils/generatePrompt');

const prisma = new PrismaClient();

// Lazy-initialized Gemini client
let genAI = null;

function getGenAI() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// Models to try in order (fallback chain) — verified model names
const MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

// Valid actions the user can request
const VALID_ACTIONS = ['explain', 'debug', 'optimize', 'convert'];

/**
 * Check if an error is a rate-limit / quota error
 */
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

/**
 * Sleep for ms
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Call Gemini with automatic retry + model fallback.
 * Tries each model in MODEL_CHAIN, with retries per model.
 */
async function callGemini(promptText) {
  const ai = getGenAI();
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    const model = ai.getGenerativeModel({ model: modelName });

    // Try up to 3 times per model with longer backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🤖 Trying ${modelName} (attempt ${attempt + 1}/3)...`);
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.3,
          },
        });
        console.log(`✅ ${modelName} succeeded!`);
        return result.response.text();
      } catch (err) {
        lastError = err;

        // If model not found (404), skip to next model immediately
        if (err.status === 404 || err.message?.includes('not found')) {
          console.log(`❌ ${modelName} not available, skipping...`);
          break;
        }

        if (isRateLimitError(err)) {
          // Longer backoff: 5s, 15s, 30s
          const delay = [5000, 15000, 30000][attempt] || 30000;
          console.log(`⏳ Rate limited on ${modelName}. Waiting ${delay / 1000}s...`);
          await sleep(delay);
        } else {
          throw err; // Non-retryable error
        }
      }
    }
    console.log(`⚠️ ${modelName} exhausted, trying next model...`);
  }

  // All models and retries exhausted
  throw lastError;
}

/**
 * POST /api/ai
 * Process code with AI based on the selected action.
 */
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

    // ── Build Prompt & Call Gemini ─────────────
    const prompt = generatePrompt(code, language, action);
    const systemPrompt =
      'You are CodeMentor AI, an expert programming assistant. ' +
      'Provide clear, well-structured, and actionable responses. ' +
      'Use markdown formatting with code blocks, headings, and bullet points. ' +
      'Be thorough but concise.\n\n';

    const response = await callGemini(systemPrompt + prompt);

    // ── Persist Query to Database ─────────────
    const userId = req.user?.id || null;
    const query = await prisma.query.create({
      data: { code, language, action, response, userId },
    });

    res.json({
      response,
      queryId: query.id,
    });
  } catch (err) {
    console.error('AI processing error:', err);

    if (err.message?.includes('API key') || err.message?.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        error: 'AI service authentication failed. Check your GEMINI_API_KEY.',
      });
    }

    if (isRateLimitError(err)) {
      return res.status(429).json({
        error: 'AI is temporarily busy. Please wait about 30 seconds and try again.',
      });
    }

    res.status(500).json({
      error: 'Failed to process your code. Please try again.',
    });
  }
};
