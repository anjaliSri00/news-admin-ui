import { DesignerPayload } from "@/helper/designers";
import React, { useState } from "react";

interface InviteContributorModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onInvite: (designer: DesignerPayload) => Promise<void> | void;
}

export const InviteContributorModal: React.FC<InviteContributorModalProps> = ({
  isOpen,
  isSubmitting = false,
  onClose,
  onInvite,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [readTime, setReadTime] = useState("");
  const [layoutType, setLayoutType] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Designer name is required.");
      return;
    }

    const payload: DesignerPayload = {
      name: name.trim(),
      ...(email.trim() && { email: email.trim() }),
      ...(excerpt.trim() && { excerpt: excerpt.trim() }),
      ...(bio.trim() && { bio: bio.trim() }),
      ...(city.trim() && { city: city.trim() }),
      ...(country.trim() && { country: country.trim() }),
      ...(specialization.trim() && {
        specialization: specialization.trim(),
      }),
      ...(portfolioUrl.trim() && {
        portfolio_url: portfolioUrl.trim(),
      }),
      ...(avatarUrl.trim() && { avatar_url: avatarUrl.trim() }),
      ...(featuredImageUrl.trim() && {
        featured_image_url: featuredImageUrl.trim(),
      }),
      ...(readTime.trim() && { read_time: readTime.trim() }),
      ...(layoutType.trim() && { layout_type: layoutType.trim() }),
    };

    try {
      await onInvite(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create designer."
      );
    }
  };

  const inputClass =
    "w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[14px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]";

  const labelClass =
    "block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#E2DFD8] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-[#E2DFD8]">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Designer Management
            </span>
            <h3 className="font-serif text-[22px] text-[#000615] mt-1">
              Add Designer
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#5e5e5c] hover:text-[#000615] text-[22px] leading-none cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-6 space-y-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter designer name"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Specialization</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Enter specialization"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter country"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Excerpt</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short designer introduction"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Biography</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter designer biography"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Portfolio URL</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Featured Image URL</label>
            <input
              type="url"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Read Time</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="Enter read time"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Layout Type</label>
              <input
                type="text"
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value)}
                placeholder="Enter layout type"
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="pt-4 border-t border-[#E2DFD8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-[#E2DFD8] font-sans text-[13px] text-[#5e5e5c] hover:text-[#000615] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#0b1f3a] text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Create Designer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
