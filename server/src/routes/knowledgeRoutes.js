import express from 'express';
import { z } from 'zod';
import { KnowledgeRagAgent } from '../services/ai/knowledgeRagAgent.js';
import { optionalAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { db } from '../config/db.js';

const router = express.Router();

const askSchema = z.object({
  question: z.string().min(3),
  sessionId: z.string().optional()
});

// POST /api/knowledge/ask - Module 2 Grounded Policy RAG with individual history tracking
router.post('/ask', aiLimiter, optionalAuth, validateBody(askSchema), async (req, res) => {
  const startTime = Date.now();
  try {
    const { question, sessionId } = req.body;
    const userId = req.user ? req.user.id : null;
    const individualKey = userId ? `user:${userId}` : `session:${sessionId || 'guest'}`;

    const response = await KnowledgeRagAgent.askPolicy(question, {
      userId,
      sessionId
    });
    const latencyMs = Date.now() - startTime;

    // Record turn in individual's chat history
    db.appendChatMessage(individualKey, {
      sender: 'user',
      text: question
    });

    db.appendChatMessage(individualKey, {
      sender: 'ai',
      text: response.answer,
      agent: 'Knowledge RAG Agent',
      confidence: response.sources?.[0]?.relevanceScore || 0.90,
      latencyMs,
      data: response
    });

    // Layer 6: Comprehensive AI Audit Logging
    await db.logAiInteraction({
      userId,
      interactionType: 'KNOWLEDGE_RAG',
      userQuery: question,
      aiResponse: response,
      confidenceScore: response.sources[0]?.relevanceScore || 0.90,
      latencyMs
    });

    res.json({
      ...response,
      individualKey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/knowledge/history - Retrieve individual RAG conversation history
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

// DELETE /api/knowledge/history - Clear individual RAG conversation history
router.delete('/history', optionalAuth, async (req, res) => {
  try {
    const individualKey = req.user ? `user:${req.user.id}` : `session:${req.query.sessionId || req.body?.sessionId || 'guest'}`;
    db.clearChatHistory(individualKey);
    res.json({
      success: true,
      message: 'RAG chat history cleared successfully',
      individualKey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
