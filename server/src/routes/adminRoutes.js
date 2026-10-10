import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { DocumentIngestionService } from '../services/ai/documentIngestionService.js';
import { VectorEngine } from '../services/ai/vectorEngine.js';

const router = express.Router();

// Configure Multer for file uploads (max 10MB memory buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadDocSchema = z.object({
  title: z.string().min(2),
  doc_type: z.enum(['PDF', 'MD', 'JSON']).default('MD'),
  category: z.string().default('General Policy'),
  version: z.string().default('2026.1'),
  region: z.string().default('GLOBAL'),
  raw_content: z.string().min(10)
});

// All admin routes require ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

// GET /api/admin/inventory - Real-time multi-warehouse stock balances & alerts
router.get('/inventory', async (req, res) => {
  try {
    const inventory = await db.getWarehouseInventory();
    const lowStockCount = inventory.filter(i => i.is_low_stock).length;
    res.json({
      totalSKUs: inventory.length,
      lowStockAlertsCount: lowStockCount,
      warehouses: ['WH-EAST', 'WH-WEST', 'WH-CENTRAL', 'WH-SOUTH'],
      records: inventory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/documents - List all ingested knowledge sources
router.get('/documents', async (req, res) => {
  try {
    const documents = await db.getKnowledgeDocuments();
    res.json({
      count: documents.length,
      documents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/documents/upload - Upload and chunk document with pgvector embeddings
router.post('/documents/upload', validateBody(uploadDocSchema), async (req, res) => {
  try {
    const result = await DocumentIngestionService.ingest(req.body);
    res.status(201).json({
      message: 'Document ingested and vectorized successfully',
      document: result.document,
      chunksCreated: result.chunksCreated,
      docType: result.docType
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/documents/upload-file - Multi-format File Upload (PDF, MD, JSON, TXT)
router.post('/documents/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, category, version, region, doc_type } = req.body;
    const originalName = req.file.originalname;
    let detectedType = (doc_type || '').toUpperCase();

    if (!detectedType) {
      if (originalName.endsWith('.pdf')) detectedType = 'PDF';
      else if (originalName.endsWith('.json')) detectedType = 'JSON';
      else detectedType = 'MD';
    }

    const result = await DocumentIngestionService.ingest({
      title: title || originalName.replace(/\.[^/.]+$/, ''),
      category: category || 'Enterprise Policy',
      version: version || '2026.1',
      region: region || 'GLOBAL',
      doc_type: detectedType,
      fileBuffer: req.file.buffer,
      filename: originalName
    });

    res.status(201).json({
      message: `File "${originalName}" ingested successfully (${result.chunksCreated} pgvector chunks)`,
      document: result.document,
      chunksCreated: result.chunksCreated,
      docType: result.docType
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/documents/test-search - Interactive Vector Search & Retrieval Explorer
router.post('/documents/test-search', async (req, res) => {
  try {
    const { query, topK = 4 } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const queryEmbedding = await VectorEngine.generateEmbedding(query);
    const chunks = await db.searchDocumentChunks(queryEmbedding, topK, 0.05, query);

    res.json({
      query,
      retrievedCount: chunks.length,
      chunks: chunks.map(c => ({
        id: c.id,
        documentTitle: c.metadata.documentTitle,
        section: c.metadata.section,
        version: c.metadata.version,
        relevanceScore: c.relevanceScore,
        content: c.content
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/audit-logs - View AI interaction history, latency, and confidence
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const logs = await db.getAiAuditLogs(limit);
    res.json({
      count: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
