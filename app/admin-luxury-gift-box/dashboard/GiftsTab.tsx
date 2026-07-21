'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, Upload, FileText, Image as ImageIcon, CheckCircle, X } from 'lucide-react';

export default function GiftsManagement() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStatusTab, setCurrentStatusTab] = useState<'Active' | 'Inactive'>('Active');
  
  // Dynamic Master Overlay Form Navigation Setup
  const [showMasterAddOverlay, setShowMasterAddOverlay] = useState(false);
  const [activeSubStep, setActiveSubStep] = useState<'details' | 'images'>('details');

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any | null>(null);

  // Form states for creating a new gift hampering product item
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStacks, setNewStacks] = useState('0');
  const [newStatus, setNewStatus] = useState('Active');
  const [newImageStrings, setNewImageStrings] = useState<string[]>([]);

  // Edit form properties states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStacks, setEditStacks] = useState('0');
  const [editStatus, setEditStatus] = useState('Active');
  const [editImageStrings, setEditImageStrings] = useState<string[]>([]);

  const PHP_GIFTS_API = 'http://localhost/luxury-backend/manage-gifts.php';
  const PHP_CATEGORIES_API = 'http://localhost/luxury-backend/manage-categories.php';
  const NEXT_GIFTS_API = '/api/gifts';
  const NEXT_CATEGORIES_API = '/api/categories';

  // 1. DYNAMIC CATEGORIES RETRIEVAL HOOK
  const fetchLiveCategories = async () => {
    try {
      let res = await fetch(NEXT_CATEGORIES_API).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(PHP_CATEGORIES_API);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) {
          setNewCategoryId(String(data[0].id));
        }
      }
    } catch (err) {
      console.error("Failed parsing relational parent categories:", err);
    }
  };

  // 2. READ / SEARCH GIFTS WITH BACKEND INTEGRATION 
  const fetchGiftsFromServer = async (search = "") => {
    try {
      let url = `${NEXT_GIFTS_API}?status=all`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      let response = await fetch(url).catch(() => null);
      if (!response || !response.ok) {
        let fallbackUrl = `${PHP_GIFTS_API}?status=all`;
        if (search) fallbackUrl += `&search=${encodeURIComponent(search)}`;
        response = await fetch(fallbackUrl);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setGifts(data);
      }
    } catch (error) {
      console.error("Backend parsing active protection logs exception:", error);
    }
  };

  useEffect(() => {
    fetchLiveCategories();
    fetchGiftsFromServer();
  }, []);

  const handleNextSubStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return alert('Please input Product Name');
    if (!newCategoryId) return alert('A valid category selector choice is mandatory');
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

    try {
      const payload = {
        action: 'CREATE',
        category_id: Number(newCategoryId),
        title: newName,
        price: Number(newPrice) || 0,
        stacks: Number(newStacks) || 0,
        description: newDescription,
        status: newStatus,
        images: newImageStrings
      };
      let response = await fetch(NEXT_GIFTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!response || !response.ok) {
        response = await fetch(PHP_GIFTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        return alert(`Server Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        // Clear all input states
        setNewName(''); setNewDescription(''); setNewPrice(''); setNewStacks('0'); setNewImageStrings([]);
        setActiveSubStep('details');
        
        // Exit structural form overlay workspace panel section mapping 
        setShowMasterAddOverlay(false);
        
        // Instantly reload active views data streams
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
    setEditCategoryId(String(gift.category_id || (categories.length > 0 ? categories[0].id : '1')));
    setEditPrice(String(gift.price));
    setEditStacks(String(gift.stacks !== undefined && gift.stacks !== null ? gift.stacks : (gift.stack !== undefined ? gift.stack : 0)));
    setEditStatus(gift.status);
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

    try {
      const payload = {
        action: 'UPDATE',
        id: selectedGift.id,
        category_id: Number(editCategoryId) || (categories.length > 0 ? Number(categories[0].id) : 1),
        title: editName,
        price: Number(editPrice) || 0,
        stacks: Number(editStacks) || 0,
        description: editDescription,
        status: editStatus,
        images: editImageStrings
      };
      let response = await fetch(NEXT_GIFTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!response || !response.ok) {
        response = await fetch(PHP_GIFTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

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
      const payload = { action: 'DELETE', id: id };
      let response = await fetch(NEXT_GIFTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!response || !response.ok) {
        response = await fetch(PHP_GIFTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

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
    <div className="flex min-h-screen bg-white text-black font-sans">
      <main className="flex-1 p-8 overflow-x-hidden relative">
        {/* Header Content */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-wide text-gray-900 font-bold">Gifts</h1>
            <p className="text-sm text-gray-500 mt-1">Manage luxury gift items synced live with server schema tracking</p>
          </div>
          <button 
            onClick={() => { setActiveSubStep('details'); setShowMasterAddOverlay(true); }}
            className="flex items-center space-x-2 bg-white border border-black text-black px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition-all font-bold text-sm"
          >
            <Plus size={16} className="text-black stroke-[3]" />
            <span className="text-black font-bold">Add Gift</span>
          </button>
        </div>

        {/* Status Toggle Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrentStatusTab('Active')}
            className={`px-4 py-2 text-xs font-bold rounded border transition-all ${
              currentStatusTab === 'Active'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setCurrentStatusTab('Inactive')}
            className={`px-4 py-2 text-xs font-bold rounded border transition-all ${
              currentStatusTab === 'Inactive'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Dynamic Context Search Element */}
        <div className="relative max-w-md mb-6 flex items-center">
          <Search size={16} className="text-gray-500 absolute left-3 z-10 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Title, Description or Unique ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchGiftsFromServer(e.target.value);
            }}
            className="w-full bg-gray-50 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black text-black font-bold placeholder-gray-400 pl-10 pr-4 py-2"
          />
        </div>

        {/* Main Data Presentation Layout Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold tracking-wider uppercase">
                <th className="py-4 px-4 w-28 text-black font-bold">Unique ID</th>
                <th className="py-4 px-4 w-20 text-black font-bold">Image</th>
                <th className="py-4 px-4 text-black font-bold">Product Title</th>
                <th className="py-4 px-4 text-black font-bold">Description Specifications</th>
                <th className="py-4 px-4 text-black font-bold">Price</th>
                <th className="py-4 px-4 text-black font-bold">Stacks</th>
                <th className="py-4 px-4 text-black font-bold">Status</th>
                <th className="py-4 px-4 text-center text-black font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {gifts.filter((gift) => gift.status === currentStatusTab).length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-400">No {currentStatusTab.toLowerCase()} tracking records matches current index criteria.</td>
                </tr>
              ) : (
                gifts
                  .filter((gift) => gift.status === currentStatusTab)
                  .map((gift) => {
                    const primaryImage = (() => {
                      if (Array.isArray(gift.images) && gift.images.length > 0 && gift.images[0]) return gift.images[0];
                      if (typeof gift.images === 'string' && gift.images.trim().startsWith('[')) {
                        try {
                          const parsed = JSON.parse(gift.images);
                          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                        } catch (e) {}
                      }
                      if (typeof gift.images === 'string' && gift.images.length > 0) return gift.images;
                      if (typeof gift.image === 'string' && gift.image.length > 0) return gift.image;
                      if (typeof gift.image_path === 'string' && gift.image_path.length > 0) return gift.image_path;
                      if (typeof gift.main_image === 'string' && gift.main_image.length > 0) return gift.main_image;
                      return null;
                    })();

                    const stackCount = gift.stacks !== undefined && gift.stacks !== null 
                      ? gift.stacks 
                      : (gift.stack !== undefined && gift.stack !== null ? gift.stack : 0);

                    return (
                      <tr key={gift.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Displays dynamically generated ELLAMAE prefix string tags */}
                        <td className="py-4 px-4 font-bold text-gray-900 tracking-wider">{gift.display_id || `ELLAMAE${gift.id}`}</td>
                        <td className="py-2 px-4">
                          {primaryImage ? (
                            <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50">
                              <img src={primaryImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-950">{gift.title}</td>
                        <td className="py-4 px-4 text-gray-700 font-medium max-w-xs truncate">{gift.description}</td>
                        <td className="py-4 px-4 font-bold text-gray-950">₹{gift.price}</td>
                        <td className="py-4 px-4 font-bold text-gray-950">{stackCount}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            gift.status === 'Active' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}>
                            {gift.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center space-x-3 text-black">
                            <button onClick={() => handleViewClick(gift)} className="hover:text-amber-600 transition-colors"><Eye size={16} className="stroke-[2.5]" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* WORKSPACE OVERLAY FORM SECTION */}
        {showMasterAddOverlay && (
          <div className="absolute inset-0 z-50 flex flex-col bg-white">
            <div className="flex justify-between items-center px-10 py-6 border-b border-gray-200 relative">
              <div>
                <h2 className="font-serif text-2xl font-bold text-black">Create Luxury Asset Component</h2>
                <p className="text-xs text-gray-500">Fill configurations logs to insert into server data</p>
              </div>
              <button type="button" onClick={() => setShowMasterAddOverlay(false)} className="border border-black bg-transparent px-4 py-2 rounded font-bold text-xs cursor-pointer hover:bg-gray-50">Exit ✕</button>
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-8 bg-gray-50 border border-gray-200 p-4 rounded-md mb-8">
                  <div className={`flex items-center gap-2.5 ${activeSubStep === 'details' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs ${activeSubStep === 'details' ? 'bg-black text-white' : 'text-black'}`}><FileText size={12} /></div>
                    <span className="font-bold text-xs text-black">1. Gift Specifications</span>
                  </div>
                  <div className="text-gray-400 font-bold">➔</div>
                  <div className={`flex items-center gap-2.5 ${activeSubStep === 'images' ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs ${activeSubStep === 'images' ? 'bg-black text-white' : 'text-black'}`}><ImageIcon size={12} /></div>
                    <span className="font-bold text-xs text-black">2. Visual Portfolio</span>
                  </div>
                </div>

                {activeSubStep === 'details' && (
                  <form onSubmit={handleNextSubStep} className="text-black text-sm">
                    <div className="mb-5">
                      <label className="block font-bold mb-1">Product Title Name</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter Product Name" className="w-full p-2.5 border border-black rounded font-bold text-black" />
                    </div>

                    <div className="mb-5">
                      <label className="block font-bold mb-1">Product Description / Specifications</label>
                      <textarea rows={4} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Write overview layout logs description..." className="w-full p-2.5 border border-black rounded font-bold resize-none text-black" />
                    </div>

                    <div className="mb-5">
                      <label className="block font-bold mb-1">Relational Category Assignment</label>
                      <select value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="w-full p-2.5 border border-black rounded font-bold bg-white text-black">
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-10">
                      <div>
                        <label className="block font-bold mb-1">Retail Price (₹)</label>
                        <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Amount (₹)" className="w-full p-2.5 border border-black rounded font-bold text-black" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Stacks</label>
                        <input type="number" value={newStacks} onChange={(e) => setNewStacks(e.target.value)} placeholder="Stacks count" className="w-full p-2.5 border border-black rounded font-bold text-black" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Initial Status</label>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full p-2.5 border border-black rounded font-bold bg-white text-black">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-200 pt-6 gap-4">
                      <button type="button" onClick={() => setShowMasterAddOverlay(false)} className="px-6 py-3 border border-black bg-white font-bold rounded">Cancel</button>
                      <button type="submit" className="px-8 py-3 bg-black text-white font-bold rounded uppercase text-xs tracking-wider">Next step</button>
                    </div>
                  </form>
                )}

                {activeSubStep === 'images' && (
                  <div className="text-black">
                    <label className="block cursor-pointer mb-6">
                      <input type="file" accept="image/*" multiple onChange={handleRealImageUpload} className="hidden" />
                      <div className="border-2 border-dashed border-black p-12 rounded-md flex flex-col items-center bg-gray-50 hover:bg-gray-100/70">
                        <Upload size={36} className="text-black mb-3" />
                        <span className="font-bold text-sm">Select Product Image Files (Multiple)</span>
                      </div>
                    </label>

                    <span className="block font-bold mb-4 text-sm">Asset Preview Portfolio ({newImageStrings.length} selected)</span>
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mb-10 min-h-[140px]">
                      {newImageStrings.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4">
                          {newImageStrings.map((imgStr, idx) => (
                            <div key={idx} className="relative aspect-square border border-black rounded overflow-hidden group bg-white">
                              <img src={imgStr} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewImageStrings(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center min-h-[108px] text-gray-400">
                          <span className="text-xs">No media portfolio assets selected yet</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end border-t border-gray-200 pt-6 gap-4">
                      <button type="button" onClick={() => setActiveSubStep('details')} className="px-6 py-3 border border-black bg-white font-bold rounded">← Back</button>
                      <button type="button" onClick={handleFinalGiftSubmit} className="px-8 py-3 bg-black text-white font-bold rounded uppercase flex items-center gap-2 text-xs">
                        <CheckCircle size={14} /> Save Product
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW + DYNAMIC SPECIFICATIONS EDITS LAYER CONTAINER */}
        {showPreviewModal && (
          <div className="absolute inset-0 z-50 flex flex-col bg-white">
            <div className="flex justify-between items-center px-10 py-6 border-b border-gray-200 relative">
              <div>
                <h2 className="font-serif text-2xl font-bold text-black">Manage Gift Asset Configs</h2>
                <p className="text-xs text-gray-500">Update metrics and configurations values parameters</p>
              </div>
              <button type="button" onClick={() => setShowPreviewModal(false)} className="border border-black bg-transparent px-4 py-2 rounded font-bold text-xs cursor-pointer hover:bg-gray-50">Exit ✕</button>
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Visual View Display Layout Container */}
                <div>
                  <span className="block font-bold text-black mb-3 uppercase text-xs tracking-wider">Product Layout Assets ({editImageStrings.length} total)</span>
                  <div className="border border-black rounded-md p-4 bg-gray-50 mb-5 min-h-[200px]">
                    {editImageStrings.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {editImageStrings.map((imgStr, idx) => (
                          <div key={idx} className="relative aspect-square border border-gray-300 rounded overflow-hidden group bg-white">
                            <img src={imgStr} alt="thumbnail" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditImageStrings(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[168px] text-gray-400">
                        <ImageIcon size={40} className="mx-auto mb-2" />
                        <span className="text-xs">No Asset Graphics Found</span>
                      </div>
                    )}
                  </div>

                  <label className="cursor-pointer border border-dashed border-black rounded p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all">
                    <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="hidden" />
                    <Upload size={18} className="text-black mb-1" />
                    <span className="text-xs font-bold">Add Additional Product Asset Graphics</span>
                  </label>
                </div>

                {/* Form Configurations Fields Module Layer */}
                <div>
                  <form onSubmit={handleUpdateGiftSubmit} className="flex flex-col text-black text-sm h-full">
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block font-bold mb-1">Product Identity Title</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Parent Category Map</label>
                        <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold bg-white">
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block font-bold mb-1">Detailed Item Specifications</label>
                      <textarea rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold resize-none" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div>
                        <label className="block font-bold mb-1">Price Matrix (₹)</label>
                        <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Stacks</label>
                        <input type="number" value={editStacks} onChange={(e) => setEditStacks(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Status Mode Log</label>
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-2.5 border border-gray-400 rounded font-bold bg-white">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
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
}