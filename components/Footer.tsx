import React from 'react';
import { NavTab } from '../types/editorial';

interface FooterProps {
  onNavClick: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="w-full bg-[#ffffff] border-t border-border-subtle mt-16 py-8">
      <div className="w-full px-margin flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <span className="font-serif text-[18px] uppercase tracking-tight text-primary font-normal">
            FORM & FIELD
          </span>
          <span className="hidden md:inline text-secondary">—</span>
          <span className="font-sans text-[13px] text-secondary">
            International Spatial Design, Theory & Architecture Journal
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-sans text-[13px] text-secondary">
          <button
            onClick={() => onNavClick('settings')}
            className="hover:text-on-surface transition-colors cursor-pointer"
          >
            Editorial Guidelines
          </button>
          <button
            onClick={() => onNavClick('settings')}
            className="hover:text-on-surface transition-colors cursor-pointer"
          >
            Typographic Scale
          </button>
          <button
            onClick={() => onNavClick('projects-and-monographs')}
            className="hover:text-on-surface transition-colors cursor-pointer"
          >
            Archive Index
          </button>
          <span className="text-outline-variant">|</span>
          <span className="text-secondary">© 2025 Form & Field Publishing AG · Zurich & Milan</span>
        </div>
      </div>
    </footer>
  );
};
