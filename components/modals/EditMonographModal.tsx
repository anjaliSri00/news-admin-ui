import React, { useState, useEffect } from 'react';
import { Monograph } from '../../types/editorial';

interface EditMonographModalProps {
  isOpen: boolean;
  onClose: () => void;
  monograph: Monograph | null;
  onUpdate: (updated: Monograph) => void;
}

export const EditMonographModal: React.FC<EditMonographModalProps> = ({
  isOpen,
  onClose,
  monograph,
  onUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorDesk, setAuthorDesk] = useState('');
  const [architecturalStyle, setArchitecturalStyle] = useState('');
  const [location, setLocation] = useState('');
  const [targetReleaseDate, setTargetReleaseDate] = useState('');
  const [status, setStatus] = useState<Monograph['status']>('review');
  const [synopsis, setSynopsis] = useState('');
  const [pullQuote, setPullQuote] = useState('');
  const [fullBody, setFullBody] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    if (monograph) {
      setTitle(monograph.title);
      setSubtitle(monograph.subtitle || '');
      setCategory(monograph.category);
      setAuthorName(monograph.author.name);
      setAuthorDesk(monograph.author.desk);
      setArchitecturalStyle(monograph.architecturalStyle || '');
      setLocation(monograph.location || '');
      setTargetReleaseDate(monograph.targetReleaseDate);
      setStatus(monograph.status);
      setSynopsis(monograph.synopsis);
      setPullQuote(monograph.pullQuote || '');
      setFullBody(monograph.fullBody || monograph.synopsis || '');
      setCoverImage(monograph.coverImage);
    }
  }, [monograph]);

  if (!isOpen || !monograph) return null;

  const handleAiAssist = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-synopsis',
          title,
          category,
          author: authorName,
          style: architecturalStyle,
          location,
          currentText: fullBody || synopsis,
        }),
      });
      const data = await res.json();
      if (data.synopsis) setSynopsis(data.synopsis);
      if (data.pullQuote) setPullQuote(data.pullQuote);
    } catch (err) {
      console.error('Failed to run AI assistance:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);

    const labels: Record<Monograph['status'], string> = {
      draft: 'Drafting Ingest',
      review: 'Peer Review (Zurich)',
      scheduled: 'Ready to Publish',
      published: 'Published',
    };

    const updatedMonograph: Monograph = {
      ...monograph,
      title,
      subtitle,
      category,
      author: {
        ...monograph.author,
        name: authorName,
        desk: authorDesk,
      },
      architecturalStyle,
      location,
      targetReleaseDate,
      status,
      statusLabel: labels[status],
      synopsis,
      pullQuote,
      fullBody,
      coverImage: coverImage || monograph.coverImage,
    };

    try {
      const res = await fetch('/api/monographs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMonograph),
      });
      const data = await res.json();
      if (data.success && data.monograph) {
        onUpdate(data.monograph);
      } else {
        onUpdate(updatedMonograph);
      }
    } catch {
      onUpdate(updatedMonograph);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-[#E2DFD8] w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between pb-4 border-b border-[#E2DFD8]">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Editorial CMS · Folio № {monograph.number}
            </span>
            <h3 className="font-serif text-[24px] text-[#000615] mt-1 font-normal">
              Edit Architectural Monograph
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5e5e5c] hover:text-[#000615] text-[24px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-6 space-y-5">
          {/* Title & Subtitle */}
          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
              Manuscript Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E2DFD8] font-serif text-[16px] text-[#000615] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
              Subtitle / Typology Header
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Curatorial Category Axis
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
              >
                <option value="Home Decor & Spatial Sanctuaries">
                  Home Decor & Spatial Sanctuaries
                </option>
                <option value="Architectural Projects & Critical Monographs">
                  Architectural Projects & Critical Monographs
                </option>
                <option value="Furniture, Joinery & Product Monographs">
                  Furniture, Joinery & Product Monographs
                </option>
                <option value="Designers, Theorists & Dialogues">
                  Designers, Theorists & Dialogues
                </option>
                <option value="Design Tech, Computation & Acoustic Science">
                  Design Tech, Computation & Acoustic Science
                </option>
                <option value="Showroom Showcases, Salons & Installations">
                  Showroom Showcases, Salons & Installations
                </option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Production Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Monograph['status'])}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
              >
                <option value="draft">01. Drafting & Ingest</option>
                <option value="review">02. Peer Review (Zurich)</option>
                <option value="scheduled">03. Proof Staging & 300 DPI (Scheduled)</option>
                <option value="published">04. Live in Circulation (Published)</option>
              </select>
            </div>
          </div>

          {/* Author & Desk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Author / Critic
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Desk Bureau
              </label>
              <input
                type="text"
                value={authorDesk}
                onChange={(e) => setAuthorDesk(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
          </div>

          {/* Style & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Architectural Style
              </label>
              <input
                type="text"
                value={architecturalStyle}
                onChange={(e) => setArchitecturalStyle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Target Release
              </label>
              <input
                type="text"
                value={targetReleaseDate}
                onChange={(e) => setTargetReleaseDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
          </div>

          {/* Synopsis with AI Synthesizer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c]">
                Curatorial Synopsis
              </label>
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 bg-[#F9F8F6] border border-[#0b1f3a] text-[#0b1f3a] hover:bg-[#0b1f3a] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="text-[#8C3F2E]">✦</span>
                <span>{isAiGenerating ? 'Synthesizing with Gemini...' : 'AI Curatorial Synthesizer'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          {/* Pull Quote */}
          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
              Broadsheet Pull-Quote
            </label>
            <input
              type="text"
              value={pullQuote}
              onChange={(e) => setPullQuote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-serif text-[14px] italic text-[#000615] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          {/* Full Body Treatise */}
          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
              Full Manuscript Text (Double-spaced paragraphs)
            </label>
            <textarea
              rows={5}
              value={fullBody}
              onChange={(e) => setFullBody(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] leading-relaxed focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
              Cover Image URL (300 DPI Architectural Plate)
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-mono text-[12px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#E2DFD8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2DFD8] font-sans text-[13px] text-[#5e5e5c] hover:text-[#000615] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#0b1f3a] text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Updating via API...' : 'Save Manuscript (API PUT)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
