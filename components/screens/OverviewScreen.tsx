import React, { useState } from 'react';
import {
  Monograph,
  TimeRange,
  PipelineFilter,
  CuratedCategory,
  DeskDeadline,
} from '../../types/editorial';
import { SYSTEM_METRICS_DATA } from '../../data/mockData';

interface OverviewScreenProps {
  monographs: Monograph[];
  categories: CuratedCategory[];
  deadlines: DeskDeadline[];
  onSelectMonograph: (mono: Monograph) => void;
  onOpenNewMonograph: () => void;
  onOpenCompilePdf: () => void;
  onOpenBatchUpload: () => void;
  onOpenInviteContributor: () => void;
  onOpenScheduleTicker: () => void;
  onOpenExportDispatch: () => void;
  tickerMessage: string;
  onPublishToggle: (id: string) => void;
  onStatusChange: (id: string, newStatus: Monograph['status']) => void;
  onEditMonograph: (mono: Monograph) => void;
  onDeleteMonograph: (mono: Monograph) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  monographs,
  categories,
  deadlines,
  onSelectMonograph,
  onOpenCompilePdf,
  onOpenBatchUpload,
  onOpenInviteContributor,
  onOpenScheduleTicker,
  onOpenExportDispatch,
  tickerMessage,
  onPublishToggle,
  onStatusChange,
  onEditMonograph,
  onDeleteMonograph,
}) => {
  const [activeTime, setActiveTime] = useState<TimeRange>('october');
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const metrics = SYSTEM_METRICS_DATA[activeTime];

  // Pipeline Filtering
  const filteredPipeline = monographs.filter((m) => {
    if (pipelineFilter === 'all') return true;
    return m.status === pipelineFilter;
  });

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredPipeline.length / itemsPerPage));
  const currentPipelineItems = filteredPipeline.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Top 4 circulation monographs
  const circulationMonographs = [...monographs]
    .sort((a, b) => b.activeReads - a.activeReads)
    .slice(0, 4);

  // Featured cover story (Hero Feature)
  const featuredStory = monographs.find((m) => m.id === 'mono-1') || monographs[0];

  return (
    <div className="flex flex-col w-full">
      {/* Top Operational Banner & Dashboard Header */}
      <div className="w-full hidden px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-rust">
                Editorial Terminal
              </span>
              <span className="text-outline-variant font-sans text-[13px]">/</span>
              <span className="font-sans text-[13px] text-secondary">Form & Field Homepage Metrics</span>
            </div>
            <h1 className="font-serif text-[32px] sm:text-[40px] text-primary tracking-tight font-normal leading-tight">
              Publishing Performance 
            </h1>
          </div>

          {/* Date Filters & Global Export Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center bg-surface-offwhite rounded-lg p-1 border border-border-subtle"
              role="tablist"
            >
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: '7days', label: 'Last 7 Days' },
                  { id: 'october', label: 'October 2024' },
                  { id: 'q4', label: "Q4 '24" },
                  { id: 'yearly', label: 'Yearly' },
                ] as { id: TimeRange; label: string }[]
              ).map((tab) => {
                const isActive = activeTime === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTime(tab.id)}
                    className={`px-3 py-1.5 font-sans text-[12px] font-semibold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-primary-container text-white font-medium shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onOpenExportDispatch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container rounded-lg text-white font-sans text-[13px] tracking-wider uppercase hover:bg-[#F9F8F6] hover:text-[#0b1f3a] hover:border-[#0b1f3a] border border-transparent transition-all cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Quick Status Ticker Line - Updated for Magazine Sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 pt-4 text-secondary font-sans text-[13px] gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-rust animate-pulse" />
            <span className="font-medium text-on-surface">Latest News:</span> 4 Stories Queued
          </div>
          <div>
            <span className="text-secondary font-light">Trends Section:</span>{' '}
            <span className="font-medium text-on-surface">Live & Updated</span>
          </div>
          <div>
            <span className="text-secondary font-light">Showroom Features:</span>{' '}
            <span className="font-medium text-on-surface">2 Pending Review</span>
          </div>
          <div className="text-right sm:text-left">
            <span className="text-secondary font-light">Next Print Run:</span>{' '}
            <span className="font-medium text-on-surface">Nov 04, 2024</span>
          </div>
        </div>
      </div>

      {/* Key Performance Metric Cards Grid */}
      <div className="w-full px-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Metric 1: Homepage Readership */}
          <div className="bg-[#ffffff] p-6 border border-border-subtle flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-secondary">
                  Homepage Readership
                </span>
                <h2 className="font-serif text-[40px] text-primary font-normal mt-2 leading-none">
                  {metrics.audience}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-offwhite border border-border-subtle text-accent-rust font-sans text-[12px] font-medium">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                {metrics.audienceChange}
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle flex items-end justify-between">
              <div className="flex flex-col">
                <span className="font-sans text-[13px] text-secondary">Avg. Read Time</span>
                <span className="font-sans text-[15px] font-medium text-on-surface">
                  {metrics.dwellTime}
                </span>
              </div>
              <svg className="w-24 h-8 text-primary-container" fill="none" viewBox="0 0 100 30">
                <path
                  d="M0 24 L18 20 L35 25 L52 14 L70 17 L88 6 L100 2"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeWidth="1.75"
                />
              </svg>
            </div>
          </div>

          {/* Metric 2: Active Features */}
          <div className="bg-[#ffffff] p-6 border border-border-subtle flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-secondary">
                  Active Homepage Features
                </span>
                <h2 className="font-serif text-[40px] text-primary font-normal mt-2 leading-none">
                  12
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-offwhite border border-border-subtle text-primary font-sans text-[12px] font-medium">
                Live Now
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle flex items-end justify-between">
              <div className="flex flex-col">
                <span className="font-sans text-[13px] text-secondary">Top Category</span>
                <span className="font-sans text-[15px] font-medium text-on-surface">
                  Trends & Architecture
                </span>
              </div>
              <svg className="w-24 h-8 text-secondary" fill="none" viewBox="0 0 100 30">
                <path
                  d="M0 28 L22 22 L40 18 L60 20 L80 12 L100 8"
                  stroke="currentColor"
                  strokeLinecap="square"
                  strokeWidth="1.75"
                />
              </svg>
            </div>
          </div>

          {/* Metric 3: Trending Stories */}
          <div className="bg-[#ffffff] p-6 border border-border-subtle flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5e5e5c]">
                  Trending Stories
                </span>
                <h2 className="font-serif text-[40px] text-primary font-normal mt-2 leading-none">
                  04
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F9F8F6] border border-[#E2DFD8] text-[#8C3F2E] font-sans text-[12px] font-medium">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                High Traffic
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-end justify-between">
              <div className="flex flex-col">
                <span className="font-sans text-[13px] text-[#5e5e5c]">Top Story</span>
                <span className="font-sans text-[15px] font-medium text-[#1c1b1b] truncate max-w-[150px]">
                  Materials living with us...
                </span>
              </div>
              <div className="w-16 h-2 bg-[#F9F8F6] border border-[#E2DFD8] relative overflow-hidden">
                <div className="h-full bg-[#0b1f3a]" style={{ width: '85%' }} />
              </div>
            </div>
          </div>

          {/* Metric 4: Publication Yield */}
          <div className="bg-[#ffffff] p-6 border border-border-subtle flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5e5e5c]">
                  Published in Vol 48
                </span>
                <h2 className="font-serif text-[40px] text-[#000615] font-normal mt-2 leading-none">
                  128
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F9F8F6] border border-[#E2DFD8] text-[#000615] font-sans text-[12px] font-medium">
                +14 this week
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-end justify-between">
              <div className="flex flex-col">
                <span className="font-sans text-[13px] text-[#5e5e5c]">Pending Editorial Review</span>
                <span className="font-sans text-[15px] font-medium text-[#1c1b1b]">
                  6 Drafts
                </span>
              </div>
              <span className="font-sans text-[12px] uppercase tracking-wider text-[#5e5e5c] font-semibold">
                On Track
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Analytics & Real-Time Monitoring Section */}
      <div className="w-full px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Primary Column: 8 Columns */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Category Readership Distribution */}
            <div className="bg-[#ffffff] p-8 border border-[#E2DFD8]">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-[#E2DFD8] gap-2">
                <div>
                  <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5e5e5c]">
                    Section Engagement
                  </span>
                  <h3 className="font-serif text-[28px] text-[#000615] font-normal mt-1">
                    Homepage Category Traffic
                  </h3>
                </div>
                <span className="font-sans text-[13px] text-[#5e5e5c]">Telemetry synced 3m ago</span>
              </div>

              {/* Comparative Bars Stack */}
              <div className="flex flex-col gap-5 mt-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex flex-col gap-1.5 group">
                    <div className="flex items-center justify-between font-sans text-[13px]">
                      <span className="font-medium text-[#1c1b1b] group-hover:text-[#8C3F2E] transition-colors">
                        {cat.title}
                      </span>
                      <span className="text-[#5e5e5c] font-mono text-[13px]">
                        {cat.readsCount.toLocaleString()} views · {cat.volumePercentage}% of traffic
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#F9F8F6] border border-[#E2DFD8] relative overflow-hidden">
                      <div
                        className="h-full bg-[#0b1f3a] transition-all duration-700 ease-out group-hover:bg-[#8C3F2E]"
                        style={{ width: `${cat.volumePercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-Time Trending Dispatches */}
            <div className="bg-[#ffffff] p-8 border border-[#E2DFD8]">
              <div className="flex items-baseline justify-between pb-6 border-b border-[#E2DFD8]">
                <div>
                  <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5e5e5c]">
                    Real-Time Circulation
                  </span>
                  <h3 className="font-serif text-[28px] text-[#000615] font-normal mt-1">
                    Most Read Articles
                  </h3>
                </div>
                <button
                  onClick={() => onSelectMonograph(circulationMonographs[0])}
                  className="font-sans text-[13px] text-[#000615] underline underline-offset-4 hover:text-[#8C3F2E] transition-colors cursor-pointer"
                >
                  Complete Archive →
                </button>
              </div>

              <div className="divide-y divide-[#E2DFD8] mt-2">
                {circulationMonographs.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectMonograph(item)}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer hover:bg-[#F9F8F6]/60 transition-colors px-2 -mx-2"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-serif text-[20px] text-[#5e5e5c] font-light">
                        {item.number}
                      </span>
                      <div>
                        <h4 className="font-serif text-[20px] text-[#000615] group-hover:text-[#8C3F2E] transition-colors leading-tight">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[#5e5e5c] font-sans text-[13px]">
                          <span>{item.author.name}</span>
                          <span>·</span>
                          <span className="text-[#44474d]">{item.subtitle}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right shrink-0">
                      <span className="font-mono text-[14px] font-semibold text-[#000615]">
                        {item.activeReads.toLocaleString()} active reads
                      </span>
                      <span className="font-sans text-[13px] text-[#5e5e5c]">
                        {item.meanDepth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Column: 4 Columns */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Geographic Presence & Device Surface */}
            <div className="bg-[#ffffff] p-6 border border-[#E2DFD8]">
              <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5e5e5c]">
                Demographic Reach
              </span>
              <h3 className="font-serif text-[28px] text-[#000615] font-normal mt-1 mb-6">
                Global Coordinates
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between font-sans text-[13px] mb-1">
                    <span className="text-[#1c1b1b] font-medium">
                      Pan-European Hubs (Zurich, Milan, London)
                    </span>
                    <span className="text-[#5e5e5c] font-mono">48%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F9F8F6] border border-[#E2DFD8]">
                    <div className="h-full bg-[#0b1f3a]" style={{ width: '48%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-sans text-[13px] mb-1">
                    <span className="text-[#1c1b1b] font-medium">
                      North America (New York, LA, Montréal)
                    </span>
                    <span className="text-[#5e5e5c] font-mono">32%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F9F8F6] border border-[#E2DFD8]">
                    <div className="h-full bg-[#0b1f3a]" style={{ width: '32%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-sans text-[13px] mb-1">
                    <span className="text-[#1c1b1b] font-medium">
                      Asia-Pacific (Tokyo, Singapore, Sydney)
                    </span>
                    <span className="text-[#5e5e5c] font-mono">20%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F9F8F6] border border-[#E2DFD8]">
                    <div className="h-full bg-[#0b1f3a]" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E2DFD8]">
                <span className="font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] block mb-3">
                  Viewport Breakdown
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#F9F8F6] border border-[#E2DFD8] text-center">
                    <span className="block font-serif text-[20px] text-[#000615]">64%</span>
                    <span className="font-sans text-[12px] font-semibold uppercase text-[#5e5e5c]">
                      Desktop Broadsheet
                    </span>
                  </div>
                  <div className="p-3 bg-[#F9F8F6] border border-[#E2DFD8] text-center">
                    <span className="block font-serif text-[20px] text-[#000615]">36%</span>
                    <span className="font-sans text-[12px] font-semibold uppercase text-[#5e5e5c]">
                      Mobile Dispatch
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Cover Story / Hero Staging */}
            <div
              onClick={() => onSelectMonograph(featuredStory)}
              className="bg-[#F9F8F6] p-6 border border-[#E2DFD8] flex flex-col gap-4 cursor-pointer hover:border-[#0b1f3a] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
                  Hero Feature Staging
                </span>
                <span className="text-[12px] font-sans font-medium text-[#0b1f3a] group-hover:underline">
                  Inspect Proof →
                </span>
              </div>
              <div className="relative w-full h-44 overflow-hidden border border-[#E2DFD8] bg-[#f0eded]">
                <img
                  src={featuredStory.coverImage}
                  alt={featuredStory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h4 className="font-serif text-[20px] text-[#000615] leading-tight group-hover:text-[#8C3F2E] transition-colors">
                  {featuredStory.title || "Copenhagen Courtyard Typology"}
                </h4>
                <p className="font-sans text-[13px] text-[#5e5e5c] mt-1 line-clamp-2">
                  Lead story scheduled for automated release to print syndicates at 00:00 CET.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Pipeline & Content Management Table */}
      <div className="w-full px-6 pb-12">
        <div className="bg-[#ffffff] border border-border-subtle p-8">
          {/* Table Header & Status Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border-subtle gap-4">
            <div>
              <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-secondary">
                Scheduled Dispatches
              </span>
              <h3 className="font-serif text-[28px] text-primary font-normal mt-1">
                Editorial Production Stream
              </h3>
            </div>

            {/* Filter Segment */}
            <div className="flex items-center overflow-x-auto border border-border-subtle bg-surface-offwhite p-1">
              {(
                [
                  { id: 'all', label: `All (${monographs.length})` },
                  {
                    id: 'review',
                    label: `In Review (${
                      monographs.filter((m) => m.status === 'review').length
                    })`,
                  },
                  {
                    id: 'scheduled',
                    label: `Scheduled (${
                      monographs.filter((m) => m.status === 'scheduled').length
                    })`,
                  },
                  {
                    id: 'published',
                    label: `Published (${
                      monographs.filter((m) => m.status === 'published').length
                    })`,
                  },
                  {
                    id: 'draft',
                    label: `Drafts (${monographs.filter((m) => m.status === 'draft').length})`,
                  },
                ] as { id: PipelineFilter; label: string }[]
              ).map((tab) => {
                const isActive = pipelineFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setPipelineFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 font-sans text-[12px] uppercase tracking-wider font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-primary-container text-white font-medium'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Width Broadsheet Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c]">
                  <th className="py-4 pr-6">Manuscript & Category</th>
                  <th className="py-4 px-6">Author / Contributor</th>
                  <th className="py-4 px-6">Target Release Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 pl-6 text-right">Curatorial Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-sans text-[13px]">
                {currentPipelineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-offwhite transition-colors group">
                    <td className="py-5 pr-6 max-w-sm">
                      <button
                        onClick={() => onSelectMonograph(item)}
                        className="text-left font-serif text-[18px] sm:text-[20px] text-primary leading-tight group-hover:text-accent-rust transition-colors cursor-pointer block"
                      >
                        {item.title}
                      </button>
                      <span className="inline-block mt-1 text-[11px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 bg-[#F9F8F6] border border-[#E2DFD8] text-[#5e5e5c]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-primary text-white flex items-center justify-center font-sans text-[11px] font-semibold">
                          {item.author.initials}
                        </div>
                        <div>
                          <span className="block text-on-surface font-medium leading-none">
                            {item.author.name}
                          </span>
                          <span className="text-secondary text-[12px]">
                            {item.author.desk}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-6 text-on-surface font-mono text-[13px] whitespace-nowrap">
                      {item.targetReleaseDate}
                    </td>

                    <td className="py-5 px-6 whitespace-nowrap">
                      {item.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0b1f3a] text-white font-sans text-[11px] font-semibold uppercase tracking-wider">
                          Published
                        </span>
                      ) : item.status === 'scheduled' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9F8F6] border border-[#000615] text-[#000615] font-sans text-[11px] font-semibold uppercase tracking-wider">
                          Ready to Publish
                        </span>
                      ) : item.status === 'review' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9F8F6] border border-[#E2DFD8] text-[#5e5e5c] font-sans text-[11px] font-semibold uppercase tracking-wider">
                          Peer Review (Zurich)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9F8F6] border border-[#E2DFD8] text-[#5e5e5c] font-sans text-[11px] font-semibold uppercase tracking-wider">
                          Drafting Ingest
                        </span>
                      )}
                    </td>

                    <td className="py-5 pl-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onEditMonograph(item)}
                          className="p-1.5 text-[#000615] hover:text-[#8C3F2E] hover:bg-[#F9F8F6] border border-[#E2DFD8] transition-all cursor-pointer"
                          title="Edit Manuscript"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteMonograph(item)}
                          className="p-1.5 text-[#8C3F2E] hover:bg-[#8C3F2E] hover:text-white border border-[#E2DFD8] transition-all cursor-pointer"
                          title="Delete Manuscript"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                        <button
                          onClick={() => onSelectMonograph(item)}
                          className="p-1.5 text-[#5e5e5c] hover:text-[#000615] hover:bg-[#F9F8F6] border border-[#E2DFD8] transition-all cursor-pointer"
                          title="Preview Proof"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>

                        {item.status === 'scheduled' || item.status === 'published' ? (
                          <button
                            onClick={() => onPublishToggle(item.id)}
                            className="px-3 py-1.5 bg-[#0b1f3a] text-white font-sans text-[11px] font-semibold uppercase tracking-wider hover:bg-[#F9F8F6] hover:text-[#0b1f3a] hover:border-[#0b1f3a] border border-transparent transition-all cursor-pointer"
                            type="button"
                          >
                            {item.status === 'published' ? 'Live' : 'Publish'}
                          </button>
                        ) : item.status === 'review' ? (
                          <button
                            onClick={() => onStatusChange(item.id, 'scheduled')}
                            className="px-3 py-1.5 bg-[#F9F8F6] text-[#5e5e5c] border border-[#E2DFD8] font-sans text-[11px] font-semibold uppercase tracking-wider hover:text-[#000615] transition-all cursor-pointer"
                            type="button"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => onStatusChange(item.id, 'review')}
                            className="px-3 py-1.5 bg-[#F9F8F6] text-[#5e5e5c] border border-[#E2DFD8] font-sans text-[11px] font-semibold uppercase tracking-wider hover:text-[#000615] transition-all cursor-pointer"
                            type="button"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination & Results Counter */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-4 border-t border-border-subtle text-secondary font-sans text-[13px] gap-4">
            <span>
              Showing {currentPipelineItems.length} of {filteredPipeline.length} manuscripts across
              all editorial departments
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border border-[#E2DFD8] hover:bg-[#F9F8F6] text-[#5e5e5c] hover:text-[#000615] transition-colors disabled:opacity-40 cursor-pointer"
                type="button"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 font-medium cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-[#0b1f3a] text-white'
                      : 'border border-[#E2DFD8] hover:bg-[#F9F8F6] text-[#5e5e5c] hover:text-[#000615]'
                  }`}
                  type="button"
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-[#E2DFD8] hover:bg-[#F9F8F6] text-[#5e5e5c] hover:text-[#000615] transition-colors disabled:opacity-40 cursor-pointer"
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Curator's Fast Operational Toolkit (Bottom Drawer Section) */}
      <div className="w-full px-6 pb-16">
        <div className="bg-[#F9F8F6] p-8 border border-[#E2DFD8]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
                Executive Actions
              </span>
              <h3 className="font-serif text-[22px] text-[#000615] mt-1 font-medium">
                Form & Field Command Palette
              </h3>
              <p className="font-sans text-[13px] text-[#5e5e5c] mt-0.5">
                Quickly stage photographic proofs, commission designers, or broadcast breaking news tickers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenBatchUpload}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ffffff] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] hover:border-[#000615] transition-colors cursor-pointer shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                <span>Upload Showroom Photos</span>
              </button>
              <button
                onClick={onOpenInviteContributor}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ffffff] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] hover:border-[#000615] transition-colors cursor-pointer shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Invite Designer</span>
              </button>
              <button
                onClick={onOpenScheduleTicker}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ffffff] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b] hover:border-[#000615] transition-colors cursor-pointer shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">campaign</span>
                <span>Schedule Breaking Ticker</span>
              </button>
              <button
                onClick={onOpenCompilePdf}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0b1f3a] text-white font-sans text-[13px] uppercase tracking-wider font-semibold hover:bg-[#F9F8F6] hover:text-[#0b1f3a] hover:border-[#0b1f3a] border border-transparent transition-all cursor-pointer shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Compile Homepage Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};