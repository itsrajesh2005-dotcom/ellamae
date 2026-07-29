'use client';

import React, { useState } from 'react';
import { Gift, Tags, Tag } from 'lucide-react';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import BrandsTab from './BrandsTab';

export default function LuxuryManagementDashboard() {
  // Navigation active tab controller state - Set 'categories' as the default view
  const [activeTab, setActiveTab] = useState<'brands' | 'categories' | 'products'>('categories');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#faf6f0] via-[#f5f0e8] to-[#faf6f0] text-black font-sans">
      
      {/* GLOBAL SIDEBAR COMPONENT */}
      <aside className="w-72 bg-white/80 backdrop-blur-md border-r border-[#d4af37]/20 flex flex-col shrink-0 shadow-lg">
        <div>
          {/* BRAND HEADER */}
          <div className="flex flex-col items-center py-8 px-6 border-b border-[#d4af37]/15">
            <div className="w-20 h-20 flex items-center justify-center mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2A0812] to-[#4a1830] shadow-xl">
              <img 
                src="/logo.png" 
                alt="Luxury Admin Logo" 
                className="w-full h-full object-contain drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center">
                <span className="text-[#d4af37] font-bold text-2xl">E</span>
              </div>
            </div>
            <h2 className="text-lg font-bold tracking-[0.3em] text-[#2A0812] uppercase">Ellamae</h2>
            <p className="text-[10px] tracking-[0.25em] text-[#d4af37]/70 uppercase mt-1 font-semibold">Admin Dashboard</p>
          </div>          
          {/* SIDEMENU BUTTON ROUTERS */}
          <nav className="px-4 pt-6 space-y-2">
            {/* CATEGORIES TAB (FIRST / DEFAULT ITEM) */}
            <button 
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group ${
                activeTab === 'categories' 
                  ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white shadow-lg shadow-[#2A0812]/20' 
                  : 'text-gray-600 hover:bg-[#d4af37]/10 hover:text-[#2A0812]'
              }`}
            >
              {activeTab === 'categories' && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-transparent opacity-50" />
              )}
              <Tags size={18} className={`stroke-[2] relative z-10 ${activeTab === 'categories' ? 'text-[#d4af37]' : ''}`} />
              <span className="relative z-10">Categories</span>
              {activeTab === 'categories' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
              )}
            </button>

            {/* BRANDS TAB */}
            <button 
              onClick={() => setActiveTab('brands')}
              className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group ${
                activeTab === 'brands' 
                  ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white shadow-lg shadow-[#2A0812]/20' 
                  : 'text-gray-600 hover:bg-[#d4af37]/10 hover:text-[#2A0812]'
              }`}
            >
              {activeTab === 'brands' && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-transparent opacity-50" />
              )}
              <Tag size={18} className={`stroke-[2] relative z-10 ${activeTab === 'brands' ? 'text-[#d4af37]' : ''}`} />
              <span className="relative z-10">Brands</span>
              {activeTab === 'brands' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
              )}
            </button>

            {/* PRODUCTS TAB */}
            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group ${
                activeTab === 'products' 
                  ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white shadow-lg shadow-[#2A0812]/20' 
                  : 'text-gray-600 hover:bg-[#d4af37]/10 hover:text-[#2A0812]'
              }`}
            >
              {activeTab === 'products' && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-transparent opacity-50" />
              )}
              <Gift size={18} className={`stroke-[2] relative z-10 ${activeTab === 'products' ? 'text-[#d4af37]' : ''}`} />
              <span className="relative z-10">Products</span>
              {activeTab === 'products' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
              )}
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 py-5 border-t border-[#d4af37]/15 bg-gradient-to-t from-[#faf6f0]/50 to-transparent">
          <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] font-medium">Admin v1.0</p>
        </div>
      </aside>

      {/* DYNAMIC COMPONENT CALLER */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'brands' && <BrandsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'products' && <ProductsTab />}
      </main>

    </div>
  );
}