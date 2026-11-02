import React, { useState } from 'react';
import { Monograph } from '../../types/editorial';

interface NewMonographModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (monograph: Monograph) => void;
}

export const NewMonographModal: React.FC<NewMonographModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Home Decor & Spatial Sanctuaries');
  const [authorName, setAuthorName] = useState('Dr. Helena Vance');
  const [authorDesk, setAuthorDesk] = useState('Zurich Desk');
  const [targetDate, setTargetDate] = useState('Nov 12, 2024 · 10:00 CET');
  const [style, setStyle] = useState('Nordic Spatial Minimalism');
  const [location, setLocation] = useState('Zurich, Switzerland');
  const [photographer, setPhotographer] = useState('Hélène Binet');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  );
  const [pullQuote, setPullQuote] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [body, setBody] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAiAssist = async () => {
    if (!title.trim()) {
      alert('Please enter a manuscript title first for the AI Curatorial Assistant.');
      return;
    }
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
          style,
          location,
          currentText: body || synopsis,
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

  if (!isOpen) return null;

  const presetImages = [
    {
      label: 'Copenhagen Courtyard',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Arctic Charred Larch',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Kyoto Joinery Sugi',
      url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Catalan Brutalism',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Raw Earth Plaster',
      url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Milan Concrete Pavilion',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const initials = authorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newMono: Monograph = {
      id: `mono-${Date.now()}`,
      number: `0${Math.floor(Math.random() * 80) + 10}`,
      title,
      subtitle: subtitle || 'Architectural Monograph / Critical Essay',
      category,
      author: {
        name: authorName,
        desk: authorDesk,
        initials: initials || 'ED',
      },
      targetReleaseDate: targetDate,
      status: 'review',
      statusLabel: 'Peer Review (Zurich)',
      activeReads: 1,
      meanDepth: '0.0m mean depth',
      coverImage: coverUrl,
      gallery: [coverUrl],
      pullQuote:
        pullQuote ||
        'Architecture is the quiet art of orchestrating light, thermal mass, and human vulnerability.',
      synopsis:
        synopsis ||
        'A newly commissioned architectural inquiry exploring contemporary spatial ethics and structural honesty.',
      fullBody:
        body ||
        'The dialogue between structural necessity and emotional atmosphere remains the preeminent question facing contemporary spatial theorists.\n\nIn this newly drafted treatise, the Zurich and Milan desks explore how materials in their unadorned state resist transient superficial trends, anchoring occupants in an enduring phenomenological presence.',
      wordCount: body ? body.split(/\s+/).length : 1480,
      architecturalStyle: style,
      location,
      photographer,
    };

    onSave(newMono);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-[#E2DFD8] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2DFD8] flex items-center justify-between sticky top-0 bg-[#ffffff] z-10">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Curatorial Commissioning
            </span>
            <h2 className="font-serif text-[24px] text-[#000615] font-normal leading-tight mt-0.5">
              Draft New Architectural Monograph
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5e5e5c] hover:text-[#000615] p-1 text-[24px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Title & Subtitle */}
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Manuscript Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Architecture of Silence: Materiality in Extreme Latitudes"
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E2DFD8] font-serif text-[17px] text-[#000615] focus:outline-none focus:border-[#0b1f3a]"
              />
            </div>

            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Subtitle & Typology
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Nordic Theory / Tromsø Dispatch"
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[14px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
              />
            </div>
          </div>

          {/* Category & Desks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Curated Category Axis
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
                Target Release Date
              </label>
              <input
                type="text"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="e.g. Nov 08, 2024 · 09:00 CET"
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
              />
            </div>
          </div>

          {/* Author & Desk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Author / Theorist
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
              />
            </div>
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Editorial Desk
              </label>
              <input
                type="text"
                value={authorDesk}
                onChange={(e) => setAuthorDesk(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
              />
            </div>
          </div>

          {/* Photography & Architectural Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Architectural Style
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
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
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
                Lead Photographer
              </label>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
          </div>

          {/* Cover Image Selector */}
          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
              High-Resolution Photographic Plate (Cover URL)
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a] mb-2"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-[11px] text-[#5e5e5c]">Curated Presets:</span>
              {presetImages.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setCoverUrl(p.url)}
                  className={`text-[11px] font-sans px-2 py-0.5 border transition-all cursor-pointer ${
                    coverUrl === p.url
                      ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                      : 'bg-[#F9F8F6] border-[#E2DFD8] text-[#5e5e5c] hover:text-[#000615]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pull Quote */}
          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
              Curatorial Pull-Quote (Featured Broadsheet Callout)
            </label>
            <textarea
              rows={2}
              value={pullQuote}
              onChange={(e) => setPullQuote(e.target.value)}
              placeholder="e.g. Light in the North is not a mere commodity; it is an architectural participant that sculpts volume."
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-serif text-[15px] italic text-[#000615] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          {/* Synopsis & Body */}
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
              placeholder="Brief abstract framing the architectural theory and historical context..."
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1.5">
              Monograph Manuscript Body (Editorial Draft)
            </label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter full monograph essay text, architectural critique, and site reflections..."
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E2DFD8] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2DFD8] font-sans text-[13px] text-[#5e5e5c] hover:text-[#000615] cursor-pointer"
            >
              Cancel Draft
            </button>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0b1f3a] text-white font-sans text-[13px] tracking-wider uppercase font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer"
              >
                Submit to Editorial Pipeline
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
