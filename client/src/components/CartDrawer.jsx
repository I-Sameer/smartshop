import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';
import { api } from '../services/api.js';

export const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, refreshCart, setActiveOrderTrackId, showToast, user } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState({
    street: '742 Evergreen Terrace',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'USA'
  });

  if (!isCartOpen) return null;

  const handleUpdateQty = async (itemId, newQty) => {
    try {
      await api.updateCartItem(itemId, newQty);
      await refreshCart();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.removeCartItem(itemId);
      await refreshCart();
      showToast('Item removed from bag', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await api.createOrder({
        shippingAddress: address,
        carrier: user?.membership_tier === 'PRIME' ? 'FedEx Priority Next-Day' : 'Standard Ground'
      });
      await refreshCart();
      setIsCartOpen(false);
      showToast(`Order #${res.order.order_number} confirmed!`, 'success');
      setActiveOrderTrackId(res.order.id);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-[14px]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-[#e5e5ea] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Review your Bag.</h2>
              <span className="text-[13px] text-[#86868b]">
                Free delivery on all orders.
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="apple-icon-circle"
            >
              <X className="w-4 h-4 text-[#1d1d1f]" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {cart.items.length === 0 ? (
              <div className="text-center py-20 text-[#86868b] space-y-2">
                <ShoppingBag className="w-12 h-12 mx-auto text-[#d2d2d7] mb-2" />
                <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Your Bag is empty.</h3>
                <p className="text-[13px]">Explore the store or ask Apple Intelligence for recommendations.</p>
              </div>
            ) : (
              cart.items.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#f5f5f7] flex gap-4 items-center">
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-16 h-16 rounded-xl object-contain bg-white p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-[#86868b] font-medium block">{item.product?.product_code}</span>
                    <h4 className="text-[14px] font-semibold text-[#1d1d1f] truncate">{item.product?.name}</h4>
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mt-0.5">
                      ${parseFloat(item.product?.price || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-white border border-[#d2d2d7] rounded-full p-0.5">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      className="p-1 hover:text-[#0071e3] text-[#1d1d1f] transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[12px] font-semibold px-1 text-[#1d1d1f]">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                      className="p-1 hover:text-[#0071e3] text-[#1d1d1f] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-[#86868b] hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

            {/* Delivery Address */}
            {cart.items.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#f5f5f7] space-y-2 text-[13px]">
                <span className="font-semibold text-[#1d1d1f] block mb-1">
                  Shipping Address
                </span>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="Street Address"
                  className="w-full p-2.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f]"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                    className="p-2.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f]"
                  />
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="State"
                    className="p-2.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f]"
                  />
                  <input
                    type="text"
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    placeholder="ZIP"
                    className="p-2.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Checkout Footer */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-[#e5e5ea] bg-white space-y-4">
              <div className="space-y-2 text-[14px]">
                <div className="flex justify-between text-[#86868b]">
                  <span>Subtotal</span>
                  <span className="text-[#1d1d1f]">${cart.summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#86868b]">
                  <span>Shipping</span>
                  <span className="text-[#34c759] font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-[#86868b]">
                  <span>Estimated Tax</span>
                  <span className="text-[#1d1d1f]">${cart.summary.estimatedTax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#f0f0f0] pt-2 flex justify-between text-[17px] font-semibold text-[#1d1d1f]">
                  <span>Total</span>
                  <span>${cart.summary.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isCheckingOut}
                className="apple-btn-primary w-full py-3.5 text-[15px] gap-2 shadow-xs disabled:opacity-50"
              >
                <span>{isCheckingOut ? 'Securing Inventory...' : 'Check Out'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
