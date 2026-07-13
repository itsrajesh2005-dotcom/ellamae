'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, Upload, FileText, Image as ImageIcon, CheckCircle, Gift, Tags, X } from 'lucide-react';

const initialGifts = [
  { id: 1, name: 'Royal Watch Gift Set', description: 'Luxury watch with premium packaging', category: 'Birthday Gifts', price: '5499', stock: '25', bestSeller: 'Yes', status: 'Active', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'] },
  { id: 2, name: 'Perfume Gift Box', description: 'Premium perfume for special moments', category: 'Anniversary Gifts', price: '2999', stock: '40', bestSeller: 'No', status: 'Active', images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80'] },
  { id: 3, name: 'Leather Wallet Gift Set', description: 'Genuine leather wallet & keychain', category: 'Corporate Gifts', price: '1799', stock: '60', bestSeller: 'Yes', status: 'Inactive', images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80'] },
];

export default function GiftsManagement() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dynamic Single Master Full Page Overlay Navigation Setup
  const [showMasterAddOverlay, setShowMasterAddOverlay] = useState(false);
  const [activeSubStep, setActiveSubStep] = useState<'details' | 'images'>('details');

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditDeleteModal, setShowEditDeleteModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any | null>(null);

  // Form states for creating new gift
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Birthday Gifts');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newBestSeller, setNewBestSeller] = useState('Yes');
  const [newStatus, setNewStatus] = useState('Active');
  const [newImages, setNewImages] = useState<string[]>([]);

  // Edit form states (Used inside the View/Edit Master Modal)
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editBestSeller, setEditBestSeller] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // ==================== BACKEND INTEGRATION INTEGRITY PIPELINE ====================
  
  const fetchGiftsFromServer = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/luxury-backend/manage-gifts.php');
      const rawText = await response.text();

      let cleanJsonText = rawText.trim();
      if (cleanJsonText.includes('<br />') || cleanJsonText.includes('<b>')) {
        console.warn("Backend dynamic notice or warnings intercepted: ", cleanJsonText);
        const jsonStartIndex = cleanJsonText.indexOf('[');
        const jsonStartObjIndex = cleanJsonText.indexOf('{');
        
        let targetIndex = -1;
        if (jsonStartIndex !== -1 && jsonStartObjIndex !== -1) {
          targetIndex = Math.min(jsonStartIndex, jsonStartObjIndex);
        } else {
          targetIndex = jsonStartIndex !== -1 ? jsonStartIndex : jsonStartObjIndex;
        }

        if (targetIndex !== -1) {
          cleanJsonText = cleanJsonText.substring(targetIndex);
        }
      }

      const data = JSON.parse(cleanJsonText);

      if (Array.isArray(data)) {
        const processedGifts = data.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          description: item.description,
          category: item.category || 'Birthday Gifts',
          price: String(item.price),
          stock: String(item.stock),
          bestSeller: item.best_seller || 'Yes',
          status: item.status,
          images: (() => {
            if (!item.images) {
              return ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80'];
            }
            try {
              const cleanedString = typeof item.images === 'string' ? item.images.trim() : JSON.stringify(item.images);
              return JSON.parse(cleanedString);
            } catch (e) {
              if (typeof item.images === 'string' && item.images.includes('http')) {
                const cleanUrl = item.images.replace(/[\[\]\\"]/g, '');
                return [cleanUrl];
              }
              return ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80'];
            }
          })()
        }));
        setGifts(processedGifts);
      } else {
        if(gifts.length === 0) setGifts(initialGifts);
      }
    } catch (error) {
      console.error("Backend parse breakdown protection fallback active logs:", error);
      if(gifts.length === 0) setGifts(initialGifts);
    }
  };

  useEffect(() => {
    fetchGiftsFromServer();
  }, []);

  // ===============================================================================

  const filteredGifts = gifts.filter(gift =>
    gift.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gift.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNextSubStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return alert('Please fill Product Name');
    setActiveSubStep('images');
  };

  const handleRealImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setNewImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setEditImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveEditImage = (indexToRemove: number) => {
    setEditImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFinalGiftSubmit = async () => {
    const imgPayload = newImages.length > 0 ? newImages : ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80'];
    
    // FIXED: Ensured unique local generation indexing to solve "Encountered two children with the same key"
    const nextLocalId = gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) + Date.now() : Date.now();
    
    const dbPayload = {
      action: 'CREATE',
      name: newName,
      description: newDescription,
      category: newCategory,
      price: newPrice,
      stock: newStock,
      best_seller: newBestSeller,
      status: newStatus,
      images: JSON.stringify(imgPayload)
    };

    const newGiftObject = {
      id: nextLocalId,
      name: newName,
      description: newDescription,
      category: newCategory,
      price: newPrice,
      stock: newStock,
      bestSeller: newBestSeller,
      status: newStatus,
      images: imgPayload
    };

    // FIXED: Active local state injection strategy to make UI instant even if fetch connection fails or errors out
    setGifts(prevGifts => [newGiftObject, ...prevGifts]);

    try {
      await fetch('http://127.0.0.1:8080/luxury-backend/manage-gifts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
      alert("Gift Product Created Successfully!");
    } catch (err) {
      console.warn("Connecting backend network breakdown fallback protection:", err);
    }
    
    setNewName(''); setNewDescription(''); setNewPrice(''); setNewStock(''); setNewImages([]);
    setActiveSubStep('details');
    setShowMasterAddOverlay(false);
    
    setTimeout(() => {
      fetchGiftsFromServer();
    }, 600);
  };

  const handleViewClick = (gift: any) => {
    setSelectedGift(gift);
    setEditName(gift.name);
    setEditDescription(gift.description);
    setEditCategory(gift.category);
    setEditPrice(gift.price);
    setEditStock(gift.stock);
    setEditBestSeller(gift.bestSeller);
    setEditStatus(gift.status);
    setEditImages(gift.images || []);
    setActiveImageIndex(0);
    setShowPreviewModal(true);
  };

  const handleUpdateGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGift) return;

    const dbPayload = {
      action: 'UPDATE',
      id: selectedGift.id,
      name: editName,
      description: editDescription,
      category: editCategory,
      price: editPrice,
      stock: editStock,
      best_seller: editBestSeller,
      status: editStatus,
      images: JSON.stringify(editImages)
    };

    // FIXED: Immediate local storage array mutation map updates
    setGifts(prevGifts => prevGifts.map(g => 
      g.id === selectedGift.id 
        ? { ...g, name: editName, description: editDescription, category: editCategory, price: editPrice, stock: editStock, bestSeller: editBestSeller, status: editStatus, images: editImages }
        : g
    ));

    try {
      await fetch('http://127.0.0.1:8080/luxury-backend/manage-gifts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
      alert("Product Configuration Updated!");
    } catch (err) {
      console.warn("Network endpoint offline tracking error protection active:", err);
    }

    setShowEditDeleteModal(false);
    setShowPreviewModal(false);
    
    setTimeout(() => {
      fetchGiftsFromServer();
    }, 600);
  };

  const handleDeleteGift = async (id: number) => {
    // FIXED: Instant visual deletion filter execution so rows vanish without waiting for backend network response
    setGifts(prevGifts => prevGifts.filter(g => g.id !== id));

    const dbPayload = {
      action: 'DELETE',
      id: id
    };

    try {
      await fetch('http://127.0.0.1:8080/luxury-backend/manage-gifts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
    } catch (err) {
      console.warn("Network offline tracking protection logic:", err);
    }

    setShowEditDeleteModal(false);
    setShowPreviewModal(false);
    
    setTimeout(() => {
      fetchGiftsFromServer();
    }, 600);
  };

  return (
    <div className="flex min-h-screen bg-white text-black font-sans">
      <main className="flex-1 p-8 overflow-x-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-wide text-gray-900 font-bold">Gifts</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all gift products</p>
          </div>
          <button 
            onClick={() => { setActiveSubStep('details'); setShowMasterAddOverlay(true); }}
            className="flex items-center space-x-2 bg-white border border-black text-black px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition-all font-bold text-sm"
          >
            <Plus size={16} className="text-black stroke-[3]" />
            <span className="text-black font-bold">Add Gift</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative max-w-md mb-6 flex items-center" style={{ position: 'relative' }}>
          <Search size={16} className="text-gray-500" style={{ position: 'absolute', left: '12px', zIndex: 10, pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search Gift..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black text-black font-bold placeholder-gray-400"
            style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px' }}
          />
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold tracking-wider uppercase">
                <th className="py-4 px-4 w-12 text-black font-bold">ID</th>
                <th className="py-4 px-4 text-black font-bold">Product Name</th>
                <th className="py-4 px-4 text-black font-bold">Description</th>
                <th className="py-4 px-4 text-black font-bold">Category</th>
                <th className="py-4 px-4 text-black font-bold">Price</th>
                <th className="py-4 px-4 text-black font-bold">Stock</th>
                <th className="py-4 px-4 text-black font-bold">Best Seller</th>
                <th className="py-4 px-4 text-black font-bold">Status</th>
                <th className="py-4 px-4 text-center text-black font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredGifts.map((gift) => (
                <tr key={gift.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900">{gift.id}</td>
                  <td className="py-4 px-4 font-bold text-gray-950">{gift.name}</td>
                  <td className="py-4 px-4 text-gray-700 font-medium max-w-xs truncate">{gift.description}</td>
                  <td className="py-4 px-4 text-gray-900 font-medium">{gift.category}</td>
                  <td className="py-4 px-4 font-bold text-gray-950">₹{gift.price}</td>
                  <td className="py-4 px-4 text-gray-900 font-bold">{gift.stock}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${gift.bestSeller === 'Yes' ? 'bg-amber-100 text-black border border-amber-300' : 'bg-gray-100 text-gray-700'}`}>
                      {gift.bestSeller}
                    </span>
                  </td>
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
                      <button onClick={() => handleDeleteGift(gift.id)} className="hover:text-red-600 transition-colors"><Trash2 size={16} className="stroke-[2.5]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WORKSPACE OVERLAY PANEL */}
        {showMasterAddOverlay && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <h2 style={{ fontFamily: 'serif', fontSize: '22px', fontWeight: 'bold', color: '#000000' }}>Create Luxury Asset Component</h2>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Fill configurations logs to insert into server data</p>
              </div>
              <button type="button" onClick={() => setShowMasterAddOverlay(false)} style={{ border: '1px solid #000000', backgroundColor: 'transparent', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Exit ✕</button>
            </div>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '16px 24px', borderRadius: '6px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: activeSubStep === 'details' ? 1 : 0.5 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: activeSubStep === 'details' ? '#000000' : 'transparent', color: activeSubStep === 'details' ? '#ffffff' : '#000000', fontWeight: 'bold', fontSize: '11px' }}>
                      <FileText size={12} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', color: '#000000' }}>1. Gift Specifications</span>
                    </div>
                  </div>
                  <div style={{ color: '#9ca3af', fontWeight: 'bold' }}>➔</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: activeSubStep === 'images' ? 1 : 0.5 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: activeSubStep === 'images' ? '#000000' : 'transparent', color: activeSubStep === 'images' ? '#ffffff' : '#000000', fontWeight: 'bold', fontSize: '11px' }}>
                      <ImageIcon size={12} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', color: '#000000' }}>2. Visual Portfolio</span>
                    </div>
                  </div>
                </div>

                {activeSubStep === 'details' && (
                  <form onSubmit={handleNextSubStep} style={{ color: '#000000', fontSize: '13px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Product Name</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter Product Name" style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Product Description</label>
                      <textarea rows={4} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Write specification or description notes..." style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '4px', color: '#000000', fontWeight: 'bold', resize: 'none' }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Category</label>
                      <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '4px', color: '#000000', fontWeight: 'bold', backgroundColor: '#ffffff' }}>
                        <option value="Birthday Gifts">Birthday Gifts</option>
                        <option value="Anniversary Gifts">Anniversary Gifts</option>
                        <option value="Corporate Gifts">Corporate Gifts</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Price (₹)</label>
                        <input type="text" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Amount (₹)" style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Stock</label>
                        <input type="text" value={newStock} onChange={(e) => setNewStock(e.target.value)} placeholder="Count" style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '24px', gap: '16px' }}>
                      <button type="button" onClick={() => setShowMasterAddOverlay(false)} style={{ padding: '12px 24px', border: '1px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '4px' }}>Cancel</button>
                      <button type="submit" style={{ padding: '12px 32px', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next step</button>
                    </div>
                  </form>
                )}

                {activeSubStep === 'images' && (
                  <div style={{ color: '#000000' }}>
                    <label style={{ display: 'block', cursor: 'pointer', marginBottom: '24px' }}>
                      <input type="file" accept="image/*" multiple onChange={handleRealImageUpload} style={{ display: 'none' }} />
                      <div style={{ border: '2px dashed #000000', padding: '48px 24px', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                        <Upload size={36} style={{ color: '#000000', marginBottom: '12px' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#000000' }}>Choose Local Images</span>
                      </div>
                    </label>

                    <span style={{ display: 'block', fontWeight: 'bold', color: '#000000', marginBottom: '16px', fontSize: '14px' }}>Select Image</span>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', maxHeight: '280px', overflowY: 'auto', backgroundColor: '#f9fafb', marginBottom: '40px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {newImages.map((url, i) => (
                          <div key={i} style={{ width: '100%', aspectRatio: '1/1', border: '1px solid #000000', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                            <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '24px', gap: '16px' }}>
                      <button type="button" onClick={() => setActiveSubStep('details')} style={{ padding: '12px 24px', border: '1px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '4px' }}>← Back</button>
                      <button type="button" onClick={handleFinalGiftSubmit} style={{ padding: '12px 32px', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} /> Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW + EDIT MODAL CONTAINER */}
        {showPreviewModal && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <h2 style={{ fontFamily: 'serif', fontSize: '22px', fontWeight: 'bold', color: '#000000' }}>Manage Gift Asset Configs</h2>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Update metrics and values for this portfolio item</p>
              </div>
              <button type="button" onClick={() => setShowPreviewModal(false)} style={{ border: '1px solid #000000', backgroundColor: 'transparent', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Exit ✕</button>
            </div>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px' }}>
                
                <div>
                  <span style={{ display: 'block', fontWeight: 'bold', color: '#000000', marginBottom: '12px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Product Images Layout</span>
                  <div style={{ border: '1px solid #000000', borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/10', backgroundColor: '#f9fafb', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {editImages.length > 0 ? (
                      <img src={editImages[activeImageIndex] || editImages[0]} alt="Active Asset" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                        <ImageIcon size={40} style={{ margin: '0 auto 8px' }} />
                        <span>No Active Images</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    {editImages.map((imgUrl, index) => (
                      <div key={index} onClick={() => setActiveImageIndex(index)} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', border: index === activeImageIndex ? '2px solid #000000' : '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                        <img src={imgUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveEditImage(index); }} style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                    <label style={{ cursor: 'pointer', width: '100%', aspectRatio: '1/1', border: '1px dashed #000000', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                      <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} style={{ display: 'none' }} />
                      <Plus size={16} style={{ color: '#000000' }} />
                      <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>Add</span>
                    </label>
                  </div>
                </div>

                <div>
                  <form onSubmit={handleUpdateGiftSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#000000', fontSize: '13px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Product Name</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Category Hierarchy</label>
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold', backgroundColor: '#ffffff' }}>
                          <option value="Birthday Gifts">Birthday Gifts</option>
                          <option value="Anniversary Gifts">Anniversary Gifts</option>
                          <option value="Corporate Gifts">Corporate Gifts</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Product Specifications / Description</label>
                      <textarea rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold', resize: 'none' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Price (₹)</label>
                        <input type="text" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Stock Inventory</label>
                        <input type="text" value={editStock} onChange={(e) => setEditStock(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Best Seller</label>
                        <select value={editBestSeller} onChange={(e) => setEditBestSeller(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }}>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Status Log</label>
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #e5e7eb', marginTop: 'auto' }}>
                      <button type="button" onClick={() => selectedGift && handleDeleteGift(selectedGift.id)} style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Delete Asset Log</button>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={() => setShowPreviewModal(false)} style={{ padding: '10px 20px', border: '1px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '4px' }}>Cancel</button>
                        <button type="submit" style={{ padding: '10px 32px', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px' }}>Update Changes</button>
                      </div>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* SMALL BACKUP SECONDARY EDIT MODAL BOX */}
        {showEditDeleteModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '6px', width: '100%', maxWidth: '440px', color: '#000000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '16px' }}>Quick Context Update</h3>
                <button onClick={() => setShowEditDeleteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <form onSubmit={handleUpdateGiftSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Product Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <button type="button" onClick={() => selectedGift && handleDeleteGift(selectedGift.id)} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Delete</button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => setShowEditDeleteModal(false)} style={{ padding: '8px 16px', border: '1px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '4px' }}>Cancel</button>
                    <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px' }}>Update</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}