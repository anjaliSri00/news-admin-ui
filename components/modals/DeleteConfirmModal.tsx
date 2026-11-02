import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemDescription?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemDescription,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#ffffff] border border-border-subtle w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-rust">
              Irreversible Curatorial Action
            </span>
            <h3 className="font-serif text-[22px] text-primary mt-1 font-normal">
              Confirm Record Deletion
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary text-[22px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="py-6 space-y-3 font-sans">
          <p className="text-[14px] text-on-surface">
            Are you sure you want to delete <strong className="text-primary font-semibold">{title}</strong>?
          </p>
          {itemDescription && (
            <p className="text-[12px] text-secondary bg-surface-offwhite p-3 border border-border-subtle italic">
              {itemDescription}
            </p>
          )}
          <p className="text-[12px] text-accent-rust">
            This will permanently remove the record from the database and international syndicate streams via API DELETE.
          </p>
        </div>

        <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3 font-sans">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-border-subtle text-[13px] text-secondary hover:text-primary cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-accent-rust text-white text-[13px] uppercase tracking-wider font-semibold hover:bg-black transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Deleting via API...' : 'Delete Record (API DELETE)'}
          </button>
        </div>
      </div>
    </div>
  );
};
