import type { Statut } from '../../api/dossiers';

const STATUT_STYLES: Record<Statut, string> = {
  brouillon: 'bg-slate-100 text-slate-700',
  depose: 'bg-blue-50 text-blue-700',
  instruction: 'bg-amber-50 text-amber-700',
  decision: 'bg-violet-50 text-violet-700',
  accorde: 'bg-emerald-50 text-emerald-700',
  refuse: 'bg-red-50 text-red-700',
};

const STATUT_LABELS: Record<Statut, string> = {
  brouillon: 'Brouillon',
  depose: 'Déposé',
  instruction: 'En instruction',
  decision: 'Décision',
  accorde: 'Validé',
  refuse: 'Refusé',
};

export default function StatutBadge({ statut }: { statut: Statut }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${STATUT_STYLES[statut]}`}
    >
      {STATUT_LABELS[statut]}
    </span>
  );
}
