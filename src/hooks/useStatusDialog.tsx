import { useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

type DialogTone = 'success' | 'error';

interface DialogState {
  open: boolean;
  message: string;
  tone: DialogTone;
  title: string;
}

const initialState: DialogState = {
  open: false,
  message: '',
  tone: 'success',
  title: '',
};

function StatusDialog({
  open,
  message,
  tone,
  title,
  onClose,
}: DialogState & { onClose: () => void }) {
  if (!open) return null;

  const isSuccess = tone === 'success';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isSuccess
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {isSuccess ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
              <p
                className={`text-sm font-medium ${
                  isSuccess ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'
                }`}
              >
                {isSuccess ? 'Operation completed' : 'Action needs attention'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
        </div>

        <div className="flex justify-end border-t border-slate-200/80 dark:border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
              isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export function useStatusDialog() {
  const [dialog, setDialog] = useState<DialogState>(initialState);

  const showDialog = (tone: DialogTone, title: string, message: string) => {
    setDialog({
      open: true,
      tone,
      title,
      message,
    });
  };

  const closeDialog = () => {
    setDialog(initialState);
  };

  const dialogElement = <StatusDialog {...dialog} onClose={closeDialog} />;

  return {
    showDialog,
    dialogElement,
  };
}
