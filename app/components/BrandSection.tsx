'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BrandSection() {
  const [brands, setBrands] = useState<any[]>([]);
  const [failedImages, setFailedImages] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands-db?status=active', { cache: 'no-store' });
        const data = await response.json();
        
        if (response.ok) {
          let listToFilter: any[] = [];
          
          if (Array.isArray(data)) {
            listToFilter = data;
          } else if (data.status === 'success' && Array.isArray(data.data)) {
            listToFilter = data.data;
          }

          const activeOnly = listToFilter.filter(
            (b: any) => (b.status || '').toString().toLowerCase() === 'active'
          );

          setBrands(activeOnly);
        }
      } catch (err) {
        console.error('Failed to fetch active brands:', err);
      }
    };

    fetchBrands();
  }, []);

  return (
    <section className="bg-[#2A0812] py-16 px-4 text-center text-white relative overflow-hidden">
      
      {/* Golden Cursor Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#d4af37]/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <h2 className="text-3xl md:text-4xl font-serif mb-12 tracking-wide relative z-10">
        Explore Our <span className="italic text-[#d4af37] font-normal">Featured Brands</span>
      </h2>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <div className="w-full relative z-10 max-w-6xl mx-auto px-4">
        
        {/* Scrollable Flex container */}
        <div className="flex items-center gap-10 overflow-x-auto pb-6 pt-4 px-2 scroll-smooth scrollbar-thin scrollbar-thumb-[#d4af37]/70 scrollbar-track-[#2A0812]/10 scrollbar-thumb-rounded-full hover:scrollbar-thumb-[#d4af37]">
          
          {brands.map((brand) => {
            const rawImage = brand.banner_image || brand.logo || brand.banner || brand.image;
            
            const hasValidImage = 
              rawImage && 
              typeof rawImage === 'string' && 
              rawImage.trim() !== '' && 
              !failedImages[brand.id];

            const firstLetter = brand.name ? brand.name.trim().charAt(0).toUpperCase() : '?';

            // Route to [slug] route existing in project (or ID as fallback)
            const brandRoute = brand.slug || brand.id;

            return (
              <Link 
                key={brand.id || brand.name} 
                href={`/brands/${brandRoute}`}
                className="flex-shrink-0 flex flex-col items-center group cursor-pointer"
              >
                
                {/* BIG PURE GOLDEN GLOWING CIRCLE CONTAINER */}
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-[#d4af37] flex items-center justify-center overflow-hidden bg-[#2A0812] p-0 transition-all duration-300 ease-out 
                  shadow-[0_0_15px_-3px_#d4af37] 
                  group-hover:scale-110 group-hover:rotate-1
                  group-hover:shadow-[0_0_20px_0_#d4af37,0_0_15px_10px_rgba(212,175,55,0.4),0_0_15px_15px_rgba(212,175,55,0.2),inset_0_0_25px_0_rgba(212,175,55,0.2)]
                  group-hover:border-[#d4af37]/90
                ">
                  
                  {/* Pulsating Glow Behind Circle */}
                  <div className="absolute -inset-1.5 bg-[#d4af37]/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>

                  {/* SHINE GLARE */}
                  <div className="absolute inset-0 -translate-x-[150%] rotate-[20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out z-20"></div>

                  {/* Brand Content */}
                  {hasValidImage ? (
                    <img
                      src={rawImage}
                      alt={brand.name || 'Brand'}
                      className="w-full h-full object-cover block relative z-1"
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [brand.id]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] font-bold text-3xl md:text-4xl select-none relative z-1 shadow-inner">
                      {firstLetter}
                    </div>
                  )}
                </div>

                {/* BRAND NAME */}
                <span className="mt-4 text-sm md:text-base font-medium tracking-wider text-gray-200 transition-all duration-300 group-hover:text-[#d4af37] group-hover:translate-y-0.5 block">
                  {brand.name}
                </span>

              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
