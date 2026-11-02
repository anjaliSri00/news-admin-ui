import React, { useState, useEffect } from 'react';
import { CuratedCategory } from '../../types/editorial';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CuratedCategory | null; // null = create new, non-null = edit
  onSave: (cat: CuratedCategory) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [leadCurator, setLeadCurator] = useState('');
  const [volumePercentage, setVolumePercentage] = useState(15);
  const [readsCount, setReadsCount] = useState(120000);
  const [focusTags, setFocusTags] = useState('Critical Theory, Spatial Tectonics');
  const [leadImage, setLeadImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setDescription(category.description);
      setLeadCurator(category.leadCurator);
      setVolumePercentage(category.volumePercentage);
      setReadsCount(category.readsCount);
      setFocusTags(category.architecturalFocus.join(', '));
      setLeadImage(category.leadImage);
    } else {
      setTitle('');
      setDescription('');
      setLeadCurator('Dr. Helena Vance');
      setVolumePercentage(15);
      setReadsCount(85000);
      setFocusTags('Materiality, Phenomenology');
      setLeadImage(
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      );
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    const tags = focusTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: CuratedCategory = {
      id: category ? category.id : `cat-${Date.now()}`,
      title,
      description,
      leadCurator,
      volumePercentage: Number(volumePercentage),
      readsCount: Number(readsCount),
      monographCount: category ? category.monographCount : 1,
      architecturalFocus: tags.length > 0 ? tags : ['Spatial Tectonics'],
      leadImage:
        leadImage ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    };

    try {
      const method = category ? 'PUT' : 'POST';
      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.category) {
        onSave(data.category);
      } else {
        onSave(payload);
      }
    } catch {
      onSave(payload);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-border-subtle w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-rust">
              Section Architecture
            </span>
            <h3 className="font-serif text-[22px] text-primary mt-1 font-normal">
              {category ? 'Edit Curatorial Category' : 'Create Curatorial Category'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary text-[22px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-6 space-y-4 font-sans text-[13px]">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1">
              Section Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Adaptive Reuse & Vernacular Earth"
              className="w-full px-3.5 py-2 bg-surface-offwhite border border-border-subtle text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1">
              Curatorial Scope / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thematic parameters of this architectural department..."
              className="w-full px-3.5 py-2 bg-surface-offwhite border border-border-subtle text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1">
                Lead Curator
              </label>
              <input
                type="text"
                value={leadCurator}
                onChange={(e) => setLeadCurator(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-offwhite border border-border-subtle text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1">
                Volume Share (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={volumePercentage}
                onChange={(e) => setVolumePercentage(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-surface-offwhite border border-border-subtle text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1">
              Thematic Focus Tags (comma-separated)
            </label>
            <input
              type="text"
              value={focusTags}
              onChange={(e) => setFocusTags(e.target.value)}
              placeholder="e.g. Earth Plaster, Structural Timber, Thermal Mass"
              className="w-full px-3.5 py-2 bg-surface-offwhite border border-border-subtle text-on-surface"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1">
              Lead Section Image URL
            </label>
            <input
              type="url"
              value={leadImage}
              onChange={(e) => setLeadImage(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-offwhite border border-border-subtle font-mono text-[11px] text-on-surface"
            />
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border-subtle text-[13px] text-secondary hover:text-primary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary-container text-white text-[13px] uppercase tracking-wider font-semibold hover:bg-accent-rust transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving via API...' : category ? 'Save Changes (PUT)' : 'Create Section (POST)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
