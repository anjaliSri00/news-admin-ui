"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, AlertTriangle, Loader2, EyeOff, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import fetchApiResponse from "../../helper/api_data_store";
import { ProjectPayload } from "../../types/editorial";

const PROJECTS_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/internal-dashboard/projects`;

const PROJECT_TYPES = ["residential", "commercial", "hospitality", "public", "workplace"];
const ALLOWED_CATEGORIES = ["architecture", "interior", "urban", "landscape"];

interface ProjectsManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const emptyDraft: ProjectPayload = {
  title: "",
  excerpt: "",
  content: "",
  category: ["architecture"],
  project_type: "residential",
  project_status: "completed",
  city: "",
  country: "",
  architect: "",
  year: new Date().getFullYear(),
  area: 0,
  featured_image_url: "",
  layout_type: "featured", // Default for top item
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

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { data: session } = useSession();

  const [items, setItems] = useState<ProjectPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProjectPayload>(emptyDraft);
  const [selectedCategory, setSelectedCategory] = useState("architecture");
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Sync form when opened
  useEffect(() => {
    if (isModalOpen && !editingId) {
      setDraft({ ...emptyDraft });
      setSelectedCategory("architecture");
    }
  }, [isModalOpen, editingId]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApiResponse<{ projects: ProjectPayload[] }>(PROJECTS_API, {
        headers: {
          "Access-Token": session?.accessToken || "",
          "Refresh-Token": session?.refreshToken || "",
        },
      });
      if (res.meta?.status === 200 && res.data?.projects) {
        setItems(res.data.projects);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [session]);

  const handleOpenEdit = (item: ProjectPayload) => {
    setEditingId(item.id!);
    setDraft({ ...item });
    setSelectedCategory(item.category?.[0] || "architecture");
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
    const payload: ProjectPayload = {
      ...draft,
      category: [selectedCategory],
    };

    try {
      let url = `${PROJECTS_API}/add`;
      let method = "POST";
      let dataToSend: any = payload;

      if (editingId) {
        url = `${PROJECTS_API}/${editingId}`;
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
        toast.success(editingId ? "Project updated" : "Project created");
        handleCancel();
        fetchItems();
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
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus as any } : i)));
    try {
      await fetchApiResponse(`${PROJECTS_API}/${id}/status`, {
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
      await fetchApiResponse(`${PROJECTS_API}/${deleteItemId}`, {
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
                    {item.layout_type || 'card'}
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
                  {item.category?.[0] || "Project"}
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
            <h3 className="font-serif text-xl mb-2">Delete Project?</h3>
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
              <h2 className="font-serif text-2xl">{editingId ? "Edit" : "Create"} Project</h2>
              <button onClick={handleCancel}>✕</button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* LEFT: FORM */}
              <form id="project-form" onSubmit={handleSubmit} className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-4 border-r">
                
                <div>
                  <label className="text-xs font-semibold">Project Title *</label>
                  <input required value={draft.title} onChange={(e) => setDraft({...draft, title: e.target.value})} className="w-full border p-2 rounded" />
                </div>

                {/* Layout Type & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold">Layout Type</label>
                    <select value={draft.layout_type} onChange={(e) => setDraft({...draft, layout_type: e.target.value})} className="w-full border p-2 rounded">
                      <option value="featured">Featured (Left Large)</option>
                      <option value="card">Card (Right Small)</option>
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

                {/* Image */}
                <div>
                  <label className="text-xs font-semibold">Image URL *</label>
                  <input required value={draft.featured_image_url || ""} onChange={(e) => setDraft({...draft, featured_image_url: e.target.value})} className="w-full border p-2 rounded" />
                </div>

                {/* Category & Project Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold">Category *</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border p-2 rounded capitalize">
                      {ALLOWED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Project Type</label>
                    <select value={draft.project_type} onChange={(e) => setDraft({...draft, project_type: e.target.value})} className="w-full border p-2 rounded capitalize">
                      {PROJECT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-xs font-semibold">Excerpt</label>
                  <textarea value={draft.excerpt} onChange={(e) => setDraft({...draft, excerpt: e.target.value})} rows={3} className="w-full border p-2 rounded" />
                </div>

                {/* Location & Architect */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold">City</label>
                    <input value={draft.city || ""} onChange={(e) => setDraft({...draft, city: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Country</label>
                    <input value={draft.country || ""} onChange={(e) => setDraft({...draft, country: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold">Architect / Designer</label>
                  <input value={draft.architect || ""} onChange={(e) => setDraft({...draft, architect: e.target.value})} className="w-full border p-2 rounded" />
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
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#3B6BB0] mb-1">
                    {selectedCategory} / {draft.city || 'Location'}
                  </div>
                  <h3 className="font-serif text-lg text-navy mb-2">{draft.title || "Project Title"}</h3>
                  <p className="text-[13px] text-gray-600 line-clamp-2 mb-2">{draft.excerpt || "Excerpt will appear here..."}</p>
                  <div className="text-[11px] text-gray-400">
                    By {draft.architect || 'Architect'} · {draft.year}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={handleCancel} className="px-5 py-2 border rounded">Cancel</button>
              <button type="submit" form="project-form" disabled={isSubmitting} className="px-5 py-2 bg-primary-container text-white rounded">
                {isSubmitting ? "Saving..." : "Save Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};