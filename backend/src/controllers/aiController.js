// ============================================
// CodeMentor AI — AI Processing Controller (Gemini)
// ============================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const { generatePrompt } = require('../utils/generatePrompt');

const prisma = new PrismaClient();

// Lazy-initialized Gemini client (avoids crash if API key is missing at startup)
let genAI = null;

function getGeminiModel() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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

    // ── Build Prompt & Call Gemini ─────────────
    const prompt = generatePrompt(code, language, action);
    const model = getGeminiModel();

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                'You are CodeMentor AI, an expert programming assistant. ' +
                'Provide clear, well-structured, and actionable responses. ' +
                'Use markdown formatting with code blocks, headings, and bullet points. ' +
                'Be thorough but concise.\n\n' +
                prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.3,
      },
    });

    const response = result.response.text();

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

    // Handle specific Gemini errors
    if (err.message?.includes('API key')) {
      return res.status(500).json({
        error: 'AI service authentication failed. Check your GEMINI_API_KEY.',
      });
    }

    if (err.message?.includes('quota') || err.message?.includes('rate')) {
      return res.status(429).json({
        error: 'API rate limit reached. Please try again in a moment.',
      });
    }

    res.status(500).json({
      error: 'Failed to process your code. Please try again.',
    });
  }
};
