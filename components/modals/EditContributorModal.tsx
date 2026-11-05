
import { Designer, DesignerPayload } from '@/helper/designers';
import React, { useEffect, useState } from 'react';

interface EditContributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributor: Designer | null;
  onSave: (updated: Designer, payload: DesignerPayload) => Promise<void>;
}

export const EditContributorModal: React.FC<EditContributorModalProps> = ({
  isOpen,
  onClose,
  contributor,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [readTime, setReadTime] = useState('');
  const [layoutType, setLayoutType] = useState('');
  const [status, setStatus] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!contributor) return;

    setName(contributor.name ?? '');
    setSlug(contributor.slug ?? '');
    setEmail(contributor.email ?? '');
    setExcerpt(contributor.excerpt ?? '');
    setBio(contributor.bio ?? '');
    setCity(contributor.city ?? '');
    setCountry(contributor.country ?? '');
    setSpecialization(contributor.specialization ?? '');
    setPortfolioUrl(contributor.portfolio_url ?? '');
    setAvatarUrl(contributor.avatar_url ?? '');
    setFeaturedImageUrl(contributor.featured_image_url ?? '');
    setReadTime(
      contributor.read_time !== undefined && contributor.read_time !== null
        ? String(contributor.read_time)
        : ''
    );
    setLayoutType(contributor.layout_type ?? '');
    setStatus(contributor.status ?? '');
    setIsActive(contributor.is_active ?? true);
    setError('');
  }, [contributor, isOpen]);

  if (!isOpen || !contributor) return null;

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name.trim()) {
    setError('Name is required.');
    return;
  }

  if (!contributor) return;

  setIsSaving(true);
  setError('');

  const currentValues: DesignerPayload = {
    name: name.trim(),
    slug: slug.trim() || null,
    email: email.trim() || null,
    excerpt: excerpt.trim() || null,
    bio: bio.trim() || null,
    city: city.trim() || null,
    country: country.trim() || null,
    specialization: specialization.trim() || null,
    portfolio_url: portfolioUrl.trim() || null,
    avatar_url: avatarUrl.trim() || null,
    featured_image_url: featuredImageUrl.trim() || null,
    read_time: readTime ? Number(readTime) : undefined,
    layout_type: layoutType.trim() || undefined,
    status: status || undefined,
    is_active: isActive,
  };

  const originalValues: DesignerPayload = {
    name: contributor.name,
    slug: contributor.slug ?? null,
    email: contributor.email ?? null,
    excerpt: contributor.excerpt ?? null,
    bio: contributor.bio ?? null,
    city: contributor.city ?? null,
    country: contributor.country ?? null,
    specialization: contributor.specialization ?? null,
    portfolio_url: contributor.portfolio_url ?? null,
    avatar_url: contributor.avatar_url ?? null,
    featured_image_url: contributor.featured_image_url ?? null,
    read_time: contributor.read_time ?? undefined,
    layout_type: contributor.layout_type ?? undefined,
    status: contributor.status ?? undefined,
    is_active: contributor.is_active ?? true,
  };

  const payload: Partial<DesignerPayload> = {};

  (Object.keys(currentValues) as (keyof DesignerPayload)[]).forEach((key) => {
    if (currentValues[key] !== originalValues[key]) {
      Object.assign(payload, { [key]: currentValues[key] });
    }
  });

  if (Object.keys(payload).length === 0) {
    onClose();
    setIsSaving(false);
    return;
  }

  try {
    await onSave(
      { ...contributor, ...payload },
      payload as DesignerPayload
    );
    onClose();
  } catch (err) {
    console.error('Failed to update designer:', err);
    setError(
      err instanceof Error ? err.message : 'Failed to update designer.'
    );
  } finally {
    setIsSaving(false);
  }
};

  const inputClass =
    'w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]';
  const labelClass =
    'block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#E2DFD8] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-[#E2DFD8]">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Designer Registry
            </span>
            <h3 className="font-serif text-[22px] text-[#000615] mt-1">
              Edit Designer Profile
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close modal"
            className="text-[#5e5e5c] hover:text-[#000615] text-[22px] leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-6 space-y-4 font-sans text-[13px]">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Specialization</label>
            <input
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Profile Summary / Excerpt</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Biography</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Portfolio URL</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Featured Image URL</label>
            <input
              type="url"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Read Time (minutes)</label>
              <input
                type="number"
                min={0}
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Layout Type</label>
              <input
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value)}
                className={inputClass}
                placeholder="Enter layout type"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
                placeholder="Enter status"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-[#1c1b1b] self-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active designer
            </label>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="pt-4 border-t border-[#E2DFD8] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-[#E2DFD8] text-[#5e5e5c] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#0b1f3a] text-white text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] disabled:opacity-50"
            >
              {isSaving ? 'Updating...' : 'Save Designer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContributorModal;
