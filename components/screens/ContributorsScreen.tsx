
import React from 'react';
import type { Designer } from '@/helper/designers';

interface ContributorsScreenProps {
  contributors: Designer[];
  isLoading?: boolean;
  onOpenInvite: () => void;
  onEditContributor: (contributor: Designer) => void;
  onDeleteContributor: (contributor: Designer) => void;
}

const getInitials = (name?: string) => {
  if (!name?.trim()) return 'NA';

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const Detail = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => {
  if (value === undefined || value === null || value === '') return null;

  return (
    <div className="min-w-0">
      <span className="text-[11px] text-secondary block mb-0.5">
        {label}
      </span>
      <p className="text-xs text-on-surface break-words line-clamp-1">
        {value}
      </p>
    </div>
  );
};

export const ContributorsScreen: React.FC<ContributorsScreenProps> = ({
  contributors,
  isLoading = false,
  onOpenInvite,
  onEditContributor,
  onDeleteContributor,
}) => {
  return (
    <div className="w-full flex flex-col">
      {isLoading ? (
        <div className="px-6 py-12 text-center text-sm text-secondary">
          Loading designers...
        </div>
      ) : contributors.length === 0 ? (
        <div className="mx-6 my-6 border border-border-subtle p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-secondary">
            groups
          </span>

          <h3 className="font-serif text-xl text-primary mt-3">
            No designers found
          </h3>

          <p className="text-sm text-secondary mt-2">
            Add a designer to get started.
          </p>

          <button
            type="button"
            onClick={onOpenInvite}
            className="mt-4 px-4 py-2 bg-primary text-white hover:bg-primary-container transition-colors cursor-pointer"
          >
            Add Designer
          </button>
        </div>
      ) : (
        <div className="w-full px-5 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
            {contributors.map((designer) => (
              <article
                key={designer.id}
                className="bg-white border border-border-subtle p-4 h-[410px] flex flex-col overflow-hidden hover:border-primary-container hover:shadow-sm transition-all group"
              >
                {/* Featured image: consistent height */}
                {designer.featured_image_url ? (
                  <img
                    src={designer.featured_image_url}
                    alt={`${designer.name} featured`}
                    className="w-full h-28 shrink-0 object-cover mb-3 border border-border-subtle"
                  />
                ) : (
                  <div className="h-3 shrink-0" />
                )}

                {/* Profile header */}
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {designer.avatar_url ? (
                      <img
                        src={designer.avatar_url}
                        alt={designer.name}
                        className="w-11 h-11 rounded-full object-cover border border-border-subtle shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-serif text-base shrink-0">
                        {getInitials(designer.name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-serif text-lg text-primary group-hover:text-accent-rust transition-colors leading-tight line-clamp-2"
                        title={designer.name}
                      >
                        {designer.name}
                      </h3>

                      {designer.specialization && (
                        <p
                          className="text-xs text-secondary mt-1 line-clamp-1"
                          title={designer.specialization}
                        >
                          {designer.specialization}
                        </p>
                      )}

                      {designer.email && (
                        <p
                          className="text-xs text-secondary mt-1 truncate"
                          title={designer.email}
                        >
                          {designer.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditContributor(designer)}
                      className="p-1.5 text-primary hover:text-accent-rust border border-border-subtle hover:bg-surface-offwhite cursor-pointer"
                      title="Edit Designer"
                      aria-label={`Edit ${designer.name}`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        edit
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteContributor(designer)}
                      className="p-1.5 text-accent-rust hover:bg-accent-rust hover:text-white border border-border-subtle cursor-pointer"
                      title="Delete Designer"
                      aria-label={`Delete ${designer.name}`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </button>
                  </div>
                </div>

                {/* Compact details */}
                <div className="mt-3 space-y-2.5 font-sans text-[13px] min-h-0">
                  {designer.excerpt && (
                    <div className="p-2.5 bg-surface-offwhite border border-border-subtle">
                      <span className="text-[10px] uppercase font-semibold text-accent-rust block mb-1">
                        Profile Summary
                      </span>
                      <p className="font-serif text-sm text-primary italic line-clamp-2">
                        “{designer.excerpt}”
                      </p>
                    </div>
                  )}

                  {designer.bio && (
                    <div>
                      <span className="text-[11px] text-secondary block mb-0.5">
                        Biography
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed line-clamp-2">
                        {designer.bio}
                      </p>
                    </div>
                  )}

                  {(designer.city || designer.country) && (
                    <div className="flex items-start gap-1.5 text-secondary min-w-0">
                      <span className="material-symbols-outlined text-sm shrink-0">
                        location_on
                      </span>
                      <span className="text-xs line-clamp-1">
                        {[designer.city, designer.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Detail
                      label="Reading Time"
                      value={
                        designer.read_time !== undefined &&
                        designer.read_time !== null
                          ? `${designer.read_time} min`
                          : undefined
                      }
                    />

                    <Detail
                      label="Layout Type"
                      value={designer.layout_type}
                    />
                  </div>

                  {designer.portfolio_url && (
                    <a
                      href={designer.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1 text-xs text-primary hover:text-accent-rust underline underline-offset-2"
                    >
                      <span className="truncate">View Portfolio</span>
                      <span className="material-symbols-outlined text-sm shrink-0">
                        open_in_new
                      </span>
                    </a>
                  )}
                </div>

                {/* Footer pinned to bottom */}
                <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between gap-3 text-xs font-sans">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wide text-secondary mb-1">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-[11px] ${
                        designer.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-surface-offwhite text-secondary'
                      }`}
                    >
                      {designer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="text-right min-w-0 max-w-[55%]">
                    <span className="block text-[10px] uppercase tracking-wide text-secondary mb-1">
                      Location
                    </span>
                    <span className="block font-medium text-primary truncate">
                      {[designer.city, designer.country]
                        .filter(Boolean)
                        .join(', ') || 'Not specified'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorsScreen;