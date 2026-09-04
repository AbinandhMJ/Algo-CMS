import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirmation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        id="confirmation-modal-card"
        className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded border ${
                isDestructive
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-300 bg-slate-100 text-slate-800'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
            </div>
            <h3 className="text-base font-medium text-slate-900">{title}</h3>
          </div>
          <button
            id="modal-close-button"
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm font-normal text-slate-600 leading-relaxed">{message}</p>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            id="modal-cancel-button"
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            id="modal-confirm-button"
            type="button"
            onClick={onConfirm}
            className={`rounded px-4 py-2 text-xs font-medium text-white transition-colors ${
              isDestructive
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
