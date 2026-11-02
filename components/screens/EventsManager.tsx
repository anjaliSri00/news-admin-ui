import React, { useState } from 'react';
import { BackendEventPayload } from '../../types/editorial';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

interface EventsManagerProps {
  events: BackendEventPayload[];
  onCreate: (event: Omit<BackendEventPayload, 'id'>) => Promise<boolean>; // 👈 Promise<boolean>
  onUpdate: (id: string, updatedData: Partial<BackendEventPayload>) => Promise<boolean>; // 👈 Promise<boolean>
  onStatusChange: (id: string, status: 'draft' | 'published' | 'archived') => Promise<BackendEventPayload | void>;
  onDelete: (id: string) => void;
  onFetchSingle?: (id: string) => Promise<BackendEventPayload | null>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;

}

const emptyDraft: Omit<BackendEventPayload, 'id'> = {
  title: '',
  content: '<p>Event details coming soon.</p>',
  excerpt: '',
  category: 'exhibitions',
  event_type: 'exhibition',
  start_date: '',
  end_date: '',
  venue: '',
  city: '',
  country: '',
  organizer: '',
  registration_url: '',
  article_url: '',
  featured_image: '',
  gallery: [],
  tags: [],
  status: 'draft',
  seo: { meta_title: '', meta_description: '', keywords: [] },
};

function getChangedFields<T extends Record<string, any>>(original: T, updated: T): Partial<T> {
  const diff: Partial<T> = {};
  
  // Keys iterate karo
  (Object.keys(updated) as Array<keyof T>).forEach((key) => {
    const originalValue = original[key];
    const updatedValue = updated[key];

    // Arrays (tags, gallery) ko JSON stringify se compare karo
    if (Array.isArray(originalValue) && Array.isArray(updatedValue)) {
      if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
        diff[key] = updatedValue;
      }
    } 
    // Objects (seo) ko JSON stringify se compare karo
    else if (typeof originalValue === 'object' && originalValue !== null && !Array.isArray(originalValue)) {
       if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
        diff[key] = updatedValue;
      }
    }
    // Simple values (string, number, boolean)
    else if (originalValue !== updatedValue) {
      diff[key] = updatedValue;
    }
  });

  return diff;
}
// Clean payload: remove empty strings, null, undefined, and empty arrays
function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key as keyof T];

    // Skip empty values
    if (
      value === "" || 
      value === null || 
      value === undefined || 
      (Array.isArray(value) && value.length === 0)
    ) {
      return;
    }

    // Handle nested objects (like 'seo')
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const nestedCleaned = cleanPayload(value);
      // Agar nested object me kuch bacha hai tabhi add karo (e.g. keywords)
      if (Object.keys(nestedCleaned).length > 0) {
        cleaned[key as keyof T] = nestedCleaned as any;
      }
      return;
    }

    cleaned[key as keyof T] = value;
  });

  return cleaned;
}

export const EventsManager: React.FC<EventsManagerProps> = ({
  events = [],
  onCreate,
  onUpdate,
  onStatusChange,
  onDelete,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [draft, setDraft] = useState<Omit<BackendEventPayload, 'id'>>(emptyDraft);
  const [tagsInput, setTagsInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI state for Modal
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (event: BackendEventPayload) => {
    setEditingId(event.id!);
    setDraft({ ...event });
    setTagsInput(event.tags?.join(', ') || '');
    setGalleryInput(event.gallery?.join('\n') || '');
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setTagsInput('');
    setGalleryInput('');
    setIsModalOpen(false);
  };

  const handleQuickStatusChange = async (id: string, newStatus: any) => {
    if (editingId === id) {
      setDraft((prev) => ({ ...prev, status: newStatus }));
    }
    const updatedEventFromApi = await onStatusChange(id, newStatus);
    if (editingId === id && updatedEventFromApi) {
      setDraft({ ...updatedEventFromApi });
    }
  };


const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (!draft.title.trim()) return toast.error("Title is required");

  setIsSubmitting(true);

  const galleryArray = galleryInput.split('\n').map((url) => url.trim()).filter(Boolean);
  const tagsArray = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

  // 1. Base payload build karo
  const rawPayload = {
    ...draft,
    tags: tagsArray,
    gallery: galleryArray,
    seo: { ...draft.seo },
  };

  try {
    if (editingId) {
      if (editingId.startsWith('temp-')) {
        toast.error("Please wait, this event is still saving...");
        return;
      }

      // --- UPDATE FLOW ---
      const originalEvent = events.find((e) => e.id === editingId);
      if (originalEvent) {
        // 1. Sirf changed fields nikalo
        const changedData = getChangedFields(originalEvent, rawPayload);
        
        // 2. Agar kuch change nahi hua
        if (Object.keys(changedData).length === 0) {
          toast.info("No changes made.");
          setIsModalOpen(false);
          return;
        }
        const success = await onUpdate(editingId, changedData);
        if (success) {
          setIsModalOpen(false);
          setEditingId(null);
          setDraft(emptyDraft);
          setTagsInput('');
          setGalleryInput('');
        }
      }
    } else {
      // --- CREATE FLOW ---
      // 🔥 Yahan cleanPayload laga diya jo empty fields hata dega
      const cleanFinalPayload = cleanPayload(rawPayload);
      
      const success = await onCreate(cleanFinalPayload as any);
      if (success) {
        setIsModalOpen(false);
        setDraft(emptyDraft);
        setTagsInput('');
        setGalleryInput('');
      }
    }
  } catch (err: any) {
    toast.error(err.message || "Something went wrong while saving.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
  

<div className="w-full flex flex-col bg-[#fcf9f8] px-6 h-auto">
  
  {/* TABLE LIST VIEW (Screenshot style) */}
  <div className="w-full bg-white border border-gray-200 shadow-sm overflow-hidden">
    
    {/* Table Header */}
    <div className="hidden md:grid grid-cols-12 gap-4 bg-[#F9F8F6] border-b border-gray-200 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
      <div className="col-span-1">Folio №</div>
      <div className="col-span-3">Event Title</div>
      <div className="col-span-2">Category</div>
      <div className="col-span-2">Location / Venue</div>
      <div className="col-span-1">Date</div>
      <div className="col-span-1">Links</div>
      <div className="col-span-2 text-right">Actions</div>
    </div>

    {events.length === 0 && (
      <div className="p-16 text-center text-secondary text-[14px]">
        <p className="font-serif text-[18px] text-primary mb-2">No events found</p>
        <p>Click the "Add Event" button in the header to create your first event.</p>
      </div>
    )}

    {/* Table Body */}
    <div className="divide-y divide-border-subtle">
      {events.map((event, index) => (
        <div 
          key={event.id} 
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-surface-offwhite transition-colors group"
        >
          {/* Col 1: Index */}
          <div className="col-span-1 hidden md:block text-[14px] font-bold text-[#8C3F2E]">
            {String(index + 1).padStart(2, '0')}
          </div>

          {/* Col 2: Title & Subtitle (Event Type) */}
          <div className="col-span-3">
            <h3 className="font-serif text-[17px] text-gray-900 leading-tight mb-1">
              {event.title}
            </h3>
            <p className="text-[11px] text-gray-500">
              {event.event_type || 'Exhibition'}
            </p>
          </div>

          {/* Col 3: Category */}
          <div className="col-span-2">
            <span className="text-[12px] text-gray-600">
              {event.category || 'Uncategorized'}
            </span>
          </div>

          {/* Col 4: Location / Venue */}
          <div className="col-span-2">
            <span className="text-[12px] text-gray-600 line-clamp-2">
              {event.city ? `${event.city}, ${event.country}` : 'Location'}{' '}
              {event.venue && <span className="text-gray-400">• {event.venue}</span>}
            </span>
          </div>

          {/* Col 5: Date */}
          <div className="col-span-1">
            <span className="text-[12px] text-gray-600 font-mono">
              {new Date(event.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
          </div>

          {/* Col 6: Link */}
           <div className="col-span-1 flex flex-col gap-1">
            {event.article_url ? (
              <a 
                href={event.article_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1"
                title="View Article"
              >
                Article <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            ) : (
              <span className="text-[11px] text-gray-400 italic">No link</span>
            )}
            
            {event.registration_url && (
              <a 
                href={event.registration_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-green-600 hover:underline flex items-center gap-1"
                title="Registration Link"
              >
                Register <span className="material-symbols-outlined text-[12px]">link</span>
              </a>
            )}
          </div>


          {/* Col 7: Actions */}
          <div className="col-span-2 flex justify-end items-center gap-2">
            {/* Edit Button (Pencil Icon) */}
            <button 
              onClick={() => handleEditClick(event)} 
              className="p-0.5 text-primary hover:text-accent-rust border border-border-subtle hover:bg-surface-offwhite transition-colors"
              title="Edit Event"
            >
             <span className="material-symbols-outlined text-[15px]">edit</span>
            </button>
            
            {/* Delete Button (Trash Icon) */}
            <button 
              onClick={() => onDelete(event.id!)} 
              className="p-0.5 text-accent-rust hover:bg-accent-rust hover:text-white border border-border-subtle transition-colors"
              title="Delete Event"
            >
            <span className="material-symbols-outlined text-[15px]">delete</span>
            </button>

            {/* Inspect / Toggle Status Button */}
            <button 
              onClick={() => handleQuickStatusChange(event.id!, event.status === 'published' ? 'draft' : 'published')}
              className={`px-3 py-1.5 text-[11px] uppercase font-bold border rounded-sm transition-colors ${
                event.status === 'published' 
                  ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' 
                  : 'border-border-subtle text-gray-700 bg-surface-offwhite hover:text-white transition-colors hover:bg-primary-container'
              }`}
                  // className="px-3 py-1 bg-surface-offwhite border border-border-subtle text-primary hover:bg-primary-container hover:text-white text-[12px] uppercase font-sans tracking-wider transition-colors cursor-pointer"

              title="Toggle Status"
            >
              {event.status === 'published' ? 'Live' : 'Draft'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
  {/* ======================================= */}
  {/* MODAL FORM WITH PREVIEW (Premium Design) */}
  {/* ======================================= */}
  {isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90rem] h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="font-serif text-2xl text-gray-900">
              {editingId ? 'Edit Event' : 'Create New Event'}
            </h2>
            <p className="text-[13px] text-gray-500 mt-1">Fill in the details to publish this event to the website.</p>
          </div>
          <button 
            onClick={handleCancelEdit} 
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Body - Split View */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* LEFT: Form (Scrollable) */}
          <form id="event-form" onSubmit={handleSubmit} className="w-full lg:w-3/5 p-8 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B6BB0] border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Event Title <span className="text-red-500">*</span></label>
                <input 
                  required 
                  value={draft.title || ''} 
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 font-serif text-[16px] focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all" 
                  placeholder="e.g. Milan Design Week 2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category</label>
                  <select 
                    value={draft.category || 'exhibitions'} 
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] bg-white focus:ring-2 focus:ring-primary-container outline-none"
                  >
                    <option value="exhibitions">Exhibitions</option>
                    <option value="conferences">Conferences</option>
                    <option value="biennials">Biennials</option>
                    <option value="workshops">Workshops</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Status</label>
                  <select 
                    value={draft.status || 'draft'} 
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as any })} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] bg-white focus:ring-2 focus:ring-primary-container outline-none font-medium"
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="published">Published (Live)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Excerpt</label>
                <textarea 
                  value={draft.excerpt || ''} 
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} 
                  rows={3} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none resize-none" 
                  placeholder="A short summary for the website card..."
                />
              </div>
            </div>

            {/* Section 2: Dates & Location */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B6BB0] border-b pb-2">Dates & Location</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={draft.start_date ? draft.start_date.split('T')[0] : ''} 
                    onChange={(e) => setDraft({ ...draft, start_date: e.target.value ? `${e.target.value}T00:00:00Z` : '' })} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">End Date</label>
                  <input 
                    type="date" 
                    value={draft.end_date ? draft.end_date.split('T')[0] : ''} 
                    onChange={(e) => setDraft({ ...draft, end_date: e.target.value ? `${e.target.value}T00:00:00Z` : '' })} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">City</label>
                  <input 
                    value={draft.city || ''} 
                    onChange={(e) => setDraft({ ...draft, city: e.target.value })} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                    placeholder="e.g. Milan"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Country</label>
                  <input 
                    value={draft.country || ''} 
                    onChange={(e) => setDraft({ ...draft, country: e.target.value })} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                    placeholder="e.g. Italy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Venue</label>
                <input 
                  value={draft.venue || ''} 
                  onChange={(e) => setDraft({ ...draft, venue: e.target.value })} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  placeholder="e.g. Fiera Milano"
                />
              </div>
            </div>

            {/* Section 3: Media & Links */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3B6BB0] border-b pb-2">Media & Links</h3>
              
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Featured Image URL</label>
                <input 
                  value={draft.featured_image || ''} 
                  onChange={(e) => setDraft({ ...draft, featured_image: e.target.value })} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  placeholder="https://example.com/hero.jpg"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Gallery Images (One URL per line)</label>
                <textarea 
                  value={galleryInput || ''} 
                  onChange={(e) => setGalleryInput(e.target.value)} 
                  rows={3} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[13px] font-mono whitespace-pre focus:ring-2 focus:ring-primary-container outline-none resize-none" 
                  placeholder={"https://img1.jpg\nhttps://img2.jpg"} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Registration URL</label>
                  <input 
                    value={draft.registration_url || ''} 
                    onChange={(e) => setDraft({ ...draft, registration_url: e.target.value })} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Article URL</label>
                  <input 
                    value={draft.article_url || ''} 
                    onChange={(e) => setDraft({ ...draft, article_url: e.target.value })} 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tags (Comma separated)</label>
                <input 
                  value={tagsInput || ''} 
                  onChange={(e) => setTagsInput(e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-primary-container outline-none" 
                  placeholder="design, milan, furniture"
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

              {/* Website Card Preview */}
              <div className="bg-white border border-gray-200 shadow-lg overflow-hidden rounded-md mb-8">
                {draft.featured_image ? (
                  <div className="w-full h-56 bg-gray-100 relative">
                    <img src={draft.featured_image} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 text-[10px] uppercase font-bold px-2 py-1 bg-white/90 text-gray-800 rounded backdrop-blur-sm">
                      {draft.category || 'Category'}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    Image Preview
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary-container text-white flex flex-col items-center justify-center shrink-0 rounded-sm shadow-sm">
                      <span className="text-2xl font-serif font-bold leading-none">
                        {draft.start_date ? new Date(draft.start_date).getDate().toString().padStart(2, '0') : '00'}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold mt-0.5 opacity-90">
                        {draft.start_date ? new Date(draft.start_date).toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'MON'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-serif text-gray-900 leading-tight mb-2">
                        {draft.title || 'Event Title Goes Here'}
                      </h3>
                      <p className="text-[13px] text-gray-500 font-medium mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {draft.city || 'City'}, {draft.country || 'Country'}
                      </p>
                      <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-3">
                        {draft.excerpt || 'The event excerpt will appear here. This is a short summary that will be shown on the website...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Preview */}
              {galleryInput.split('\n').filter(Boolean).length > 0 && (
                <div className="bg-white border border-gray-200 p-5 rounded-md shadow-sm">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2 flex justify-between">
                    <span>Gallery Images</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{galleryInput.split('\n').filter(Boolean).length}</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryInput.split('\n').filter(Boolean).map((url, i) => (
                      <div key={i} className="aspect-square bg-gray-100 border border-gray-200 rounded-sm overflow-hidden">
                        <img 
                          src={url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/100?text=Error'} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t bg-white flex justify-end gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleCancelEdit} 
            type="button" 
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="event-form"  
            disabled={isSubmitting} 
            className="px-8 py-2.5 text-sm font-semibold bg-primary-container text-white rounded-md shadow-sm hover:bg-[#8C3F2E] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Saving...' : editingId ? 'Update Event' : 'Publish Event'}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
};