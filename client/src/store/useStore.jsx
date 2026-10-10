import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], summary: { itemCount: 0, subtotal: 0, total: 0 } });
  const [wishlist, setWishlist] = useState({ items: [], count: 0 });
  const [compareList, setCompareList] = useState([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeOrderTrackId, setActiveOrderTrackId] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' | 'orders' | 'admin' | 'wishlist'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const defaultWelcomeMessage = {
    id: 'welcome',
    sender: 'ai',
    agent: 'Master AI Router (LangChain RAG)',
    text: "👋 Welcome to ShopSmart AI! I'm your autonomous multi-agent co-pilot powered by LangChain. I can recommend laptops based on technical specs & budget, verify return policies with zero hallucinations, or track live carrier shipments. How can I help you today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      "Suggest a laptop under $1000 for Java development and AI projects",
      "What is the return policy for opened laptops?",
      "Where is my order ORD-2026-89412?",
      "Check multi-warehouse stock health"
    ]
  };

  const [copilotMessages, setCopilotMessages] = useState([defaultWelcomeMessage]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshChatHistory = async () => {
    try {
      const data = await api.getAiChatHistory();
      if (data && data.history && data.history.length > 0) {
        setCopilotMessages(data.history);
      } else {
        setCopilotMessages([defaultWelcomeMessage]);
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e.message);
      setCopilotMessages([defaultWelcomeMessage]);
    }
  };

  const clearChatHistory = async () => {
    try {
      await api.clearAiChatHistory();
      setCopilotMessages([defaultWelcomeMessage]);
      showToast('Chat history cleared for this profile', 'info');
    } catch (e) {
      showToast('Failed to clear chat history: ' + e.message, 'error');
    }
  };

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          await Promise.all([refreshCart(), refreshWishlist(), refreshChatHistory()]);
        } catch (e) {
          api.logout();
          setUser(null);
          await refreshChatHistory();
        }
      } else {
        // If user explicitly signed out, respect guest state; otherwise auto-login demo Prime account for smooth demo testing
        const hasLoggedOut = sessionStorage.getItem('shopsmart_logged_out');
        if (!hasLoggedOut) {
          try {
            const res = await api.login('customer@shopsmart.ai', 'password123');
            setUser(res.user);
            await Promise.all([refreshCart(), refreshWishlist(), refreshChatHistory()]);
          } catch (e) {
            console.error('Demo auto-login error:', e);
            await refreshChatHistory();
          }
        } else {
          await refreshChatHistory();
        }
      }
    };
    initApp();
  }, []);

  const refreshCart = async () => {
    try {
      if (api.getToken()) {
        const cartData = await api.getCart();
        setCart(cartData);
      } else {
        setCart({ items: [], summary: { itemCount: 0, subtotal: 0, total: 0 } });
      }
    } catch (e) {
      console.warn('Failed to load cart:', e.message);
    }
  };

  const refreshWishlist = async () => {
    try {
      if (api.getToken()) {
        const wishlistData = await api.getWishlist();
        setWishlist(wishlistData);
      } else {
        setWishlist({ items: [], count: 0 });
      }
    } catch (e) {
      console.warn('Failed to load wishlist:', e.message);
    }
  };

  // Login for any specific customer
  const loginUser = async (email, password) => {
    sessionStorage.removeItem('shopsmart_logged_out');
    const res = await api.login(email, password);
    setUser(res.user);
    await Promise.all([refreshCart(), refreshWishlist(), refreshChatHistory()]);
    showToast(`Welcome back, ${res.user.full_name}! (${res.user.membership_tier} Tier)`, 'success');
    return res.user;
  };

  // Register new specific customer
  const registerUser = async (userData) => {
    sessionStorage.removeItem('shopsmart_logged_out');
    const res = await api.register(userData);
    setUser(res.user);
    await Promise.all([refreshCart(), refreshWishlist(), refreshChatHistory()]);
    showToast(`Account created! Welcome, ${res.user.full_name}!`, 'success');
    return res.user;
  };

  // Clean logout for current customer
  const logoutUser = () => {
    sessionStorage.setItem('shopsmart_logged_out', 'true');
    api.logout();
    setUser(null);
    setCart({ items: [], summary: { itemCount: 0, subtotal: 0, total: 0 } });
    setWishlist({ items: [], count: 0 });
    refreshChatHistory();
    showToast('Logged out successfully', 'info');
  };

  // Quick switch between demo customer profiles
  const switchDemoRole = async (role) => {
    try {
      if (role === 'CUSTOMER') {
        await loginUser('customer@shopsmart.ai', 'password123');
      } else if (role === 'ADMIN') {
        await loginUser('admin@shopsmart.ai', 'admin123');
        setActiveView('admin');
      } else if (role === 'BASIC') {
        await loginUser('basic@shopsmart.ai', 'password123');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Cart operations
  const addToCart = async (productId, quantity = 1) => {
    try {
      if (!user) {
        showToast('Please sign in to add items to your bag', 'info');
        setIsAuthModalOpen(true);
        return;
      }
      await api.addToCart(productId, quantity);
      await refreshCart();
      showToast('Item added to bag!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Wishlist operations
  const toggleWishlist = async (product) => {
    if (!user) {
      showToast('Please sign in to save items to your wishlist', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    const productId = product.id || product.product_code;
    try {
      const res = await api.toggleWishlist(productId);
      setWishlist(res.wishlist);
      showToast(res.message, res.inWishlist ? 'success' : 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await api.removeFromWishlist(productId);
      setWishlist(res.wishlist);
      showToast('Item removed from wishlist', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const moveToCartFromWishlist = async (product) => {
    try {
      const productId = product.id || product.product_code;
      await api.addToCart(productId, 1);
      await api.removeFromWishlist(productId);
      await Promise.all([refreshCart(), refreshWishlist()]);
      showToast(`Moved ${product.name} to bag!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const isInWishlist = (productId) => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some(
      w => w.product_id === productId || w.product?.id === productId || w.product?.product_code === productId
    );
  };

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 4) {
          showToast('Comparison is limited to a maximum of 4 products', 'warning');
          return prev;
        }
        showToast(`Added ${product.name} to comparison`, 'info');
        return [...prev, product];
      }
    });
  };

  const sendCopilotMessage = async (messageText) => {
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCopilotMessages(prev => [...prev, userMsg]);

    try {
      const response = await api.aiChat(messageText);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        agent: response.agent,
        confidence: response.confidence,
        latencyMs: response.latencyMs,
        data: response.result,
        text: response.result?.answer || response.result?.aiCommentary || response.result?.message || '',
        geminiError: response.geminiError || response.result?.geminiError || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCopilotMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setCopilotMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          agent: 'Error Handler',
          text: `Apologies, I encountered an issue processing that query: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        cart,
        wishlist,
        compareList,
        isCopilotOpen,
        setIsCopilotOpen,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCompareOpen,
        setIsCompareOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeOrderTrackId,
        setActiveOrderTrackId,
        detailProduct,
        setDetailProduct,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        copilotMessages,
        sendCopilotMessage,
        addToCart,
        refreshCart,
        refreshWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCartFromWishlist,
        isInWishlist,
        toggleCompare,
        loginUser,
        registerUser,
        logoutUser,
        switchDemoRole,
        refreshChatHistory,
        clearChatHistory,
        toastMessage,
        showToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
