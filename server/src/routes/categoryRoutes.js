import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/categories - Complete hierarchical tree
router.get('/', async (req, res) => {
  try {
    const categoriesTree = await db.getCategoriesTree();
    res.json(categoriesTree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
