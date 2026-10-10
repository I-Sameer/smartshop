import React from 'react';
import { RotateCcw } from 'lucide-react';

export const ProductFilter = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  priceRange, 
  onPriceChange,
  selectedBrands,
  onBrandToggle,
  minRating,
  onRatingChange,
  stockOnly,
  onStockToggle,
  onResetFilters
}) => {
  const brandsList = ['Dell', 'Lenovo', 'ASUS', 'Apple', 'Sony', 'Samsung', 'Breville'];

  return (
    <div className="space-y-6 text-[14px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea]">
        <span className="font-semibold text-[#1d1d1f]">Filter &amp; Specifications</span>
        <button
          onClick={onResetFilters}
          className="text-[#0071e3] hover:underline text-[13px] flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Price Ceiling */}
        <div>
          <div className="flex justify-between items-center mb-2 font-medium text-[13px]">
            <span className="text-[#86868b]">Maximum Budget</span>
            <span className="text-[#1d1d1f] font-semibold">${priceRange}</span>
          </div>
          <input
            type="range"
            min="300"
            max="2000"
            step="50"
            value={priceRange}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full accent-[#0071e3] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#86868b] mt-1">
            <span>$300</span>
            <span>$1000</span>
            <span>$2000+</span>
          </div>
        </div>

        {/* Brands Pills */}
        <div>
          <span className="text-[13px] font-medium text-[#86868b] block mb-2">Brands</span>
          <div className="flex flex-wrap gap-1.5">
            {brandsList.map(brand => {
              const active = selectedBrands.includes(brand);
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onBrandToggle(brand)}
                  className={`px-3 py-1 rounded-full text-[12px] transition-all ${
                    active
                      ? 'bg-[#0071e3] text-white font-medium'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ratings & Stock */}
        <div className="space-y-3">
          <div>
            <span className="text-[13px] font-medium text-[#86868b] block mb-2">Customer Rating</span>
            <div className="flex gap-1.5">
              {[
                { label: 'All', val: 0 },
                { label: '4.0★+', val: 4.0 },
                { label: '4.5★+', val: 4.5 }
              ].map(r => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => onRatingChange(r.val)}
                  className={`px-3 py-1 rounded-full text-[12px] transition-all ${
                    minRating === r.val
                      ? 'bg-[#1d1d1f] text-white font-medium'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none text-[13px] text-[#1d1d1f]">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => onStockToggle(e.target.checked)}
                className="rounded accent-[#0071e3]"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

      </div>

    </div>
  );
};
