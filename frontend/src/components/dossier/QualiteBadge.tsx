import { AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';
import type { QualiteDonnees, QualiteNiveau } from '../../api/dossiers';

const NIVEAU_META: Record<
  QualiteNiveau,
  { label: string; cls: string; icon: typeof CheckCircle2 }
> = {
  bon: {
    label: 'Données conformes',
    cls: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  a_verifier: {
    label: 'À vérifier',
    cls: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: AlertTriangle,
  },
  critique: {
    label: 'Écarts critiques',
    cls: 'border-red-200 bg-red-50 text-red-700',
    icon: ShieldAlert,
  },
  non_evalue: {
    label: 'Non évalué',
    cls: 'border-slate-200 bg-slate-50 text-slate-500',
    icon: HelpCircle,
  },
};

// Pastille de qualité des données (au regard de l'API Entreprise).
export default function QualiteBadge({ qualite, showScore = true }: { qualite: QualiteDonnees | null | undefined; showScore?: boolean }) {
  if (!qualite) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  const meta = NIVEAU_META[qualite.niveau];
  const Icon = meta.icon;
  return (
    <span
      title={qualite.motif}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}
    >
      <Icon size={12} />
      {meta.label}
      {showScore && qualite.score !== null && <span className="font-semibold">· {qualite.score}%</span>}
    </span>
  );
}
