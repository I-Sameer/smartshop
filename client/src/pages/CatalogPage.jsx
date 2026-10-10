import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Laptop, 
  Headphones, 
  Smartphone, 
  Home, 
  ChevronRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard.jsx';
import { ProductFilter } from '../components/ProductFilter.jsx';
import { useStore } from '../store/useStore.jsx';
import { api } from '../services/api.js';

export const CatalogPage = () => {
  const { 
    searchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    setIsCopilotOpen, 
    sendCopilotMessage 
  } = useStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState(2000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [stockOnly, setStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState('featured');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory, priceRange, selectedBrands, minRating, stockOnly, sortOption]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        query: searchQuery,
        category_id: selectedCategory,
        max_price: priceRange < 2000 ? priceRange : undefined,
        brand: selectedBrands.length > 0 ? selectedBrands : undefined,
        min_rating: minRating > 0 ? minRating : undefined,
        stock_status: stockOnly ? 'IN_STOCK' : undefined,
        sort: sortOption,
        limit: 24
      });
      setProducts(data.products || []);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setPriceRange(2000);
    setSelectedBrands([]);
    setMinRating(0);
    setStockOnly(false);
    setSortOption('featured');
  };

  const handleLaunchPrompt = (promptText) => {
    setIsCopilotOpen(true);
    sendCopilotMessage(promptText);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* 1. Apple Hero Gallery Banner */}
      <div className="pt-2 pb-6 space-y-4">
        <div className="text-[14px] font-semibold text-[#86868b] uppercase tracking-wider">
          ShopSmart AI Store
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-semibold text-[#1d1d1f] tracking-tight leading-[1.08] max-w-3xl">
          The latest. <span className="text-[#86868b]">Take a look at what’s new, intelligent, and exceptional.</span>
        </h1>

        <p className="text-[17px] text-[#86868b] leading-relaxed max-w-2xl pt-1">
          Explore enterprise electronics guided by autonomous AI recommendations, zero-hallucination compliance retrieval, and live carrier tracking.
        </p>

        {/* Apple Capsule Prompt Pills */}
        <div className="pt-4 flex flex-wrap gap-2.5">
          <button
            onClick={() => handleLaunchPrompt("Suggest a laptop under $1000 for Java development and AI projects")}
            className="apple-btn-secondary text-[13px] border border-[#d2d2d7]/80 hover:border-[#86868b] bg-white gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Laptop under $1000 for Java &amp; AI</span>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
          </button>

          <button
            onClick={() => handleLaunchPrompt("What is the return policy for opened laptops?")}
            className="apple-btn-secondary text-[13px] border border-[#d2d2d7]/80 hover:border-[#86868b] bg-white gap-2 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#34c759]" />
            <span>Return policy for opened laptops</span>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
          </button>

          <button
            onClick={() => handleLaunchPrompt("Where is my order ORD-2026-89412?")}
            className="apple-btn-secondary text-[13px] border border-[#d2d2d7]/80 hover:border-[#86868b] bg-white gap-2 shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Track order ORD-2026-89412</span>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
          </button>
        </div>
      </div>

      {/* 2. Apple Horizontal Category Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-[#e5e5ea] text-[13px]">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selectedCategory === null
              ? 'bg-[#1d1d1f] text-white shadow-xs'
              : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'
          }`}
        >
          All Products
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#1d1d1f] text-white shadow-xs'
                : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 3. Catalog Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[14px] text-[#86868b]">
        <div className="flex items-center gap-3">
          <span className="text-[#1d1d1f] font-semibold">{products.length} Products</span>
          <span>·</span>
          <span>Curated with Apple Intelligence</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="flex items-center gap-1.5 text-[13px] text-[#0071e3] hover:underline"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showFilterDrawer ? 'Hide Filters' : 'Filter by Specs'}</span>
          </button>

          <div className="flex items-center gap-2 text-[13px]">
            <span>Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-1 text-[#1d1d1f] focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Collapsible Filters Drawer */}
      {showFilterDrawer && (
        <div className="p-6 bg-white rounded-2xl border border-[#e5e5ea] shadow-xs">
          <ProductFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            selectedBrands={selectedBrands}
            onBrandToggle={handleBrandToggle}
            minRating={minRating}
            onRatingChange={setMinRating}
            stockOnly={stockOnly}
            onStockToggle={setStockOnly}
            onResetFilters={handleResetFilters}
          />
        </div>
      )}

      {/* 5. Apple Store Product Tiles Grid */}
      <main>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="apple-card h-96 animate-pulse bg-white"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="apple-card p-16 text-center space-y-3">
            <h3 className="text-xl font-semibold text-[#1d1d1f]">No matching products</h3>
            <p className="text-[15px] text-[#86868b] max-w-sm mx-auto">
              Try adjusting your filters or price ceiling to explore more items.
            </p>
            <button
              onClick={handleResetFilters}
              className="apple-btn-primary mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

    </div>
  );
};
