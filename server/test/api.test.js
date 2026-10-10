import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { db } from '../src/config/db.js';

let server;
let baseUrl;
let customerToken;
let adminToken;

test.before(async () => {
  await db.init();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('1. Health Check Endpoint', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ONLINE');
  assert.ok(data.capabilities.length >= 5);
});

test('2. Authentication Flow (Customer & Admin Login)', async () => {
  // Customer Login
  const custRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@shopsmart.ai', password: 'password123' })
  });
  assert.strictEqual(custRes.status, 200);
  const custData = await custRes.json();
  assert.ok(custData.token);
  customerToken = custData.token;
  assert.strictEqual(custData.user.membership_tier, 'PRIME');

  // Admin Login
  const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@shopsmart.ai', password: 'admin123' })
  });
  assert.strictEqual(adminRes.status, 200);
  const adminData = await adminRes.json();
  assert.ok(adminData.token);
  adminToken = adminData.token;
  assert.strictEqual(adminData.user.role, 'ADMIN');
});

test('3. Category Hierarchy Tree', async () => {
  const res = await fetch(`${baseUrl}/api/categories`);
  assert.strictEqual(res.status, 200);
  const tree = await res.json();
  assert.ok(Array.isArray(tree));
  assert.ok(tree.length >= 2);
  const electronics = tree.find(c => c.slug === 'electronics');
  assert.ok(electronics);
  assert.ok(electronics.children.length >= 3);
});

test('4. Product Catalog & Faceted Search', async () => {
  const res = await fetch(`${baseUrl}/api/products?query=Dell`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.products.length >= 1);
  assert.strictEqual(data.products[0].brand, 'Dell');
  assert.ok(data.products[0].total_inventory > 0);
});

test('5. Side-by-Side Product Comparison Matrix', async () => {
  const res = await fetch(`${baseUrl}/api/products/compare?ids=LAP101,LAP102`);
  assert.strictEqual(res.status, 200);
  const matrix = await res.json();
  assert.strictEqual(matrix.products.length, 2);
  assert.ok(matrix.comparisonKeys.length >= 5);
});

test('6. Cart & Checkout Operations', async () => {
  // Add LAP102 to cart
  const addRes = await fetch(`${baseUrl}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({ productId: 'LAP102', quantity: 1 })
  });
  assert.strictEqual(addRes.status, 201);

  // Get Cart
  const getRes = await fetch(`${baseUrl}/api/cart`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  assert.strictEqual(getRes.status, 200);
  const cart = await getRes.json();
  assert.ok(cart.items.length >= 1);
  assert.ok(cart.summary.total > 0);

  // Place Order
  const orderRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      shippingAddress: {
        street: '123 Innovation Way',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'USA'
      }
    })
  });
  assert.strictEqual(orderRes.status, 201);
  const orderData = await orderRes.json();
  assert.ok(orderData.order.order_number);
  assert.strictEqual(orderData.order.status, 'PLACED');

  // Track Order
  const trackRes = await fetch(`${baseUrl}/api/orders/${orderData.order.id}/track`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  assert.strictEqual(trackRes.status, 200);
  const trackData = await trackRes.json();
  assert.strictEqual(trackData.status, 'PLACED');
  assert.ok(trackData.milestones.length >= 1);
});

test('7. Module 1: AI-Powered Product Discovery Contract', async () => {
  const res = await fetch(`${baseUrl}/api/ai/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      query: 'Suggest a laptop under $1000 for Java development and AI projects'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.interpretedRequirement);
  assert.strictEqual(data.budget, 1000);
  assert.ok(Array.isArray(data.extractedFeatures));
  assert.ok(data.extractedFeatures.includes('16GB+ RAM'));
  assert.ok(Array.isArray(data.recommendations));
  assert.ok(data.recommendations.length > 0);
  assert.ok(data.recommendations[0].productId);
  assert.ok(data.recommendations[0].reason);
  assert.ok(typeof data.recommendations[0].matchScore === 'number');
});

test('8. Module 2: Grounded Knowledge RAG Contract', async () => {
  const res = await fetch(`${baseUrl}/api/knowledge/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      question: 'What is the return policy for opened laptops?'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.answer);
  assert.ok(data.answer.includes('7 days'));
  assert.strictEqual(data.confidence, 'HIGH');
  assert.ok(Array.isArray(data.sources));
  assert.ok(data.sources.length > 0);
  assert.ok(data.sources[0].document);
  assert.ok(data.sources[0].section);
  assert.ok(data.sources[0].version);
  assert.ok(typeof data.sources[0].relevanceScore === 'number');
});

test('9. Admin Warehouse Inventory & Audit Logs', async () => {
  // Inventory
  const invRes = await fetch(`${baseUrl}/api/admin/inventory`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(invRes.status, 200);
  const invData = await invRes.json();
  assert.ok(invData.records.length > 0);
  assert.ok(invData.warehouses.includes('WH-EAST'));

  // Audit Logs
  const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(auditRes.status, 200);
  const auditData = await auditRes.json();
  assert.ok(auditData.logs.length >= 1);
  assert.ok(auditData.logs[0].latency_ms >= 0);
});

test('10. Customer Wishlist Lifecycle (Add, Get, Toggle, Remove)', async () => {
  // 1. Get initial wishlist
  const getRes = await fetch(`${baseUrl}/api/wishlist`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  assert.strictEqual(getRes.status, 200);
  const initialWishlist = await getRes.json();
  assert.ok(Array.isArray(initialWishlist.items));

  // 2. Add product to wishlist
  const addRes = await fetch(`${baseUrl}/api/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({ productId: 'LAP101' })
  });
  assert.strictEqual(addRes.status, 201);
  const addData = await addRes.json();
  assert.ok(addData.item);
  assert.strictEqual(addData.item.product.product_code, 'LAP101');

  // 3. Toggle off
  const toggleOffRes = await fetch(`${baseUrl}/api/wishlist/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({ productId: 'LAP101' })
  });
  assert.strictEqual(toggleOffRes.status, 200);
  const toggleOffData = await toggleOffRes.json();
  assert.strictEqual(toggleOffData.inWishlist, false);

  // 4. Toggle on
  const toggleOnRes = await fetch(`${baseUrl}/api/wishlist/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({ productId: 'LAP101' })
  });
  assert.strictEqual(toggleOnRes.status, 200);
  const toggleOnData = await toggleOnRes.json();
  assert.strictEqual(toggleOnData.inWishlist, true);

  // 5. Remove from wishlist
  const deleteRes = await fetch(`${baseUrl}/api/wishlist/LAP101`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  assert.strictEqual(deleteRes.status, 200);
});

test('11. Multi-Format Knowledge Document Ingestion & Vector Search (Markdown, JSON, Retrieval)', async () => {
  // 1. List pre-seeded knowledge documents
  const docsRes = await fetch(`${baseUrl}/api/admin/documents`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(docsRes.status, 200);
  const docsData = await docsRes.json();
  assert.ok(docsData.count >= 8); // Covers all 8 knowledge sources

  // 2. Ingest structured JSON policy document
  const jsonDocRes = await fetch(`${baseUrl}/api/admin/documents/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Customer Trade-In Valuation & Credit Schedule',
      category: 'Trade-In & Recycling',
      doc_type: 'JSON',
      version: '2026.1',
      region: 'GLOBAL',
      raw_content: JSON.stringify({
        title: 'Customer Trade-In Valuation Policy',
        sections: [
          {
            heading: 'Section 1: Trade-In Assessment',
            content: 'Working Apple MacBooks with battery health above 80% receive up to $650 instant credit.'
          }
        ]
      })
    })
  });
  assert.strictEqual(jsonDocRes.status, 201);
  const jsonDocData = await jsonDocRes.json();
  assert.ok(jsonDocData.chunksCreated >= 1);

  // 3. Vector search and retrieval test
  const searchRes = await fetch(`${baseUrl}/api/admin/documents/test-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      query: 'What credit is given for MacBook trade-in?'
    })
  });
  assert.strictEqual(searchRes.status, 200);
  const searchData = await searchRes.json();
  assert.ok(searchData.retrievedCount > 0);
  assert.ok(searchData.chunks[0].content.includes('650'));
});

test('12. Individual Chat History Isolation & Conversational RAG with LangChain', async () => {
  // 1. Customer 1 Turn 1: Ask initial policy question
  const turn1Res = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      message: 'What is the return policy for laptops?'
    })
  });
  assert.strictEqual(turn1Res.status, 200);
  const turn1Data = await turn1Res.json();
  assert.strictEqual(turn1Data.agent, 'Knowledge RAG Agent');
  assert.ok(turn1Data.result.answer);

  // 2. Customer 1 Turn 2: Terse conversational follow-up ("What about opened ones?")
  const turn2Res = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      message: 'What about opened ones?'
    })
  });
  assert.strictEqual(turn2Res.status, 200);
  const turn2Data = await turn2Res.json();
  assert.strictEqual(turn2Data.agent, 'Knowledge RAG Agent');
  assert.ok(turn2Data.result.answer.includes('7 days'));
  assert.ok(turn2Data.result.chatHistoryTurnCount >= 2);

  // 3. Customer 1 history verification
  const cust1HistoryRes = await fetch(`${baseUrl}/api/ai/history`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  assert.strictEqual(cust1HistoryRes.status, 200);
  const cust1History = await cust1HistoryRes.json();
  assert.ok(cust1History.count >= 4); // 2 user turns + 2 AI responses
  assert.ok(cust1History.history.some(m => m.text.includes('What about opened ones?')));

  // 4. Customer 2 (Admin / distinct individual) history isolation check
  const cust2HistoryRes = await fetch(`${baseUrl}/api/ai/history`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(cust2HistoryRes.status, 200);
  const cust2History = await cust2HistoryRes.json();
  assert.strictEqual(cust2History.count, 0); // No leakage between individuals

  // 5. Guest individual with specific sessionId
  const guestRes = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Check shipping SLA to Alaska',
      sessionId: 'sess_guest_98765'
    })
  });
  assert.strictEqual(guestRes.status, 200);

  const guestHistoryRes = await fetch(`${baseUrl}/api/ai/history?sessionId=sess_guest_98765`);
  assert.strictEqual(guestHistoryRes.status, 200);
  const guestHistory = await guestHistoryRes.json();
  assert.strictEqual(guestHistory.count, 2); // 1 user + 1 AI

  // 6. Clear history for Customer 1
  const clearCust1Res = await fetch(`${baseUrl}/api/ai/history`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  assert.strictEqual(clearCust1Res.status, 200);

  // Verify Customer 1 history is cleared
  const cust1ClearedRes = await fetch(`${baseUrl}/api/ai/history`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const cust1Cleared = await cust1ClearedRes.json();
  assert.strictEqual(cust1Cleared.count, 0);

  // Verify Guest history is unaffected
  const guestRemainingRes = await fetch(`${baseUrl}/api/ai/history?sessionId=sess_guest_98765`);
  const guestRemaining = await guestRemainingRes.json();
  assert.strictEqual(guestRemaining.count, 2);
});


