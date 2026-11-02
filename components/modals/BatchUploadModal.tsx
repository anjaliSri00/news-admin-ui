import React, { useState } from 'react';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (count: number) => void;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([
    'IMG_7920_Copenhagen_Kolumba_Facade.tif',
    'IMG_7921_Tromso_Basalt_Interior.tif',
    'IMG_7922_Kyoto_Sugi_Joinery.tif',
  ]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onUploadSuccess(selectedFiles.length);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-[#E2DFD8] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-[#E2DFD8]">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Asset Ingest
            </span>
            <h3 className="font-serif text-[22px] text-[#000615] mt-1">
              Batch Photographic Plate Upload
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5e5e5c] hover:text-[#000615] text-[22px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="py-6 space-y-4">
          <div className="border-2 border-dashed border-[#E2DFD8] p-8 text-center bg-[#F9F8F6] hover:border-[#0b1f3a] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[36px] text-[#5e5e5c] block mb-2">
              cloud_upload
            </span>
            <p className="font-sans text-[14px] font-medium text-[#1c1b1b]">
              Drag & drop 300 DPI master TIFF or RAW images here
            </p>
            <p className="font-sans text-[12px] text-[#5e5e5c] mt-1">
              Supports TIFF, RAW, DNG, and high-res PNG (up to 150MB per plate)
            </p>
          </div>

          <div>
            <span className="font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] block mb-2">
              Staged Plates for Proofing ({selectedFiles.length})
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[12px] font-mono text-[#1c1b1b]"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#0b1f3a]">
                      image
                    </span>
                    <span>{file}</span>
                  </div>
                  <span className="text-[#8C3F2E] font-sans font-medium text-[11px] uppercase">
                    300 DPI OK
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E2DFD8] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#E2DFD8] font-sans text-[13px] text-[#5e5e5c] hover:text-[#000615] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-5 py-2.5 bg-[#0b1f3a] text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploading ? 'Ingesting 300 DPI Plates...' : 'Ingest Plates to Showroom'}
          </button>
        </div>
      </div>
    </div>
  );
};
