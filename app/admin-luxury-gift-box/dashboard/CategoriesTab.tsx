'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, Layers, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
const API_URL = "/api/categories";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Overlay & Modal Setup
  const [showMasterAddOverlay, setShowMasterAddOverlay] = useState(false);
  const [activeSubStep, setActiveSubStep] = useState<'details' | 'banner'>('details');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Form states for creating a new category
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  const [newImageString, setNewImageString] = useState(''); 

  // Form states for viewing/editing inside overlay
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editImageString, setEditImageString] = useState('');


  // 1. READ & DYNAMIC SEARCH PIPELINE
  const fetchCategories = async (search = "") => {
    try {
      let url = API_URL;
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed fetching categories from database schema:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNextSubStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return alert('Please enter a Category Name');
    setActiveSubStep('banner');
  };

  // Converts uploaded binary asset signatures clean to standard base64 strings
  const handleRealBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewImageString(reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleEditBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditImageString(reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // 2. CREATE CATEGORY ROUTINE (SAVE & EXIT)
  const handleFinalCategorySubmit = async () => {
    if (!newName.trim()) return alert('Category Name is required');
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          name: newName,
          description: newDescription,
          status: newStatus,
          banner_image: newImageString
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        return alert(`Server Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === "success") {
        // Clear all form input hooks
        setNewName("");
        setNewDescription("");
        setNewStatus("Active");
        setNewImageString("");
        setActiveSubStep("details");
        
        // EXIT insertion segment view overlay panel panel
        setShowMasterAddOverlay(false);
        
        // Re-fetch list to render dynamically in the interface
        fetchCategories(searchTerm);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Data insertion flow crash logs:", error);
      alert("Error saving category. Please verify your connection or check console logs.");
    }
  };

  const handleViewClick = (category: any) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditDescription(category.description);
    setEditStatus(category.status);
    setEditImageString(category.banner_image || "");
    setShowPreviewModal(true);
  };

  // 3. UPDATE CATEGORY SPECIFICATIONS LOGS
  const handleUpdateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE",
          id: selectedCategory.id,
          name: editName,
          description: editDescription,
          status: editStatus,
          banner_image: editImageString
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        return alert(`Server Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === "success") {
        setShowPreviewModal(false);
        fetchCategories(searchTerm);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Data update stream crash:", error);
    }
  };

  // 4. ISOLATED TARGETED DELETIONS (ONLY DROPS REQUESTED TARGET)
  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you positive you want to completely discard this isolated category entry?")) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE",
          id
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        return alert(`Server Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === "success") {
        setShowPreviewModal(false);
        fetchCategories(searchTerm);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Decoupled deletion action error trace:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-black font-sans">
      <main className="flex-1 p-8 overflow-x-hidden relative">
        {/* Header Block Layout */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-wide text-gray-900 font-bold">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track structural store classifications live from server schema</p>
          </div>
          <button 
            onClick={() => { setActiveSubStep('details'); setShowMasterAddOverlay(true); }}
            className="flex items-center space-x-2 bg-white border border-black text-black px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition-all font-bold text-sm"
          >
            <Plus size={16} className="text-black stroke-[3]" />
            <span className="text-black font-bold">Add Category</span>
          </button>
        </div>

        {/* Live Search Trigger Filter Input Box */}
        <div className="relative max-w-md mb-6 flex items-center">
          <Search size={16} className="text-gray-500 absolute left-3 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Category by Title name parameters..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchCategories(e.target.value);
            }}
            className="w-full bg-gray-50 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black text-black font-bold placeholder-gray-400 pl-10 pr-4 py-2"
          />
        </div>

        {/* Dynamic Matrix Data Table Rendering Element */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold tracking-wider uppercase">
                <th className="py-4 px-4 w-12 text-black font-bold">ID</th>
                <th className="py-4 px-4 w-20 text-black font-bold">Banner</th>
                <th className="py-4 px-4 text-black font-bold">Category Name</th>
                <th className="py-4 px-4 text-black font-bold">Description</th>
                <th className="py-4 px-4 text-black font-bold">Status</th>
                <th className="py-4 px-4 text-center text-black font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-400">No category parameters found inside active database indexes.</td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-900">{index + 1}</td>
                    <td className="py-2 px-4">
                      {category.banner_image ? (
                        <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={category.banner_image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-950">{category.name}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium max-w-xs truncate">{category.description}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                        category.status === 'Active' || category.status === 'active' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-3 text-black">
                        <button onClick={() => handleViewClick(category)} className="hover:text-amber-600 transition-colors"><Eye size={16} className="stroke-[2.5]" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CREATE CATEGORY FULL-SCREEN WORKSPACE OVERLAY */}
        {showMasterAddOverlay && (
          <div className="absolute inset-0 z-50 flex flex-col bg-white">
            <div className="flex justify-between items-center px-10 py-6 border-b border-gray-200 relative">
              <div>
                <h2 className="font-serif text-2xl font-bold text-black">Create Category Component</h2>
                <p className="text-xs text-gray-500">Fill configurations logs to insert into server data</p>
              </div>
              <button type="button" onClick={() => setShowMasterAddOverlay(false)} className="border border-black bg-transparent px-4 py-2 rounded font-bold text-xs cursor-pointer hover:bg-gray-50">Exit ✕</button>
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-8 bg-gray-50 border border-gray-200 p-4 rounded-md mb-8">
                  <div className={`flex items-center gap-2.5 ${activeSubStep === 'details' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs ${activeSubStep === 'details' ? 'bg-black text-white' : 'text-black'}`}><Layers size={12} /></div>
                    <span className="font-bold text-xs text-black">1. Category Specifications</span>
                  </div>
                  <div className="text-gray-400 font-bold">➔</div>
                  <div className={`flex items-center gap-2.5 ${activeSubStep === 'banner' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs ${activeSubStep === 'banner' ? 'bg-black text-white' : 'text-black'}`}><ImageIcon size={12} /></div>
                    <span className="font-bold text-xs text-black">2. Category Banner Portfolio</span>
                  </div>
                </div>

                {activeSubStep === 'details' && (
                  <form onSubmit={handleNextSubStep} className="text-black text-sm">
                    <div className="mb-5">
                      <label className="block font-bold mb-1">Category Name</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter Category Name" className="w-full p-2.5 border border-black rounded color-black font-bold text-black" />
                    </div>
                    <div className="mb-5">
                      <label className="block font-bold mb-1">Category Description</label>
                      <textarea rows={4} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Write description overview parameters configuration..." className="w-full p-2.5 border border-black rounded color-black font-bold resize-none text-black" />
                    </div>
                    <div className="mb-10">
                      <label className="block font-bold mb-1">Initial Status</label>
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full p-2.5 border border-black rounded color-black font-bold bg-white text-black">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex justify-end border-t border-gray-200 pt-6 gap-4">
                      <button type="button" onClick={() => setShowMasterAddOverlay(false)} className="px-6 py-3 border border-black bg-white font-bold rounded">Cancel</button>
                      <button type="submit" className="px-8 py-3 bg-black text-white font-bold rounded uppercase tracking-wider text-xs">Next step</button>
                    </div>
                  </form>
                )}

                {activeSubStep === 'banner' && (
                  <div className="text-black">
                    <label className="block cursor-pointer mb-6">
                      <input type="file" accept="image/*" onChange={handleRealBannerUpload} className="hidden" />
                      <div className="border-2 dashed border-black p-12 rounded-md flex flex-col items-center bg-gray-50 hover:bg-gray-100/70 transition-all">
                        <Upload size={36} className="text-black mb-3" />
                        <span className="font-bold text-sm">Choose Category Banner Image File</span>
                      </div>
                    </label>

                    <span className="block font-bold mb-4 text-sm">Selected Banner Image Preview</span>
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mb-10 min-h-[120px] flex items-center justify-center">
                      {newImageString ? (
                        <div className="w-32 aspect-square border border-black rounded overflow-hidden bg-white">
                          <img src={newImageString} alt="preview asset" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No banner graphic item mapped yet</span>
                      )}
                    </div>

                    <div className="flex justify-end border-t border-gray-200 pt-6 gap-4">
                      <button type="button" onClick={() => setActiveSubStep('details')} className="px-6 py-3 border border-black bg-white font-bold rounded">← Back</button>
                      <button type="button" onClick={handleFinalCategorySubmit} className="px-8 py-3 bg-black text-white font-bold rounded uppercase flex items-center gap-2 text-xs">
                        <CheckCircle size={14} /> Save Component
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW + DIRECT EDIT LIVE OVERLAY CONTAINER */}
        {showPreviewModal && (
          <div className="absolute inset-0 z-50 flex flex-col bg-white">
            <div className="flex justify-between items-center px-10 py-6 border-b border-gray-200 relative">
              <div>
                <h2 className="font-serif text-2xl font-bold text-black">Manage Category Asset Configs</h2>
                <p className="text-xs text-gray-500">Update hierarchy metrics and active log specifications</p>
              </div>
              <button type="button" onClick={() => setShowPreviewModal(false)} className="border border-black bg-transparent px-4 py-2 rounded font-bold text-xs cursor-pointer hover:bg-gray-50">Exit ✕</button>
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Left Block Side Image Graphics Display Container */}
                <div>
                  <span className="block font-bold text-black mb-3 uppercase text-xs tracking-wider">Category Banner Layout</span>
                  <div className="border border-black rounded-md overflow-hidden aspect-[16/10] bg-gray-50 mb-5 flex items-center justify-center">
                    {editImageString ? (
                      <img src={editImageString} alt="Active Layout Grid Asset" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon size={40} className="mx-auto mb-2" />
                        <span className="text-xs">No Active Banner Layout Rendered</span>
                      </div>
                    )}
                  </div>

                  <label className="cursor-pointer border border-dashed border-black rounded p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all">
                    <input type="file" accept="image/*" onChange={handleEditBannerUpload} className="hidden" />
                    <Upload size={18} className="text-black mb-1" />
                    <span className="text-xs font-bold">Replace Banner Image</span>
                  </label>
                </div>

                {/* Right Block Side Form Content Component */}
                <div>
                  <form onSubmit={handleUpdateCategorySubmit} className="flex flex-col text-black text-sm h-full">
                    <div className="mb-5">
                      <label className="block font-bold mb-1">Category Hierarchy Name</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold text-black" />
                    </div>

                    <div className="mb-5">
                      <label className="block font-bold mb-1">Category Specifications / Description Overview</label>
                      <textarea rows={5} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold resize-none text-black" />
                    </div>

                    <div className="mb-8">
                      <label className="block font-bold mb-1">Hierarchy Status Log</label>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold bg-white text-black">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-5 border-t border-gray-200 mt-auto gap-4">
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setShowPreviewModal(false)} className="px-6 py-3 border border-black bg-white font-bold rounded">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-black text-white font-bold rounded hover:bg-gray-900 transition-all">Update Changes</button>
                      </div>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}-0