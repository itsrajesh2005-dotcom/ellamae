"use client";

import React, { useEffect, useState } from "react";

interface Brand {
  id: number;
  name: string;
  description: string;
  banner_image?: string;
}

export default function BrandSection({ onSelectBrand }: { onSelectBrand?: (brandId: number) => void }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCustomerBrands = async () => {
      try {
        const response = await fetch("/api/brands");
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setBrands(data);
        }
      } catch (err) {
        console.error("Failed to load brands on front-end:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerBrands();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading Luxury Brands...</div>;
  if (brands.length === 0) return null;

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Featured Brands</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              onClick={() => onSelectBrand && onSelectBrand(brand.id)}
              className="cursor-pointer border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition flex flex-col items-center justify-center text-center group"
            >
              {brand.banner_image ? (
                <img
                  src={brand.banner_image}
                  alt={brand.name}
                  className="h-16 w-16 object-contain mb-2 group-hover:scale-105 transition"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 mb-2">
                  {brand.name.charAt(0)}
                </div>
              )}
              <h3 className="font-semibold text-sm text-gray-800">{brand.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
