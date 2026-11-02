import React, { useState } from 'react';

interface BreakingTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicker: (message: string) => void;
  currentTicker: string;
}

export const BreakingTickerModal: React.FC<BreakingTickerModalProps> = ({
  isOpen,
  onClose,
  onUpdateTicker,
  currentTicker,
}) => {
  const [tickerText, setTickerText] = useState(
    currentTicker || 'Main Engine: Active (Zurich Node) · Global Content Ingestion: 99.98% · Curatorial Review: 3 Pending Final Sign-off · Scheduled Print Run: Nov 04, 2024'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTicker(tickerText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-[#E2DFD8] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-[#E2DFD8]">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Operational Bulletin
            </span>
            <h3 className="font-serif text-[22px] text-[#000615] mt-1">
              Broadcast Breaking Editorial Ticker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5e5e5c] hover:text-[#000615] text-[22px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-6 space-y-4">
          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
              Ticker Message (Live Broadsheet Header)
            </label>
            <textarea
              rows={3}
              required
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E2DFD8] font-mono text-[13px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          <div className="p-3 bg-[#F9F8F6] border border-[#E2DFD8] text-[12px] font-sans text-[#5e5e5c]">
            This message streams across all subscriber broadsheets, reader terminals, and print syndicates in Zurich, Milan, Tokyo, and London.
          </div>

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
              className="px-5 py-2.5 bg-[#0b1f3a] text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer"
            >
              Broadcast Ticker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
