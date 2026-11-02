import React, { useState } from 'react';
import { MediaAsset } from '../../types/editorial';

interface MediaScreenProps {
  mediaAssets: MediaAsset[];
  onOpenBatchUpload: () => void;
  onDeleteMedia: (asset: MediaAsset) => void;
}

export const MediaScreen: React.FC<MediaScreenProps> = ({
  mediaAssets,
  onOpenBatchUpload,
  onDeleteMedia,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');

  const tags = ['all', 'Nordic Brick', 'Charred Timber', 'Joinery', 'Brutalist', 'Earth Plaster', 'CLT Timber'];

  const filtered = mediaAssets.filter((a) => {
    if (filterTag === 'all') return true;
    return a.tags.some((t) => t.toLowerCase().includes(filterTag.toLowerCase()));
  });

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="w-full px-margin py-8 bg-[#ffffff] border-b border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-rust">
                Visual Archives
              </span>
              <span className="text-outline-variant font-sans text-[13px]">/</span>
              <span className="font-sans text-[13px] text-secondary">
                300 DPI Master Proofing
              </span>
            </div>
            <h1 className="font-serif text-[32px] sm:text-[38px] text-primary font-normal leading-tight mt-1">
              Media & Architectural Showrooms
            </h1>
            <p className="font-sans text-[15px] text-on-surface-variant font-light mt-0.5">
              High-resolution photographic plates, CMYK color-calibrated proofs, and material macro details for Issue № 48.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBatchUpload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
              <span>Upload 300 DPI Plate</span>
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border-subtle overflow-x-auto">
          <span className="font-sans text-[12px] uppercase tracking-wider text-secondary shrink-0">
            Material Filter:
          </span>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTag(t)}
              className={`px-3 py-1 font-sans text-[12px] uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                filterTag === t
                  ? 'bg-primary-container text-white font-medium'
                  : 'bg-surface-offwhite border border-border-subtle text-secondary hover:text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Showroom Plates Grid */}
      <div className="w-full px-margin py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="bg-[#ffffff] border border-border-subtle flex flex-col justify-between hover:border-primary-container transition-all cursor-pointer group"
            >
              <div>
                <div className="relative h-64 w-full overflow-hidden bg-surface-container">
                  <img
                    src={asset.imageUrl}
                    alt={asset.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-primary/80 text-white font-mono text-[11px] px-2 py-0.5 backdrop-blur-xs">
                    {asset.resolution}
                  </div>
                  <div className="absolute top-3 right-3 bg-[#ffffff]/90 text-primary font-sans font-semibold text-[11px] px-2 py-0.5 uppercase tracking-wider backdrop-blur-xs border border-[#E2DFD8]">
                    {asset.status}
                  </div>
                </div>

                <div className="p-5">
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-accent-rust block mb-1">
                    Photo: {asset.photographer}
                  </span>
                  <h3 className="font-serif text-[18px] text-primary leading-snug group-hover:text-accent-rust transition-colors">
                    {asset.title}
                  </h3>
                  <p className="font-sans text-[12px] text-secondary mt-1 italic">
                    Assigned to: {asset.monographTitle}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border-subtle">
                    {asset.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-sans px-1.5 py-0.5 bg-surface-offwhite border border-border-subtle text-secondary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-[12px] font-mono text-secondary">
                  <span>{asset.fileSize}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMedia(asset);
                      }}
                      className="p-1 text-accent-rust hover:bg-accent-rust hover:text-white border border-border-subtle transition-colors cursor-pointer"
                      title="Delete Plate (API DELETE)"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                    <span className="text-primary-container font-sans uppercase font-medium group-hover:underline">
                      Inspect Plate →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Inspection Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#ffffff] border border-border-subtle w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
              <div>
                <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-accent-rust">
                  Plate Inspection Sheet
                </span>
                <h2 className="font-serif text-[24px] text-primary mt-0.5">
                  {selectedAsset.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-secondary hover:text-primary text-[24px] leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="py-6 space-y-4">
              <div className="w-full h-80 overflow-hidden border border-border-subtle bg-surface-container">
                <img
                  src={selectedAsset.imageUrl}
                  alt={selectedAsset.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-offwhite border border-border-subtle text-[12px] font-sans">
                <div>
                  <span className="text-secondary block">Photographer</span>
                  <span className="font-medium text-on-surface">{selectedAsset.photographer}</span>
                </div>
                <div>
                  <span className="text-secondary block">Resolution</span>
                  <span className="font-mono text-on-surface">{selectedAsset.resolution}</span>
                </div>
                <div>
                  <span className="text-secondary block">Color Profile</span>
                  <span className="font-medium text-on-surface">CMYK ECI Coated v2</span>
                </div>
                <div>
                  <span className="text-secondary block">Print Status</span>
                  <span className="font-medium text-accent-rust">{selectedAsset.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <button
                onClick={() => {
                  onDeleteMedia(selectedAsset);
                  setSelectedAsset(null);
                }}
                className="px-4 py-2 border border-accent-rust text-accent-rust font-sans text-[12px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] hover:text-white transition-colors cursor-pointer"
              >
                Delete Plate (API)
              </button>
              <button
                onClick={() => {
                  alert('300 DPI master plate download initiated.');
                  setSelectedAsset(null);
                }}
                className="px-5 py-2 bg-primary-container text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-accent-rust transition-colors cursor-pointer"
              >
                Download Master TIFF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
