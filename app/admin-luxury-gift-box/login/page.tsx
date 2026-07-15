'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';

export default function SlantedResponsiveLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in your authorized admin credentials.');
      return;
    }

    setIsLoading(true);

    try {
      // System validation sync delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Redirecting to your exact dashboard directory route path
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

  if (!isOpen) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <button
          onClick={() => setIsOpen(true)}
          className="border-2 border-black bg-black text-white px-6 py-2.5 text-xs font-semibold hover:bg-neutral-900 transition-all uppercase tracking-wider"
        >
          Open Login Portal
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#faf8f5] text-black font-sans px-4 antialiased">
      
      {/* OVERLAY MODAL CONTAINER */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
        
        {/* RESPONSIVE TEMPLATE CARD (Mobile: 100% width with padding | Desktop: ~460px width max) */}
        <div className="relative w-full md:max-w-[460px] min-h-[380px] bg-[#1a1a1a] border-2 border-solid border-black flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden rounded-none m-4">
          
          {/* Top-Right Absolute Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 z-30 bg-black/80 hover:bg-black text-white border border-white/20 p-1.5 rounded-full transition-colors focus:outline-none"
          >
            <X size={16} />
          </button>

          {/* TOP SECTION: Slanted Layout Area displaying your "A to Z" Logo */}
          <div className="relative w-full h-[160px] bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
            
            {/* Horizontal Slanted Divider Effect */}
            <div className="absolute bottom-[-20px] left-0 right-0 h-[40px] bg-[#1a1a1a] transform -skew-y-3 z-10" />

            {/* Logo Wrapper Container with Solid Background (Uses /logo.png from your public folder) */}
            <div className="relative w-full h-full flex items-center justify-center p-4 bg-white z-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-black/10 shadow-md">
                <Image 
                  src="/logo.png" 
                  alt="A to Z Logo" 
                  fill
                  className="object-cover p-1.5 bg-white"
                  priority
                />
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: Strict Black & White Input Form Area */}
          <div className="w-full p-6 flex flex-col justify-center z-20 bg-[#1a1a1a]">
            
            {/* Header Content */}
            <div className="mb-4 text-center">
              <span className="text-[9px] font-bold text-white/50 tracking-[0.3em] uppercase block mb-1">
                AURELIAN SYSTEM
              </span>
              <h2 className="text-xl font-serif font-black text-white uppercase tracking-wide leading-tight">
                ADMIN LOGIN
              </h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-[10px] p-2 rounded-none mb-3 flex items-center space-x-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full shrink-0 animate-pulse"></span>
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Login Inputs */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Type your email address"
                  className="w-full bg-white border border-neutral-800 p-2.5 text-black placeholder:text-neutral-400 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-white rounded-none"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type your security password"
                  className="w-full bg-white border border-neutral-800 p-2.5 text-black placeholder:text-neutral-400 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-white rounded-none"
                />
              </div>

              {/* Action Button - Extreme Contrast */}
              <div className="pt-2 flex flex-col items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2.5 text-xs transition-colors rounded-none uppercase tracking-widest flex items-center justify-center border border-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={12} className="animate-spin mr-1.5 text-black" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Login Now</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => alert("Password reset workflow is handled by administration.")}
                  className="text-[9px] text-white/40 hover:text-white transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}