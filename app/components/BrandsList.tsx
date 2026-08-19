"use client";

import React, { useState, useEffect } from "react";

export interface Brand {
  id: number;
  name: string;
  description?: string;
  status?: string;
  banner_image?: string;
  category_id?: number | string | null;
  category_ids?: number[];
}

export function BrandsList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch Categories
        const catRes = await fetch("/api/categories?status=all", { cache: "no-store" });
        if (catRes.ok) {
          const catData = await catRes.json();
          let catArray: any[] = [];
          if (Array.isArray(catData)) catArray = catData;
          else if (catData?.categories) catArray = catData.categories;
          else if (catData?.data) catArray = catData.data;
          setCategories(catArray);
        }

        // 2. Fetch All Brands without query params (Frontend handles filtering)
        const res = await fetch("/api/brands?status=all", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          let brandArray: any[] = [];
          if (Array.isArray(data)) brandArray = data;
          else if (data?.brands) brandArray = data.brands;
          else if (data?.data) brandArray = data.data;

          const activeBrands = brandArray.filter(
            (b) => String(b.status).toLowerCase() === "active"
          );

          setBrands(activeBrands);
        }
      } catch (err) {
        console.error("Failed to fetch data in front-end:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter Logic Fix:
  // 1. "all" select brands.
  // 2. category select :
  //   category ID brand .
  //    - "All Categories" (category_id null / empty / undefined) .
  const filteredBrands = brands.filter((brand) => {
    if (selectedCategoryId === "all") return true;

    const isGlobalBrand =
      brand.category_id === null ||
      brand.category_id === undefined ||
      brand.category_id === "" ||
      String(brand.category_id) === "null" ||
      String(brand.category_id) === "all";

    if (isGlobalBrand) return true;

    return (brand.category_ids || []).some((categoryId) => String(categoryId) === String(selectedCategoryId))
      || String(brand.category_id) === String(selectedCategoryId);
  });

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
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-6 tracking-wide">
          <span className="text-white font-normal">Explore Our </span>
          <span className="text-[#D4AF37] italic font-serif">Featured Brands</span>
        </h2>

        {/* Category Dropdown */}
        {categories.length > 0 && (
          <div className="flex justify-center mb-8">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="bg-[#2a080d] text-[#D4AF37] border border-[#D4AF37]/50 rounded-xl px-4 py-2 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-lg cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#1a0508] text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {filteredBrands.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No Active Brands Found</p>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 pt-2 px-2 scrollbar-thin scrollbar-thumb-[#D4AF37] scrollbar-track-transparent snap-x snap-mandatory focus:outline-none">
            {filteredBrands.map((brand) => (
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
                {brand.banner_image ? (
                  <img
                    src={brand.banner_image}
                    alt={brand.name}
                    className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full mb-1 pointer-events-none"
                  />
                ) : (
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-[#D4AF37] text-black rounded-full flex items-center justify-center font-bold text-base mb-1">
                    {brand.name ? brand.name.charAt(0) : "B"}
                  </div>
                )}

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