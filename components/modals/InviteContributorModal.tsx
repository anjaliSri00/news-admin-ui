import React, { useState } from 'react';
import { Contributor } from '../../types/editorial';

interface InviteContributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (contributor: Contributor) => void;
}

export const InviteContributorModal: React.FC<InviteContributorModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Architectural Theorist & Contributing Fellow');
  const [desk, setDesk] = useState('Venice Bureau');
  const [location, setLocation] = useState('Venice, Italy');
  const [specialty, setSpecialty] = useState('Lagoon Ecology & Amphibious Urbanism');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newContributor: Contributor = {
      id: `cont-${Date.now()}`,
      name,
      initials: initials || 'CO',
      role,
      desk,
      location,
      activeAssignments: 1,
      totalMonographs: 0,
      specialty,
      recentPiece: 'Commissioning Proposal in Staging',
      status: 'Contributing Fellow',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    onInvite(newContributor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-[#E2DFD8] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-[#E2DFD8]">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Contributor Network
            </span>
            <h3 className="font-serif text-[22px] text-[#000615] mt-1">
              Commission International Theorist
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
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Carlo Scarpa Jr."
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[14px] text-[#1c1b1b] focus:outline-none focus:border-[#0b1f3a]"
            />
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
              Curatorial Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                Desk Station
              </label>
              <input
                type="text"
                value={desk}
                onChange={(e) => setDesk(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                Base City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
              Thematic Specialty
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[13px] text-[#1c1b1b]"
            />
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
              Send Commissioning Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
