import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/products/compare - Must come before /:id
router.get('/compare', async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    if (ids.length < 2) {
      return res.status(400).json({ error: 'Please provide at least 2 product IDs or codes to compare' });
    }
    if (ids.length > 4) {
      return res.status(400).json({ error: 'Comparison is limited to a maximum of 4 products' });
    }

    const products = await db.getProductsByIds(ids);

    // Build side-by-side specification comparison matrix
    const matrix = {
      products: products.map(p => ({
        id: p.id,
        product_code: p.product_code,
        name: p.name,
        brand: p.brand,
        price: p.price,
        rating: p.rating,
        review_count: p.review_count,
        stock_status: p.stock_status,
        image_url: p.image_url,
        specifications: p.specifications
      })),
      comparisonKeys: [
        { key: 'processor', label: 'Processor / CPU' },
        { key: 'ram', label: 'RAM / Memory' },
        { key: 'storage', label: 'Storage' },
        { key: 'graphics', label: 'Graphics / GPU' },
        { key: 'display', label: 'Display' },
        { key: 'battery', label: 'Battery Life' },
        { key: 'weight', label: 'Weight' },
        { key: 'os', label: 'Operating System' }
      ]
    };

    res.json(matrix);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { query, category_id, min_price, max_price, brand, min_rating, stock_status, sort, page, limit } = req.query;
    const result = await db.queryProducts({
      query,
      category_id,
      min_price,
      max_price,
      brand: brand ? (Array.isArray(brand) ? brand : [brand]) : undefined,
      min_rating,
      stock_status,
      sort,
      page: page || 1,
      limit: limit || 12
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
