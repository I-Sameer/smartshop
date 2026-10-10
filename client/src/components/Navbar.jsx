import React from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Heart,
  Scale, 
  Search, 
  ShieldCheck, 
  Package, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../store/useStore.jsx';

export const Navbar = () => {
  const { 
    user, 
    cart, 
    wishlist,
    compareList, 
    setIsCopilotOpen, 
    setIsCartOpen, 
    setIsWishlistOpen,
    setIsCompareOpen, 
    setIsAuthModalOpen,
    activeView, 
    setActiveView,
    searchQuery,
    setSearchQuery,
    switchDemoRole,
    logoutUser
  } = useStore();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveView('catalog');
  };

  return (
    <div className="sticky top-0 z-40 w-full select-none">
      
      {/* 1. Global Navigation Strip (Apple Global Nav - 44px) */}
      <nav className="h-11 bg-[#161617] text-[#f5f5f7] flex items-center px-4 sm:px-8 border-b border-[#333336]">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between text-[12px] font-normal tracking-tight">
          
          {/* Brand Logo & Home */}
          <div 
            onClick={() => setActiveView('catalog')}
            className="flex items-center gap-2 cursor-pointer text-white hover:opacity-80 transition-opacity"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <span className="text-[11px] font-black text-black leading-none">S</span>
            </div>
            <span className="font-semibold tracking-tight text-[13px]">ShopSmart</span>
          </div>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-[#d2d2d7]">
            <button
              onClick={() => setActiveView('catalog')}
              className={`hover:text-white transition-colors ${activeView === 'catalog' ? 'text-white font-medium' : ''}`}
            >
              Store
            </button>
            <button
              onClick={() => setActiveView('orders')}
              className={`hover:text-white transition-colors ${activeView === 'orders' ? 'text-white font-medium' : ''}`}
            >
              Orders
            </button>
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Wishlist
              {wishlist.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-semibold">
                  {wishlist.count}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsCompareOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Compare
              {compareList.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#333336] text-[#2997ff] font-semibold">
                  {compareList.length}
                </span>
              )}
            </button>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveView('admin')}
                className={`hover:text-white transition-colors ${activeView === 'admin' ? 'text-white font-medium' : ''}`}
              >
                Operations
              </button>
            )}
          </div>

          {/* Right Action Cluster: User, Wishlist, Bag */}
          <div className="flex items-center gap-3.5 text-[#d2d2d7]">
            
            {/* Customer Auth Cluster */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-[11px] hover:text-white transition-colors bg-[#272729] px-2.5 py-1 rounded-full border border-white/5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#0071e3] text-white text-[9px] font-bold flex items-center justify-center">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <span>{user.full_name ? user.full_name.split(' ')[0] : 'Account'}</span>
                  <span className="text-[10px] text-[#2997ff] font-medium">({user.membership_tier})</span>
                  <ChevronDown className="w-3 h-3 text-[#86868b]" />
                </button>

                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1d1d1f] border border-[#333336] shadow-2xl p-2.5 hidden group-hover:block z-50 text-[12px]">
                  <div className="px-3 py-2 border-b border-[#333336] mb-1">
                    <div className="font-semibold text-white truncate">{user.full_name}</div>
                    <div className="text-[11px] text-[#86868b] truncate">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] bg-[#0071e3]/20 text-[#2997ff] px-2 py-0.5 rounded-md font-medium">
                        {user.membership_tier} Member
                      </span>
                      {user.role === 'ADMIN' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsWishlistOpen(true)}
                    className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#2c2c2e] text-[#f5f5f7] flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      My Wishlist
                    </span>
                    <span className="text-[10px] text-[#86868b]">{wishlist.count}</span>
                  </button>

                  <button
                    onClick={() => setActiveView('orders')}
                    className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#2c2c2e] text-[#f5f5f7] flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5 text-[#2997ff]" />
                    <span>My Orders</span>
                  </button>

                  <div className="border-t border-[#333336] my-1.5"></div>
                  <div className="text-[10px] uppercase font-semibold text-[#86868b] px-3 py-1">Switch Customer Profile</div>
                  
                  <button
                    onClick={() => switchDemoRole('CUSTOMER')}
                    className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#2c2c2e] text-[#f5f5f7] flex justify-between items-center"
                  >
                    <span>Alex Mercer</span>
                    <span className="text-[#2997ff] text-[10px]">Prime</span>
                  </button>
                  <button
                    onClick={() => switchDemoRole('BASIC')}
                    className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#2c2c2e] text-[#f5f5f7] flex justify-between items-center"
                  >
                    <span>David Miller</span>
                    <span className="text-[#86868b] text-[10px]">Basic</span>
                  </button>
                  <button
                    onClick={() => switchDemoRole('ADMIN')}
                    className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#2c2c2e] text-[#f5f5f7] flex justify-between items-center"
                  >
                    <span>Sarah Connor</span>
                    <span className="text-amber-400 text-[10px]">Admin</span>
                  </button>

                  <div className="border-t border-[#333336] my-1.5"></div>
                  
                  <button
                    onClick={logoutUser}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-[11px] bg-[#0071e3] text-white px-3 py-1 rounded-full hover:bg-[#0077ed] font-medium transition-all shadow-xs"
              >
                <User className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-1 hover:text-white transition-colors"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist.count > 0 ? 'text-rose-400' : ''}`} />
              {wishlist.count > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-semibold text-[10px] flex items-center justify-center shadow-xs">
                  {wishlist.count}
                </span>
              )}
            </button>

            {/* Apple Bag (Cart) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 hover:text-white transition-colors"
              title="View Bag"
              aria-label="Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.summary.itemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#0071e3] text-white font-semibold text-[10px] flex items-center justify-center">
                  {cart.summary.itemCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </nav>

      {/* 2. Frosted Sub-Nav Bar (Apple Sub-Nav - 52px) */}
      <div className="apple-frosted-nav h-[52px] flex items-center px-4 sm:px-8">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <span 
              onClick={() => setActiveView('catalog')}
              className="text-[19px] sm:text-[21px] font-semibold text-[#1d1d1f] tracking-tight cursor-pointer"
            >
              Store
            </span>
            <span className="text-[12px] text-[#86868b] hidden sm:inline">
              The best way to buy the products you love.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#e8e8ed] text-[13px] rounded-full text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] transition-all"
              />
            </form>

            {/* Apple Intelligence Pill Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="apple-btn-primary gap-1.5 shadow-sm text-[13px] py-1.5 px-3.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Intelligence</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
