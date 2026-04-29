// ============================================
// CodeMentor AI — AI Processing Controller
// ============================================

const OpenAI = require('openai');
const { PrismaClient } = require('@prisma/client');
const { generatePrompt } = require('../utils/generatePrompt');

const prisma = new PrismaClient();

// Lazy-initialized OpenAI client (avoids crash if API key is missing at startup)
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

// Valid actions the user can request
const VALID_ACTIONS = ['explain', 'debug', 'optimize', 'convert'];

/**
 * POST /api/ai
 * Process code with AI based on the selected action.
 *
 * Body: { code: string, language: string, action: string }
 */
exports.processCode = async (req, res) => {
  try {
    const { code, language, action } = req.body;
    const userId = req.user.userId;

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

    // ── Build Prompt & Call OpenAI ────────────
    const prompt = generatePrompt(code, language, action);

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are CodeMentor AI, an expert programming assistant. ' +
            'Provide clear, well-structured, and actionable responses. ' +
            'Use markdown formatting with code blocks, headings, and bullet points. ' +
            'Be thorough but concise.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;

    // ── Persist Query to Database ─────────────
    const query = await prisma.query.create({
      data: { code, language, action, response, userId },
    });

    res.json({
      response,
      queryId: query.id,
    });
  } catch (err) {
    console.error('AI processing error:', err);

    // Handle specific OpenAI errors
    if (err?.status === 429 || err?.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'API rate limit reached. Please try again in a moment.',
      });
    }

    if (err?.status === 401) {
      return res.status(500).json({
        error: 'AI service authentication failed. Check your API key.',
      });
    }

    res.status(500).json({
      error: 'Failed to process your code. Please try again.',
    });
  }
};
