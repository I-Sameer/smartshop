import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';

export const WishlistDrawer = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    removeFromWishlist,
    moveToCartFromWishlist,
    setDetailProduct,
    setActiveView
  } = useStore();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-[14px]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-fade-in">
          
          {/* Header */}
          <div className="p-6 border-b border-[#e5e5ea] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Your Wishlist</h2>
                <span className="text-[12px] text-[#86868b]">
                  {wishlist.count} {wishlist.count === 1 ? 'saved item' : 'saved items'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="apple-icon-circle"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-[#1d1d1f]" />
            </button>
          </div>

          {/* Body: Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlist.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center">
                  <Heart className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[#1d1d1f]">Your wishlist is empty</h3>
                  <p className="text-[13px] text-[#86868b] max-w-xs">
                    Tap the heart icon on any product to save it here for later or compare specs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    setActiveView('catalog');
                  }}
                  className="apple-btn-secondary text-[13px] mt-2"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.items.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  return (
                    <div 
                      key={item.id} 
                      className="p-3.5 rounded-2xl border border-[#e5e5ea] hover:border-[#d2d2d7] bg-[#fbfbfd] transition-all flex flex-col gap-3 group"
                    >
                      <div className="flex gap-3.5 items-center">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-16 h-16 object-cover rounded-xl border border-black/5 bg-white shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => {
                            setDetailProduct(product);
                            setIsWishlistOpen(false);
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-[#86868b] uppercase tracking-wider font-semibold">
                            {product.brand} • {product.product_code}
                          </div>
                          <h4 
                            onClick={() => {
                              setDetailProduct(product);
                              setIsWishlistOpen(false);
                            }}
                            className="font-semibold text-[#1d1d1f] text-[13px] truncate cursor-pointer hover:text-[#0071e3] transition-colors"
                          >
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold text-[14px] text-[#1d1d1f]">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                            {product.stock_status === 'IN_STOCK' ? (
                              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                                Low Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#f0f0f2]">
                        <button
                          onClick={() => moveToCartFromWishlist(product)}
                          className="flex-1 apple-btn-primary text-[12px] py-1.5 flex items-center justify-center gap-1.5 shadow-none"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Bag</span>
                        </button>
                        <button
                          onClick={() => removeFromWishlist(product.id || product.product_code)}
                          className="p-1.5 rounded-full hover:bg-rose-50 text-[#86868b] hover:text-rose-500 transition-colors"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlist.items.length > 0 && (
            <div className="p-5 border-t border-[#e5e5ea] bg-white space-y-2">
              <div className="flex items-center justify-between text-[12px] text-[#86868b]">
                <span>Items in Wishlist</span>
                <span className="font-semibold text-[#1d1d1f]">{wishlist.count}</span>
              </div>
              <button
                onClick={() => {
                  wishlist.items.forEach(i => i.product && moveToCartFromWishlist(i.product));
                }}
                className="w-full apple-btn-secondary text-[13px] py-2 flex items-center justify-center gap-2"
              >
                <span>Move All to Bag</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
