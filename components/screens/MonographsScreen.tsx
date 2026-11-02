import React, { useState } from 'react';
import { Monograph } from '../../types/editorial';

interface MonographsScreenProps {
  monographs: Monograph[];
  onSelectMonograph: (mono: Monograph) => void;
  onOpenNewMonograph: () => void;
  onEditMonograph: (mono: Monograph) => void;
  onDeleteMonograph: (mono: Monograph) => void;
  initialCategoryFilter?: string;
}

export const MonographsScreen: React.FC<MonographsScreenProps> = ({
  monographs,
  onSelectMonograph,
  onOpenNewMonograph,
  onEditMonograph,
  onDeleteMonograph,
  initialCategoryFilter,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'reads' | 'date' | 'number'>('reads');

  const categories = [
    'all',
    'Home Decor & Spatial Sanctuaries',
    'Architectural Projects & Critical Monographs',
    'Furniture, Joinery & Product Monographs',
    'Designers, Theorists & Dialogues',
    'Design Tech, Computation & Acoustic Science',
    'Showroom Showcases, Salons & Installations',
  ];

  const filtered = monographs
    .filter((m) => {
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.author.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        (m.location && m.location.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'reads') return b.activeReads - a.activeReads;
      if (sortBy === 'number') return parseInt(a.number, 10) - parseInt(b.number, 10);
      return b.targetReleaseDate.localeCompare(a.targetReleaseDate);
    });

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="w-full px-6">
       

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#5e5e5c] text-[16px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search monographs by title, author, city..."
                className="pl-8 pr-3 py-1.5 bg-[#F9F8F6] border border-[#E2DFD8] text-[13px] font-sans text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a] w-64"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-[#F9F8F6] border border-[#E2DFD8] text-[13px] font-sans text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a] max-w-xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Curatorial Axes' : c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'reads' | 'date' | 'number')}
              className="px-3 py-1.5 bg-surface-offwhite border border-border-subtle text-[13px] font-sans text-on-surface focus:outline-none focus:border-[#0b1f3a]"
            >
              <option value="reads">Sort by Active Circulation</option>
              <option value="number">Sort by Issue Folio №</option>
              <option value="date">Sort by Target Date</option>
            </select>
          </div>

          <div className="flex items-center gap-1 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 border border-border-subtle cursor-pointer ${
                viewMode === 'grid' ? 'bg-primary-container text-white' : 'bg-surface-offwhite text-secondary'
              }`}
              title="Broadsheet Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 border border-border-subtle cursor-pointer ${
                viewMode === 'list' ? 'bg-primary-container text-white' : 'bg-surface-offwhite text-secondary'
              }`}
              title="Editorial Index List View"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 py-8">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#ffffff] border border-border-subtle">
            <p className="font-serif text-[20px] text-primary">No monographs match your criteria</p>
            <p className="font-sans text-[13px] text-secondary mt-1">
              Try adjusting your search terms or curatorial axis filter.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectMonograph(item)}
                className="bg-[#ffffff] border border-border-subtle flex flex-col justify-between hover:border-primary-container hover:shadow-xs transition-all cursor-pointer group"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden border-b border-border-subtle bg-surface-container">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-primary-container text-white font-mono text-[11px] px-2 py-0.5 tracking-wider uppercase">
                      № {item.number}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#ffffff]/90 text-primary font-sans font-medium text-[11px] px-2 py-0.5 tracking-wider uppercase backdrop-blur-xs border border-[#E2DFD8]">
                      {item.statusLabel}
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-accent-rust block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-[20px] text-primary leading-snug group-hover:text-accent-rust transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-sans text-[13px] text-secondary mt-1.5 line-clamp-2">
                      {item.synopsis}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-border-subtle flex items-center justify-between font-sans text-[12px] text-[#5e5e5c]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-primary text-white flex items-center justify-center text-[10px] font-semibold">
                        {item.author.initials}
                      </span>
                      <span>{item.author.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-on-surface">
                        {item.activeReads.toLocaleString()} reads
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMonograph(item);
                        }}
                        className="p-1 text-primary hover:text-accent-rust border border-border-subtle hover:bg-surface-offwhite transition-colors"
                        title="Edit Manuscript (API PUT)"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMonograph(item);
                        }}
                        className="p-1 text-accent-rust hover:bg-accent-rust hover:text-white border border-border-subtle transition-colors"
                        title="Delete Manuscript (API DELETE)"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#ffffff] border border-border-subtle">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle font-sans text-[12px] font-semibold uppercase tracking-wider text-secondary bg-[#F9F8F6]">
                  <th className="py-3 px-6">Folio №</th>
                  <th className="py-3 px-6">Monograph Title</th>
                  <th className="py-3 px-6">Axis</th>
                  <th className="py-3 px-6">Author & Desk</th>
                  <th className="py-3 px-6">Circulation</th>
                  <th className="py-3 px-6 text-right">Proof Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-sans text-[13px]">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectMonograph(item)}
                    className="hover:bg-surface-offwhite transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono font-semibold text-accent-rust">
                      {item.number}
                    </td>
                    <td className="py-4 px-6 max-w-md">
                      <span className="font-serif text-[17px] text-primary group-hover:text-accent-rust transition-colors block">
                        {item.title}
                      </span>
                      <span className="text-[12px] text-secondary">{item.subtitle}</span>
                    </td>
                    <td className="py-4 px-6 text-[12px] text-secondary">{item.category}</td>
                    <td className="py-4 px-6 text-on-surface whitespace-nowrap">
                      {item.author.name} · <span className="text-secondary text-[12px]">{item.author.desk}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[13px]">
                      {item.activeReads.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditMonograph(item);
                          }}
                          className="p-1 text-primary hover:text-accent-rust border border-border-subtle hover:bg-surface-offwhite transition-colors"
                          title="Edit Manuscript (API PUT)"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMonograph(item);
                          }}
                          className="p-1 text-accent-rust hover:bg-accent-rust hover:text-white border border-border-subtle transition-colors"
                          title="Delete Manuscript (API DELETE)"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMonograph(item);
                          }}
                          className="px-3 py-1 bg-surface-offwhite border border-border-subtle text-primary hover:bg-primary-container hover:text-white text-[12px] uppercase font-sans tracking-wider transition-colors cursor-pointer"
                        >
                          Inspect Proof
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
