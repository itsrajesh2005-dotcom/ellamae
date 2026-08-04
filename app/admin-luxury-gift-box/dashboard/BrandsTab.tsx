'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, CheckCircle, Upload, Image as ImageIcon, Layers, X } from 'lucide-react';

const API_URL = "/api/brands";

export default function BrandsTab() {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStatusTab, setCurrentStatusTab] = useState<'Active' | 'Inactive'>('Active');
  
  // Overlay & Modal Setup
  const [showMasterAddOverlay, setShowMasterAddOverlay] = useState(false);
  const [activeSubStep, setActiveSubStep] = useState<'details' | 'banner'>('details');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  // Form states for creating a new brand
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  const [newImageString, setNewImageString] = useState(''); 
  const [newCategoryId, setNewCategoryId] = useState('');

  // Form states for viewing/editing inside overlay
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editImageString, setEditImageString] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');

  // 1. READ & DYNAMIC SEARCH PIPELINE
  const fetchBrands = async (search = "") => {
  try {
    let url = '/api/brands-db?status=all';
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    
    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (response.ok) {
        setBrands(data); // Ungaloda state setter name
      } else {
        console.error("API Error:", data);
      }
    } else {
      const text = await response.text();
      console.error("Non-JSON Server Response:", text);
    }
  } catch (error) {
    console.error("Failed fetching brands:", error);
  }
};

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories-db?status=all');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories in brands tab:", err);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  const handleNextSubStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return alert('Please enter a Brand Name');
    setActiveSubStep('banner');
  };

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

  const handleNewBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      compressImage(files[0]).then(base64 => setNewImageString(base64));
    }
  };

  const handleEditBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      compressImage(files[0]).then(base64 => setEditImageString(base64));
    }
  };

  // 2. CREATE BRAND ROUTINE (SAVE & EXIT)
  const handleFinalBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Constructing brand object from your individual states
    const newBrandData = {
      name: newName,
      description: newDescription,
      status: newStatus,
      banner_image: newImageString,
      category_id: Number(newCategoryId) || null
    };

    try {
      const response = await fetch('/api/brands-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBrandData), // Fixed: Now using created brand object
      });

      const contentType = response.headers.get("content-type");

      if (response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          alert("Brand saved successfully!");
          
          // Form resets and Modal Close
          setNewName('');
          setNewDescription('');
          setNewStatus('Active');
          setNewImageString('');
          setNewCategoryId('');
          setShowMasterAddOverlay(false);

          fetchBrands(); // Refresh list after save
        }
      } else {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || 'Failed to save'}`);
        } else {
          const text = await response.text();
          console.error("Server Error Response:", text);
          alert(`Server Error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong while saving!");
    }
  };

  const handleViewClick = (brand: any) => {
    setSelectedBrand(brand);
    setEditName(brand.name);
    setEditDescription(brand.description);
    setEditStatus(brand.status);
    setEditImageString(brand.banner_image || "");
    setEditCategoryId(brand.category_id ? String(brand.category_id) : "");
    setShowPreviewModal(true);
  };

  // 3. UPDATE BRAND SPECIFICATIONS LOGS
  const handleUpdateBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand) return;

    try {
      const updatePayload = {
        id: selectedBrand.id,
        name: editName,
        description: editDescription,
        status: editStatus,
        banner_image: editImageString,
        category_id: Number(editCategoryId) || null
      };
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        return alert(`Server Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === "success") {
        setShowPreviewModal(false);
        fetchBrands(searchTerm);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Data update stream crash:", error);
    }
  };

  return (
    <div className="flex min-h-full bg-transparent text-black font-sans">
      <main className="flex-1 overflow-x-hidden relative">

        {/* Header Block Layout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2A0812] font-serif">Brands</h1>
            <p className="text-sm text-[#d4af37]/80 mt-1.5 tracking-wide">Manage luxury brand items synced live with the server</p>
          </div>
          <button 
            onClick={() => { setActiveSubStep('details'); setShowMasterAddOverlay(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-[#2A0812]/30 transition-all duration-300 border border-[#d4af37]/20"
          >
            <Plus size={16} className="stroke-[2.5] text-[#d4af37]" />
            Add Brand
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

        {/* Live Search Trigger Filter Input Box */}
        <div className="relative max-w-md mb-8">
          <Search size={16} className="text-[#d4af37]/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search brands by name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchBrands(e.target.value);
            }}
            className="w-full bg-white/80 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-black placeholder-gray-400 pl-11 pr-4 py-3 transition-all duration-300 shadow-sm"
          />
        </div>

        {/* Dynamic Matrix Data Table Rendering Element */}
        <div className="bg-white/70 backdrop-blur-md border border-[#d4af37]/15 rounded-2xl overflow-hidden shadow-lg shadow-[#2A0812]/5 mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d4af37]/10 bg-gradient-to-r from-[#faf6f0]/50 to-white text-[11px] font-bold tracking-wider uppercase text-[#2A0812]/70">
                <th className="py-4 px-5 w-12">ID</th>
                <th className="py-4 px-5 w-24">Banner</th>
                <th className="py-4 px-5">Brand Name</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Description</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/5 text-xs">
              {brands.filter((brand) => brand.status === currentStatusTab).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">No {currentStatusTab.toLowerCase()} brands found.</td>
                </tr>
              ) : (
                brands
                  .filter((brand) => brand.status === currentStatusTab)
                  .map((brand, index) => (
                  <tr key={brand.id} className="hover:bg-[#d4af37]/5 transition-all duration-200 group">
                    <td className="py-3.5 px-5 font-medium text-[#2A0812]/60">{index + 1}</td>
                    <td className="py-3 px-5">
                      {brand.banner_image ? (
                        <div className="w-12 h-12 rounded-xl border border-[#d4af37]/20 overflow-hidden bg-[#faf6f0] shadow-sm group-hover:shadow-md transition-shadow">
                          <img src={brand.banner_image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl border border-[#d4af37]/20 bg-[#faf6f0] flex items-center justify-center text-[#d4af37]/40">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#2A0812] text-sm">{brand.name}</td>
                    <td className="py-3.5 px-5 text-gray-600 text-sm font-medium">
                      {categories.find(c => c.id === brand.category_id)?.name || <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 max-w-xs truncate">{brand.description}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${
                        brand.status === 'Active' || brand.status === 'active'
                          ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white border-[#2A0812] shadow-sm'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {brand.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex justify-center space-x-3 text-gray-400">
                        <button onClick={() => handleViewClick(brand)} className="hover:text-[#d4af37] transition-colors p-1.5 rounded-lg hover:bg-[#d4af37]/10"><Eye size={16} className="stroke-[2]" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CREATE BRAND MODAL */}
        {showMasterAddOverlay && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-[#2A0812]/60 backdrop-blur-md p-4">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-xl rounded-3xl shadow-2xl shadow-[#2A0812]/30 flex flex-col overflow-hidden max-h-[90vh] border border-[#d4af37]/20">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-8 py-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#faf6f0]/50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-[#2A0812] font-serif">Create Brand</h2>
                  <p className="text-xs text-[#d4af37]/70 mt-1 tracking-wide">Fill in the details to create a new brand entry</p>
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
                      <Layers size={15} />
                    </div>
                    <span className="font-semibold text-sm text-[#2A0812]">Details</span>
                  </div>
                  <div className="text-[#d4af37]/30 text-lg font-light">→</div>
                  <div className={`flex items-center gap-3 transition-opacity duration-300 ${activeSubStep === 'banner' ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${activeSubStep === 'banner' ? 'bg-gradient-to-r from-[#2A0812] to-[#4a1830] border-[#2A0812] text-white shadow-md shadow-[#2A0812]/20' : 'border-[#d4af37]/30 text-[#d4af37]/50'}`}>
                      <ImageIcon size={15} />
                    </div>
                    <span className="font-semibold text-sm text-[#2A0812]">Banner</span>
                  </div>
                </div>
                {activeSubStep === 'details' && (
                  <form onSubmit={handleNextSubStep} className="text-black text-sm">
                    <div className="mb-5">
                      <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Brand Name</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. , Ellamae Brands" className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm" />
                    </div>
                    <div className="mb-5">
                      <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Description</label>
                      <textarea rows={4} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Write a short brand description..." className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium resize-none text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm" />
                    </div>
                    <div className="mb-5">
                      <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Category Association</label>
                      <select value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm">
                        <option value="">Select Category (Optional)</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-8">
                      <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Initial Status</label>
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex justify-end border-t border-[#d4af37]/10 pt-6 gap-3">
                      <button type="button" onClick={() => setShowMasterAddOverlay(false)} className="px-6 py-3 border border-[#d4af37]/20 text-gray-600 hover:border-[#d4af37] hover:text-[#2A0812] font-semibold rounded-xl transition-all text-sm">Cancel</button>
                      <button type="submit" className="px-7 py-3 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#2A0812]/20 transition-all text-sm border border-[#d4af37]/20">Next →</button>
                    </div>
                  </form>
                )}

                {activeSubStep === 'banner' && (
                  <div className="text-black">
                    <label className="block cursor-pointer mb-6">
                      <input type="file" accept="image/*" onChange={handleNewBannerUpload} className="hidden" />
                      <div className="border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37] p-12 rounded-2xl flex flex-col items-center bg-gradient-to-br from-[#faf6f0]/50 to-white hover:from-[#faf6f0] hover:to-white transition-all duration-300">
                        <Upload size={36} className="text-[#d4af37]/60 mb-4" />
                        <span className="font-semibold text-sm text-[#2A0812]">Click to upload brand banner</span>
                        <span className="text-xs text-[#d4af37]/60 mt-2">PNG, JPG up to 5MB</span>
                      </div>
                    </label>

                    <span className="block font-semibold mb-4 text-sm text-[#2A0812]">Preview</span>
                    <div className="border border-[#d4af37]/15 rounded-2xl p-5 bg-gradient-to-br from-[#faf6f0]/30 to-white mb-8 min-h-[140px] flex items-center justify-center">
                      {newImageString ? (
                        <div className="w-32 aspect-square border border-[#d4af37]/20 rounded-xl overflow-hidden bg-white shadow-md">
                          <img src={newImageString} alt="preview asset" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-[#d4af37]/40 text-sm">No image selected</span>
                      )}
                    </div>

                    <div className="flex justify-end border-t border-[#d4af37]/10 pt-6 gap-3">
                      <button type="button" onClick={() => setActiveSubStep('details')} className="px-6 py-3 border border-[#d4af37]/20 text-gray-600 hover:border-[#d4af37] hover:text-[#2A0812] font-semibold rounded-xl transition-all text-sm">← Back</button>
                      <button type="button" onClick={handleFinalBrandSubmit} className="px-7 py-3 bg-gradient-to-r from-[#2A0812] to-[#4a1830] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#2A0812]/20 transition-all text-sm flex items-center gap-2 border border-[#d4af37]/20">
                        <CheckCircle size={16} className="text-[#d4af37]" /> Save Brand
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDIT/VIEW BRAND MODAL */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-[#2A0812]/60 backdrop-blur-md p-4">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-4xl rounded-3xl shadow-2xl shadow-[#2A0812]/30 flex flex-col overflow-hidden max-h-[90vh] border border-[#d4af37]/20">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-8 py-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#faf6f0]/50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-[#2A0812] font-serif">Edit Brand</h2>
                  <p className="text-xs text-[#d4af37]/70 mt-1 tracking-wide">Update brand details and banner image</p>
                </div>
                <button type="button" onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-[#2A0812] transition-colors p-2 rounded-lg hover:bg-[#d4af37]/10">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                  {/* Left — Banner */}
                  <div>
                    <span className="block font-semibold text-xs uppercase tracking-wider text-[#2A0812]/70 mb-4">Brand Banner</span>
                    <div className="border border-[#d4af37]/15 rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br from-[#faf6f0]/30 to-white mb-5 flex items-center justify-center">
                      {editImageString ? (
                        <img src={editImageString} alt="Active Brand Banner" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center text-[#d4af37]/40">
                          <ImageIcon size={40} className="mx-auto mb-3" />
                          <span className="text-sm">No banner uploaded</span>
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37] rounded-2xl p-5 flex flex-col items-center justify-center bg-gradient-to-br from-[#faf6f0]/50 to-white hover:from-[#faf6f0] hover:to-white transition-all duration-300">
                      <input type="file" accept="image/*" onChange={handleEditBannerUpload} className="hidden" />
                      <Upload size={24} className="text-[#d4af37]/60 mb-2" />
                      <span className="text-xs font-semibold text-[#2A0812]">Replace Banner</span>
                    </label>
                  </div>

                  {/* Right — Form */}
                  <div>
                    <form onSubmit={handleUpdateBrandSubmit} className="flex flex-col text-black text-sm h-full">
                      <div className="mb-5">
                        <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Brand Name</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all" />
                      </div>

                      <div className="mb-5">
                        <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Description</label>
                        <textarea rows={5} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-[#faf6f0]/50 focus:bg-white font-medium resize-none text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all" />
                      </div>

                      <div className="mb-5">
                        <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Category Association</label>
                        <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all text-sm">
                          <option value="">Select Category (Optional)</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-8">
                        <label className="block font-semibold mb-2 text-xs uppercase tracking-wider text-[#2A0812]/70">Status</label>
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-4 border border-[#d4af37]/20 rounded-xl bg-white font-medium text-[#2A0812] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
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