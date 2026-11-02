'use client';

import React, { useState, useEffect } from 'react';
import { HomeDecorPayload } from '../../types/home-decor';
import fetchApiResponse from '../../helper/api_data_store';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import { useSession } from 'next-auth/react';

const HOME_DECOR_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/internal-dashboard/home-decor`;

const emptyDraft: Omit<HomeDecorPayload, 'id'> = {
  title: '',
  content: '<p>Details coming soon.</p>',
  excerpt: '',
  featured_image: '',
  category: 'living-room',
  room_type: 'living',
  style: 'scandinavian',
  layout_type: 'featured',
  is_active: true,
  status: 'draft',
  article_url: '',
  tags: [],
  seo: { meta_title: '', meta_description: '', keywords: [] },
};

interface HomeDecorManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const HomeDecorManager: React.FC<HomeDecorManagerProps> = ({ 
  isModalOpen, 
  setIsModalOpen 
}) => {

  const [decorItems, setDecorItems] = useState<HomeDecorPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {data:session} = useSession();

  // Modal State
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [draft, setDraft] = useState<Omit<HomeDecorPayload, 'id'>>(emptyDraft);
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data
  const fetchDecor = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApiResponse<{ home_decor: HomeDecorPayload[] }>(HOME_DECOR_API, {
        headers: {
          'Access-Token': session?.accessToken || '',
          'Refresh-Token': session?.refreshToken || ''
        }
      });
      if (res.meta?.status === 200 && res.data?.home_decor) {
        setDecorItems(res.data.home_decor);
      }
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDecor(); }, []);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setTagsInput('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: HomeDecorPayload) => {
    setEditingId(item.id);
    setDraft({ ...item });
    setTagsInput(item.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

   // Cancel Edit
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setTagsInput('');
  };

  // Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.featured_image) return alert("Title & Image required!");

    setIsSubmitting(true);
    
    const payload: any = {
      title: draft.title,
      content: draft.content,
      excerpt: draft.excerpt,
      featured_image: draft.featured_image,
      category: draft.category,
      room_type: draft.room_type,
      style: draft.style,
      layout_type: draft.layout_type,
      is_active: draft.is_active,
      status: draft.status,
    };
    
    const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (tagsArr.length > 0) payload.tags = tagsArr;
    if (draft.article_url?.trim()) payload.article_url = draft.article_url;

    try {
      const url = editingId ? `${HOME_DECOR_API}/${editingId}` : `${HOME_DECOR_API}/add`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetchApiResponse<any>(url, {
        method,
        headers: { 'Content-Type': 'application/json',
            'Access-Token':session?.accessToken,
            'Refresh-Token':session?.refreshToken
         },
        body: JSON.stringify(payload),
      });

      if (res.meta?.status === 200 || res.meta?.status === 201) {
        handleCancel();
        fetchDecor();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    // Optimistic Update
    setDecorItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus as any } : item));

    try {
      await fetchApiResponse(`${HOME_DECOR_API}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchDecor(); // Revert on fail
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const previousItems = [...decorItems];
    setDecorItems(prev => prev.filter(i => i.id !== id));
    
    try {
      await fetchApiResponse(`${HOME_DECOR_API}/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
      setDecorItems(previousItems); // Revert on fail
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
   <div className="w-full flex flex-col bg-[#fcf9f8] h-auto">
  
  {/* DASHBOARD HEADER & GRID */}
  <div className="w-full px-6">

    {decorItems.length === 0 && (
      <div className="p-16 text-center border border-dashed border-border-subtle bg-white text-secondary text-[14px] rounded-lg">
        <p className="font-serif text-[18px] text-primary mb-2">No articles found</p>
        <p>Click the "Add Article" button above to create your first Home Decor feature.</p>
      </div>
    )}

    {/* PREMIUM GRID CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {decorItems.map((item) => (
        <div 
          key={item.id} 
          className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col group relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          {/* Image Block */}
          <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative">
            {item.featured_image ? (
              <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-3xl mb-1">image</span>
                <span className="text-[11px] uppercase tracking-wider">No Image</span>
              </div>
            )}
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm backdrop-blur-md ${
                item.status === 'published' ? 'bg-green-600/90 text-white' : 'bg-gray-800/90 text-white'
              }`}>
                {item.status}
              </span>
              <span className="text-[10px] font-semibold bg-white/90 text-gray-800 px-2.5 py-1 rounded backdrop-blur-md shadow-sm capitalize">
                {item.layout_type}
              </span>
            </div>

            {/* Hover Overlay Actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-3">
              <button 
                onClick={() => handleOpenEdit(item)} 
                className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:scale-110 shadow-lg transition-all"
                title="Edit Article"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(item.id)} 
                className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-red-600 hover:scale-110 shadow-lg transition-all"
                title="Delete Article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleToggleStatus(item.id, item.status)} 
                className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-gray-100 hover:text-primary hover:scale-110 shadow-lg transition-all"
                title="Toggle Status"
              >
                {item.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Content Info */}
          <div className="p-4 flex-1 flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#3B6BB0] font-bold mb-1.5 truncate">
              {item.category || 'Uncategorized'}
            </span>
            <h3 className="font-serif text-[18px] text-gray-900 leading-snug mb-2 line-clamp-2" title={item.title}>
              {item.title}
            </h3>
            <p className="text-[12px] text-gray-500 line-clamp-2 mt-auto">
              {item.excerpt || 'No excerpt provided...'}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* ======================================= */}
  {/* MODAL FORM WITH LIVE PREVIEW */}
  {/* ======================================= */}
  {isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90rem] h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="font-serif text-2xl text-gray-900">
              {editingId ? 'Edit Home Decor Article' : 'Create New Article'}
            </h2>
            <p className="text-[13px] text-gray-500 mt-1">Fill in the details to update the website layout.</p>
          </div>
          <button 
            onClick={handleCancel} 
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Body - Split View */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* LEFT: Form */}
          <form id="decor-form" onSubmit={handleSubmit} className="w-full lg:w-3/5 p-8 overflow-y-auto space-y-6 custom-scrollbar border-r border-gray-200">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B6BB0] border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Article Title <span className="text-red-500">*</span></label>
                <input 
                  required 
                  value={draft.title} 
                  onChange={e => setDraft({...draft, title: e.target.value})} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 font-serif text-[16px] focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all" 
                  placeholder="e.g. Minimalist Scandinavian Living Room"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Layout Slot</label>
                  <select 
                    value={draft.layout_type} 
                    onChange={e => setDraft({...draft, layout_type: e.target.value as any})} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] bg-white focus:ring-2 focus:ring-primary-container outline-none"
                  >
                    <option value="featured">Featured (Left Large)</option>
                    <option value="medium">Medium (Center)</option>
                    <option value="compact">Compact (Right List)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Status</label>
                  <select 
                    value={draft.status} 
                    onChange={e => setDraft({...draft, status: e.target.value as any})} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] bg-white focus:ring-2 focus:ring-primary-container outline-none font-medium"
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="published">Published (Live)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category Tag</label>
                <input 
                  value={draft.category} 
                  onChange={e => setDraft({...draft, category: e.target.value})} 
                  placeholder="e.g. LIVING WELL / AMSTERDAM" 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                />
              </div>
            </div>

            {/* Section 2: Media & Content */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B6BB0] border-b pb-2">Media & Content</h3>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Featured Image URL <span className="text-red-500">*</span></label>
                <input 
                  required 
                  value={draft.featured_image} 
                  onChange={e => setDraft({...draft, featured_image: e.target.value})} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  placeholder="https://example.com/hero.jpg"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Excerpt</label>
                <textarea 
                  value={draft.excerpt} 
                  onChange={e => setDraft({...draft, excerpt: e.target.value})} 
                  rows={3} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none resize-none" 
                  placeholder="A short summary of the article..."
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Article Link</label>
                <input 
                  value={draft.article_url} 
                  onChange={e => setDraft({...draft, article_url: e.target.value})} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  placeholder="https://example.com/full-article"
                />
              </div>
            </div>

          </form>

          {/* RIGHT: Sticky Live Preview */}
          <div className="w-full lg:w-2/5 bg-[#f8f9fa] border-l border-gray-200 overflow-y-auto hidden lg:block p-8">
            <div className="sticky top-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Website Preview
              </span>

              {/* Featured Preview */}
              {draft.layout_type === 'featured' && (
                <div className="bg-white p-5 shadow-sm border border-gray-200 rounded-md">
                  <div className="aspect-[4/3] bg-gray-100 mb-5 overflow-hidden rounded-sm">
                    {draft.featured_image ? (
                      <img src={draft.featured_image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image Preview</div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#3B6BB0] mb-2 block">{draft.category || 'CATEGORY'}</span>
                  <h3 className="font-serif text-[32px] text-[#1a1a1a] leading-tight mb-3">{draft.title || 'Article Title Will Appear Here'}</h3>
                  <p className="text-[15px] text-gray-600 leading-relaxed line-clamp-3">{draft.excerpt || 'The excerpt will appear here...'}</p>
                </div>
              )}

              {/* Medium Preview */}
              {draft.layout_type === 'medium' && (
                <div className="bg-white p-5 shadow-sm border border-gray-200 rounded-md">
                  <div className="aspect-[4/3] bg-gray-100 mb-5 overflow-hidden rounded-sm">
                    {draft.featured_image ? (
                      <img src={draft.featured_image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image Preview</div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#3B6BB0] mb-2 block">{draft.category || 'CATEGORY'}</span>
                  <h3 className="font-serif text-[24px] text-[#1a1a1a] leading-tight mb-2">{draft.title || 'Article Title Will Appear Here'}</h3>
                  <p className="text-[14px] text-gray-600 line-clamp-3">{draft.excerpt || 'The excerpt will appear here...'}</p>
                </div>
              )}

              {/* Compact Preview */}
              {draft.layout_type === 'compact' && (
                <div className="bg-white p-5 shadow-sm border border-gray-200 rounded-md">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#3B6BB0] mb-2 block">{draft.category || 'CATEGORY'}</span>
                  <h3 className="font-serif text-[20px] text-[#1a1a1a] leading-tight mb-2">{draft.title || 'Article Title Will Appear Here'}</h3>
                  <p className="text-[14px] text-gray-600 line-clamp-3">{draft.excerpt || 'The excerpt will appear here...'}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t bg-white flex justify-end gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleCancel} 
            type="button"
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="decor-form" 
            disabled={isSubmitting} 
            className="px-8 py-2.5 text-sm font-semibold bg-primary-container text-white rounded-md shadow-sm hover:bg-[#8C3F2E] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Saving...' : 'Save Article'}
          </button>
        </div>

      </div>
    </div>
  )}
</div>
  );
};