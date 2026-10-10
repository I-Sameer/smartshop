import express from 'express';
import { z } from 'zod';
import { ShoppingAgent } from '../services/ai/shoppingAgent.js';
import { MasterRouter } from '../services/ai/masterRouter.js';
import { optionalAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { db } from '../config/db.js';

const router = express.Router();

const recommendSchema = z.object({
  query: z.string().min(2),
  preferences: z.record(z.any()).optional()
});

const chatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  conversationHistory: z.array(z.any()).optional()
});

// POST /api/ai/recommend - Module 1 Discovery Pipeline
router.post('/recommend', aiLimiter, optionalAuth, validateBody(recommendSchema), async (req, res) => {
  const startTime = Date.now();
  try {
    const { query, preferences } = req.body;
    const response = await ShoppingAgent.evaluateDiscovery(query, preferences || {});
    const latencyMs = Date.now() - startTime;

    // Layer 6: Comprehensive AI Audit Logging
    await db.logAiInteraction({
      userId: req.user ? req.user.id : null,
      interactionType: 'SHOPPING_RECOMMENDATION',
      userQuery: query,
      aiResponse: response,
      confidenceScore: response.recommendations[0]?.matchScore || 0.90,
      latencyMs
    });

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat - Multi-Agent Conversational Copilot with per-individual memory
router.post('/chat', aiLimiter, optionalAuth, validateBody(chatSchema), async (req, res) => {
  try {
    const { message, sessionId, conversationHistory } = req.body;
    const routed = await MasterRouter.routeQuery({
      query: message,
      userId: req.user ? req.user.id : null,
      sessionId: sessionId || null,
      userPreferences: req.user ? req.user.preferences : {},
      conversationHistory: conversationHistory || null
    });
    res.json(routed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/history - Retrieve individual chat history
router.get('/history', optionalAuth, async (req, res) => {
  try {
    const individualKey = req.user ? `user:${req.user.id}` : `session:${req.query.sessionId || 'guest'}`;
    const history = db.getChatHistory(individualKey);
    res.json({
      individualKey,
      count: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/ai/history - Clear individual chat history
router.delete('/history', optionalAuth, async (req, res) => {
  try {
    const individualKey = req.user ? `user:${req.user.id}` : `session:${req.query.sessionId || req.body?.sessionId || 'guest'}`;
    db.clearChatHistory(individualKey);
    res.json({
      success: true,
      message: 'Chat history cleared successfully',
      individualKey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
