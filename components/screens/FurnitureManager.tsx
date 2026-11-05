"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, AlertTriangle, Loader2, EyeOff, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import fetchApiResponse from "../../helper/api_data_store";

const FURNITURE_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/internal-dashboard/furniture`;

// Allowed Categories for Furniture
const FURNITURE_CATEGORIES = [
  "sofa", "chair", "table", "lighting", 
  "storage", "decor", "bed", "outdoor"
];

interface FurnitureManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}



const emptyDraft: any = {
  title: "",
  excerpt: "",
  content: "",
  category: ["furniture"], // Default
  tags: [],
  featured_image_url: "",
  read_time: 5,
  layout_type: "card",
  status: "draft",
  is_active: true,
};


function getChangedFields<T extends Record<string, any>>(original: T, updated: T): Partial<T> {
  const diff: Partial<T> = {};
  (Object.keys(updated) as Array<keyof T>).forEach((key) => {
    // Array (jaise category, tags) compare
    if (Array.isArray(original[key]) && Array.isArray(updated[key])) {
      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        diff[key] = updated[key];
      }
    } 
    // Object (jaise dimensions, extra) compare
    else if (typeof original[key] === "object" && original[key] !== null) {
      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        diff[key] = updated[key];
      }
    } 
    // Simple values (string, number, boolean)
    else if (original[key] !== updated[key]) {
      diff[key] = updated[key];
    }
  });
  return diff;
}

export const FurnitureManager: React.FC<FurnitureManagerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { data: session } = useSession();

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(emptyDraft);
  
  // Separate state for Category dropdown (Single select)
  const [selectedCategory, setSelectedCategory] = useState("furniture");
  
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Sync form when opened
  useEffect(() => {
    if (isModalOpen && !editingId) {
      setDraft(JSON.parse(JSON.stringify(emptyDraft)));
      setSelectedCategory("furniture");
    }
  }, [isModalOpen, editingId]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApiResponse<{ furniture: any[] }>(FURNITURE_API, {
        headers: {
          "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
        },
      });
      if (res.meta?.status === 200 && res.data?.furniture) {
        setItems(res.data.furniture);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load furniture articles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [session]);

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setDraft({ ...item });
    setSelectedCategory(item.category?.[0] || "furniture"); // Set category on edit
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Basic Validation
  if (!draft.title || !draft.featured_image_url) {
    return toast.error("Title & Featured Image are required");
  }

  setIsSubmitting(true);

  // 1. Naya payload banao
  const newPayload = {
    ...draft,
    category: [selectedCategory], // Array format
    read_time: Number(draft.read_time),
  };

  try {
    let url = `${FURNITURE_API}/add`;
    let method = "POST";
    let payloadToSend = newPayload;

    // 2. Agar EDIT mode me hai
    if (editingId) {
      url = `${FURNITURE_API}/${editingId}`;
      method = "PUT";
      
      // Original item dhundo
      const originalItem = items.find((i) => i.id === editingId);
      
      if (originalItem) {
        // Sirf changed fields nikalo
        const changedData = getChangedFields(originalItem, newPayload);
        
        // Agar kuch bhi change nahi hua
        if (Object.keys(changedData).length === 0) {
          toast.info("No changes made.");
          handleCancel();
          setIsSubmitting(false);
          return;
        }
        
        // Sirf changed data bhejo
        payloadToSend = changedData;
      }
    }

    // 3. API Call
    const res = await fetchApiResponse(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Access-Token": session?.accessToken || "",
        "Refresh-Token":session?.refreshToken || ""
      },
      body: JSON.stringify(payloadToSend),
    });

    if (res.meta?.status === 200 || res.meta?.status === 201) {
      toast.success(editingId ? "Article updated" : "Article created");
      handleCancel();
      fetchItems();
    } else {
      toast.error(res.meta?.message || "Validation Error");
    }
  } catch (err: any) {
    toast.error(err.message || "Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
};

  // ... Delete and Toggle Status Functions (Same as before)

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="w-full flex flex-col bg-[#fcf9f8] h-auto">
      {/* GRID LIST */}
      <div className="px-6 mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col group relative">
              {/* Image */}
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                {item.featured_image_url && <img src={item.featured_image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              
              {/* Info */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#3B6BB0] font-bold">
                    {item.category?.[0] || "Furniture"}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${item.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="font-serif text-[18px] text-gray-900 leading-snug mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-[12px] text-gray-500 line-clamp-2 mt-auto">{item.excerpt}</p>
              </div>
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-white text-gray-800 rounded-full hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                <button onClick={() => setDeleteItemId(item.id)} className="p-2.5 bg-white text-gray-800 rounded-full hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <h2 className="font-serif text-2xl">{editingId ? "Edit" : "Create"} Furniture Article</h2>
              <button onClick={handleCancel}>✕</button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              <form id="furniture-form" onSubmit={handleSubmit} className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-4 border-r">
                
                <div>
                  <label className="text-xs font-semibold">Title *</label>
                  <input required value={draft.title} onChange={(e) => setDraft({...draft, title: e.target.value})} className="w-full border p-2 rounded" />
                </div>

                {/* 👇 CATEGORY & STATUS DROPDOWNS 👇 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold">Category *</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)} 
                      className="w-full border p-2 rounded capitalize"
                    >
                      {FURNITURE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Status</label>
                    <select 
                      value={draft.status} 
                      onChange={(e) => setDraft({...draft, status: e.target.value})} 
                      className="w-full border p-2 rounded"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold">Image URL *</label>
                  <input required value={draft.featured_image_url || ""} onChange={(e) => setDraft({...draft, featured_image_url: e.target.value})} className="w-full border p-2 rounded" />
                </div>

                <div>
                  <label className="text-xs font-semibold">Excerpt</label>
                  <textarea value={draft.excerpt} onChange={(e) => setDraft({...draft, excerpt: e.target.value})} rows={3} className="w-full border p-2 rounded" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold">Layout Type</label>
                    <select value={draft.layout_type} onChange={(e) => setDraft({...draft, layout_type: e.target.value})} className="w-full border p-2 rounded">
                      <option value="featured">Featured (Top)</option>
                      <option value="card">Card (Grid)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Read Time</label>
                    <input type="number" value={draft.read_time} onChange={(e) => setDraft({...draft, read_time: Number(e.target.value)})} className="w-full border p-2 rounded" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold">Tags / Topics (comma separated)</label>
                  <input 
                    value={draft.tags?.join(", ") || ""} 
                    onChange={(e) => setDraft({...draft, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})} 
                    className="w-full border p-2 rounded" 
                    placeholder="MODULAR DESIGN, LIVING ROOM"
                  />
                </div>
              </form>

              {/* PREVIEW */}
              <div className="w-full lg:w-1/2 bg-[#F3F8FF] p-6 overflow-y-auto hidden lg:block">
                {/* <div className="w-full lg:w-1/2 bg-[#F3F8FF] p-6 overflow-y-auto hidden lg:block"> */}
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Live Website Preview</span>
                <div className="bg-white p-4 shadow-sm border rounded-sm">
                  <div className="aspect-[14/12] bg-gray-100 mb-3 overflow-hidden">
                    {draft.featured_image_url ? (
                      <img src={draft.featured_image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image</div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B6BB0] block mb-1">
                    {draft.tags?.[0] || "DESIGN EVOLUTION"}
                  </span>
                  <h3 className="font-serif text-[20px] text-navy leading-tight mb-2">
                    {draft.title || "Article Title"}
                  </h3>
                  <p className="text-[13px] text-gray-600 line-clamp-3 mb-3">
                    {draft.excerpt || "Excerpt here..."}
                  </p>
                  <div className="text-[11px] text-gray-400">{draft.read_time} min read</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={handleCancel} className="px-5 py-2 border rounded">Cancel</button>
              <button type="submit" form="furniture-form" disabled={isSubmitting} className="px-5 py-2 bg-primary-container text-white rounded">
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};