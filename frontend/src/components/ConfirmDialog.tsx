import React from 'react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<Props> = ({
  open,
  title,
  message,
  confirmLabel = 'Remove',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-5"
      >
        <h3 id="confirm-dialog-title" className="text-base font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onCancel} className="btn-secondary text-sm px-3 py-1.5">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger text-sm px-3 py-1.5">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
