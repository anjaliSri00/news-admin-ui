'use client';

import React, { useState } from 'react';
import { NewsItemPayload } from '../../types/editorial';
import { Edit, Trash2, Eye, EyeOff, Plus, AlertTriangle } from 'lucide-react';

// --- MOCK DATA (Screenshot jaisa exact data) ---
const INITIAL_MOCK_NEWS: NewsItemPayload[] = [
  {
    id: 'news-1',
    title: 'Less floor area. More possibilities.',
    excerpt: 'Inside the compact homes challenging the idea that better living means building bigger.',
    category: 'URBAN LIVING / TOKYO',
    featured_image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800',
    date: '14 Oct 2026',
    time: '08:45 GMT',
    author: 'Kenji Mori',
    read_time: '6 min read',
    is_featured: true,
    status: 'published',
  },
  {
    id: 'news-2',
    title: 'A former school in Porto finds a second life as a neighbourhood library',
    excerpt: 'A careful retrofit puts public space ahead of spectacle.',
    category: 'ARCHITECTURE',
    featured_image: 'https://images.unsplash.com/photo-1791676126920-bf915893508b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    date: '14 Oct 2026',
    time: '08:45 GMT',
    is_featured: false,
    status: 'published',
  },
  {
    id: 'news-3',
    title: 'A new generation of acoustic lighting does double duty',
    excerpt: 'Lighting studios turn down the volume without losing warmth.',
    category: 'PRODUCTS',
    featured_image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=400',
    date: '14 Oct 2026',
    time: '08:10 GMT',
    is_featured: false,
    status: 'published',
  },
  {
    id: 'news-4',
    title: 'The kitchen island is making room for the family table',
    excerpt: 'Designers rethink the social heart of the home.',
    category: 'HOME DECOR',
    featured_image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400',
    date: '14 Oct 2026',
    time: '07:30 GMT',
    is_featured: false,
    status: 'published',
  },
  {
    id: 'news-5',
    title: 'Small studios, shared resources: the rise of the design collective',
    excerpt: 'A more collaborative model for independent practice.',
    category: 'INDUSTRY',
    featured_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
    date: '13 Oct 2026',
    time: '16:20 GMT',
    is_featured: false,
    status: 'published',
  },
];
interface LatestNewsManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}
const emptyDraft: Omit<NewsItemPayload, 'id'> = {
  title: '',
  excerpt: '',
  category: '',
  featured_image: '',
  date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  time: '10:00 GMT',
  author: '',
  read_time: '4 min read',
  is_featured: false,
  status: 'draft',
};

export const LatestNewsManager: React.FC<LatestNewsManagerProps> = ({isModalOpen,setIsModalOpen}) => {
  const [items, setItems] = useState<NewsItemPayload[]>(INITIAL_MOCK_NEWS);
//   const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(emptyDraft);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsItemPayload) => {
    setEditingId(item.id);
    setDraft({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If setting this as featured, remove featured from others
    let updatedItems = [...items];
    if (draft.is_featured) {
      updatedItems = updatedItems.map(i => ({ ...i, is_featured: false }));
    }

    if (editingId) {
      setItems(updatedItems.map(i => i.id === editingId ? { ...draft, id: editingId } : i));
    } else {
      setItems([{ ...draft, id: Date.now().toString() }, ...updatedItems]);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    setItems(prev => prev.filter(i => i.id !== deleteItemId));
    setDeleteItemId(null);
  };

  const handleToggleStatus = (id: string, current: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: current === 'published' ? 'draft' : 'published' } : i));
  };

  // Derived Data for Preview
  const publishedItems = items.filter(i => i.status === 'published');
  const featuredItem = publishedItems.find(i => i.is_featured) || publishedItems[0];
  const gridItems = publishedItems.filter(i => i.id !== featuredItem?.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      
      {/* =========================================
          DASHBOARD VIEW (ADMIN)
      ========================================= */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Dashboard Table View */}
        <div className="bg-white border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Title / Excerpt</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.featured_image && <img src={item.featured_image} className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <div className="font-serif font-medium text-gray-900 line-clamp-1">{item.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{item.excerpt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs font-bold tracking-wider">{item.category}</td>
                  <td className="px-6 py-4">
                    {item.is_featured ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Featured</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Grid Item</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggleStatus(item.id, item.status)} className={`flex items-center gap-1.5 text-xs font-bold uppercase ${item.status === 'published' ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {item.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-blue-600 border rounded hover:bg-blue-50"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteItemId(item.id)} className="p-1.5 text-red-600 border rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          WEBSITE PREVIEW VIEW
      ========================================= */}
      <div className="border-t-4 border-dashed border-gray-300 mt-12 bg-white">
        <div className="bg-gray-800 text-white text-center py-2 text-sm font-bold tracking-widest uppercase">
          ⬇ Live Website Preview Below ⬇
        </div>

        <div className="max-w-screen-xl mx-auto px-6 py-16">
          
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#3B6BB0] block mb-1">
                The Daily Dispatch
              </span>
              <h2 className="font-serif text-[38px] text-[#1a1a1a] leading-none">Latest News</h2>
            </div>
            <a href="#" className="text-[12px] font-bold uppercase tracking-wider text-[#3B6BB0] hover:text-[#1a1a1a] flex items-center gap-1">
              View all news <span className="text-lg">→</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT: Featured Article (5 cols) */}
            {featuredItem && (
              <div className="lg:col-span-5 flex flex-col group cursor-pointer">
                <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden mb-4">
                  <img src={featuredItem.featured_image} alt={featuredItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B6BB0] mb-2">
                  {featuredItem.category}
                </span>
                <h3 className="font-serif text-[32px] text-[#1a1a1a] leading-tight mb-3 group-hover:text-[#3B6BB0] transition-colors">
                  {featuredItem.title}
                </h3>
                <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
                  {featuredItem.excerpt}
                </p>
                <div className="mt-auto text-[12px] text-gray-500">
                  By {featuredItem.author || 'Editorial Desk'} · {featuredItem.date} · {featuredItem.read_time}
                </div>
              </div>
            )}

            {/* RIGHT: 2x2 Grid (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
              {gridItems.map(item => (
                <div key={item.id} className="flex flex-col group cursor-pointer border-b border-gray-100 pb-6 sm:border-b-0 sm:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 shrink-0 bg-gray-100 overflow-hidden rounded-sm">
                      <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B6BB0] block mb-1">
                        {item.category}
                      </span>
                      <h4 className="font-serif text-[20px] text-[#1a1a1a] leading-snug mb-2 group-hover:text-[#3B6BB0] transition-colors line-clamp-3">
                        {item.title}
                      </h4>
                      <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-4 pl-28">
                    {item.date} · {item.time}
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>

      {/* =========================================
          MODALS
      ========================================= */}
      {deleteItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle /></div>
            <h3 className="text-xl font-serif mb-2">Delete Article?</h3>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setDeleteItemId(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-serif">{editingId ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold mb-1">Title</label>
                <input required value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} className="w-full border p-2 rounded font-serif" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <input value={draft.category} onChange={e => setDraft({...draft, category: e.target.value.toUpperCase()})} className="w-full border p-2 rounded text-sm" placeholder="e.g. URBAN LIVING" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Status</label>
                  <select value={draft.status} onChange={e => setDraft({...draft, status: e.target.value})} className="w-full border p-2 rounded text-sm">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Image URL</label>
                <input required value={draft.featured_image} onChange={e => setDraft({...draft, featured_image: e.target.value})} className="w-full border p-2 rounded text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Excerpt</label>
                <textarea value={draft.excerpt} onChange={e => setDraft({...draft, excerpt: e.target.value})} rows={2} className="w-full border p-2 rounded text-sm resize-none" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="featured" checked={draft.is_featured} onChange={e => setDraft({...draft, is_featured: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="featured" className="text-sm font-bold text-gray-700 cursor-pointer">Make this the Featured Article (Left side)</label>
              </div>

              {draft.is_featured && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded border">
                  <div>
                    <label className="block text-xs font-bold mb-1">Author</label>
                    <input value={draft.author} onChange={e => setDraft({...draft, author: e.target.value})} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Read Time</label>
                    <input value={draft.read_time} onChange={e => setDraft({...draft, read_time: e.target.value})} className="w-full border p-2 rounded text-sm" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Date</label>
                  <input value={draft.date} onChange={e => setDraft({...draft, date: e.target.value})} className="w-full border p-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Time</label>
                  <input value={draft.time} onChange={e => setDraft({...draft, time: e.target.value})} className="w-full border p-2 rounded text-sm" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded">Cancel</button>
              <button onClick={handleSubmit} className="px-5 py-2 bg-[#8C3F2E] text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};