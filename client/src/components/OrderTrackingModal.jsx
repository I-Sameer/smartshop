import React, { useEffect, useState, useRef } from 'react';
import { X, Truck, CheckCircle2, MapPin, Package } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';
import { api } from '../services/api.js';

export const OrderTrackingModal = () => {
  const { activeOrderTrackId, setActiveOrderTrackId } = useStore();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeOrderTrackId) {
      if (!dialog.open) dialog.showModal();
      loadTracking(activeOrderTrackId);
    } else {
      if (dialog.open) dialog.close();
      setTrackingData(null);
    }
  }, [activeOrderTrackId]);

  const loadTracking = async (orderId) => {
    setLoading(true);
    try {
      const data = await api.trackOrder(orderId);
      setTrackingData(data);
    } catch (err) {
      console.error('Failed to load tracking:', err);
    } finally {
      setLoading(false);
    }
  };

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
      setActiveOrderTrackId(null);
    }
  };

  if (!activeOrderTrackId) return null;

  const milestones = trackingData?.milestones || [];
  const statusSteps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const stepLabels = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
  const currentStatusIndex = statusSteps.indexOf(trackingData?.status || 'PLACED');

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className="m-auto rounded-3xl bg-white p-0 text-[#1d1d1f] max-w-2xl w-[92vw] shadow-2xl overflow-hidden text-[14px]"
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[#e5e5ea] bg-[#f5f5f7] flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider block">
              Delivery Status
            </span>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mt-0.5">
              Order #{trackingData?.orderNumber}
            </h2>
            <p className="text-[13px] text-[#86868b] mt-1">Carrier: {trackingData?.carrier} · {trackingData?.trackingNumber}</p>
          </div>
          <button
            onClick={() => setActiveOrderTrackId(null)}
            className="apple-icon-circle"
          >
            <X className="w-4 h-4 text-[#1d1d1f]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {loading ? (
            <div className="text-center py-12 text-[#86868b] text-[14px]">
              Loading tracking details...
            </div>
          ) : trackingData ? (
            <>
              {/* Stepper Status Bar */}
              <div className="p-6 rounded-2xl bg-[#f5f5f7]">
                <div className="grid grid-cols-4 gap-2 text-center relative">
                  {statusSteps.map((step, idx) => {
                    const isDone = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all ${
                          isDone 
                            ? 'bg-[#0071e3] text-white shadow-xs' 
                            : 'bg-[#e5e5ea] text-[#86868b]'
                        } ${isCurrent ? 'ring-3 ring-[#0071e3]/30' : ''}`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[12px] font-medium mt-2 ${isDone ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                          {stepLabels[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestones Timeline */}
              <div>
                <h4 className="text-[13px] uppercase font-semibold text-[#86868b] tracking-wider mb-3">
                  Tracking History
                </h4>
                <div className="space-y-3 relative pl-4 border-l border-[#d2d2d7] ml-2">
                  {milestones.map((event, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#0071e3] ring-4 ring-white"></div>
                      <div className="p-3.5 rounded-xl bg-[#f5f5f7]">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-semibold text-[#1d1d1f]">{event.title}</span>
                          <span className="text-[12px] text-[#86868b]">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[12px] text-[#86868b] mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0071e3] shrink-0" />
                          <span>{event.location}</span>
                        </div>
                        <p className="text-[13px] text-[#515154] mt-1 leading-relaxed">{event.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Address */}
              {trackingData.shippingAddress && (
                <div className="p-4 rounded-xl bg-[#f5f5f7] text-[13px] flex items-center justify-between">
                  <span className="text-[#86868b]">Ship to:</span>
                  <span className="font-medium text-[#1d1d1f] text-right">
                    {trackingData.shippingAddress.street}, {trackingData.shippingAddress.city}, {trackingData.shippingAddress.state} {trackingData.shippingAddress.zip}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-[#86868b]">Shipment record not found.</div>
          )}
        </div>
      </div>
    </dialog>
  );
};
