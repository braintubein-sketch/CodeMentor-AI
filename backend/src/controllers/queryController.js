// ============================================
// CodeMentor AI — Query History Controller
// ============================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/query/history
 * Retrieve the authenticated user's query history (most recent first).
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [queries, total] = await Promise.all([
      prisma.query.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          code: true,
          language: true,
          action: true,
          response: true,
          createdAt: true,
        },
      }),
      prisma.query.count({ where: { userId } }),
    ]);

    res.json({
      queries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch query history.' });
  }
};

/**
 * GET /api/query/:id
 * Retrieve a single query by ID (must belong to the authenticated user).
 */
exports.getQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const query = await prisma.query.findFirst({
      where: { id, userId },
    });

    if (!query) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    res.json({ query });
  } catch (err) {
    console.error('Query fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch query.' });
  }
};

/**
 * DELETE /api/query/:id
 * Delete a single query by ID (must belong to the authenticated user).
 */
exports.deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const query = await prisma.query.findFirst({ where: { id, userId } });
    if (!query) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    await prisma.query.delete({ where: { id } });

    res.json({ message: 'Query deleted successfully.' });
  } catch (err) {
    console.error('Query delete error:', err);
    res.status(500).json({ error: 'Failed to delete query.' });
  }
};
