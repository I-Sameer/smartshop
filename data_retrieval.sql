SELECT id, email, full_name, membership_tier, role, preferences, created_at
FROM users
ORDER BY created_at DESC;

SELECT p.id, p.product_code, p.name, p.brand, p.price, p.rating, p.stock_status,
       c.name AS category_name,
       COALESCE(SUM(i.quantity - i.reserved_quantity), 0) AS net_inventory
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY p.id, c.name
ORDER BY p.price ASC;

SELECT id, product_code, name, brand, price, rating
FROM products
WHERE search_vector @@ plainto_tsquery('english', 'laptop')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'laptop')) DESC;

SELECT id, document_id, chunk_index, content, metadata,
       1 - (embedding <=> '[0.01, 0.02]'::vector) AS similarity_score
FROM document_chunks
ORDER BY embedding <=> '[0.01, 0.02]'::vector ASC
LIMIT 5;

SELECT o.id, o.order_number, o.status, o.total_amount, o.carrier, o.tracking_number, o.created_at,
       oi.quantity, oi.unit_price, oi.total_price, p.name AS product_name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.user_id = 'u1111111-1111-1111-1111-111111111111'
ORDER BY o.created_at DESC;

SELECT ci.id, ci.user_id, ci.product_id, ci.quantity,
       p.name, p.price, (ci.quantity * p.price) AS subtotal
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = 'u1111111-1111-1111-1111-111111111111'
ORDER BY ci.added_at DESC;

SELECT wi.id, wi.user_id, wi.product_id, wi.added_at,
       p.product_code, p.name, p.brand, p.price, p.rating
FROM wishlist_items wi
JOIN products p ON wi.product_id = p.id
WHERE wi.user_id = 'u1111111-1111-1111-1111-111111111111'
ORDER BY wi.added_at DESC;

SELECT i.id, i.product_id, p.name AS product_name, i.warehouse_code,
       i.quantity, i.reserved_quantity,
       (i.quantity - i.reserved_quantity) AS net_available,
       (i.quantity - i.reserved_quantity <= i.reorder_threshold) AS is_low_stock
FROM inventory i
JOIN products p ON i.product_id = p.id
ORDER BY net_available ASC;

SELECT id, user_id, interaction_type, user_query, ai_response, confidence_score, latency_ms, created_at
FROM ai_interactions
ORDER BY created_at DESC
LIMIT 50;
