import express from 'express';
import { z } from 'zod';
import { db } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = express.Router();

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).optional().default(1)
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(0)
});

// GET /api/cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cart = await db.getCart(req.user.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart
router.post('/', authenticateToken, validateBody(addToCartSchema), async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const item = await db.addToCart(req.user.id, productId, quantity);
    const cart = await db.getCart(req.user.id);
    res.status(201).json({ message: 'Item added to cart', item, cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/cart/:id
router.put('/:id', authenticateToken, validateBody(updateCartSchema), async (req, res) => {
  try {
    const { quantity } = req.body;
    const updated = await db.updateCartItem(req.user.id, req.params.id, quantity);
    const cart = await db.getCart(req.user.id);
    res.json({ message: 'Cart updated', updated, cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.removeCartItem(req.user.id, req.params.id);
    const cart = await db.getCart(req.user.id);
    res.json({ message: 'Item removed from cart', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
