import { LogOut, X } from "lucide-react";

const ConfirmDialog = ({
  open,
  title = "Confirm Logout",
  message = "Are you sure you want to logout?",
  confirmText = "Logout",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      {/* Modal */}

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <LogOut size={19} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* Body */}

        <div className="px-5 py-6">
          <p className="text-sm leading-6 text-slate-500">
            {message}
          </p>
        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;