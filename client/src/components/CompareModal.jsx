import React, { useEffect, useRef } from 'react';
import { X, Scale, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';

export const CompareModal = () => {
  const { isCompareOpen, setIsCompareOpen, compareList, toggleCompare, addToCart } = useStore();
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isCompareOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isCompareOpen]);

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
      setIsCompareOpen(false);
    }
  };

  if (!isCompareOpen) return null;

  const specRows = [
    { label: 'Brand', key: 'brand' },
    { label: 'Price', key: 'price', format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { label: 'Rating', key: 'rating', format: (val, p) => `${val}★ (${p.review_count} reviews)` },
    { label: 'Processor', key: 'specifications.processor' },
    { label: 'Memory / RAM', key: 'specifications.ram' },
    { label: 'Storage', key: 'specifications.storage' },
    { label: 'Graphics', key: 'specifications.graphics' },
    { label: 'Display', key: 'specifications.display' },
    { label: 'Battery', key: 'specifications.battery' },
    { label: 'Operating System', key: 'specifications.os' }
  ];

  const getVal = (prod, key) => {
    if (key.startsWith('specifications.')) {
      const sub = key.split('.')[1];
      return prod.specifications?.[sub] || '—';
    }
    return prod[key] || '—';
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className="m-auto rounded-3xl bg-white p-0 text-[#1d1d1f] max-w-5xl w-[94vw] shadow-2xl overflow-hidden text-[14px]"
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[#e5e5ea] bg-[#f5f5f7] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Compare Models</h2>
            <p className="text-[13px] text-[#86868b] mt-0.5">Find the right device for your workflow.</p>
          </div>
          <button
            onClick={() => setIsCompareOpen(false)}
            className="apple-icon-circle"
          >
            <X className="w-4 h-4 text-[#1d1d1f]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-x-auto flex-1 overflow-y-auto">
          {compareList.length === 0 ? (
            <div className="text-center py-16 text-[#86868b] space-y-2">
              <Scale className="w-12 h-12 mx-auto text-[#d2d2d7] mb-2" />
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">No models selected</h3>
              <p className="text-[13px]">Select "Compare" on any product card in the Store to build your matrix.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left font-semibold text-[#86868b] border-b border-[#e5e5ea] w-48 text-[13px]">
                    Specification
                  </th>
                  {compareList.map(prod => (
                    <th key={prod.id} className="p-4 text-center border-b border-[#e5e5ea] min-w-[200px]">
                      <div className="flex flex-col items-center">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-28 h-28 object-contain rounded-xl apple-product-shadow mb-3"
                        />
                        <span className="font-semibold text-[#1d1d1f] text-[15px] line-clamp-1">{prod.name}</span>
                        <span className="text-[12px] text-[#86868b] mt-0.5">{prod.product_code}</span>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => addToCart(prod.id, 1)}
                            className="apple-btn-primary text-[12px] py-1 px-4"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => toggleCompare(prod)}
                            className="text-[12px] text-[#86868b] hover:text-red-500"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {specRows.map((row) => (
                  <tr key={row.key}>
                    <td className="p-4 font-medium text-[#86868b]">
                      {row.label}
                    </td>
                    {compareList.map(prod => {
                      const raw = getVal(prod, row.key);
                      const display = row.format ? row.format(raw, prod) : raw;
                      return (
                        <td key={prod.id} className="p-4 text-center text-[#1d1d1f] font-normal">
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </dialog>
  );
};
