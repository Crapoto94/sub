import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dossier } from '../../api/dossiers';
import StatutBadge from './StatutBadge';
import { formatEur } from './format';

// En-tête bleu foncé du dossier : titre, sous-titre, statut et montant demandé.
export default function DossierHeader({ dossier }: { dossier: Dossier }) {
  const navigate = useNavigate();
  const sollicite = dossier.sections['situation-financiere'] as { montantSubventionSollicitee?: number | null } | undefined;

  return (
    <div className="relative overflow-hidden rounded-lg bg-[#173F73] px-6 py-6 text-white shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-200">
            {dossier.reference} — Année {dossier.annee}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight">
            DOSSIER DE DEMANDE DE SUBVENTION DE FONCTIONNEMENT {dossier.annee}
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Associations Sportives — Ville d'Ivry-sur-Seine
          </p>
          <p className="mt-2 text-lg font-semibold">{dossier.nomAssociation}</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <StatutBadge statut={dossier.statut} />
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-blue-200">Montant demandé</p>
            <p className="text-3xl font-bold text-white">{formatEur(sollicite?.montantSubventionSollicitee ?? null)}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dossiers')}
          className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </button>
        <button
          type="button"
          disabled
          title="La modification du dossier s'effectue côté association"
          className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-[#173F73] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Pencil size={16} />
          Modifier le dossier
        </button>
      </div>
    </div>
  );
}
