'use client';

import React, { useState } from 'react';
import { Gift, Tags } from 'lucide-react';
import GiftsTab from './GiftsTab';
import CategoriesTab from './CategoriesTab';

export default function LuxuryManagementDashboard() {
  // Navigation active tab controller state
  const [activeTab, setActiveTab] = useState<'gifts' | 'categories'>('gifts');

  return (
    <div className="flex min-h-screen bg-white text-black font-sans">
      
      {/* GLOBAL SIDEBAR COMPONENT */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* BRAND HEADER WITH PURE TRANSPARENT LOGO */}
          <div className="flex flex-col items-center mb-8 border-b border-gray-200 pb-6">
            <div className="w-20 h-20 flex items-center justify-center mb-3 bg-transparent overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Luxury A to Z Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="w-full h-full flex-col items-center justify-center bg-transparent font-serif text-xs font-bold text-amber-800">
                <span className="text-sm">A to Z</span>
              </div>
            </div>
            <h2 className="text-xl font-serif tracking-widest text-amber-700 font-bold">LUXURY</h2>
            <p className="text-xs tracking-wider text-gray-500 uppercase mt-0.5">Gift Box</p>
          </div>          
          {/* SIDEMENU BUTTON ROUTERS - CALLING THE COMPONENTS */}
          <nav className="space-y-2">

            
            <button 
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'categories' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Tags size={18} className="stroke-[2.5]" />
              <span className="text-black font-bold">Categories</span>
            </button>

           <button 
              onClick={() => setActiveTab('gifts')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'gifts' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Gift size={18} className="stroke-[2.5]" />
              <span className="text-black font-bold">Gifts</span>
            </button>
          </nav>
        </div>

      
      </aside>

      {/* DYNAMIC COMPONENT CALLER */}
      <main className="flex-1 p-8 overflow-x-hidden relative">
        {activeTab === 'gifts' ? <GiftsTab /> : <CategoriesTab />}
      </main>

    </div>
  );
}