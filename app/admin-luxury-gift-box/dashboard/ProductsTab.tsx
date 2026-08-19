'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Upload, FileText, Image as ImageIcon, CheckCircle, X } from 'lucide-react';

export default function ProductsManagement() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStatusTab, setCurrentStatusTab] = useState<'Active' | 'Inactive'>('Active');
  const [loading, setLoading] = useState(true);
  
  // Dynamic Master Overlay Form Navigation Setup
  const [showMasterAddOverlay, setShowMasterAddOverlay] = useState(false);
  const [activeSubStep, setActiveSubStep] = useState<'details' | 'images'>('details');

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any | null>(null);

  const normalizeProductStatus = (status: any) => {
    if (status === undefined || status === null || status === '') return 'Active';
    const normalized = String(status).trim().toLowerCase();
    if (['active', '1', 'true', 'yes', 'enabled'].includes(normalized)) return 'Active';
    return 'Inactive';
  };

  const getRawProducts = (data: any) => {
    const rawProducts = Array.isArray(data)
      ? data
      : data?.products ?? data?.data ?? data?.results ?? [];
    console.log('UI Received Products:', rawProducts);
    return Array.isArray(rawProducts) ? rawProducts : [];
  };

  // Form states for creating a new gift hampering product item
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStacks, setNewStacks] = useState('0');
  const [newStatus, setNewStatus] = useState('Active');
  const [newImageStrings, setNewImageStrings] = useState<string[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [newBrandId, setNewBrandId] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');

  // Edit form properties states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStacks, setEditStacks] = useState('0');
  const [editStatus, setEditStatus] = useState('Active');
  const [editImageStrings, setEditImageStrings] = useState<string[]>([]);
  const [editBrandId, setEditBrandId] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');

  const GIFTS_API = '/api/products';
  const CATEGORIES_API = '/api/categories?status=all';

  // 1. DYNAMIC CATEGORIES RETRIEVAL HOOK
  // Fetch live categories from API
  const fetchLiveCategories = async () => {
    try {
      const res = await fetch('/api/categories?status=all');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch live brands from API
  const fetchLiveBrands = async () => {
    try {
      const res = await fetch('/api/brands?status=all');
      if (res.ok) {
        const data = await res.json();
        setBrands(Array.isArray(data) ? data : data.brands || []);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  // Your existing useEffect
  useEffect(() => {
    fetchLiveCategories();
    fetchLiveBrands();
    fetchGiftsFromServer();
  }, []);
  // 2. READ / SEARCH PRODUCTS WITH BACKEND INTEGRATION 
  const fetchGiftsFromServer = async (search = "") => {
    setLoading(true);
    try {
      let url = `${GIFTS_API}?status=all`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await fetch(url);
      const json = await response.json();
      const productData = Array.isArray(json) ? json : json?.products ?? json?.data ?? json?.results ?? [];
      const normalizedProducts = productData.map((item: any) => {
        const id = Number(item.id ?? item.product_id ?? item.gift_id ?? 0);
        const title = String(item.title ?? item.name ?? item.product_name ?? item.gift_name ?? '');
        const price = Number(item.price ?? item.product_price ?? item.gift_price ?? 0);
        const category_id = Number(item.category_id ?? item.cat_id ?? 0);
        const status = normalizeProductStatus(item.status);
        const images = (() => {
          if (Array.isArray(item.images)) return item.images.filter(Boolean);
          if (typeof item.images === 'string' && item.images.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(item.images);
              if (Array.isArray(parsed)) return parsed.filter(Boolean);
            } catch {
              // ignore invalid JSON
            }
          }
          if (typeof item.images === 'string' && item.images) return [item.images];
          if (typeof item.main_image === 'string' && item.main_image) return [item.main_image];
          if (typeof item.image_path === 'string' && item.image_path) return [item.image_path];
          if (typeof item.image === 'string' && item.image) return [item.image];
          return [];
        })();

        return {
          ...item,
          id,
          title,
          price,
          category_id,
          status,
          images,
          display_id: item.display_id ?? `ELLAMAE${id}`,
        };
      });
      setGifts(normalizedProducts);
    } catch (error) {
      console.error("Backend parsing active protection logs exception:", error);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCategories();
    fetchLiveBrands();
    fetchGiftsFromServer();
  }, []);

  const handleNextSubStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return alert('Please input Product Name');
    if (!newBrandId) return alert('A valid brand selector choice is mandatory');
    if (!newCategoryId) return alert('Please select a category');
    setActiveSubStep('images');
  };

  // Encodes incoming multiple files binary logs completely to pure Base64 strings
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(event.target?.result as string || '');
          }
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRealImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      const promises = fileList.map(file => compressImage(file));

      Promise.all(promises).then(base64Strings => {
        setNewImageStrings(prev => [...prev, ...base64Strings]);
      }).catch(err => {
        console.error("Error converting files:", err);
      });
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      const promises = fileList.map(file => compressImage(file));

      Promise.all(promises).then(base64Strings => {
        setEditImageStrings(prev => [...prev, ...base64Strings]);
      }).catch(err => {
        console.error("Error converting files:", err);
      });
    }
  };

  // 3. CREATE GIFT FUNCTION (SAVE & EXIT)
  const handleFinalGiftSubmit = async () => {
    if (!newName.trim()) return alert("Product Title can't be empty");
    if (!newBrandId) return alert("Please select a brand");
    if (!newCategoryId) return alert("Please select a category");

    try {
      const payload = {
        category_id: Number(newCategoryId),
        brand_id: Number(newBrandId),
        title: newName,
        price: Number(newPrice) || 0,
        stacks: Number(newStacks) || 0,
        description: newDescription,
        status: newStatus,
        images: newImageStrings
      };
      const response = await fetch(GIFTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        return alert(`Server Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setNewName(''); setNewDescription(''); setNewPrice(''); setNewStacks('0'); setNewImageStrings([]);
        setNewBrandId('');
        setNewCategoryId('');
        setActiveSubStep('details');
        setShowMasterAddOverlay(false);
        fetchGiftsFromServer(searchTerm);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Creating operational process pipeline error logs:", err);
      alert("Error saving gift hamper. Please check console logs.");
    }
  };

  const handleViewClick = (gift: any) => {
    setSelectedGift(gift);
    setEditName(gift.title);
    setEditDescription(gift.description);
    setEditPrice(String(gift.price));
    setEditStacks(String(gift.stacks !== undefined && gift.stacks !== null ? gift.stacks : (gift.stack !== undefined ? gift.stack : 0)));
    setEditStatus(gift.status);
    setEditBrandId(gift.brand_id ? String(gift.brand_id) : "");
    setEditCategoryId(gift.category_id ? String(gift.category_id) : "");
    const parsedImages = (() => {
      if (Array.isArray(gift.images) && gift.images.length > 0) return gift.images.filter(Boolean);
      if (typeof gift.images === 'string' && gift.images.trim().startsWith('[')) {
        try { return JSON.parse(gift.images); } catch (e) {}
      }
      if (typeof gift.images === 'string' && gift.images.length > 0) return [gift.images];
      if (typeof gift.image === 'string' && gift.image.length > 0) return [gift.image];
      if (typeof gift.image_path === 'string' && gift.image_path.length > 0) return [gift.image_path];
      return [];
    })();
    setEditImageStrings(parsedImages);
    setShowPreviewModal(true);
  };

  // 4. UPDATE GIFT FUNCTION
  const handleUpdateGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGift) return;
    if (!editBrandId) return alert('Please select a brand');
    if (!editCategoryId) return alert('Please select a category');

    try {
      const payload = {
        id: selectedGift.id,
        category_id: Number(editCategoryId),
        brand_id: Number(editBrandId),
        title: editName,
        price: Number(editPrice) || 0,
        stacks: Number(editStacks) || 0,
        description: editDescription,
        status: editStatus,
        images: editImageStrings
      };
      const response = await fetch(GIFTS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        return alert(`Server Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setShowPreviewModal(false);
        fetchGiftsFromServer(searchTerm);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Updating modifications logs stream execution crash:", err);
    }
  };

  // 5. ISOLATED TARGETED DELETIONS (DELETES ONLY THE INTENDED UNIQUE ID ROW)
  const handleDeleteGift = async (id: number) => {
    if (!confirm("Are you confident about completely erasing this distinct item?")) return;

    try {
      const response = await fetch(`${GIFTS_API}?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        return alert(`Server Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setShowPreviewModal(false);
        fetchGiftsFromServer(searchTerm);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Decoupled single targeted drop exception trace:", err);
    }
  };

  return (
    <div className="flex min-h-full bg-transparent text-black font-sans">
      <main className="flex-1 overflow-x-hidden relative">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2A0812] font-serif">Products</h1>
            <p className="text-sm text-[#d4af37]/80 mt-1.5 tracking-wide">Manage luxury product items synced live with the server</p>
          </div>
          <button 
            onClick={() => { setActiveSubStep('details'); setShowMasterAddOverlay(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-[#2A0812]/30 transition-all duration-300 border border-[#d4af37]/20"
          >
            <Plus size={16} className="stroke-[2.5] text-[#d4af37]" />
            Add Product
          </button>
        </div>

        {/* Status Toggle Buttons */}
        <div className="inline-flex items-center bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 mb-6 border border-[#d4af37]/15 shadow-sm">
          <button
            onClick={() => setCurrentStatusTab('Active')}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
              currentStatusTab === 'Active'
                ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white shadow-md shadow-[#2A0812]/20'
                : 'text-gray-500 hover:text-[#2A0812] hover:bg-[#d4af37]/10'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setCurrentStatusTab('Inactive')}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
              currentStatusTab === 'Inactive'
                ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white shadow-md shadow-[#2A0812]/20'
                : 'text-gray-500 hover:text-[#2A0812] hover:bg-[#d4af37]/10'
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search size={16} className="text-[#d4af37]/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by title, description or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchGiftsFromServer(e.target.value);
            }}
            className="w-full bg-white/80 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-black placeholder-gray-400 pl-11 pr-4 py-3 transition-all duration-300 shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white/70 backdrop-blur-md border border-[#d4af37]/15 rounded-2xl overflow-hidden shadow-lg shadow-[#2A0812]/5 mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d4af37]/10 bg-gradient-to-r from-[#faf6f0]/50 to-white text-[11px] font-bold tracking-wider uppercase text-[#2A0812]/70">
                <th className="py-4 px-5 w-28">ID</th>
                <th className="py-4 px-5 w-20">Image</th>
                <th className="py-4 px-5">Title</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Brand</th>
                <th className="py-4 px-5">Description</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Stacks</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
           <tbody className="divide-y divide-[#d4af37]/5 text-xs">
              {gifts.filter((gift) => normalizeProductStatus(gift.status) === currentStatusTab).length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-gray-400 text-sm">No {currentStatusTab.toLowerCase()} products found.</td>
                </tr>
              ) : (
                gifts.filter((gift) => normalizeProductStatus(gift.status) === currentStatusTab).map((gift) => {
                  const images = (() => {
                    if (Array.isArray(gift.images) && gift.images.length > 0) return gift.images.filter(Boolean);
                    if (typeof gift.images === 'string' && gift.images.trim().startsWith('[')) {
                      try { return JSON.parse(gift.images); } catch (e) {}
                    }
                    if (typeof gift.images === 'string' && gift.images.length > 0) return [gift.images];
                    if (typeof gift.image === 'string' && gift.image.length > 0) return [gift.image];
                    if (typeof gift.image_path === 'string' && gift.image_path.length > 0) return [gift.image_path];
                    return [];
                  })();
                  const primaryImage = images.length > 0 ? images[0] : null;
                  const stackCount = gift.stacks !== undefined && gift.stacks !== null ? gift.stacks
                    : (gift.stack !== undefined && gift.stack !== null ? gift.stack : 0);

                  return (
                    <tr key={gift.id} className="hover:bg-[#d4af37]/5 transition-all duration-200 group">
                      <td className="py-3.5 px-5 font-medium text-[#2A0812]/60 text-xs">{gift.display_id || `ELLAMAE${gift.id}`}</td>
                      <td className="py-3 px-5">
                        {primaryImage ? (
                          <div className="w-12 h-12 rounded-xl border border-[#d4af37]/20 overflow-hidden bg-[#faf6f0] shadow-sm group-hover:shadow-md transition-shadow">
                            <img src={primaryImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-[#d4af37]/20 bg-[#faf6f0] flex items-center justify-center text-[#d4af37]/40">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#2A0812] text-sm">{gift.title}</td>
                      <td className="py-3.5 px-5 text-gray-600 text-sm font-medium">
                        {categories.find(c => c.id == gift.category_id)?.name || <span className="text-gray-400 italic">None</span>}
                      </td>
                      <td className="py-3.5 px-5 text-gray-600 text-sm font-medium">
                        {brands.find(b => b.id == gift.brand_id)?.name || <span className="text-gray-400 italic">None</span>}
                      </td>
                      <td className="py-3.5 px-5 text-gray-500 max-w-xs truncate">{gift.description}</td>
                      <td className="py-3.5 px-5 font-semibold text-[#2A0812]">₹{gift.price}</td>
                      <td className="py-3.5 px-5 font-medium text-gray-600">{stackCount}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${
                          gift.status === 'Active' 
                            ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white border-[#2A0812] shadow-sm' 
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {gift.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex justify-center space-x-3 text-gray-400">
                          <button onClick={() => handleViewClick(gift)} className="hover:text-[#d4af37] transition-colors p-1.5 rounded-lg hover:bg-[#d4af37]/10">
                            <Eye size={16} className="stroke-[2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ADD GIFT MODAL */}
        {showMasterAddOverlay && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-[#2A0812]/60 backdrop-blur-md p-4">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-xl rounded-3xl shadow-2xl shadow-[#2A0812]/30 flex flex-col overflow-hidden max-h-[90vh] border border-[#d4af37]/20">
              <div className="flex justify-between items-center px-8 py-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#faf6f0]/50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-[#2A0812] font-serif">Add New Gift</h2>
                  <p className="text-xs text-[#d4af37]/70 mt-1 tracking-wide">Fill in details to create a new gift product</p>
                </div>
                <button type="button" onClick={() => setShowMasterAddOverlay(false)} className="text-gray-400 hover:text-[#2A0812] transition-colors p-2 rounded-lg hover:bg-[#d4af37]/10">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 px-8 py-7 overflow-y-auto">
                {/* Step Indicator */}
                <div className="flex items-center gap-6 bg-gradient-to-r from-[#faf6f0]/80 to-white border border-[#d4af37]/15 px-6 py-4 rounded-2xl mb-8 shadow-sm">
                  <div className={`flex items-center gap-3 transition-opacity duration-300 ${activeSubStep === 'details' ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${activeSubStep === 'details' ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] border-[#2A0812] text-white shadow-md shadow-[#2A0812]/20' : 'border-[#d4af37]/30 text-[#d4af37]/50'}`}>
                      <FileText size={15} />
                    </div>
                    <span className="font-semibold text-sm text-[#2A0812]">Details</span>
                  </div>
                  <div className="text-[#d4af37]/30 text-lg font-light">→</div>
                  <div className={`flex items-center gap-3 transition-opacity duration-300 ${activeSubStep === 'images' ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${activeSubStep === 'images' ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] border-[#2A0812] text-white shadow-md shadow-[#2A0812]/20' : 'border-[#d4af37]/30 text-[#d4af37]/50'}`}>
                      <ImageIcon size={15} />
                    </div>
                    <span className="font-semibold text-sm text-[#2A0812]">Images</span>
                  </div>
                </div>

                {activeSubStep === 'details' && (
                  <form onSubmit={handleNextSubStep} className="text-black text-sm">
                    <div className="mb-5">
                      <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Product Title</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Premium Gift Hamper" className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm" />
                    </div>
                    <div className="mb-5">
                      <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Description</label>
                      <textarea rows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Write a product description..." className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium resize-none text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm" />
                    </div>
                    <div className="mb-5">
                      <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Category (Required)</label>
                      <select value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm">
                        <option value="">Select Category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="mb-5">
                      <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Brand (Required)</label>
                      <select value={newBrandId} onChange={(e) => setNewBrandId(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm">
                        <option value="">Select Brand</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.category_name || (b.category_ids || (b.category_id ? [b.category_id] : [])).map((id: number) => categories.find(c => c.id == id)?.name).filter(Boolean).join(', ') || 'No Category'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div>
                        <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Price (₹)</label>
                        <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Stacks</label>
                        <input type="number" value={newStacks} onChange={(e) => setNewStacks(e.target.value)} placeholder="0" className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Status</label>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-[#d4af37]/10 pt-6 gap-3">
                      <button type="button" onClick={() => setShowMasterAddOverlay(false)} className="px-6 py-3 border border-[#d4af37]/20 text-gray-600 hover:border-[#d4af37] hover:text-[#2A0812] font-semibold rounded-xl transition-all text-sm">Cancel</button>
                      <button type="submit" className="px-7 py-3 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#2A0812]/20 transition-all text-sm border border-[#d4af37]/20">Next →</button>
                    </div>
                  </form>
                )}

                {activeSubStep === 'images' && (
                  <div className="text-black">
                    <label className="block cursor-pointer mb-6">
                      <input type="file" accept="image/*" multiple onChange={handleRealImageUpload} className="hidden" />
                      <div className="border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37] p-12 rounded-2xl flex flex-col items-center bg-gradient-to-br from-[#faf6f0]/50 to-white hover:from-[#faf6f0] hover:to-white transition-all duration-300">
                        <Upload size={36} className="text-[#d4af37]/60 mb-4" />
                        <span className="font-semibold text-sm text-[#2A0812]">Click to upload product images</span>
                        <span className="text-xs text-[#d4af37]/60 mt-2">PNG, JPG — multiple allowed</span>
                      </div>
                    </label>

                    <span className="block font-semibold mb-4 text-sm text-[#2A0812]">Selected Images ({newImageStrings.length})</span>
                    <div className="border border-[#d4af37]/15 rounded-2xl p-5 bg-gradient-to-br from-[#faf6f0]/30 to-white mb-8 min-h-[140px]">
                      {newImageStrings.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4">
                          {newImageStrings.map((imgStr, idx) => (
                            <div key={idx} className="relative aspect-square border border-[#d4af37]/20 rounded-xl overflow-hidden group bg-white shadow-md group-hover:shadow-lg transition-shadow">
                              <img src={imgStr} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewImageStrings(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-2 right-2 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center min-h-[100px] text-[#d4af37]/40">
                          <span className="text-sm">No images selected yet</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end border-t border-[#d4af37]/10 pt-6 gap-3">
                      <button type="button" onClick={() => setActiveSubStep('details')} className="px-6 py-3 border border-[#d4af37]/20 text-gray-600 hover:border-[#d4af37] hover:text-[#2A0812] font-semibold rounded-xl transition-all text-sm">← Back</button>
                      <button type="button" onClick={handleFinalGiftSubmit} className="px-7 py-3 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#2A0812]/20 transition-all text-sm flex items-center gap-2 border border-[#d4af37]/20">
                        <CheckCircle size={16} className="text-[#d4af37]" /> Save Gift
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDIT GIFT MODAL */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-[#2A0812]/60 backdrop-blur-md p-4">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-5xl rounded-3xl shadow-2xl shadow-[#2A0812]/30 flex flex-col overflow-hidden max-h-[90vh] border border-[#d4af37]/20">
              <div className="flex justify-between items-center px-8 py-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#faf6f0]/50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-[#2A0812] font-serif">Edit Gift</h2>
                  <p className="text-xs text-[#d4af37]/70 mt-1 tracking-wide">Update gift product details and images</p>
                </div>
                <button type="button" onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-[#2A0812] transition-colors p-2 rounded-lg hover:bg-[#d4af37]/10">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                  {/* Left — Images */}
                  <div>
                    <span className="block font-semibold text-xs uppercase tracking-wider text-[#2A0812]/70 mb-4">Product Images ({editImageStrings.length})</span>
                    <div className="border border-[#d4af37]/15 rounded-2xl p-5 bg-gradient-to-br from-[#faf6f0]/30 to-white mb-5 min-h-[200px]">
                      {editImageStrings.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                          {editImageStrings.map((imgStr, idx) => (
                            <div key={idx} className="relative aspect-square border border-[#d4af37]/20 rounded-xl overflow-hidden group bg-white shadow-md group-hover:shadow-lg transition-shadow">
                              <img src={imgStr} alt="thumbnail" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setEditImageStrings(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-2 right-2 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[180px] text-[#d4af37]/40">
                          <ImageIcon size={40} className="mx-auto mb-3" />
                          <span className="text-sm">No images found</span>
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37] rounded-2xl p-5 flex flex-col items-center justify-center bg-gradient-to-br from-[#faf6f0]/50 to-white hover:from-[#faf6f0] hover:to-white transition-all duration-300">
                      <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="hidden" />
                      <Upload size={24} className="text-[#d4af37]/60 mb-2" />
                      <span className="text-xs font-semibold text-[#2A0812]">Add More Images</span>
                    </label>
                  </div>

                  {/* Right — Form */}
                  <div>
                    <form onSubmit={handleUpdateGiftSubmit} className="flex flex-col text-black text-sm h-full">
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                          <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Title</label>
                          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all" />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Category (Required)</label>
                          <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all">
                            <option value="">Select Category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Brand (Required)</label>
                          <select value={editBrandId} onChange={(e) => setEditBrandId(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all">
                            <option value="">Select Brand</option>
                            {brands.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name} ({b.category_name || (b.category_ids || (b.category_id ? [b.category_id] : [])).map((id: number) => categories.find(c => c.id == id)?.name).filter(Boolean).join(', ') || 'No Category'})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-5">
                        <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Description</label>
                        <textarea rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium resize-none text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div>
                          <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Price (₹)</label>
                          <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all" />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Stacks</label>
                          <input type="number" value={editStacks} onChange={(e) => setEditStacks(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all" />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Status</label>
                          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-[#d4af37]/10 mt-auto gap-3">
                        <button type="button" onClick={() => setShowPreviewModal(false)} className="px-6 py-3 border border-[#d4af37]/20 text-gray-600 hover:border-[#d4af37] hover:text-[#2A0812] font-semibold rounded-xl transition-all text-sm">Cancel</button>
                        <button type="submit" className="px-7 py-3 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#2A0812]/20 transition-all text-sm border border-[#d4af37]/20">Save Changes</button>
                      </div>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}