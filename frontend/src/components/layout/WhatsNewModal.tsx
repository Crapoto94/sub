import { X } from 'lucide-react';
import { APP_VERSION, CHANGELOG } from '../../lib/appMeta';

interface WhatsNewModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WhatsNewModal({ open, onClose }: WhatsNewModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Quoi de neuf ?</h2>
            <p className="text-xs text-slate-500">Notes de version — application Subventions</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-4">
          {CHANGELOG.map((entry) => {
            const isCurrent = entry.version === APP_VERSION;
            return (
              <div
                key={entry.version}
                className={`rounded-lg border p-4 ${
                  isCurrent ? 'border-indigo-200 bg-indigo-50/60' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Version {entry.version}</p>
                  <p className="text-xs text-slate-500">{entry.date}</p>
                </div>
                {isCurrent && (
                  <p className="mt-0.5 inline-flex rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                    Version actuelle
                  </p>
                )}
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {entry.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
