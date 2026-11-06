"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, AlertTriangle, Loader2, EyeOff, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import fetchApiResponse from "../../helper/api_data_store";
import { TrendPayload } from "../../types/editorial";

const TRENDS_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/internal-dashboard/trends`;

const ALLOWED_CATEGORIES = ["design", "architecture", "interiors", "materials"];
const TREND_CATEGORIES = ["color", "material", "spatial", "cultural"];
// Frontend state always uses backend-accepted values
const SEASONS = [
  { label: "Spring", value: "spring" },
  { label: "Summer", value: "summer" },
  { label: "Autumn", value: "autumn" },
  { label: "Winter", value: "winter" },
  { label: "All Year", value: "all_year" },
];
const CONFIDENCE_LEVELS = ["high", "medium", "low"];

interface TrendsManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const emptyDraft: TrendPayload = {
  title: "",
  excerpt: "",
  content: "",
  category: ["design"],
  trend_category: "color",
  season: "autumn",
  year: new Date().getFullYear(), // Static year for now
  confidence_level: "high",
  region: "",
  color: "",
  material: "",
  style: "",
  featured_image_url: "",
  layout_type: "card",
  status: "draft",
  is_active: true,
};

function getChangedFields<T extends Record<string, any>>(original: T, updated: T): Partial<T> {
  const diff: Partial<T> = {};
  (Object.keys(updated) as Array<keyof T>).forEach((key) => {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      diff[key] = updated[key];
    }
  });
  return diff;
}

export const TrendsManager: React.FC<TrendsManagerProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { data: session } = useSession();

  const [items, setItems] = useState<TrendPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TrendPayload>(emptyDraft);
  
  const [selectedCategory, setSelectedCategory] = useState("design");
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Sync form when opened
  useEffect(() => {
    if (isModalOpen && !editingId) {
      setDraft({ ...emptyDraft });
      setSelectedCategory("design");
    }
  }, [isModalOpen, editingId]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApiResponse<{ trends: TrendPayload[] }>(TRENDS_API, {
        headers: {
          "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
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

  useEffect(() => {
    fetchItems();
  }, [session]);

const handleOpenEdit = (item: TrendPayload) => {
  setEditingId(item.id!);
  setDraft({ 
    ...item,
    season: item.season?.toLowerCase() || "autumn"
  });
  setSelectedCategory(item.category?.[0] || "design");
  setIsModalOpen(true);
};

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title || !draft.featured_image_url) {
      return toast.error("Title & Featured Image are required");
    }

    setIsSubmitting(true);
    const payload: TrendPayload = {
      ...draft,
      category: [selectedCategory],
    };

    try {
      let url = `${TRENDS_API}/add`;
      let method = "POST";
      let dataToSend: any = payload;

      if (editingId) {
        url = `${TRENDS_API}/${editingId}`;
        method = "PUT";
        const original = items.find((i) => i.id === editingId);
        if (original) {
          const changed = getChangedFields(original, payload);
          if (Object.keys(changed).length === 0) {
            toast.info("No changes made.");
            handleCancel();
            return;
          }
          dataToSend = changed;
        }
      }

      const res = await fetchApiResponse(url, {
        method,
        headers: { "Content-Type": "application/json", "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
         },
        body: JSON.stringify(dataToSend),
      });

      if (res.meta?.status === 200 || res.meta?.status === 201) {
        toast.success(editingId ? "Trend updated" : "Trend created");
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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus as any } : i)));
    try {
      await fetchApiResponse(`${TRENDS_API}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
         },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      fetchItems();
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteItemId));
    try {
      await fetchApiResponse(`${TRENDS_API}/${deleteItemId}`, {
        method: "DELETE",
        headers: { "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
         },
      });
      toast.success("Deleted successfully");
    } catch {
      fetchItems();
    }
    setDeleteItemId(null);
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="w-full flex flex-col bg-[#fcf9f8] h-auto">
      {/* LIST */}
      <div className="px-6 mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col group relative hover:shadow-xl transition-all">
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative">
                {item.featured_image_url && (
                  <img src={item.featured_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-md ${item.status === "published" ? "bg-green-600/90 text-white" : "bg-gray-800/90 text-white"}`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-md bg-white/90 text-gray-800">
                    {item.trend_category || 'Trend'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-blue-50 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteItemId(item.id!)} className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleStatus(item.id!, item.status)} className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-gray-100 hover:text-primary">
                    {item.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#3B6BB0] font-bold mb-1.5">
                  {item.category?.[0] || "Trend"}
                </span>
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
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <h2 className="font-serif text-2xl">{editingId ? "Edit" : "Create"} Trend</h2>
              <button onClick={handleCancel}>✕</button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* LEFT: FORM */}
              <form id="trend-form" onSubmit={handleSubmit} className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-4 border-r">
                
                <div>
                  <label className="text-xs font-semibold">Title *</label>
                  <input required value={draft.title} onChange={(e) => setDraft({...draft, title: e.target.value})} className="w-full border p-2 rounded" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold">Category *</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border p-2 rounded capitalize">
                      {ALLOWED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Status</label>
                    <select value={draft.status} onChange={(e) => setDraft({...draft, status: e.target.value as any})} className="w-full border p-2 rounded">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold">Trend Category</label>
                    <select value={draft.trend_category} onChange={(e) => setDraft({...draft, trend_category: e.target.value})} className="w-full border p-2 rounded capitalize">
                      {TREND_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Confidence Level</label>
                    <select value={draft.confidence_level} onChange={(e) => setDraft({...draft, confidence_level: e.target.value})} className="w-full border p-2 rounded capitalize">
                      {CONFIDENCE_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
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
  <label className="text-xs font-semibold">Season</label>
  <select 
    value={draft.season || "autumn"} 
    onChange={(e) => setDraft({...draft, season: e.target.value})} 
    className="w-full border p-2 rounded"
  >
    {SEASONS.map(s => (
      <option key={s.value} value={s.value}>{s.label}</option>
    ))}
  </select>
</div>
                  <div>
                    <label className="text-xs font-semibold">Year</label>
                    <input type="number" value={draft.year} onChange={(e) => setDraft({...draft, year: Number(e.target.value)})} className="w-full border p-2 rounded" />
                  </div>
                </div>
              </form>

              {/* RIGHT: LIVE PREVIEW */}
              <div className="w-full lg:w-1/2 bg-[#F3F8FF] p-6 overflow-y-auto hidden lg:block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Live Website Preview</span>
                
                <div className="bg-white p-4 shadow-sm border rounded-sm max-w-sm">
                  <div className="aspect-[4/3] bg-gray-100 mb-3 overflow-hidden">
                    {draft.featured_image_url ? (
                      <img src={draft.featured_image_url} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image</div>
                    )}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#3B6BB0] mb-1">{selectedCategory}</div>
                  <h3 className="font-serif text-lg text-navy mb-2">{draft.title || "Trend Title"}</h3>
                  <p className="text-[13px] text-gray-600 line-clamp-2 mb-2">{draft.excerpt || "Excerpt will appear here..."}</p>
                  <div className="text-[11px] text-gray-400">{draft.year} · {draft.season?.replace('_', ' ')}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={handleCancel} className="px-5 py-2 border rounded">Cancel</button>
              <button type="submit" form="trend-form" disabled={isSubmitting} className="px-5 py-2 bg-primary-container text-white rounded">
                {isSubmitting ? "Saving..." : "Save Trend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};