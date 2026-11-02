import React, { useState, useEffect } from 'react';
import { Contributor } from '../../types/editorial';

interface EditContributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributor: Contributor | null;
  onSave: (updated: Contributor) => void;
}

export const EditContributorModal: React.FC<EditContributorModalProps> = ({
  isOpen,
  onClose,
  contributor,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [desk, setDesk] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [recentPiece, setRecentPiece] = useState('');
  const [status, setStatus] = useState<'Active' | 'Contributing Fellow' | 'On Assignment'>('Active');
  const [activeAssignments, setActiveAssignments] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contributor) {
      setName(contributor.name);
      setRole(contributor.role);
      setDesk(contributor.desk);
      setLocation(contributor.location);
      setSpecialty(contributor.specialty);
      setRecentPiece(contributor.recentPiece);
      setStatus(contributor.status);
      setActiveAssignments(contributor.activeAssignments);
    }
  }, [contributor, isOpen]);

  if (!isOpen || !contributor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const updated: Contributor = {
      ...contributor,
      name,
      role,
      desk,
      location,
      specialty,
      recentPiece,
      status,
      activeAssignments: Number(activeAssignments),
    };

    try {
      const res = await fetch('/api/contributors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.contributor) {
        onSave(data.contributor);
      } else {
        onSave(updated);
      }
    } catch {
      onSave(updated);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-[#E2DFD8] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-[#E2DFD8]">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C3F2E]">
              Theorist Registry
            </span>
            <h3 className="font-serif text-[22px] text-[#000615] mt-1 font-normal">
              Edit Contributor Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5e5e5c] hover:text-[#000615] text-[22px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-6 space-y-4 font-sans text-[13px]">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
              Curatorial Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                Desk Bureau
              </label>
              <input
                type="text"
                value={desk}
                onChange={(e) => setDesk(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                Base City / Country
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
              Thematic Specialty
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
              Recent Contribution / Monograph
            </label>
            <input
              type="text"
              value={recentPiece}
              onChange={(e) => setRecentPiece(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'Active' | 'Contributing Fellow' | 'On Assignment')
                }
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]"
              >
                <option value="Active">Active</option>
                <option value="On Assignment">On Assignment</option>
                <option value="Contributing Fellow">Contributing Fellow</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                Active Assignments
              </label>
              <input
                type="number"
                min={0}
                value={activeAssignments}
                onChange={(e) => setActiveAssignments(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E2DFD8] text-[#1c1b1b]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2DFD8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2DFD8] text-[13px] text-[#5e5e5c] hover:text-[#000615] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#0b1f3a] text-white text-[13px] uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Updating via API...' : 'Save Profile (API PUT)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
