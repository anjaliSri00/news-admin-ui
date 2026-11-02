import React, { useState, useEffect } from 'react';

interface CompilePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompilePdfModal: React.FC<CompilePdfModalProps> = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initiating Curatorial Engine...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsComplete(false);
      return;
    }

    const timer1 = setTimeout(() => {
      setProgress(24);
      setStage('Gathering 328 High-Resolution 300 DPI Photographic Plates...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(58);
      setStage('Applying Swiss 12-Column Typographic Scale & Folio Proofing...');
    }, 1100);

    const timer3 = setTimeout(() => {
      setProgress(86);
      setStage('Generating CMYK Print Signatures for Zurich & Milan Hubs...');
    }, 1800);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setStage('Issue № 48 Broadsheet Compilation Complete');
      setIsComplete(true);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-border-subtle w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-rust">
              Print Production Engine
            </span>
            <h3 className="font-serif text-[22px] text-primary mt-1">
              Compile Issue № 48 Print Folio
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary text-[22px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="py-6 space-y-4">
          <div className="flex items-center justify-between text-[13px] font-sans">
            <span className="text-on-surface font-medium">{stage}</span>
            <span className="font-mono text-accent-rust font-semibold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-surface-offwhite border border-border-subtle relative overflow-hidden">
            <div
              className="h-full bg-primary-container transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-3 bg-surface-offwhite border border-border-subtle space-y-1.5 text-[12px] font-sans text-secondary">
            <div className="flex justify-between">
              <span>Target Output:</span>
              <span className="font-medium text-on-surface">380-Page Broadsheet (A3 Folio)</span>
            </div>
            <div className="flex justify-between">
              <span>Color Profile:</span>
              <span className="font-medium text-on-surface">ISO Coated v2 300% (ECI)</span>
            </div>
            <div className="flex justify-between">
              <span>Primary Press:</span>
              <span className="font-medium text-on-surface">Denzler Druck AG (Zurich)</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border-subtle font-sans text-[13px] text-secondary hover:text-primary cursor-pointer"
          >
            Close
          </button>
          {isComplete ? (
            <button
              onClick={() => {
                alert('Issue № 48 PDF print package prepared. Ready for press syndicate distribution.');
                onClose();
              }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary-container text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download Print Master (PDF)</span>
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2 bg-primary-container/40 text-white font-sans text-[13px] uppercase tracking-wider cursor-not-allowed"
            >
              Compiling...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
