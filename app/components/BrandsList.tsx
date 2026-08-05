"use client";

import React, { useState, useEffect } from "react";

export interface Brand {
  id: number;
  name: string;
  description?: string;
  status?: string;
  banner_image?: string;
}

export function BrandsList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await fetch("/api/brands-db?status=Active", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setBrands(data);
        } else {
          console.error("Brands API response error:", data);
        }
      } catch (err) {
        console.error("Failed to fetch brands in front-end:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8 text-center text-gray-400 font-medium">
        Loading Luxury Brands...
      </div>
    );
  }

  return (
    <section className="w-full py-10 bg-[#1a0508] border-y border-[#D4AF37]/30 my-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Luxury Heading */}
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-8 tracking-wide">
          <span className="text-white font-normal">Explore Our </span>
          <span className="text-[#D4AF37] italic font-serif">Featured Brands</span>
        </h2>

        {brands.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No Active Brands Found</p>
        ) : (
          /* Side-by-Side Horizontal Scroll Wrapper */
          <div className="flex gap-6 overflow-x-auto pb-4 pt-2 px-2 scrollbar-thin scrollbar-thumb-[#D4AF37] scrollbar-track-transparent snap-x snap-mandatory focus:outline-none">
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => console.log("Brand clicked:", brand.id)}
                className="flex-shrink-0 snap-center group relative flex flex-col items-center justify-center 
                           w-28 h-28 md:w-32 md:h-32 
                           rounded-full 
                           bg-[#2a080d] 
                           border-2 border-[#D4AF37] 
                           shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.7)] 
                           transition-all duration-300 transform hover:scale-105 
                           p-2 cursor-pointer focus:outline-none"
              >
                {/* Circle Image / Icon */}
                {brand.banner_image ? (
                  <img
                    src={brand.banner_image}
                    alt={brand.name}
                    className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full mb-1 pointer-events-none"
                  />
                ) : (
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-[#D4AF37] text-black rounded-full flex items-center justify-center font-bold text-base mb-1">
                    {brand.name.charAt(0)}
                  </div>
                )}

                {/* Brand Name inside Circle */}
                <span className="text-xs md:text-sm font-medium text-white group-hover:text-[#D4AF37] transition-colors truncate max-w-[85%]">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BrandsList;
