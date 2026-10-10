import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore.jsx';
import { api } from '../services/api.js';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser, showToast } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [tier, setTier] = useState('PRIME');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await api.register({
          email,
          password,
          full_name: fullName,
          membership_tier: tier
        });
        await loginUser(email, password);
      } else {
        await loginUser(email, password);
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setLoading(true);
    try {
      await loginUser(demoEmail, demoPassword);
      setIsAuthModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-2xl border border-black/5 p-7 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.18)] space-y-6 text-[#1d1d1f] animate-fade-in">
        
        {/* Apple Style Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f] flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Apple ID Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-14 h-14 rounded-full bg-[#f5f5f7] text-[#1d1d1f] border border-[#d2d2d7]/60 mx-auto flex items-center justify-center mb-3 shadow-sm">
            <Lock className="w-6 h-6 text-[#0071e3]" />
          </div>
          <h2 className="text-[23px] font-semibold tracking-tight text-[#1d1d1f]">
            {isRegister ? 'Create your Apple ID' : 'Sign in with Apple ID'}
          </h2>
          <p className="text-[13px] text-[#86868b]">
            {isRegister ? 'Enter your details to create your ShopSmart account.' : 'Your Apple ID is the account you use for all Apple services.'}
          </p>
        </div>

        {/* Quick Demo Customer Profiles */}
        <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-[#e5e5ea] space-y-2.5">
          <span className="text-[11px] font-medium text-[#86868b] tracking-wide block text-center uppercase">
            Select Customer Profile
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@shopsmart.ai', 'password123')}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#fafafc] border border-[#d2d2d7]/80 text-[#1d1d1f] text-left transition-all shadow-xs group"
            >
              <div className="text-[11px] font-semibold text-[#0071e3] flex items-center justify-between">
                <span>Alex M.</span>
                <span className="text-[9px] bg-[#0071e3]/10 text-[#0071e3] px-1 py-0.2 rounded font-medium">Prime</span>
              </div>
              <div className="text-[9px] text-[#86868b] truncate mt-0.5">customer@...</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('basic@shopsmart.ai', 'password123')}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#fafafc] border border-[#d2d2d7]/80 text-[#1d1d1f] text-left transition-all shadow-xs group"
            >
              <div className="text-[11px] font-semibold text-[#515154] flex items-center justify-between">
                <span>David M.</span>
                <span className="text-[9px] bg-gray-100 text-[#515154] px-1 py-0.2 rounded font-medium">Basic</span>
              </div>
              <div className="text-[9px] text-[#86868b] truncate mt-0.5">basic@...</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@shopsmart.ai', 'admin123')}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#fafafc] border border-[#d2d2d7]/80 text-[#1d1d1f] text-left transition-all shadow-xs group"
            >
              <div className="text-[11px] font-semibold text-[#b25e00] flex items-center justify-between">
                <span>Sarah C.</span>
                <span className="text-[9px] bg-[#b25e00]/10 text-[#b25e00] px-1 py-0.2 rounded font-medium">Admin</span>
              </div>
              <div className="text-[9px] text-[#86868b] truncate mt-0.5">admin@...</div>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {isRegister && (
            <div>
              <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Steve Jobs"
                className="w-full px-3.5 py-2.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] text-[14px] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">Apple ID / Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] text-[14px] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Required"
              className="w-full px-3.5 py-2.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] text-[14px] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15 transition-all"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">Membership Plan</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15 transition-all"
              >
                <option value="BASIC">Basic Member · Standard Delivery</option>
                <option value="PRIME">Prime Member · Next-Day Free Freight</option>
                <option value="PREMIUM">Premium Member · Same-Day VIP Courier</option>
              </select>
            </div>
          )}

          {/* Action Blue Apple Pill */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0066cc] text-white font-medium text-[14px] transition-all shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Continue' : 'Sign In'}
          </button>
        </form>

        {/* Footer switch */}
        <div className="text-center text-[13px] text-[#6e6e73] pt-1 border-t border-[#f5f5f7]">
          {isRegister ? (
            <p>
              Already have an Apple ID?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[#0071e3] font-medium hover:underline inline-block"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an Apple ID?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-[#0071e3] font-medium hover:underline inline-block"
              >
                Create yours now
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

