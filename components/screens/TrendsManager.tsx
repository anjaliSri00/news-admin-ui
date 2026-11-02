'use client';

import React, { useState, useEffect } from 'react';
import { TrendItemPayload } from '../../types/editorial';
import { Loader2, Edit, Trash2, Eye, EyeOff, Plus, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import fetchApiResponse from '../../helper/api_data_store';
import { toast } from 'react-toastify';

const TRENDS_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/internal-dashboard/trends`;

interface TrendsManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const emptyDraft: Omit<TrendItemPayload, 'id'> = {
  title: '',
  excerpt: '',
  category: 'COLOR FORECAST',
  featured_image: '',
  read_time: '4 min read',
  date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  article_url: '',
  tags: [],
  status: 'draft',
};

export const TrendsManager: React.FC<TrendsManagerProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { data: session } = useSession();
  const [items, setItems] = useState<TrendItemPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(emptyDraft);
  const [tagsInput, setTagsInput] = useState('');
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Fetch Data
  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApiResponse<{ trends: TrendItemPayload[] }>(TRENDS_API, {
        headers: { 'Access-Token': session?.accessToken || '', 
            'Refresh-Token':session?.refreshToken || ''
         },
      });
      if (res.meta?.status === 200 && res.data?.trends) {
        setItems(res.data.trends);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load trends");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTrends(); }, [session]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setTagsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TrendItemPayload) => {
    setEditingId(item.id);
    setDraft({ ...item });
    setTagsInput(item.tags?.map(t => `${t.label}|${t.url}`).join('\n') || '');
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title || !draft.featured_image) return toast.error("Title & Image required");

    setIsSubmitting(true);

    // Process Tags (Format: Label|URL)
    const parsedTags = tagsInput.split('\n').map(line => {
      const [label, url] = line.split('|');
      return label ? { label: label.trim(), url: (url || '#').trim() } : null;
    }).filter(Boolean);

    const payload = { ...draft, tags: parsedTags };

    try {
      const url = editingId ? `${TRENDS_API}/${editingId}` : `${TRENDS_API}/add`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetchApiResponse(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': session?.accessToken || '',
        },
        body: JSON.stringify(payload),
      });

      if (res.meta?.status === 200 || res.meta?.status === 201) {
        toast.success(editingId ? "Trend updated" : "Trend created");
        handleCancel();
        fetchTrends();
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as any } : i));
    try {
      await fetchApiResponse(`${TRENDS_API}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Access-Token': session?.accessToken || '' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      fetchTrends(); // Revert on fail
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setItems(prev => prev.filter(i => i.id !== deleteItemId));
    try {
      await fetchApiResponse(`${TRENDS_API}/${deleteItemId}`, {
        method: 'DELETE',
        headers: { 'Access-Token': session?.accessToken || '' },
      });
      toast.success("Deleted successfully");
    } catch {
      fetchTrends();
    }
    setDeleteItemId(null);
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="w-full flex flex-col bg-[#fcf9f8] min-h-screen">
      
      {/* GRID LIST */}
      <div className="p-6 md:p-8 max-w-[90rem] mx-auto w-full">
        {items.length === 0 && (
          <div className="p-16 text-center border border-dashed border-gray-300 bg-white rounded-lg">
            <p className="font-serif text-lg text-gray-900 mb-2">No Trends Found</p>
            <p className="text-sm text-gray-500">Click the "Add Trend" button above to create the first trend.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col group relative hover:shadow-xl transition-all duration-300">
              
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative">
                {item.featured_image ? (
                  <img src={item.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                )}
                
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm backdrop-blur-md ${
                    item.status === 'published' ? 'bg-green-600/90 text-white' : 'bg-gray-800/90 text-white'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:scale-110"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteItemId(item.id)} className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-red-600 hover:scale-110"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleStatus(item.id, item.status)} className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-gray-100 hover:text-primary hover:scale-110">
                    {item.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#3B6BB0] font-bold mb-1.5">{item.category}</span>
                <h3 className="font-serif text-[18px] text-gray-900 leading-snug mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-[12px] text-gray-500 line-clamp-2 mt-auto">{item.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteItemId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6" /></div>
            <h3 className="font-serif text-xl mb-2">Delete Trend?</h3>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setDeleteItemId(null)} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 shrink-0">
              <h2 className="font-serif text-2xl">{editingId ? 'Edit Trend' : 'Create Trend'}</h2>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-200 rounded-full">✕</button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              <form id="trend-form" onSubmit={handleSubmit} className="w-full lg:w-3/5 p-6 overflow-y-auto space-y-4 border-r border-gray-200">
                
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Title *</label>
                  <input required value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} className="w-full border rounded-md px-3 py-2 font-serif text-[16px]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category</label>
                    <input value={draft.category} onChange={e => setDraft({...draft, category: e.target.value.toUpperCase()})} placeholder="e.g. COLOR FORECAST" className="w-full border rounded-md px-3 py-2 text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Status</label>
                    <select value={draft.status} onChange={e => setDraft({...draft, status: e.target.value})} className="w-full border rounded-md px-3 py-2 text-[13px]">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Image URL *</label>
                  <input required value={draft.featured_image} onChange={e => setDraft({...draft, featured_image: e.target.value})} className="w-full border rounded-md px-3 py-2 text-[13px]" />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Excerpt</label>
                  <textarea value={draft.excerpt} onChange={e => setDraft({...draft, excerpt: e.target.value})} rows={3} className="w-full border rounded-md px-3 py-2 text-[13px] resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Read Time</label>
                    <input value={draft.read_time} onChange={e => setDraft({...draft, read_time: e.target.value})} placeholder="4 min read" className="w-full border rounded-md px-3 py-2 text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Date</label>
                    <input value={draft.date} onChange={e => setDraft({...draft, date: e.target.value})} placeholder="14 Oct 2026" className="w-full border rounded-md px-3 py-2 text-[13px]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Article URL</label>
                  <input value={draft.article_url} onChange={e => setDraft({...draft, article_url: e.target.value})} className="w-full border rounded-md px-3 py-2 text-[13px]" />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bottom Thread Tags (Label | URL)</label>
                  <textarea 
                    value={tagsInput} 
                    onChange={e => setTagsInput(e.target.value)} 
                    rows={4} 
                    placeholder="Adaptive reuse | /tag/adaptive&#10;Quiet technology | /tag/quiet"
                    className="w-full border rounded-md px-3 py-2 text-[13px] font-mono resize-none" 
                  />
                  <p className="text-[11px] text-gray-500 mt-1">One tag per line. Format: Label | URL</p>
                </div>
              </form>

              {/* LIVE PREVIEW */}
              <div className="w-full lg:w-2/5 bg-gray-50 border-l p-6 overflow-y-auto hidden lg:block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Live Website Card</span>
                <div className="bg-white p-4 shadow-sm border rounded-sm">
                  <div className="aspect-[4/3] bg-gray-100 mb-4 overflow-hidden">
                    {draft.featured_image ? <img src={draft.featured_image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image</div>}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#3B6BB0] mb-2 block">{draft.category || 'CATEGORY'}</span>
                  <h3 className="font-serif text-[24px] text-[#1a1a1a] leading-tight mb-2">{draft.title || 'Trend Title Here'}</h3>
                  <p className="text-[14px] text-gray-600 line-clamp-3 mb-4">{draft.excerpt || 'Excerpt will appear here...'}</p>
                  <div className="text-[12px] text-gray-400">{draft.date} · {draft.read_time}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-white flex justify-end gap-3 shrink-0">
              <button onClick={handleCancel} className="px-5 py-2 text-sm font-semibold border rounded-md">Cancel</button>
              <button type="submit" form="trend-form" disabled={isSubmitting} className="px-6 py-2 text-sm font-semibold bg-primary-container text-white rounded-md disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Trend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};