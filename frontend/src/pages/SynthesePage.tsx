import { BarChart3, FileText, Users } from 'lucide-react';

const stats = [
  { label: 'Dossiers reçus', value: '—', icon: FileText },
  { label: 'Dossiers en cours', value: '—', icon: BarChart3 },
  { label: 'Associations', value: '—', icon: Users },
];

export default function SynthesePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Synthèse</h1>
      <p className="mt-1 text-sm text-slate-500">
        Vue d’ensemble des demandes de subvention des associations (fonctionnel à venir).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <s.icon size={18} className="text-indigo-600" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
