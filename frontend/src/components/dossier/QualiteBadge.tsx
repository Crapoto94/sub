import { AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';
import type { QualiteDonnees, QualiteNiveau, QualiteProbleme } from '../../api/dossiers';

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
    label: 'Écart à confirmer',
    cls: 'border-red-200 bg-red-50 text-red-700',
    icon: ShieldAlert,
  },
  non_evalue: {
    label: 'Non évalué',
    cls: 'border-slate-200 bg-slate-50 text-slate-500',
    icon: HelpCircle,
  },
};

const TYPE_LABEL: Record<QualiteProbleme['type'], string> = {
  financier: 'Financement',
  identite_structurante: 'Identifiant',
  identite: 'Identité',
  local_seul: 'Non confirmé',
};

function typeColor(type: QualiteProbleme['type']): string {
  if (type === 'financier') return 'text-red-700';
  if (type === 'identite_structurante') return 'text-orange-700';
  if (type === 'identite') return 'text-slate-600';
  return 'text-slate-400';
}

// Infobulle listant les écarts (déclaration vs API Entreprise).
function Tooltip({ qualite }: { qualite: QualiteDonnees }) {
  const ecarts = qualite.ecarts ?? [];
  return (
    <div className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-80 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg group-hover:block">
      <p className="text-xs font-semibold text-slate-700">{qualite.motif}</p>
      {qualite.score !== null && <p className="mt-0.5 text-[11px] text-slate-400">Score API Entreprise : {qualite.score}%</p>}

      {ecarts.length === 0 ? (
        <p className="mt-2 text-[12px] text-emerald-600">Aucun écart détecté.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {ecarts.map((e, i) => (
            <li key={`${e.libelle}-${i}`} className="border-t border-slate-100 pt-2 first:border-0 first:pt-0">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <span className={`rounded px-1 ${typeColor(e.type)} bg-slate-100`}>{TYPE_LABEL[e.type]}</span>
                {e.libelle}
              </p>
              <div className="mt-1 space-y-0.5 text-[12px]">
                <p className="text-slate-600">
                  <span className="text-slate-400">Déclaré : </span>
                  {e.local ?? '—'}
                </p>
                <p className="text-slate-600">
                  <span className="text-slate-400">API : </span>
                  {e.api ?? '—'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {qualite.champs.financiers > 0 && (
        <p className="mt-2 rounded bg-red-50 px-2 py-1 text-[11px] text-red-700">
          Écart sur des données financières : à rapprocher des pièces justificatives.
        </p>
      )}
    </div>
  );
}

// Pastille de qualité des données (au regard de l'API Entreprise).
export default function QualiteBadge({
  qualite,
  showScore = true,
}: {
  qualite: QualiteDonnees | null | undefined;
  showScore?: boolean;
}) {
  if (!qualite) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  const meta = NIVEAU_META[qualite.niveau];
  const Icon = meta.icon;
  return (
    <span className="group relative inline-block">
      <span
        className={`inline-flex cursor-help items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}
      >
        <Icon size={12} />
        {meta.label}
        {showScore && qualite.score !== null && <span className="font-semibold">· {qualite.score}%</span>}
      </span>
      <Tooltip qualite={qualite} />
    </span>
  );
}
