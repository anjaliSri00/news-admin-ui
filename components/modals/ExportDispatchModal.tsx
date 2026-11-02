import React, { useState } from 'react';
import { Monograph } from '../../types/editorial';

interface ExportDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  monographs: Monograph[];
}

export const ExportDispatchModal: React.FC<ExportDispatchModalProps> = ({
  isOpen,
  onClose,
  monographs,
}) => {
  const [format, setFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  const [includeTelemetry, setIncludeTelemetry] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);

      if (format === 'csv') {
        const headers = 'Number,Title,Category,Author,Desk,Status,TargetDate,Reads\n';
        const rows = monographs
          .map(
            (m) =>
              `"${m.number}","${m.title.replace(/"/g, '""')}","${m.category}","${m.author.name}","${m.author.desk}","${m.statusLabel}","${m.targetReleaseDate}","${m.activeReads}"`
          )
          .join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `form_and_field_issue_48_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(`Issue № 48 ${format.toUpperCase()} dispatch exported successfully.`);
      }

      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-[#E2DFD8] w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-[#E2DFD8]">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Data Export
            </span>
            <h3 className="font-serif text-[22px] text-[#000615] mt-1">
              Export Dispatch Metrics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5e5e5c] hover:text-[#000615] text-[22px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="py-6 space-y-4 font-sans">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`py-2 text-[13px] border uppercase tracking-wider font-medium cursor-pointer ${
                  format === 'csv'
                    ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                    : 'bg-[#F9F8F6] border-[#E2DFD8] text-[#1c1b1b]'
                }`}
              >
                CSV Table
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`py-2 text-[13px] border uppercase tracking-wider font-medium cursor-pointer ${
                  format === 'pdf'
                    ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                    : 'bg-[#F9F8F6] border-[#E2DFD8] text-[#1c1b1b]'
                }`}
              >
                PDF Report
              </button>
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`py-2 text-[13px] border uppercase tracking-wider font-medium cursor-pointer ${
                  format === 'json'
                    ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                    : 'bg-[#F9F8F6] border-[#E2DFD8] text-[#1c1b1b]'
                }`}
              >
                JSON Raw
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={includeTelemetry}
              onChange={(e) => setIncludeTelemetry(e.target.checked)}
              className="accent-[#0b1f3a]"
            />
            <span className="text-[13px] text-[#1c1b1b]">
              Include live reader telemetry & dwell times
            </span>
          </label>
        </div>

        <div className="pt-4 border-t border-[#E2DFD8] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#E2DFD8] font-sans text-[13px] text-[#5e5e5c] hover:text-[#000615] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 bg-[#0b1f3a] text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer"
          >
            {isExporting ? 'Generating File...' : 'Download Export'}
          </button>
        </div>
      </div>
    </div>
  );
};
