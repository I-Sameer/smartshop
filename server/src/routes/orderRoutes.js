import express from 'express';
import { z } from 'zod';
import { db } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = express.Router();

const checkoutSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(3),
    country: z.string().default('USA')
  }).optional(),
  carrier: z.string().optional()
});

// POST /api/orders - Convert active cart to order
router.post('/', authenticateToken, validateBody(checkoutSchema), async (req, res) => {
  try {
    const { shippingAddress, carrier } = req.body;
    const order = await db.createOrder(req.user.id, {
      shippingAddress,
      carrier: carrier || (req.user.membershipTier === 'PRIME' ? 'FedEx Priority Next-Day' : 'Standard Carrier')
    });
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders - List user order history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await db.getUserOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id/track - Track shipment timeline & carrier milestones
router.get('/:id/track', authenticateToken, async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id, req.user.role === 'ADMIN' ? null : req.user.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found or access denied' });
    }

    res.json({
      orderNumber: order.order_number,
      trackingNumber: order.tracking_number,
      status: order.status,
      carrier: order.carrier,
      estimatedDelivery: order.estimated_delivery,
      shippingAddress: order.shipping_address,
      items: order.items,
      milestones: order.tracking_events || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
