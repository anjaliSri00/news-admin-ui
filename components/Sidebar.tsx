import React, { useState } from 'react';
import { NavTab, Monograph } from '../types/editorial';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { internalLogout } from '@/helper/api_data_store';
import { Plus, Search, Bell, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onGlobalAdd: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  monographs: Monograph[];
  onSelectMonograph: (mono: Monograph) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onGlobalAdd,
  searchQuery,
  onSearchChange,
  monographs,
  onSelectMonograph,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'overview', label: 'Dashboard Overview' },
    { id: 'home-decor', label: 'Home Decor' },
    { id: 'trending-stories', label: 'Trending Stories' },
    { id: 'latest-news', label: 'Latest News' }, 
    { id: 'events-industry', label: 'Events & Industry' },
    { id: 'designers', label: 'Designers' },
    { id: 'design-tech', label: 'Design Tech' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'products', label: 'Products' },
    { id: 'showrooms-projects', label: 'Showrooms & Projects' },
    { id: 'editorial-desk', label: 'Editorial Desk' },
    { id: 'special-reports', label: 'Special Reports' },
    { id: 'podcast-video', label: 'Podcast & Video' },
    { id: 'settings', label: 'Settings' }
  ];

  const email = session?.user?.email ?? '';
  const initials = email.split('@')[0]?.split(/[._-]+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '·';
  const displayName = session?.user?.name ?? email.split('@')[0] ?? 'Editorial Desk';
  const roleLabel = session?.user?.userType ? session.user.userType.charAt(0).toUpperCase() + session.user.userType.slice(1) : 'Editorial Staff';

  const handleSignOut = async () => {
    try {
      if (session?.accessToken) {
        await internalLogout(process.env.NEXT_PUBLIC_API_URL ?? '', session.accessToken, session.refreshToken);
      }
    } catch {}
    
    await signOut({ redirect: false });
    router.replace('/admin/signin');
    router.refresh();
  };

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'home-decor': return 'Add Decor';
      case 'events-industry': return 'Add Event';
      case 'trending-stories': return 'Add Story';
      case 'designers': return 'Add Designer';
      case 'furniture': return 'New Furniture';
      case 'products': return 'New Products';
      default: return 'Create New';
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-border-subtle flex flex-col z-50">
      
      {/* Brand */}
      <div className="h-20 shrink-0 flex flex-col justify-center px-6 border-b border-border-subtle cursor-pointer" onClick={() => onTabChange('overview')}>
        <span className="font-serif text-[22px] tracking-tight uppercase text-primary font-normal leading-none hover:text-accent-rust transition-colors">
          FORM & FIELD
        </span>
        <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-secondary mt-1">
          Editorial CMS & Dispatch
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu</div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-3 py-2 text-[13px] font-sans transition-colors rounded-md ${
                isActive
                  ? 'bg-primary-container/10 text-primary-container font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-border-subtle bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-[11px] font-semibold ring-1 ring-border-subtle">
              {initials}
            </div>
            <div>
              <p className="text-[13px] font-medium text-primary leading-tight truncate max-w-[100px]">{displayName}</p>
              <p className="text-[10px] text-secondary uppercase tracking-wider">{roleLabel}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
};