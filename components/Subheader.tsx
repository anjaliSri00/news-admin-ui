import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { NavTab } from '../types/editorial';

interface SubheaderProps {
  activeTab: NavTab;
  onGlobalAdd: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Subheader: React.FC<SubheaderProps> = ({
  activeTab,
  onGlobalAdd,
  searchQuery,
  onSearchChange,
}) => {
  // Tab ke hisaab se Title aur Add Button ka label
const getHeaderDetails = () => {
  switch (activeTab) {
    case 'overview':
      return { 
        title: 'Dashboard Overview', 
        addLabel: 'Create New', 
        subheading1: 'Workspace', 
        subheading2: 'Overview & Analytics' 
      };
    case 'home-decor':
      return { 
        title: 'Home Decor', 
        addLabel: 'Add Decor', 
        subheading1: 'Content Production', 
        subheading2: 'Visual Stories' 
      };
    case 'trending-stories':
      return { 
        title: 'Trending Stories', 
        addLabel: 'Add Story', 
        subheading1: 'Editorial Modules', 
        subheading2: 'Homepage Highlights' 
      };
    case 'latest-news':
      return { 
        title: 'Latest News', 
        addLabel: 'Add News', 
        subheading1: 'Newsroom', 
        subheading2: 'Daily Dispatches' 
      };
    case 'events-industry':
      return { 
        title: 'Events & Industry', 
        addLabel: 'Add Event', 
        subheading1: 'Events & Calendar', 
        subheading2: 'Industry Gatherings' 
      };
    case 'designers':
      return { 
        title: 'Designers', 
        addLabel: 'Add Designer', 
        subheading1: 'Profiles & Interviews', 
        subheading2: 'Directory' 
      };
    case 'design-tech':
      return { 
        title: 'Design Tech', 
        addLabel: 'Add Tech Article', 
        subheading1: 'Innovation Hub', 
        subheading2: 'Material & Tech' 
      };
    case 'furniture-products':
      return { 
        title: 'Furniture & Products', 
        addLabel: 'New Monograph', 
        subheading1: 'Design Pillars', 
        subheading2: 'Product Launches' 
      };
    case 'showrooms-projects':
      return { 
        title: 'Showrooms & Projects', 
        addLabel: 'Add Showroom', 
        subheading1: 'Design Pillars', 
        subheading2: 'Spatial Showcases' 
      };
    case 'editorial-desk':
      return { 
        title: 'Editorial Desk', 
        addLabel: 'New Draft', 
        subheading1: 'Content Operations', 
        subheading2: 'Pipeline & Drafts' 
      };
    case 'special-reports':
      return { 
        title: 'Special Reports', 
        addLabel: 'Add Report', 
        subheading1: 'Editorial Modules', 
        subheading2: 'Deep Dives' 
      };
    case 'podcast-video':
      return { 
        title: 'Podcast & Video', 
        addLabel: 'Upload Media', 
        subheading1: 'Multimedia', 
        subheading2: 'Audio & Visual' 
      };
    case 'settings':
      return { 
        title: 'User Profile & System Access', 
        addLabel: 'Save Changes', 
        subheading1: 'Account & Access', 
        subheading2: 'Configuration' 
      };
    default:
      return { 
        title: 'Dashboard', 
        addLabel: 'Create New', 
        subheading1: 'Workspace', 
        subheading2: 'Home' 
      };
  }
};

  const { title, addLabel,subheading1,subheading2 } = getHeaderDetails();

  return (
    <header className="sticky top-0 z-30 w-full h-20 bg-white border-b border-border-subtle flex items-center justify-between px-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">

      <div className="max-w-full">
        <div className="flex items-center gap-3">
          <span className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-rust">
            {subheading1}
          </span>
          <span className="text-outline-variant font-sans text-[13px]">/</span>
          <span className="font-sans text-[13px] text-secondary">
            {subheading2}
          </span>
        </div>
        <h1 className="font-serif text-[22px] text-primary font-normal leading-none mt-1">
          {title}
        </h1>
      
      </div>

      {/* Right: Search, Notifications & Add Button */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative hidden md:flex items-center">
          <span className="absolute left-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search archives..."
            className="w-64 pl-9 pr-4 py-1.5 bg-gray-50 text-gray-800 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-primary-container focus:bg-white transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Global Add Button */}
        <button
          onClick={onGlobalAdd}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-container text-white text-[12px] uppercase tracking-wider font-semibold rounded hover:bg-[#8C3F2E] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{addLabel}</span>
        </button>

      </div>
    </header>
  );
};