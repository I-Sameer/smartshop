import React, { useState, useEffect } from 'react';
import { Package, Truck, ExternalLink, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';
import { api } from '../services/api.js';

export const OrdersPage = () => {
  const { setActiveOrderTrackId, setIsCopilotOpen, sendCopilotMessage, user } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAboutOrder = (order) => {
    setIsCopilotOpen(true);
    sendCopilotMessage(`What is the current delivery status and tracking timeline for my order ${order.order_number}?`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-[14px]">
      
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e5e5ea]">
        <div>
          <span className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider block">
            Account &amp; History
          </span>
          <h1 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
            Your Orders.
          </h1>
          <p className="text-[15px] text-[#86868b] mt-1">
            Track, return, or ask Apple Intelligence about your purchases.
          </p>
        </div>
        <span className="px-3.5 py-1 rounded-full bg-white border border-[#d2d2d7] text-[13px] font-medium text-[#1d1d1f]">
          {orders.length} Orders
        </span>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="apple-card h-44 animate-pulse bg-white"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="apple-card p-16 text-center space-y-3">
          <Package className="w-12 h-12 mx-auto text-[#d2d2d7]" />
          <h3 className="text-xl font-semibold text-[#1d1d1f]">No orders placed yet</h3>
          <p className="text-[15px] text-[#86868b]">
            Browse the store and checkout to view live simulated carrier delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="apple-card p-6 sm:p-8 space-y-5">
              
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#f0f0f0]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[17px] font-semibold text-[#1d1d1f]">{order.order_number}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                      order.status === 'DELIVERED'
                        ? 'bg-[#eafaf1] text-[#34c759]'
                        : order.status === 'SHIPPED'
                        ? 'bg-[#e8f2ff] text-[#0071e3]'
                        : 'bg-[#f5f5f7] text-[#1d1d1f]'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-[#86868b]">
                    <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{order.carrier}</span>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span className="text-[12px] text-[#86868b]">Total Amount</span>
                  <span className="text-[19px] font-semibold text-[#1d1d1f]">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7] text-[14px]">
                    <span className="font-medium text-[#1d1d1f]">
                      {item.product_name} <span className="text-[#86868b]">(×{item.quantity})</span>
                    </span>
                    <span className="font-semibold text-[#1d1d1f]">
                      ${parseFloat(item.total_price || item.unit_price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
                <span className="text-[#86868b]">
                  Tracking: <strong className="text-[#1d1d1f]">{order.tracking_number}</strong>
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleAskAboutOrder(order)}
                    className="apple-btn-secondary py-2 px-4 gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>Ask Intelligence</span>
                  </button>

                  <button
                    onClick={() => setActiveOrderTrackId(order.id)}
                    className="apple-btn-primary py-2 px-5 gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Shipment</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
