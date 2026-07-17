'use client';

import React, { useState } from 'react';
import { Search, Plus, Eye, Trash2, Gift, Tags, Layers, FileText, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';

const initialCategories = [
  { id: 1, name: 'Birthday Gifts', description: 'Curated luxury packages optimized for birthday celebrations', status: 'Active', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'] },
  { id: 2, name: 'Anniversary Gifts', description: 'Premium elegant combinations tailored for couples and milestones', status: 'Active', images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80'] },
  { id: 3, name: 'Corporate Gifts', description: 'Sophisticated professional hampers for events and corporate branding', status: 'Inactive', images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80'] },
];

export default function CategoriesManagement() {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Overlay & Modal Setup
  const [showMasterAddOverlay, setShowMasterAddOverlay] = useState(false);
  const [activeSubStep, setActiveSubStep] = useState<'details' | 'banner'>('details');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof initialCategories[0] | null>(null);

  // Form states for creating a new category
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  const [newImages, setNewImages] = useState<string[]>([]);

  // Form states for viewing/editing inside overlay
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  
  // State tracking for the currently selected preview image index inside View Modal
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNextSubStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return alert('Please fill Category Name');
    setActiveSubStep('banner');
  };

  const handleRealBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleEditBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRemoveEditBanner = (indexToRemove: number) => {
    setEditImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    // Reset preview index safely if the current previewed item gets deleted
    if (activePreviewIndex >= editImages.length - 1) {
      setActivePreviewIndex(0);
    }
  };

  const handleFinalCategorySubmit = () => {
    const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;

    const createdCategory = {
      id: nextId,
      name: newName,
      description: newDescription,
      status: newStatus,
      images: newImages.length > 0 ? newImages : ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80']
    };

    setCategories([...categories, createdCategory]);
    
    setNewName(''); 
    setNewDescription('');
    setNewImages([]);
    setActiveSubStep('details');
    setShowMasterAddOverlay(false);
  };

  const handleViewClick = (category: typeof initialCategories[0]) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditDescription(category.description);
    setEditStatus(category.status);
    setEditImages(category.images || []);
    setActivePreviewIndex(0); // Always default view to the first image log asset
    setShowPreviewModal(true);
  };

  const handleUpdateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    const updatedCategories = categories.map(c => 
      c.id === selectedCategory.id 
        ? { ...c, name: editName, description: editDescription, status: editStatus, images: editImages }
        : c
    );

    setCategories(updatedCategories);
    setShowPreviewModal(false);
  };

  const handleDeleteCategory = (id: number) => {
    const balanceCategories = categories.filter(c => c.id !== id);
    setCategories(balanceCategories);
    setShowPreviewModal(false);
  };

  return (
    <div className="flex min-h-screen bg-white text-black font-sans">
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-x-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-wide text-gray-900 font-bold">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track inventory categories</p>
          </div>
          <button 
            onClick={() => { setActiveSubStep('details'); setShowMasterAddOverlay(true); }}
            className="flex items-center space-x-2 bg-white border border-black text-black px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition-all font-bold text-sm"
          >
            <Plus size={16} className="text-black stroke-[3]" />
            <span className="text-black font-bold">Add Category</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative max-w-md mb-6 flex items-center" style={{ position: 'relative' }}>
          <Search size={16} className="text-gray-500" style={{ position: 'absolute', left: '12px', zIndex: 10, pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search Category..."
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
                <th className="py-4 px-4 text-black font-bold">Category Name</th>
                <th className="py-4 px-4 text-black font-bold">Description</th>
                <th className="py-4 px-4 text-black font-bold">Status</th>
                <th className="py-4 px-4 text-center text-black font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900">{category.id}</td>
                  <td className="py-4 px-4 font-bold text-gray-950">{category.name}</td>
                  <td className="py-4 px-4 text-gray-700 font-medium max-w-xs truncate">{category.description}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                      category.status === 'Active' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center space-x-3 text-black">
                      <button onClick={() => handleViewClick(category)} className="hover:text-amber-600 transition-colors"><Eye size={16} className="stroke-[2.5]" /></button>
                      <button onClick={() => handleDeleteCategory(category.id)} className="hover:text-red-600 transition-colors"><Trash2 size={16} className="stroke-[2.5]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WORKSPACE OVERLAY FORM PANEL (ADD CATEGORY WITH BANNER STEP) */}
        {showMasterAddOverlay && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <h2 style={{ fontFamily: 'serif', fontSize: '22px', fontWeight: 'bold', color: '#000000' }}>Create Category Component</h2>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Fill configurations logs to insert into server data</p>
              </div>
              <button type="button" onClick={() => setShowMasterAddOverlay(false)} style={{ position: 'absolute', top: '24px', right: '40px', border: '1px solid #000000', backgroundColor: 'transparent', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Exit ✕</button>
            </div>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '16px 24px', borderRadius: '6px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: activeSubStep === 'details' ? 1 : 0.5 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #000000', display: 'flex', alignItems: 'center', justify: 'center', backgroundColor: activeSubStep === 'details' ? '#000000' : 'transparent', color: activeSubStep === 'details' ? '#ffffff' : '#000000', fontWeight: 'bold', fontSize: '11px' }}>
                      <Layers size={12} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', color: '#000000' }}>1. Category Specifications</span>
                    </div>
                  </div>
                  <div style={{ color: '#9ca3af', fontWeight: 'bold' }}>➔</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: activeSubStep === 'banner' ? 1 : 0.5 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #000000', display: 'flex', alignItems: 'center', justify: 'center', backgroundColor: activeSubStep === 'banner' ? '#000000' : 'transparent', color: activeSubStep === 'banner' ? '#ffffff' : '#000000', fontWeight: 'bold', fontSize: '11px' }}>
                      <ImageIcon size={12} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', color: '#000000' }}>2. Category Banner Portfolio</span>
                    </div>
                  </div>
                </div>

                {activeSubStep === 'details' && (
                  <form onSubmit={handleNextSubStep} style={{ color: '#000000', fontSize: '13px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Category Name</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter Category Name" style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Category Description</label>
                      <textarea rows={4} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Write description overview for this tracking log level..." style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '4px', color: '#000000', fontWeight: 'bold', resize: 'none' }} />
                  </div>

                  <div style={{ marginBottom: '40px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Initial Status</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '4px', color: '#000000', fontWeight: 'bold', backgroundColor: '#ffffff' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '24px', gap: '16px' }}>
                      <button type="button" onClick={() => setShowMasterAddOverlay(false)} style={{ padding: '12px 24px', border: '1px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '4px' }}>Cancel</button>
                      <button type="submit" style={{ padding: '12px 32px', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next step</button>
                    </div>
                  </form>
                )}

                {activeSubStep === 'banner' && (
                  <div style={{ color: '#000000' }}>
                    <label style={{ display: 'block', cursor: 'pointer', marginBottom: '24px' }}>
                      <input type="file" accept="image/*" multiple onChange={handleRealBannerUpload} style={{ display: 'none' }} />
                      <div style={{ border: '2px dashed #000000', padding: '48px 24px', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                        <Upload size={36} style={{ color: '#000000', marginBottom: '12px' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#000000' }}>Choose Category Banner Image</span>
                      </div>
                    </label>

                    <span style={{ display: 'block', fontWeight: 'bold', color: '#000000', marginBottom: '16px', fontSize: '14px' }}>Select Banner Image</span>
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
                      <button type="button" onClick={handleFinalCategorySubmit} style={{ padding: '12px 32px', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} /> Save Component
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
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <h2 style={{ fontFamily: 'serif', fontSize: '22px', fontWeight: 'bold', color: '#000000' }}>Manage Category Asset Configs</h2>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Update hierarchy metrics and active log specifications</p>
              </div>
              <button type="button" onClick={() => setShowPreviewModal(false)} style={{ position: 'absolute', top: '24px', right: '40px', border: '1px solid #000000', backgroundColor: 'transparent', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Exit ✕</button>
            </div>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px' }}>
                
                {/* Left Side: Banner View Layout */}
                <div>
                  <span style={{ display: 'block', fontWeight: 'bold', color: '#000000', marginBottom: '12px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Category Banner Layout</span>
                  <div style={{ border: '1px solid #000000', borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/10', backgroundColor: '#f9fafb', marginBottom: '20px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    {editImages.length > 0 ? (
                      <img src={editImages[activePreviewIndex] || editImages[0]} alt="Active Asset" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                        <ImageIcon size={40} style={{ margin: '0 auto 8px' }} />
                        <span>No Active Banners</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    {editImages.map((imgUrl, index) => (
                      <div 
                        key={index} 
                        onClick={() => setActivePreviewIndex(index)}
                        style={{ position: 'relative', width: '100%', aspectRatio: '1/1', border: activePreviewIndex === index ? '2px solid #000000' : '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#ffffff', cursor: 'pointer' }}
                      >
                        <img src={imgUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveEditBanner(index); }} style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                    <label style={{ cursor: 'pointer', width: '100%', aspectRatio: '1/1', border: '1px dashed #000000', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', backgroundColor: '#f9fafb' }}>
                      <input type="file" accept="image/*" multiple onChange={handleEditBannerUpload} style={{ display: 'none' }} />
                      <Plus size={16} style={{ color: '#000000' }} />
                      <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>Add</span>
                    </label>
                  </div>
                </div>

                {/* Right Side: Detailed Direct Fields Editor Form */}
                <div>
                  <form onSubmit={handleUpdateCategorySubmit} style={{ display: 'flex', flexDirection: 'column', color: '#000000', fontSize: '13px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Category Hierarchy Name</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold' }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Category Specifications / Description Overview</label>
                      <textarea rows={5} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold', resize: 'none' }} />
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Hierarchy Status Log</label>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #9ca3af', borderRadius: '4px', color: '#000000', fontWeight: 'bold', backgroundColor: '#ffffff' }}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #e5e7eb', marginTop: 'auto' }}>
                      <button type="button" onClick={() => selectedCategory && handleDeleteCategory(selectedCategory.id)} style={{ padding: '12px 24px', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Delete Category Log</button>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={() => setShowPreviewModal(false)} style={{ padding: '12px 24px', border: '1px solid #000000', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold', borderRadius: '4px' }}>Cancel</button>
                        <button type="submit" style={{ padding: '12px 32px', backgroundColor: '#000000', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px' }}>Update Changes</button>
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