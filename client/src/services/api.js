const BASE_URL = '/api';

class ApiClient {
  getToken() {
    return localStorage.getItem('shopsmart_token') || '';
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('shopsmart_token', token);
    } else {
      localStorage.removeItem('shopsmart_token');
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid response from server' };
    }

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // --- Auth APIs ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // --- Products APIs ---
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/products${qs}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async compareProducts(ids) {
    return this.request(`/products/compare?ids=${ids.join(',')}`);
  }

  // --- Categories APIs ---
  async getCategories() {
    return this.request('/categories');
  }

  // --- Cart APIs ---
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity = 1) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  }

  async updateCartItem(id, quantity) {
    return this.request(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeCartItem(id) {
    return this.request(`/cart/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Wishlist APIs ---
  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(productId) {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE'
    });
  }

  async toggleWishlist(productId) {
    return this.request('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  }

  // --- Orders & Tracking APIs ---
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async trackOrder(orderId) {
    return this.request(`/orders/${orderId}/track`);
  }

  getSessionId() {
    let sid = localStorage.getItem('shopsmart_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('shopsmart_session_id', sid);
    }
    return sid;
  }

  // --- AI Multi-Agent & RAG APIs ---
  async aiRecommend(query) {
    return this.request('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  async aiAskPolicy(question, sessionId = null) {
    const sid = sessionId || this.getSessionId();
    return this.request('/knowledge/ask', {
      method: 'POST',
      body: JSON.stringify({ question, sessionId: sid })
    });
  }

  async aiChat(message, sessionId = null) {
    const sid = sessionId || this.getSessionId();
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId: sid })
    });
  }

  async getAiChatHistory(sessionId = null) {
    const sid = sessionId || this.getSessionId();
    const qs = sid ? `?sessionId=${encodeURIComponent(sid)}` : '';
    return this.request(`/ai/history${qs}`);
  }

  async clearAiChatHistory(sessionId = null) {
    const sid = sessionId || this.getSessionId();
    const qs = sid ? `?sessionId=${encodeURIComponent(sid)}` : '';
    return this.request(`/ai/history${qs}`, {
      method: 'DELETE'
    });
  }

  // --- Admin APIs ---
  async getAdminInventory() {
    return this.request('/admin/inventory');
  }

  async uploadKnowledgeDoc(docData) {
    return this.request('/admin/documents/upload', {
      method: 'POST',
      body: JSON.stringify(docData)
    });
  }

  async uploadKnowledgeFile(formData) {
    return this.request('/admin/documents/upload-file', {
      method: 'POST',
      body: formData
    });
  }

  async getKnowledgeDocs() {
    return this.request('/admin/documents');
  }

  async testVectorSearch(query, topK = 4) {
    return this.request('/admin/documents/test-search', {
      method: 'POST',
      body: JSON.stringify({ query, topK })
    });
  }

  async getAdminAuditLogs() {
    return this.request('/admin/audit-logs');
  }
}

export const api = new ApiClient();
