'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Loader2, LogIn, ShieldCheck } from 'lucide-react';

export default function LuxuryAdminPortalDirect() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in your authorized admin login credentials.');
      return;
    }

    setIsLoading(true);

    try {
      // Premium system connection delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (email === 'admin@luxury.com' && password === 'admin123') {
        router.push('/admin-luxury-gift-box/dashboard');
      } else {
        setError('Invalid admin identity email or passcode.');
      }
    } catch (err) {
      setError('Internal security authentication failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-black font-sans p-6 antialiased">
      {/* Structural Minimal Grid Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-xl shadow-lg relative z-10">
        
        {/* ELLAMAE Corporate Brand Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-medium tracking-[0.25em] text-black uppercase">
            ELLAMAE
          </h1>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="h-px w-5 bg-gray-300"></span>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-semibold">
              Where Memories Begin
            </p>
            <span className="h-px w-5 bg-gray-300"></span>
          </div>
          
          <div className="mt-5 inline-flex items-center justify-center space-x-1.5 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
            <ShieldCheck size={12} className="text-black" />
            <span>Management Gateway</span>
          </div>
        </div>

        {/* Dynamic Security Errors Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-900 text-xs font-semibold p-3.5 rounded-lg mb-6 flex items-center space-x-2.5">
            <span className="w-2 h-2 bg-red-600 rounded-full shrink-0 animate-pulse"></span>
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Direct Authentication Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-6 text-xs">
          <div>
            <label className="block font-bold mb-2 text-gray-700 uppercase tracking-wider text-[10px]">
              Admin Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="text-gray-400 absolute left-3.5 pointer-events-none z-20" />
              <input
                type="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@luxury.com"
                className="w-full bg-white border border-gray-300 rounded-lg p-3 pl-11 text-black font-medium transition-all focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2 text-gray-700 uppercase tracking-wider text-[10px]">
              Security Passcode
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="text-gray-400 absolute left-3.5 pointer-events-none z-20" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-300 rounded-lg p-3 pl-11 pr-11 text-black font-medium transition-all focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 absolute right-3.5 hover:text-black transition-colors z-20 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 🚨 DEDICATED HIGH-VISIBILITY LOGIN BUTTON BLOCK */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-bold p-3.5 rounded-lg uppercase tracking-widest text-[11px] hover:bg-gray-900 transition-all active:scale-[0.99] disabled:bg-gray-400 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>AUTHENTICATING SESSION...</span>
                </>
              ) : (
                <>
                  <LogIn size={14} />
                  <span>LOGIN TO ADMIN PORTAL</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Corporate Attribution Guard Footnote */}
        <p className="text-center mt-8 pt-4 border-t border-gray-100 text-[9px] text-gray-400 tracking-widest uppercase font-bold">
          Authorized Operations Personnel Only
        </p>
      </div>
    </div>
  );
}