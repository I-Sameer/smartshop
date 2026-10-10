import React, { useEffect, useRef } from 'react';
import { X, Star, ShoppingBag, Sparkles, Building2, Check, Heart } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';

export const ProductDetailModal = () => {
  const { detailProduct, setDetailProduct, addToCart, setIsCopilotOpen, sendCopilotMessage, toggleWishlist, isInWishlist } = useStore();
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (detailProduct) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [detailProduct]);

  const handleDialogClick = (e) => {
    const dialog = dialogRef.current;
    if (!dialog || e.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInside = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );

    if (!isInside) {
      setDetailProduct(null);
    }
  };

  if (!detailProduct) return null;

  const specs = detailProduct.specifications || {};
  const warehouses = detailProduct.warehouses || [];

  const handleAskAi = () => {
    const productName = detailProduct.name;
    setDetailProduct(null);
    setIsCopilotOpen(true);
    sendCopilotMessage(`Analyze the specifications of ${productName} (${detailProduct.product_code}) and tell me what tasks it is ideal for.`);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className="m-auto rounded-3xl bg-white p-0 text-[#1d1d1f] max-w-3xl w-[94vw] shadow-2xl overflow-hidden"
    >
      <div className="relative max-h-[90vh] flex flex-col overflow-y-auto">
        
        {/* Floating Circular Close Button */}
        <button
          onClick={() => setDetailProduct(null)}
          className="absolute top-5 right-5 z-10 apple-icon-circle shadow-xs"
        >
          <X className="w-4 h-4 text-[#1d1d1f]" />
        </button>

        {/* Hero Product Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 sm:p-12 bg-[#f5f5f7] border-b border-[#e5e5ea]">
          <div className="flex items-center justify-center p-4">
            <img
              src={detailProduct.image_url}
              alt={detailProduct.name}
              className="max-h-64 object-contain rounded-2xl apple-product-shadow"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                {detailProduct.brand} · {detailProduct.product_code}
              </span>

              <h2 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2 leading-tight">
                {detailProduct.name}
              </h2>

              <div className="flex items-center gap-2 mb-4 text-[13px] text-[#86868b]">
                <div className="flex items-center text-[#ff9500]">
                  <Star className="w-4 h-4 fill-[#ff9500] mr-1" />
                  <span className="font-semibold text-[#1d1d1f]">{detailProduct.rating}</span>
                </div>
                <span>· {detailProduct.review_count} reviews</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#34c759] bg-[#eafaf1]">
                  {detailProduct.stock_status === 'IN_STOCK' ? 'In Stock' : 'Limited Stock'}
                </span>
              </div>

              <div className="text-3xl font-semibold text-[#1d1d1f] mb-4">
                ${parseFloat(detailProduct.price).toFixed(2)}
              </div>

              <p className="text-[14px] text-[#515154] leading-relaxed mb-6">
                Engineered for uncompromising high productivity, verified by ShopSmart hardware diagnostics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  addToCart(detailProduct.id, 1);
                  setDetailProduct(null);
                }}
                className="apple-btn-primary flex-1 py-3 text-[14px] gap-2 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => toggleWishlist(detailProduct)}
                className={`py-3 px-4 rounded-full border text-[14px] flex items-center gap-2 transition-all ${
                  isInWishlist(detailProduct.id || detailProduct.product_code)
                    ? 'bg-rose-50 border-rose-200 text-rose-600 font-medium'
                    : 'bg-white border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(detailProduct.id || detailProduct.product_code) ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                <span>{isInWishlist(detailProduct.id || detailProduct.product_code) ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleAskAi}
                className="apple-btn-secondary py-3 px-4 text-[14px] gap-2 bg-white border border-[#d2d2d7]"
              >
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tech Specs & Warehouse Section */}
        <div className="p-8 sm:p-12 space-y-8 bg-white">
          
          {/* Tech Specs Table */}
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4 tracking-tight">
              Tech Specs
            </h3>
            <div className="divide-y divide-[#f0f0f0] border-y border-[#f0f0f0] text-[14px]">
              {Object.entries(specs).map(([key, val]) => {
                if (typeof val === 'object') return null;
                const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <div key={key} className="py-3 flex justify-between gap-4">
                    <span className="text-[#86868b]">{formattedKey}</span>
                    <span className="font-medium text-[#1d1d1f] text-right">{String(val)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warehouse Inventory Breakdown */}
          {warehouses.length > 0 && (
            <div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-4 tracking-tight">
                Store &amp; Warehouse Availability
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {warehouses.map(wh => (
                  <div key={wh.id} className="p-4 rounded-2xl bg-[#f5f5f7] border border-[#e5e5ea]">
                    <span className="text-[11px] font-semibold text-[#86868b] block">{wh.warehouse_code}</span>
                    <span className="text-xl font-semibold text-[#1d1d1f] block mt-1">{wh.quantity} units</span>
                    <span className="text-[11px] text-[#86868b]">Reserved: {wh.reserved_quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </dialog>
  );
};
