import express from 'express';
import { z } from 'zod';
import { db } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = express.Router();

const wishlistActionSchema = z.object({
  productId: z.string().min(1)
});

// GET /api/wishlist — Retrieve current customer's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const wishlist = await db.getWishlist(req.user.id);
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wishlist — Add product to wishlist
router.post('/', authenticateToken, validateBody(wishlistActionSchema), async (req, res) => {
  try {
    const { productId } = req.body;
    const item = await db.addToWishlist(req.user.id, productId);
    const wishlist = await db.getWishlist(req.user.id);
    res.status(201).json({ message: 'Added to wishlist', item, wishlist });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/wishlist/toggle — Toggle product in/out of wishlist
router.post('/toggle', authenticateToken, validateBody(wishlistActionSchema), async (req, res) => {
  try {
    const { productId } = req.body;
    const result = await db.toggleWishlist(req.user.id, productId);
    const wishlist = await db.getWishlist(req.user.id);
    res.json({
      message: result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
      inWishlist: result.inWishlist,
      product: result.product,
      wishlist
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/wishlist/:productId — Remove product from wishlist
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    await db.removeFromWishlist(req.user.id, req.params.productId);
    const wishlist = await db.getWishlist(req.user.id);
    res.json({ message: 'Removed from wishlist', wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
