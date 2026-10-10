import React from 'react';
import { Star, Eye, Scale, Plus, Check, Heart } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';

export const ProductCard = ({ product }) => {
  const { addToCart, toggleCompare, compareList, setDetailProduct, toggleWishlist, isInWishlist } = useStore();

  const isCompared = compareList.some(p => p.id === product.id);
  const isFavorited = isInWishlist(product.id || product.product_code);
  const specs = product.specifications || {};

  return (
    <div className="apple-card p-6 flex flex-col justify-between group overflow-hidden relative">
      
      {/* Top Details & Image */}
      <div>
        {/* Category & Status */}
        <div className="flex items-center justify-between text-[12px] text-[#86868b] mb-2 font-medium">
          <span className="uppercase tracking-wider">{product.brand} · {product.product_code}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
            product.stock_status === 'IN_STOCK'
              ? 'text-[#34c759] bg-[#eafaf1]'
              : 'text-[#ff9500] bg-[#fff8eb]'
          }`}>
            {product.stock_status === 'IN_STOCK' ? 'In Stock' : 'Low Stock'}
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => setDetailProduct(product)}
          className="text-[19px] font-semibold text-[#1d1d1f] tracking-tight hover:text-[#0071e3] transition-colors cursor-pointer line-clamp-1"
        >
          {product.name}
        </h3>

        {/* Short Specs Highlight */}
        <div className="text-[13px] text-[#86868b] mt-1 line-clamp-1">
          {[specs.ram, specs.storage, specs.processor].filter(Boolean).join(' · ')}
        </div>

        {/* Product Imagery with Apple Shadow & Wishlist Heart */}
        <div 
          onClick={() => setDetailProduct(product)}
          className="relative aspect-[4/3] w-full my-6 flex items-center justify-center cursor-pointer group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        >
          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-0 right-0 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isFavorited
                ? 'bg-rose-50 text-rose-500 shadow-sm ring-1 ring-rose-200'
                : 'bg-white/90 backdrop-blur-md text-[#86868b] hover:text-rose-500 hover:bg-white shadow-xs'
            }`}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Wishlist toggle"
          >
            <Heart className={`w-4 h-4 transition-transform ${isFavorited ? 'fill-rose-500 stroke-rose-500 scale-110' : ''}`} />
          </button>

          <img
            src={product.image_url}
            alt={product.name}
            className="max-h-full max-w-full object-contain rounded-xl apple-product-shadow"
            loading="lazy"
          />
        </div>
      </div>

      {/* Bottom Pricing & Actions */}
      <div className="pt-4 border-t border-[#f0f0f0] flex items-center justify-between">
        <div>
          <span className="text-[12px] text-[#86868b] block">Price</span>
          <span className="text-[17px] font-semibold text-[#1d1d1f]">
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare Link / Pill */}
          <button
            onClick={() => toggleCompare(product)}
            className={`text-[12px] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
              isCompared 
                ? 'bg-[#0071e3] text-white font-medium' 
                : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
            }`}
          >
            <Scale className="w-3 h-3" />
            <span>{isCompared ? 'Added' : 'Compare'}</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => addToCart(product.id, 1)}
            className="apple-btn-primary text-[13px] py-1.5 px-4"
          >
            Buy
          </button>
        </div>
      </div>

    </div>
  );
};
