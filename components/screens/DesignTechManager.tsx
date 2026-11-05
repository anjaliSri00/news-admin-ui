"use client";

import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  EyeOff,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import fetchApiResponse from "../../helper/api_data_store";

const DESIGN_TECH_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/internal-dashboard/design-tech`;

interface DesignTechManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const emptyDraft: any = {
  title: "",
  excerpt: "",
  content: "",
  category: ["design_tech"],
  featured_image_url: "",
  read_time: 5,
  layout_type: "featured", // Defaulting to featured
  status: "draft",
  is_active: true,
  extra: {
    checklistTitle: "Before you specify a smart home",
    checklistDesc: "Four questions to ask before adding another connected device:",
    checklistItems: [
      "Does it work offline?",
      "Who owns the data?",
      "Can it be repaired?",
      "Will it age gracefully?",
    ],
    buttonText: "Read the checklist",
    buttonUrl: "/category/design-tech",
  },
};

function getChangedFields<T extends Record<string, any>>(
  original: T,
  updated: T,
): Partial<T> {
  const diff: Partial<T> = {};
  (Object.keys(updated) as Array<keyof T>).forEach((key) => {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      diff[key] = updated[key];
    }
  });
  return diff;
}

export const DesignTechManager: React.FC<DesignTechManagerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { data: session } = useSession();

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"featured" | "card" | "compact">("featured");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(emptyDraft);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Reset form when opened for create
  useEffect(() => {
    if (isModalOpen && !editingId) {
      setDraft({...JSON.parse(JSON.stringify(emptyDraft)), layout_type: activeTab});
    }
  }, [isModalOpen, editingId, activeTab]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApiResponse<{ design_tech: any[] }>(DESIGN_TECH_API, {
        headers: {
          "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
        },
      });
      if (res.meta?.status === 200 && res.data?.design_tech) {
        setItems(res.data.design_tech);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load design tech articles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [session]);

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setDraft({
      ...item,
      extra: item.extra && Object.keys(item.extra).length > 0 ? item.extra : emptyDraft.extra,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const handleExtraChange = (field: string, value: string) => {
    setDraft((prev: any) => ({
      ...prev,
      extra: { ...prev.extra, [field]: value },
    }));
  };

  const handleChecklistItemChange = (index: number, value: string) => {
    setDraft((prev: any) => {
      const newItems = [...(prev.extra?.checklistItems || [])];
      newItems[index] = value;
      return { ...prev, extra: { ...prev.extra, checklistItems: newItems } };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title && draft.layout_type !== "compact") {
      return toast.error("Title is required");
    }
    if (draft.layout_type === "featured" && !draft.featured_image_url) {
      return toast.error("Featured Image is required for this layout");
    }

    setIsSubmitting(true);
    
    // Conditionally send extra only for compact layout
    const payload = { 
      ...draft, 
      read_time: Number(draft.read_time),
      extra: draft.layout_type === "compact" ? draft.extra : {},
    };

    try {
      let url = `${DESIGN_TECH_API}/add`;
      let method = "POST";
      let dataToSend = payload;

      if (editingId) {
        url = `${DESIGN_TECH_API}/${editingId}`;
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
        headers: {
          "Content-Type": "application/json",
          "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
        },
        body: JSON.stringify(dataToSend),
      });

      if (res.meta?.status === 200 || res.meta?.status === 201) {
        toast.success(editingId ? "Updated successfully" : "Created successfully");
        handleCancel();
        fetchItems();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    try {
      await fetchApiResponse(`${DESIGN_TECH_API}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": session?.accessToken || "",
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
      await fetchApiResponse(`${DESIGN_TECH_API}/${deleteItemId}`, {
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

  const filteredItems = items.filter((item) => item.layout_type === activeTab);


  if (isLoading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }


  

  return (
    <div className="w-full flex flex-col bg-[#fcf9f8] h-auto">
         <div className="px-6 mx-auto w-full pt-6">
        <div className="flex border-b border-gray-200 gap-6">
          <button
            onClick={() => setActiveTab("featured")}
            className={`pb-3 text-[15px] font-semibold transition-colors ${activeTab === "featured" ? "border-b-2 border-[#3B6BB0] text-[#3B6BB0]" : "text-gray-500"}`}
          >
            Left Featured (Big)
          </button>
          <button
            onClick={() => setActiveTab("card")}
            className={`pb-3 text-[15px] font-semibold transition-colors ${activeTab === "card" ? "border-b-2 border-[#3B6BB0] text-[#3B6BB0]" : "text-gray-500"}`}
          >
            Middle Cards (Text)
          </button>
          <button
            onClick={() => setActiveTab("compact")}
            className={`pb-3 text-[15px] font-semibold transition-colors ${activeTab === "compact" ? "border-b-2 border-[#3B6BB0] text-[#3B6BB0]" : "text-gray-500"}`}
          >
            Right Side Box (Brief)
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      <div className="px-6 mx-auto w-full">
        {filteredItems.length === 0 && (
          <div className="p-16 text-center border border-dashed border-gray-300 bg-white rounded-lg">
            <p className="font-serif text-lg text-gray-900 mb-2">No Design Tech articles found</p>
            <p className="text-sm text-gray-500">Click "Add" from the header to create one.</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col group relative hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative">
                {item.featured_image_url && (
                  <img
                    src={item.featured_image_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute top-3 left-3 flex gap-1">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-md ${
                      item.status === "published" ? "bg-green-600/90 text-white" : "bg-gray-800/90 text-white"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-white/90 text-gray-800 backdrop-blur-md">
                    {item.layout_type}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteItemId(item.id)}
                    className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-gray-100 hover:text-primary"
                  >
                    {item.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#3B6BB0] font-bold mb-1.5">
                  {item.category?.[0] || "Design Tech"}
                </span>
                <h3 className="font-serif text-[18px] text-gray-900 leading-snug mb-2 line-clamp-2">
                  {item.layout_type === 'compact' ? item.extra?.checklistTitle || "Practical Brief" : item.title}
                </h3>
                <p className="text-[12px] text-gray-500 line-clamp-2 mt-auto">
                  {item.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteItemId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl mb-2">Delete Item?</h3>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setDeleteItemId(null)} className="px-4 py-2 border rounded-md">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 shrink-0">
              <h2 className="font-serif text-2xl">{editingId ? "Edit" : "Create"} Design Tech</h2>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-200 rounded-full">✕</button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* LEFT: FORM */}
              <form
                id="design-tech-form"
                onSubmit={handleSubmit}
                className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-5 border-r border-gray-200"
              >
                {/* Common: Layout Type Selector */}
                <div>
                  <label className="text-sm font-bold text-gray-800 block mb-2">Select Section (Layout Type) *</label>
                  <select
                    value={draft.layout_type || "featured"}
                    onChange={(e) => setDraft({ ...draft, layout_type: e.target.value })}
                    className="w-full border p-2.5 rounded-md font-semibold bg-gray-50 focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="featured">Left Section (Featured Large)</option>
                    <option value="card">Middle Section (Text Cards)</option>
                    <option value="compact">Right Section (Practical Brief Box)</option>
                  </select>
                </div>

                {/* =========================================
                    CONDITION 1: FEATURED (LEFT SECTION)
                ========================================= */}
                {draft.layout_type === 'featured' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B6BB0]">Left Section Details</h3>
                    
                    <div>
                      <label className="text-xs font-semibold">Title *</label>
                      <input
                        required
                        value={draft.title || ""}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        className="w-full border p-2 rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold">Image URL *</label>
                      <input
                        required
                        value={draft.featured_image_url || ""}
                        onChange={(e) => setDraft({ ...draft, featured_image_url: e.target.value })}
                        className="w-full border p-2 rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold">Excerpt</label>
                      <textarea
                        value={draft.excerpt || ""}
                        onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                        className="w-full border p-2 rounded text-sm"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold">Read Time (mins)</label>
                      <input
                        type="number"
                        value={draft.read_time || 0}
                        onChange={(e) => setDraft({ ...draft, read_time: Number(e.target.value) })}
                        className="w-full border p-2 rounded text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* =========================================
                    CONDITION 2: CARD (MIDDLE SECTION)
                ========================================= */}
                {draft.layout_type === 'card' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B6BB0]">Middle Section Details</h3>

                    <div>
                      <label className="text-xs font-semibold">Title *</label>
                      <input
                        required
                        value={draft.title || ""}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        className="w-full border p-2 rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold">Excerpt</label>
                      <textarea
                        value={draft.excerpt || ""}
                        onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                        className="w-full border p-2 rounded text-sm"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold">Read Time (mins)</label>
                      <input
                        type="number"
                        value={draft.read_time || 0}
                        onChange={(e) => setDraft({ ...draft, read_time: Number(e.target.value) })}
                        className="w-full border p-2 rounded text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded border">
                      Note: Middle section me image nahi dikhti, sirf text hota hai.
                    </p>
                  </div>
                )}

                {/* =========================================
                    CONDITION 3: COMPACT (RIGHT SECTION)
                ========================================= */}
                {draft.layout_type === 'compact' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B6BB0]">Right Section (Practical Brief)</h3>

                    <div>
                      <label className="text-xs font-semibold">Box Kicker / Title</label>
                      <input
                        value={draft.extra?.checklistTitle || ""}
                        onChange={(e) => handleExtraChange("checklistTitle", e.target.value)}
                        className="w-full border p-2 rounded text-sm"
                        placeholder="e.g. Before you specify a smart home"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold">Box Description</label>
                      <textarea
                        value={draft.extra?.checklistDesc || ""}
                        onChange={(e) => handleExtraChange("checklistDesc", e.target.value)}
                        className="w-full border p-2 rounded text-sm"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1">Checklist Items</label>
                      {(draft.extra?.checklistItems || []).map((item: string, idx: number) => (
                        <input
                          key={idx}
                          value={item}
                          onChange={(e) => handleChecklistItemChange(idx, e.target.value)}
                          className="w-full border p-2 rounded text-sm mb-2"
                          placeholder={`Item ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div>
                      <label className="text-xs font-semibold">Button Text</label>
                      <input
                        value={draft.extra?.buttonText || ""}
                        onChange={(e) => handleExtraChange("buttonText", e.target.value)}
                        className="w-full border p-2 rounded text-sm"
                      />
                    </div>
                  </div>
                )}
              </form>

              {/* RIGHT: LIVE PREVIEW */}
              <div className="w-full lg:w-1/2 bg-[#F3F8FF] p-6 overflow-y-auto hidden lg:block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-4">
                  Live Website Preview
                </span>

                {/* Featured Layout Preview */}
                {draft.layout_type === 'featured' && (
                  <div className="bg-white p-5 shadow-sm border border-gray-200 rounded-sm mb-6">
                    <div className="aspect-[6/2.5] bg-gray-100 mb-4 overflow-hidden">
                      {draft.featured_image_url ? (
                        <img src={draft.featured_image_url} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image</div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#3B6BB0] block mb-1">
                      {draft.category?.[0] || 'Design Tech'}
                    </span>
                    <h3 className="font-serif text-[24px] text-[#1a1a1a] leading-tight mb-2">
                      {draft.title || "Article Title Here"}
                    </h3>
                    <p className="text-[13px] text-gray-600 line-clamp-3 mb-3">
                      {draft.excerpt || "Excerpt will appear here..."}
                    </p>
                    <div className="text-[11px] text-gray-400">{draft.read_time} min read</div>
                  </div>
                )}

                {/* Card Layout Preview */}
                {draft.layout_type === 'card' && (
                  <div className="bg-white p-5 shadow-sm border border-gray-200 rounded-sm mb-6">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#3B6BB0] block mb-1">
                      {draft.category?.[0] || 'Design Tech'}
                    </span>
                    <h3 className="font-serif text-[20px] text-[#1a1a1a] leading-tight mb-2">
                      {draft.title || "Article Title Here"}
                    </h3>
                    <p className="text-[13px] text-gray-600 line-clamp-3 mb-4">
                      {draft.excerpt || "Excerpt will appear here..."}
                    </p>
                    <div className="text-[11px] text-gray-400">{draft.read_time} min read</div>
                  </div>
                )}

                {/* Compact Layout Preview */}
                {draft.layout_type === 'compact' && (
                  <div className="bg-white border border-slate-200 p-6 flex flex-col justify-start shadow-sm rounded-sm w-full max-w-sm">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#3B6BB0] font-bold block mb-3">
                        THE PRACTICAL BRIEF
                      </span>
                      <h3 className="text-[22px] font-serif text-[#0b1f3a] mb-3 leading-snug">
                        {draft.extra?.checklistTitle || "Before you specify a smart home"}
                      </h3>
                      <p className="text-[13px] text-slate-600 mb-5 leading-relaxed">
                        {draft.extra?.checklistDesc || "Four questions to ask before adding another connected device:"}
                      </p>
                      <ol className="space-y-3 text-[13px] text-slate-700">
                        {(draft.extra?.checklistItems || []).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="font-mono text-[11px] font-bold text-[#3B6BB0] mt-0.5 shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="leading-tight">{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="pt-5 border-t border-slate-200 mt-6">
                      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#3B6BB0]">
                        <span>{draft.extra?.buttonText || "Read the checklist"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-white flex justify-end gap-3 shrink-0">
              <button onClick={handleCancel} className="px-5 py-2 text-sm font-semibold border rounded-md">
                Cancel
              </button>
              <button
                type="submit"
                form="design-tech-form"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-semibold bg-primary-container text-white rounded-md disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};