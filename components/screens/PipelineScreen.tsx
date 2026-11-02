import React, { useState } from 'react';
import { Monograph } from '../../types/editorial';

interface PipelineScreenProps {
  monographs: Monograph[];
  onSelectMonograph: (mono: Monograph) => void;
  onOpenNewMonograph: () => void;
  onStatusChange: (id: string, newStatus: Monograph['status']) => void;
  onEditMonograph: (mono: Monograph) => void;
  onDeleteMonograph: (mono: Monograph) => void;
}

export const PipelineScreen: React.FC<PipelineScreenProps> = ({
  monographs,
  onSelectMonograph,
  onOpenNewMonograph,
  onStatusChange,
  onEditMonograph,
  onDeleteMonograph,
}) => {
  const [selectedDesk, setSelectedDesk] = useState<string>('all');

  const desks = ['all', 'Zurich', 'Milan', 'Barcelona', 'Kyoto', 'London', 'Paris', 'Copenhagen'];

  const filteredMonographs = monographs.filter((m) => {
    if (selectedDesk === 'all') return true;
    return m.author.desk.toLowerCase().includes(selectedDesk.toLowerCase());
  });

  const columns: {
    status: Monograph['status'];
    title: string;
    subtitle: string;
    tagClass: string;
  }[] = [
    {
      status: 'draft',
      title: '01. Drafting & Ingest',
      subtitle: 'Raw manuscripts & briefs',
      tagClass: 'bg-[#F9F8F6] border-[#E2DFD8] text-[#5e5e5c]',
    },
    {
      status: 'review',
      title: '02. Peer Review (Zurich)',
      subtitle: 'Curatorial sign-off & theory',
      tagClass: 'bg-[#F9F8F6] border-[#8C3F2E] text-[#8C3F2E]',
    },
    {
      status: 'scheduled',
      title: '03. Proof Staging & 300 DPI',
      subtitle: 'Color verified for press',
      tagClass: 'bg-[#F9F8F6] border-[#0b1f3a] text-[#0b1f3a]',
    },
    {
      status: 'published',
      title: '04. Live in Circulation',
      subtitle: 'Syndicated broadsheet',
      tagClass: 'bg-[#0b1f3a] text-white',
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* Subheader */}
      <div className="w-full px-margin py-8 bg-[#ffffff] border-b border-[#E2DFD8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8C3F2E]">
                Workflow Architecture
              </span>
              <span className="text-[#c4c6ce] font-sans text-[13px]">/</span>
              <span className="font-sans text-[13px] text-[#5e5e5c]">
                Curatorial Gatekeeping
              </span>
            </div>
            <h1 className="font-serif text-[32px] sm:text-[38px] text-[#000615] font-normal leading-tight mt-1">
              Editorial Production Pipeline
            </h1>
            <p className="font-sans text-[15px] text-[#44474d] font-light mt-0.5">
              Track architectural monographs across critical peer review, 300 DPI photographic plate
              proofing, and global syndicate syndication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#F9F8F6] p-1 border border-[#E2DFD8] overflow-x-auto">
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#5e5e5c] px-2">
                Desk:
              </span>
              {desks.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDesk(d)}
                  className={`px-2.5 py-1 text-[12px] font-sans uppercase tracking-wider cursor-pointer transition-colors ${
                    selectedDesk === d
                      ? 'bg-[#0b1f3a] text-white font-medium'
                      : 'text-[#44474d] hover:text-[#000615]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenNewMonograph}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b1f3a] text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Commission Manuscript</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Broadsheet Pipeline Board */}
      <div className="w-full px-margin py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => {
            const columnMonographs = filteredMonographs.filter((m) => m.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-[#ffffff] border border-[#E2DFD8] flex flex-col min-h-[560px]"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-[#E2DFD8] bg-[#F9F8F6] flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-[18px] text-[#000615] font-medium leading-tight">
                      {col.title}
                    </h3>
                    <p className="font-sans text-[12px] text-[#5e5e5c] mt-0.5">{col.subtitle}</p>
                  </div>
                  <span
                    className={`font-mono text-[12px] font-semibold px-2 py-0.5 border ${col.tagClass}`}
                  >
                    {columnMonographs.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
                  {columnMonographs.length === 0 ? (
                    <div className="p-8 text-center text-[13px] text-[#5e5e5c] font-sans border border-dashed border-[#E2DFD8] my-auto">
                      No manuscripts in this stage
                    </div>
                  ) : (
                    columnMonographs.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-[#ffffff] border border-[#E2DFD8] hover:border-[#000615] hover:shadow-xs transition-all group flex flex-col justify-between"
                      >
                        <div
                          onClick={() => onSelectMonograph(item)}
                          className="cursor-pointer space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px] font-sans text-[#5e5e5c]">
                            <span className="font-mono font-medium text-[#8C3F2E]">
                              № {item.number}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="uppercase tracking-wider">{item.targetReleaseDate.split('·')[0]}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditMonograph(item);
                                }}
                                className="p-0.5 text-[#000615] hover:text-[#8C3F2E] cursor-pointer"
                                title="Edit Manuscript (API PUT)"
                              >
                                <span className="material-symbols-outlined text-[13px]">edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteMonograph(item);
                                }}
                                className="p-0.5 text-[#8C3F2E] hover:text-black cursor-pointer"
                                title="Delete Manuscript (API DELETE)"
                              >
                                <span className="material-symbols-outlined text-[13px]">delete</span>
                              </button>
                            </div>
                          </div>

                          <h4 className="font-serif text-[16px] text-[#000615] font-medium leading-snug group-hover:text-[#8C3F2E] transition-colors">
                            {item.title}
                          </h4>

                          <p className="font-sans text-[12px] text-[#5e5e5c] line-clamp-2">
                            {item.synopsis}
                          </p>
                        </div>

                        {/* Thumbnail if present */}
                        {item.coverImage && (
                          <div
                            onClick={() => onSelectMonograph(item)}
                            className="mt-3 h-24 w-full overflow-hidden border border-[#E2DFD8] cursor-pointer"
                          >
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                            />
                          </div>
                        )}

                        {/* Card Footer with Author and Shift Button */}
                        <div className="mt-4 pt-3 border-t border-[#E2DFD8] flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[12px] font-sans text-[#1c1b1b]">
                            <span className="w-5 h-5 bg-[#000615] text-white flex items-center justify-center text-[10px] font-semibold">
                              {item.author.initials}
                            </span>
                            <span className="truncate max-w-[100px]">{item.author.name}</span>
                          </div>

                          {/* Quick Stage Controls */}
                          <div className="flex items-center gap-1">
                            {col.status !== 'draft' && (
                              <button
                                onClick={() => {
                                  const prevStatus: Record<string, Monograph['status']> = {
                                    review: 'draft',
                                    scheduled: 'review',
                                    published: 'scheduled',
                                  };
                                  onStatusChange(item.id, prevStatus[col.status]);
                                }}
                                title="Demote to Previous Stage"
                                className="p-1 text-[#5e5e5c] hover:text-[#000615] border border-[#E2DFD8] bg-[#F9F8F6] text-[12px] cursor-pointer"
                              >
                                ←
                              </button>
                            )}

                            {col.status !== 'published' && (
                              <button
                                onClick={() => {
                                  const nextStatus: Record<string, Monograph['status']> = {
                                    draft: 'review',
                                    review: 'scheduled',
                                    scheduled: 'published',
                                  };
                                  onStatusChange(item.id, nextStatus[col.status]);
                                }}
                                title="Advance to Next Stage"
                                className="px-2 py-0.5 text-[#ffffff] bg-[#0b1f3a] hover:bg-[#8C3F2E] text-[11px] font-sans uppercase font-medium cursor-pointer transition-colors"
                              >
                                {col.status === 'scheduled' ? 'Publish →' : 'Advance →'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
