"use client";

import React, { useState, useEffect } from "react";
import { NewsItemPayload } from "../../types/editorial";
import {
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  EyeOff,
  Eye,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import fetchApiResponse from "../../helper/api_data_store";

const NEWS_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/internal-dashboard/news`;

// Allowed Categories from Backend
const ALLOWED_CATEGORIES = [
  "home_decor",
  "events",
  "trends",
  "furniture",
  "projects",
  "products",
  "designers",
  "design_tech",
  "decor",
  "showroom_showcase",
];

function getChangedFields<T extends Record<string, any>>(
  original: T,
  updated: T,
): Partial<T> {
  const diff: Partial<T> = {};

  (Object.keys(updated) as Array<keyof T>).forEach((key) => {
    const originalValue = original[key];
    const updatedValue = updated[key];

    // Arrays (category) compare
    if (Array.isArray(originalValue) && Array.isArray(updatedValue)) {
      if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
        diff[key] = updatedValue;
      }
    }
    // Objects compare
    else if (typeof originalValue === "object" && originalValue !== null) {
      if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
        diff[key] = updatedValue;
      }
    }
    // Simple values
    else if (originalValue !== updatedValue) {
      diff[key] = updatedValue;
    }
  });

  return diff;
}

interface NewsManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  defaultTab?: "latest" | "trending" | "special";
}

const emptyDraft: any = {
  title: "",
  excerpt: "",
  content: "<p>Details coming soon.</p>",
  category: ["home_decor"], // Array of categories
  news_type: "latest",
  featured_image_url: "",
  read_time: 4,
  status: "draft",
  layout_type: "card",
  is_active: true,
};

export const NewsManager: React.FC<NewsManagerProps> = ({
  isModalOpen,
  setIsModalOpen,
  defaultTab = "latest",
}) => {
  const { data: session } = useSession();

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"latest" | "trending" | "special">(
    defaultTab,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(emptyDraft);
  const [selectedCategory, setSelectedCategory] = useState("home_decor"); // Single select
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Sync tab when prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
    setDraft((prev: any) => ({ ...prev, news_type: defaultTab }));
  }, [defaultTab]);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApiResponse<{ news: any[] }>(`${NEWS_API}/list`, {
        headers: {
          "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
        },
      });
      if (res.meta?.status === 200 && res.data?.news) {
        setItems(res.data.news);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load news");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [session]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setDraft({ ...emptyDraft, news_type: activeTab });
    setSelectedCategory("home_decor");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id!);
    setDraft({ ...item });
    setSelectedCategory(item.category?.[0] || "home_decor");
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title || !draft.featured_image_url)
      return toast.error("Title & Image required");

    setIsSubmitting(true);

    // 1. Form se naya payload banao
    const newPayload = {
      ...draft,
      news_type: activeTab,
      category: [selectedCategory],
      read_time: Number(draft.read_time),
    };

    try {
      let url = `${NEWS_API}/add`;
      let method = "POST";
      let payloadToSend = newPayload;

      // 2. Agar EDIT mode me hai
      if (editingId) {
        url = `${NEWS_API}/${editingId}`;
        method = "PUT";

        // Original item dhundo
        const originalItem = items.find((i) => i.id === editingId);

        if (originalItem) {
          // Sirf changed fields nikalo
          const changedData = getChangedFields(originalItem, newPayload);

          // Agar kuch bhi change nahi hua
          if (Object.keys(changedData).length === 0) {
            toast.info("No changes made.");
            setIsModalOpen(false);
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
          "Refresh-Token": session?.refreshToken || "",
        },
        body: JSON.stringify(payloadToSend), // 👈 Sirf changed data jayega
      });

      if (res.meta?.status === 200 || res.meta?.status === 201) {
        toast.success(editingId ? "News updated" : "News created");
        handleCancel();
        fetchNews();
      } else {
        toast.error(res.meta?.message || "Validation error");
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
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
    );
    try {
      await fetchApiResponse(`${NEWS_API}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      fetchNews();
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteItemId));
    try {
      await fetchApiResponse(`${NEWS_API}/${deleteItemId}`, {
        method: "DELETE",
        headers: { "Access-Token": session?.accessToken || "" },
      });
      toast.success("Deleted successfully");
    } catch {
      fetchNews();
    }
    setDeleteItemId(null);
  };

  // Filter only 'latest' or 'special' based on tab
  const filteredItems = items.filter((item) => item.news_type === activeTab);

  if (isLoading)
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );

  return (
    <div className="w-full flex flex-col bg-[#fcf9f8] h-auto">
      {/* GRID LIST (Simplified for brevity) */}
      <div className="px-6 mx-auto w-full">
        {filteredItems.length === 0 && (
          <div className="p-16 text-center border border-dashed border-gray-300 bg-white rounded-lg">
            <p className="font-serif text-lg text-gray-900 mb-2">
              No {activeTab} items found
            </p>
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
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-md ${item.status === "published" ? "bg-green-600/90 text-white" : "bg-gray-800/90 text-white"}`}
                  >
                    {item.status}
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
                    onClick={() => setDeleteItemId(item.id!)}
                    className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(item.id, item.status);
                    }}
                    className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-gray-100 hover:text-primary"
                    title={
                      item.status === "published" ? "Unpublish" : "Publish"
                    }
                  >
                    {item.status === "published" ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#3B6BB0] font-bold mb-1.5">
                  {item.category?.[0]}
                </span>
                <h3 className="font-serif text-[18px] text-gray-900 leading-snug mb-2 line-clamp-2">
                  {item.title}
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
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl mb-2">Delete Item?</h3>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteItemId(null)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 shrink-0">
              <h2 className="font-serif text-2xl">
                {editingId ? "Edit" : "Create"}{" "}
                {activeTab === "latest" ? "Latest News" : "Special Report"}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* LEFT: FORM */}
              <form
                id="news-form"
                onSubmit={handleSubmit}
                className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-4 border-r border-gray-200"
              >
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    Title *
                  </label>
                  <input
                    required
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 font-serif text-[16px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                      Category *
                    </label>
                    {/* 👇 ALLOWED CATEGORIES DROPDOWN 👇 */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-[13px] capitalize"
                    >
                      {ALLOWED_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        setDraft({ ...draft, status: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 text-[13px]"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    Image URL *
                  </label>
                  <input
                    required
                    value={draft.featured_image_url}
                    onChange={(e) =>
                      setDraft({ ...draft, featured_image_url: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 text-[13px]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    Excerpt
                  </label>
                  <textarea
                    value={draft.excerpt}
                    onChange={(e) =>
                      setDraft({ ...draft, excerpt: e.target.value })
                    }
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-[13px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    Read Time (mins)
                  </label>
                  <input
                    type="number"
                    value={draft.read_time}
                    onChange={(e) =>
                      setDraft({ ...draft, read_time: Number(e.target.value) })
                    }
                    className="w-full border rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
              </form>

              {/* RIGHT: LIVE PREVIEW */}
              <div className="w-full lg:w-1/2 bg-[#fcf9f8] border-l p-6 overflow-y-auto hidden lg:block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-4">
                  Live Website Preview
                </span>

                {/* LATEST NEWS PREVIEW */}
                {activeTab === "latest" && (
                  <div className="bg-white p-5 shadow-sm border border-gray-200 rounded-md">
                    <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#3B6BB0] block mb-0.5">
                          The Daily Dispatch
                        </span>
                        <h2 className="font-serif text-[22px] text-[#1a1a1a] leading-none">
                          Latest News
                        </h2>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                        {draft.featured_image_url ? (
                          <img
                            src={draft.featured_image_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Image
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#3B6BB0] block">
                        {selectedCategory.replace("_", " ")} / TOKYO
                      </span>
                      <h3 className="font-serif text-[24px] text-[#1a1a1a] leading-tight mb-1">
                        {draft.title || "Less floor area. More possibilities."}
                      </h3>
                      <p className="text-[12px] text-gray-600 line-clamp-2">
                        {draft.excerpt || "Inside the compact homes..."}
                      </p>
                      <div className="text-[10px] text-gray-400 mt-2">
                        By Editorial Desk · 14 Oct 2026 · {draft.read_time} min
                        read
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIAL REPORTS PREVIEW */}
                {activeTab === "special" && (
                  <div className="bg-[#0A192F] p-5 shadow-sm rounded-md text-white">
                    <div className="flex justify-between items-end mb-4 border-b border-white/20 pb-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#88B0E8] block mb-0.5">
                          Original Research
                        </span>
                        <h2 className="font-serif text-[22px] text-white leading-none">
                          Special Reports
                        </h2>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="aspect-[4/3] w-full bg-gray-800 overflow-hidden">
                        {draft.featured_image_url ? (
                          <img
                            src={draft.featured_image_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                            Image
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#88B0E8] block">
                        {selectedCategory.replace("_", " ")}
                      </span>
                      <h3 className="font-serif text-[22px] text-white leading-tight mb-1">
                        {draft.title || "The circular interiors report"}
                      </h3>
                      <p className="text-[13px] text-gray-300 line-clamp-3">
                        {draft.excerpt || "Repair, reuse and the realities..."}
                      </p>
                      <div className="text-[11px] text-gray-400 mt-2">
                        Published 14 Oct 2026 · {draft.read_time} min read
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-white flex justify-end gap-3 shrink-0">
              <button
                onClick={handleCancel}
                className="px-5 py-2 text-sm font-semibold border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="news-form"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-semibold bg-primary-container text-white rounded-md disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
