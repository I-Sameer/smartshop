import React from 'react';
import { useStore } from './store/useStore.jsx';
import { Navbar } from './components/Navbar.jsx';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { ProductDetailModal } from './components/ProductDetailModal.jsx';
import { CompareModal } from './components/CompareModal.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { WishlistDrawer } from './components/WishlistDrawer.jsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.jsx';
import { CopilotDrawer } from './components/CopilotDrawer.jsx';
import { AuthModal } from './pages/AuthModal.jsx';
import { Toast } from './components/Toast.jsx';
import { Terminal, ShieldCheck, Database, Cpu } from 'lucide-react';

export const App = () => {
  const { activeView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-[#0071e3] selection:text-white antialiased">
      {/* Top Apple Navigation Bar */}
      <Navbar />

      {/* Main Museum Canvas View */}
      <main className="flex-1">
        {activeView === 'catalog' && <CatalogPage />}
        {activeView === 'orders' && <OrdersPage />}
        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Modals & Drawers */}
      <ProductDetailModal />
      <CompareModal />
      <CartDrawer />
      <WishlistDrawer />
      <OrderTrackingModal />
      <CopilotDrawer />
      <AuthModal />
      <Toast />

      {/* Signature Apple Directory & Footnotes Footer */}
      <footer className="border-t border-[#d2d2d7]/50 bg-[#f5f5f7] pt-12 pb-16 text-[12px] text-[#6e6e73] font-normal leading-relaxed">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-6">
          {/* Footnotes */}
          <div className="space-y-2 pb-6 border-b border-[#d2d2d7]/50 text-[11px] text-[#86868b]">
            <p>
              1. Multi-Agent Product Discovery (Module 1) and Policy RAG (Module 2) are powered by ShopSmart Intelligence and LangChain with pgvector 1536-D HNSW indexing and deterministic cosine confidence scoring.
            </p>
            <p>
              2. Warehouse allocations and inventory reservations execute through atomic row-level isolation across four regional logistics hubs (WH-EAST, WH-WEST, WH-CENTRAL, WH-SOUTH).
            </p>
            <p>
              3. Membership freight benefits (Basic Standard, Prime Next-Day, and Premium Same-Day VIP) are calculated in real time by the Autonomous Logistics Agent.
            </p>
          </div>

          {/* Directory Columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-8 text-[12px]">
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-3">Shop &amp; Explore</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">MacBook Pro &amp; Air</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">iPad Pro &amp; Air</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">iPhone 16 Pro</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Apple Watch Ultra 2</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">AirPods Max &amp; Pro</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Studio Display &amp; Pro Display</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-3">ShopSmart Intelligence</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Autonomous Shopping Agent</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Zero-Hallucination Policy RAG</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Dynamic Logistics Dispatcher</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Operations &amp; Stock Balancer</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Deterministic Vector Engine</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-3">Account &amp; Orders</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Manage Apple ID</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">ShopSmart Store Account</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">iCloud &amp; Security Keys</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Order Tracking &amp; Freight</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Returns &amp; 30-Day Policy</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-3">Entertainment &amp; Care</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Apple Care+ Diagnostics</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Genius Bar Appointments</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Trade In &amp; Recycling</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Apple Music &amp; TV+</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Financing &amp; Monthly Installments</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-3">About ShopSmart</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Architecture Specification</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">pgvector 1536-D Dual Engine</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">AI Ethics &amp; Explainability</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">HCL Hackathon 2026</span></li>
                <li><span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">System Status: All Systems Normal</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-[#d2d2d7]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] text-[#86868b]">
            <div>
              Copyright © {new Date().getFullYear()} ShopSmart AI Inc. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Privacy Policy</span>
              <span className="text-[#d2d2d7]">|</span>
              <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Terms of Use</span>
              <span className="text-[#d2d2d7]">|</span>
              <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Sales Policy</span>
              <span className="text-[#d2d2d7]">|</span>
              <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Legal</span>
              <span className="text-[#d2d2d7]">|</span>
              <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Site Map</span>
            </div>
            <div className="text-[#1d1d1f] font-medium">
              United States · English
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
