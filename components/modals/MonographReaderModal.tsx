import React, { useState } from 'react';
import { Monograph } from '../../types/editorial';

interface MonographReaderModalProps {
  monograph: Monograph | null;
  onClose: () => void;
  onPublishToggle?: (id: string) => void;
}

export const MonographReaderModal: React.FC<MonographReaderModalProps> = ({
  monograph,
  onClose,
  onPublishToggle,
}) => {
  const [aiCritique, setAiCritique] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleGenerateCritique = async () => {
    if (!monograph) return;
    setIsReviewing(true);
    try {
      const res = await fetch('/api/gemini/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'peer-review',
          title: monograph.title,
          category: monograph.category,
          author: monograph.author.name,
          style: monograph.architecturalStyle,
          location: monograph.location,
          currentText: monograph.fullBody || monograph.synopsis,
        }),
      });
      const data = await res.json();
      if (data.critique) {
        setAiCritique(data.critique);
      }
    } catch (err) {
      console.error('Failed to generate peer review:', err);
    } finally {
      setIsReviewing(false);
    }
  };

  if (!monograph) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-[#E2DFD8] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* Broadsheet Top Bar */}
        <div className="px-6 py-4 border-b border-[#E2DFD8] bg-[#F9F8F6] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-serif text-[15px] font-bold tracking-tight text-[#000615] uppercase">
              FORM & FIELD
            </span>
            <span className="text-[#c4c6ce]">/</span>
            <span className="font-sans text-[12px] font-semibold text-[#8C3F2E] uppercase tracking-wider">
              Curatorial Proof Sheet
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 bg-white border border-[#E2DFD8] text-[#5e5e5c]">
              № {monograph.number} · {monograph.statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onPublishToggle && (
              <button
                onClick={() => onPublishToggle(monograph.id)}
                className="px-3 py-1.5 bg-[#0b1f3a] text-white font-sans text-[12px] uppercase tracking-wider hover:bg-[#8C3F2E] transition-colors cursor-pointer"
              >
                {monograph.status === 'published' ? 'Unpublish Monograph' : 'Approve & Publish'}
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E2DFD8] bg-white font-sans text-[12px] text-[#1c1b1b] hover:bg-[#F9F8F6] cursor-pointer"
              title="Print Proof Sheet"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Proof</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#5e5e5c] hover:text-[#000615] p-1 text-[24px] leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>

        {/* Monograph Article Canvas */}
        <div className="p-6 sm:p-10 space-y-8 bg-[#ffffff]">
          {/* Metadata Subheader */}
          <div className="border-b border-[#E2DFD8] pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[#5e5e5c] font-sans text-[12px] uppercase tracking-widest mb-3">
              <span className="text-[#8C3F2E] font-semibold">{monograph.category}</span>
              <span>{monograph.targetReleaseDate}</span>
            </div>

            <h1 className="font-serif text-[32px] sm:text-[42px] text-[#000615] leading-[1.15] font-normal">
              {monograph.title}
            </h1>

            <p className="font-sans text-[17px] text-[#5e5e5c] font-light mt-3">
              {monograph.subtitle}
            </p>

            {/* Author Byline */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#E2DFD8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#000615] text-white flex items-center justify-center font-sans font-semibold text-[13px]">
                  {monograph.author.initials}
                </div>
                <div>
                  <div className="font-sans text-[14px] font-semibold text-[#1c1b1b]">
                    {monograph.author.name}
                  </div>
                  <div className="font-sans text-[12px] text-[#5e5e5c]">
                    {monograph.author.desk}
                    {monograph.location && ` · ${monograph.location}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[12px] font-sans text-[#5e5e5c]">
                <div>
                  <span className="font-medium text-[#1c1b1b]">Reads: </span>
                  <span className="font-mono">{monograph.activeReads.toLocaleString()}</span>
                </div>
                <span>·</span>
                <div>
                  <span className="font-medium text-[#1c1b1b]">Depth: </span>
                  <span>{monograph.meanDepth}</span>
                </div>
                <span>·</span>
                <div>
                  <span className="font-medium text-[#1c1b1b]">Words: </span>
                  <span className="font-mono">{monograph.wordCount || 3420}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Architectural Plate */}
          <div className="space-y-2">
            <div className="relative w-full h-80 sm:h-110 overflow-hidden border border-[#E2DFD8] bg-[#f0eded]">
              <img
                src={monograph.coverImage}
                alt={monograph.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black/75 text-white font-sans text-[11px] px-2.5 py-1 tracking-wider uppercase backdrop-blur-xs">
                Verified 300 DPI Plate · CMYK Print Ready
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-[12px] text-[#5e5e5c] font-sans italic pt-1">
              <span>{monograph.synopsis}</span>
              {monograph.photographer && (
                <span className="not-italic uppercase tracking-wider text-[11px] text-[#5e5e5c]">
                  Photographic Plate: {monograph.photographer}
                </span>
              )}
            </div>
          </div>

          {/* Featured Pull Quote */}
          {monograph.pullQuote && (
            <div className="my-8 py-6 px-8 bg-[#F9F8F6] border-l-4 border-[#8C3F2E]">
              <blockquote className="font-serif text-[22px] sm:text-[26px] text-[#000615] italic leading-snug font-normal">
                &ldquo;{monograph.pullQuote}&rdquo;
              </blockquote>
              <div className="mt-3 font-sans text-[12px] uppercase tracking-widest text-[#5e5e5c]">
                Curatorial Note · Dr. Helena Vance, Editor-in-Chief
              </div>
            </div>
          )}

          {/* Body Columns */}
          <div className="prose max-w-none text-[#1c1b1b] font-sans text-[15px] sm:text-[16px] leading-[1.75] space-y-4">
            <p className="first-letter:font-serif first-letter:text-[54px] first-letter:leading-[46px] first-letter:float-left first-letter:mr-3 first-letter:text-[#000615] first-letter:font-normal">
              {monograph.fullBody?.split('\n\n')[0] ||
                'Architecture at its most authentic requires no rhetorical justification. It stands within the landscape as a silent negotiator between geological time and human vulnerability.'}
            </p>

            {monograph.fullBody?.split('\n\n').slice(1).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Additional Gallery Plates if present */}
          {monograph.gallery && monograph.gallery.length > 1 && (
            <div className="mt-8 pt-6 border-t border-[#E2DFD8]">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#5e5e5c] block mb-3">
                Supplementary Architectural Plates & Details
              </span>
              <div className="grid grid-cols-2 gap-4">
                {monograph.gallery.slice(1).map((img, idx) => (
                  <div key={idx} className="h-48 border border-[#E2DFD8] overflow-hidden">
                    <img
                      src={img}
                      alt="Plate detail"
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Curatorial Peer Review Section */}
          <div className="mt-8 pt-6 border-t border-[#E2DFD8] bg-[#F9F8F6] p-6 border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DFD8]">
              <div>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#8C3F2E]">
                  Zurich / Milan Editorial Engine
                </span>
                <h4 className="font-serif text-[18px] text-[#000615] font-normal">
                  Curatorial Peer Review & Theoretical Critique
                </h4>
              </div>
              <button
                type="button"
                onClick={handleGenerateCritique}
                disabled={isReviewing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1f3a] text-white text-[12px] font-sans uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                <span className="text-[#8C3F2E]">✦</span>
                <span>{isReviewing ? 'Analyzing Tectonic Discourse...' : 'Request AI Peer Review'}</span>
              </button>
            </div>

            {aiCritique ? (
              <div className="mt-4 font-sans text-[14px] text-[#1c1b1b] leading-relaxed whitespace-pre-line bg-white p-4 border border-[#E2DFD8]">
                {aiCritique}
              </div>
            ) : (
              <p className="mt-3 text-[13px] font-sans text-[#5e5e5c] italic">
                Generate an on-demand phenomenological and material appraisal of this manuscript powered by Gemini 3.8 Flash.
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-[#E2DFD8] bg-[#F9F8F6] flex flex-wrap items-center justify-between text-[12px] font-sans text-[#5e5e5c]">
          <span>
            Edition Syndicate: Zurich, Milan, Copenhagen, Kyoto, London print hubs.
          </span>
          <button
            onClick={onClose}
            className="font-medium text-[#0b1f3a] hover:underline uppercase tracking-wider"
          >
            Close Proof Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
