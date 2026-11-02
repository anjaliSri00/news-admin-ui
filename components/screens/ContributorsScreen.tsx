import React from 'react';
import { Contributor } from '../../types/editorial';

interface ContributorsScreenProps {
  contributors: Contributor[];
  onOpenInvite: () => void;
  onEditContributor: (c: Contributor) => void;
  onDeleteContributor: (c: Contributor) => void;
}

export const ContributorsScreen: React.FC<ContributorsScreenProps> = ({
  contributors,
  onOpenInvite,
  onEditContributor,
  onDeleteContributor,
}) => {
  return (
    <div className="w-full flex flex-col">    

      {/* Contributors Grid */}
      <div className="w-full px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contributors.map((c) => (
            <div
              key={c.id}
              className="bg-[#ffffff] border border-border-subtle p-6 flex flex-col justify-between hover:border-primary-container hover:shadow-xs transition-all group relative"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-14 h-14 rounded-full object-cover border border-border-subtle"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-serif text-[18px]">
                        {c.initials}
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif text-[20px] text-primary group-hover:text-accent-rust transition-colors leading-tight">
                        {c.name}
                      </h3>
                      <p className="font-sans text-[12px] text-secondary mt-0.5">{c.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditContributor(c)}
                      className="p-1 text-primary hover:text-accent-rust border border-border-subtle hover:bg-surface-offwhite cursor-pointer"
                      title="Edit Profile (API PUT)"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteContributor(c)}
                      className="p-1 text-accent-rust hover:bg-accent-rust hover:text-white border border-border-subtle cursor-pointer"
                      title="Remove Contributor (API DELETE)"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3 font-sans text-[13px]">
                  <div className="p-3 bg-surface-offwhite border border-border-subtle">
                    <span className="text-[11px] uppercase font-semibold text-accent-rust block">
                      Thematic Specialty
                    </span>
                    <span className="text-on-surface">{c.specialty}</span>
                  </div>

                  <div>
                    <span className="text-[12px] text-secondary block">Recent Contribution:</span>
                    <span className="font-serif text-[14px] text-primary italic">
                      &ldquo;{c.recentPiece}&rdquo;
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-[12px] font-sans text-secondary">
                <div>
                  <span className="font-medium text-on-surface">{c.activeAssignments}</span> Active Assignments
                </div>
                <div>
                  <span className="font-medium text-on-surface">{c.totalMonographs}</span> Published
                </div>
                <div className="text-primary-container font-medium">
                  {c.desk}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
