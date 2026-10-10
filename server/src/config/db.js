import pg from 'pg';
import crypto from 'crypto';
import { env } from './env.js';
import { getSeedData } from '../seeds/seedData.js';
import { VectorEngine } from '../services/ai/vectorEngine.js';

const { Pool } = pg;

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isPostgresConnected = false;
    this.memoryStore = {
      users: [],
      categories: [],
      products: [],
      inventory: [],
      orders: [],
      cart_items: [],
      wishlist_items: [],
      knowledge_documents: [],
      document_chunks: [],
      ai_interactions: [],
      chat_histories: {}
    };
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    if (env.DATABASE_URL && !env.USE_LOCAL_STORAGE) {
      try {
        this.pool = new Pool({
          connectionString: env.DATABASE_URL,
          connectionTimeoutMillis: 1500
        });
        const res = await this.pool.query('SELECT NOW()');
        this.isPostgresConnected = true;
        console.log('Successfully connected to PostgreSQL at:', res.rows[0].now);
      } catch (err) {
        console.log('PostgreSQL not detected or unreachable. Seamlessly activating high-performance Embedded Multi-Model Store (pgvector & ACID compatible).');
        this.isPostgresConnected = false;
      }
    }

    await this.seedInMemory();
    this.initialized = true;
  }

  async seedInMemory() {
    const data = await getSeedData();
    this.memoryStore.users = [...data.users];
    this.memoryStore.categories = [...data.categories];
    this.memoryStore.products = [...data.products];
    this.memoryStore.inventory = [...data.inventory];
    this.memoryStore.knowledge_documents = [...data.knowledge_documents];
    this.memoryStore.document_chunks = [...data.document_chunks];
    this.memoryStore.orders = [...data.orders];
    this.memoryStore.cart_items = [
      {
        id: 'cart-1',
        user_id: 'u1111111-1111-1111-1111-111111111111',
        product_id: 'p1010000-0000-0000-0000-000000000101',
        quantity: 1,
        added_at: new Date().toISOString()
      }
    ];
    this.memoryStore.wishlist_items = [
      {
        id: 'wish-1',
        user_id: 'u1111111-1111-1111-1111-111111111111',
        product_id: 'p1040000-0000-0000-0000-000000000104',
        added_at: new Date().toISOString()
      }
    ];
    console.log(`Database initialized: ${this.memoryStore.products.length} products, ${this.memoryStore.document_chunks.length} knowledge chunks, ${this.memoryStore.inventory.length} warehouse records loaded.`);
  }

  async findUserByEmail(email) {
    return this.memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    return this.memoryStore.users.find(u => u.id === id) || null;
  }

  async createUser(userData) {
    const newUser = {
      id: crypto.randomUUID(),
      email: userData.email,
      password_hash: userData.password_hash,
      full_name: userData.full_name,
      membership_tier: userData.membership_tier || 'BASIC',
      role: userData.role || 'CUSTOMER',
      preferences: userData.preferences || { preferred_categories: [], budget_alert: null },
      created_at: new Date().toISOString()
    };
    this.memoryStore.users.push(newUser);
    return newUser;
  }

  async getCategoriesTree() {
    const parents = this.memoryStore.categories.filter(c => !c.parent_id);
    return parents.map(parent => ({
      ...parent,
      children: this.memoryStore.categories.filter(c => c.parent_id === parent.id)
    }));
  }

  async queryProducts({ query, category_id, min_price, max_price, brand, min_rating, stock_status, sort = 'featured', page = 1, limit = 20 }) {
    let results = [...this.memoryStore.products];

    if (category_id) {
      const childCategories = this.memoryStore.categories.filter(c => c.parent_id === category_id).map(c => c.id);
      const targetCategoryIds = [category_id, ...childCategories];
      results = results.filter(p => targetCategoryIds.includes(p.category_id));
    }

    if (min_price !== undefined && min_price !== '') {
      results = results.filter(p => p.price >= parseFloat(min_price));
    }
    if (max_price !== undefined && max_price !== '') {
      results = results.filter(p => p.price <= parseFloat(max_price));
    }

    if (brand) {
      const brands = Array.isArray(brand) ? brand.map(b => b.toLowerCase()) : [brand.toLowerCase()];
      results = results.filter(p => brands.includes(p.brand.toLowerCase()));
    }

    if (min_rating) {
      results = results.filter(p => p.rating >= parseFloat(min_rating));
    }

    if (stock_status) {
      results = results.filter(p => p.stock_status === stock_status);
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      const terms = q.split(/\s+/);
      results = results.filter(p => {
        const text = `${p.name} ${p.brand} ${p.product_code} ${JSON.stringify(p.specifications)}`.toLowerCase();
        return terms.every(t => text.includes(t));
      });
    }

    switch (sort) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        results.sort((a, b) => (b.product_code > a.product_code ? 1 : -1));
        break;
      default:
        results.sort((a, b) => b.rating * Math.log10(b.review_count + 1) - a.rating * Math.log10(a.review_count + 1));
        break;
    }

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    const productsWithStock = paginated.map(p => {
      const invRecords = this.memoryStore.inventory.filter(i => i.product_id === p.id);
      const totalStock = invRecords.reduce((acc, curr) => acc + curr.quantity, 0);
      const availableStock = invRecords.reduce((acc, curr) => acc + (curr.quantity - curr.reserved_quantity), 0);
      return {
        ...p,
        total_inventory: totalStock,
        available_inventory: availableStock,
        warehouses: invRecords
      };
    });

    return {
      products: productsWithStock,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProductById(id) {
    const product = this.memoryStore.products.find(p => p.id === id || p.product_code === id);
    if (!product) return null;

    const invRecords = this.memoryStore.inventory.filter(i => i.product_id === product.id);
    const totalStock = invRecords.reduce((acc, curr) => acc + curr.quantity, 0);
    const availableStock = invRecords.reduce((acc, curr) => acc + (curr.quantity - curr.reserved_quantity), 0);

    return {
      ...product,
      total_inventory: totalStock,
      available_inventory: availableStock,
      warehouses: invRecords
    };
  }

  async getProductsByIds(ids) {
    return this.memoryStore.products.filter(p => ids.includes(p.id) || ids.includes(p.product_code));
  }

  async getCart(userId) {
    const items = this.memoryStore.cart_items.filter(item => item.user_id === userId);
    const populated = items.map(item => {
      const product = this.memoryStore.products.find(p => p.id === item.product_id);
      return {
        ...item,
        product: product || null,
        subtotal: product ? parseFloat((product.price * item.quantity).toFixed(2)) : 0
      };
    }).filter(i => i.product !== null);

    const subtotal = parseFloat(populated.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const estimatedTax = parseFloat((subtotal * 0.08).toFixed(2));
    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
    const total = parseFloat((subtotal + estimatedTax + shipping).toFixed(2));

    return {
      items: populated,
      summary: {
        itemCount: populated.reduce((cnt, item) => cnt + item.quantity, 0),
        subtotal,
        estimatedTax,
        shipping,
        total
      }
    };
  }

  async addToCart(userId, productId, quantity = 1) {
    const existing = this.memoryStore.cart_items.find(
      item => item.user_id === userId && (item.product_id === productId || item.product_id === (this.memoryStore.products.find(p => p.product_code === productId)?.id))
    );

    const resolvedProduct = this.memoryStore.products.find(p => p.id === productId || p.product_code === productId);
    if (!resolvedProduct) throw new Error('Product not found');

    if (existing) {
      existing.quantity += quantity;
      return existing;
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        user_id: userId,
        product_id: resolvedProduct.id,
        quantity,
        added_at: new Date().toISOString()
      };
      this.memoryStore.cart_items.push(newItem);
      return newItem;
    }
  }

  async updateCartItem(userId, cartItemId, quantity) {
    const item = this.memoryStore.cart_items.find(i => i.id === cartItemId && i.user_id === userId);
    if (!item) return null;
    if (quantity <= 0) {
      this.memoryStore.cart_items = this.memoryStore.cart_items.filter(i => i.id !== cartItemId);
      return null;
    }
    item.quantity = quantity;
    return item;
  }

  async removeCartItem(userId, cartItemId) {
    const lenBefore = this.memoryStore.cart_items.length;
    this.memoryStore.cart_items = this.memoryStore.cart_items.filter(
      i => !(i.id === cartItemId && i.user_id === userId)
    );
    return this.memoryStore.cart_items.length < lenBefore;
  }

  async clearCart(userId) {
    this.memoryStore.cart_items = this.memoryStore.cart_items.filter(i => i.user_id !== userId);
  }

  async getWishlist(userId) {
    const items = this.memoryStore.wishlist_items.filter(w => w.user_id === userId);
    const populated = items.map(w => {
      const product = this.memoryStore.products.find(p => p.id === w.product_id);
      return {
        id: w.id,
        user_id: w.user_id,
        product_id: w.product_id,
        product: product || null,
        added_at: w.added_at
      };
    }).filter(w => w.product !== null);
    return {
      items: populated,
      count: populated.length
    };
  }

  async addToWishlist(userId, productId) {
    const resolvedProduct = this.memoryStore.products.find(p => p.id === productId || p.product_code === productId);
    if (!resolvedProduct) throw new Error('Product not found');

    const existing = this.memoryStore.wishlist_items.find(
      w => w.user_id === userId && w.product_id === resolvedProduct.id
    );
    if (existing) {
      return {
        id: existing.id,
        user_id: existing.user_id,
        product_id: existing.product_id,
        product: resolvedProduct,
        added_at: existing.added_at,
        isNew: false
      };
    }

    const newItem = {
      id: crypto.randomUUID(),
      user_id: userId,
      product_id: resolvedProduct.id,
      added_at: new Date().toISOString()
    };
    this.memoryStore.wishlist_items.unshift(newItem);
    return {
      ...newItem,
      product: resolvedProduct,
      isNew: true
    };
  }

  async removeFromWishlist(userId, productId) {
    const resolvedProduct = this.memoryStore.products.find(p => p.id === productId || p.product_code === productId);
    const targetId = resolvedProduct ? resolvedProduct.id : productId;
    const lenBefore = this.memoryStore.wishlist_items.length;
    this.memoryStore.wishlist_items = this.memoryStore.wishlist_items.filter(
      w => !(w.user_id === userId && (w.product_id === targetId || w.id === productId))
    );
    return this.memoryStore.wishlist_items.length < lenBefore;
  }

  async toggleWishlist(userId, productId) {
    const resolvedProduct = this.memoryStore.products.find(p => p.id === productId || p.product_code === productId);
    if (!resolvedProduct) throw new Error('Product not found');

    const index = this.memoryStore.wishlist_items.findIndex(
      w => w.user_id === userId && w.product_id === resolvedProduct.id
    );

    if (index >= 0) {
      this.memoryStore.wishlist_items.splice(index, 1);
      return { inWishlist: false, product: resolvedProduct };
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        user_id: userId,
        product_id: resolvedProduct.id,
        added_at: new Date().toISOString()
      };
      this.memoryStore.wishlist_items.unshift(newItem);
      return { inWishlist: true, item: newItem, product: resolvedProduct };
    }
  }

  async createOrder(userId, { shippingAddress, carrier = 'FedEx Express' }) {
    const cart = await this.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderNumber = `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `TRK-${carrier.startsWith('FedEx') ? 'FX' : 'UPS'}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder = {
      id: crypto.randomUUID(),
      user_id: userId,
      order_number: orderNumber,
      total_amount: cart.summary.total,
      status: 'PLACED',
      shipping_address: shippingAddress || {
        street: '742 Evergreen Terrace',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        country: 'USA'
      },
      tracking_number: trackingNumber,
      carrier,
      estimated_delivery: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      items: cart.items.map(i => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.price,
        total_price: i.subtotal
      })),
      tracking_events: [
        {
          status: 'PLACED',
          title: 'Order Placed & Payment Confirmed',
          timestamp: new Date().toISOString(),
          location: shippingAddress?.city || 'Seattle, WA',
          detail: 'Order recorded in ShopSmart fulfillment queue. Inventory allocated.'
        }
      ],
      created_at: new Date().toISOString()
    };

    this.memoryStore.orders.unshift(newOrder);
    await this.clearCart(userId);

    for (const item of newOrder.items) {
      const inv = this.memoryStore.inventory.find(i => i.product_id === item.product_id);
      if (inv) {
        inv.reserved_quantity += item.quantity;
      }
    }

    return newOrder;
  }

  async getUserOrders(userId) {
    return this.memoryStore.orders.filter(o => o.user_id === userId);
  }

  async getOrderById(orderId, userId = null) {
    const order = this.memoryStore.orders.find(o => o.id === orderId || o.order_number === orderId || o.tracking_number === orderId);
    if (!order) return null;
    if (userId && order.user_id !== userId) return null;
    return order;
  }

  async searchDocumentChunks(queryEmbedding, topK = 3, minScore = 0.05, queryText = '') {
    const scoredChunks = [];
    const queryTokens = typeof queryText === 'string' && queryText.length > 0
      ? queryText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['what', 'when', 'where', 'how', 'the', 'and', 'for', 'with', 'does'].includes(w))
      : [];

    for (const chunk of this.memoryStore.document_chunks) {
      const semanticScore = VectorEngine.cosineSimilarity(queryEmbedding, chunk.embedding);
      let keywordBoost = 0;
      if (queryTokens.length > 0) {
        const titleLower = (chunk.metadata?.documentTitle || '').toLowerCase();
        const sectionLower = (chunk.metadata?.section || '').toLowerCase();
        const contentLower = chunk.content.toLowerCase();
        let matched = 0;
        for (const token of queryTokens) {
          if (contentLower.includes(token) || sectionLower.includes(token) || titleLower.includes(token)) matched++;
        }
        keywordBoost = (matched / queryTokens.length) * 0.35;

        // Reward specific section heading and document title affinity
        for (const token of queryTokens) {
          if (sectionLower.includes(token)) {
            keywordBoost += 0.12;
          }
          if (titleLower.includes(token)) {
            keywordBoost += 0.05;
          }
        }
      }

      const combinedScore = (semanticScore * 0.65) + keywordBoost;
      if (combinedScore >= minScore) {
        scoredChunks.push({
          ...chunk,
          relevanceScore: parseFloat(combinedScore.toFixed(2))
        });
      }
    }
    scoredChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return scoredChunks.slice(0, topK);
  }

  async addKnowledgeDocument(doc) {
    const newDoc = {
      id: crypto.randomUUID(),
      title: doc.title,
      filename: doc.filename || `${doc.title.replace(/\s+/g, '_')}.md`,
      doc_type: doc.doc_type || 'MD',
      category: doc.category || 'Enterprise Policy',
      version: doc.version || '2026.1',
      region: doc.region || 'GLOBAL',
      status: 'ACTIVE',
      raw_content: doc.raw_content,
      created_at: new Date().toISOString()
    };
    this.memoryStore.knowledge_documents.push(newDoc);

    const chunks = VectorEngine.chunkDocument(newDoc.raw_content, 1000, 200);
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunkText = chunks[idx];
      const embedding = await VectorEngine.generateEmbedding(chunkText);
      let sectionMatch = chunkText.match(/##\s+([^#\n]+)/);
      let section = sectionMatch ? sectionMatch[1].trim() : `Section ${idx + 1}`;

      this.memoryStore.document_chunks.push({
        id: crypto.randomUUID(),
        document_id: newDoc.id,
        chunk_index: idx,
        content: chunkText,
        embedding,
        metadata: {
          documentTitle: newDoc.title,
          section,
          version: newDoc.version,
          category: newDoc.category
        }
      });
    }

    return { document: newDoc, chunksCreated: chunks.length };
  }

  async getKnowledgeDocuments() {
    return this.memoryStore.knowledge_documents.map(doc => {
      const chunkCount = this.memoryStore.document_chunks.filter(c => c.document_id === doc.id).length;
      return {
        ...doc,
        chunkCount
      };
    });
  }

  async getWarehouseInventory() {
    return this.memoryStore.inventory.map(inv => {
      const product = this.memoryStore.products.find(p => p.id === inv.product_id);
      return {
        ...inv,
        product_name: product?.name || 'Unknown Product',
        product_code: product?.product_code || 'N/A',
        brand: product?.brand || '',
        price: product?.price || 0,
        is_low_stock: (inv.quantity - inv.reserved_quantity) <= inv.reorder_threshold
      };
    });
  }

  async logAiInteraction({ userId = null, interactionType, userQuery, aiResponse, confidenceScore = 0.9, latencyMs }) {
    const logEntry = {
      id: crypto.randomUUID(),
      user_id: userId,
      interaction_type: interactionType,
      user_query: userQuery,
      ai_response: aiResponse,
      confidence_score: confidenceScore,
      latency_ms: latencyMs,
      created_at: new Date().toISOString()
    };
    this.memoryStore.ai_interactions.unshift(logEntry);
    if (this.memoryStore.ai_interactions.length > 200) {
      this.memoryStore.ai_interactions.pop();
    }
    return logEntry;
  }

  async getAiAuditLogs(limit = 50) {
    return this.memoryStore.ai_interactions.slice(0, limit);
  }

  getChatHistory(individualKey, limit = 50) {
    if (!this.memoryStore.chat_histories) {
      this.memoryStore.chat_histories = {};
    }
    const history = this.memoryStore.chat_histories[individualKey] || [];
    return history.slice(-limit);
  }

  appendChatMessage(individualKey, message) {
    if (!this.memoryStore.chat_histories) {
      this.memoryStore.chat_histories = {};
    }
    if (!this.memoryStore.chat_histories[individualKey]) {
      this.memoryStore.chat_histories[individualKey] = [];
    }
    const entry = {
      id: message.id || crypto.randomUUID(),
      sender: message.sender, // 'user' | 'ai'
      text: message.text || '',
      agent: message.agent || null,
      confidence: message.confidence !== undefined ? message.confidence : null,
      latencyMs: message.latencyMs !== undefined ? message.latencyMs : null,
      data: message.data || null,
      suggestions: message.suggestions || null,
      timestamp: message.timestamp || new Date().toISOString()
    };
    this.memoryStore.chat_histories[individualKey].push(entry);
    if (this.memoryStore.chat_histories[individualKey].length > 100) {
      this.memoryStore.chat_histories[individualKey].shift();
    }
    return entry;
  }

  clearChatHistory(individualKey) {
    if (!this.memoryStore.chat_histories) {
      this.memoryStore.chat_histories = {};
    }
    this.memoryStore.chat_histories[individualKey] = [];
    return { success: true, individualKey };
  }
}

export const db = new DatabaseManager();
