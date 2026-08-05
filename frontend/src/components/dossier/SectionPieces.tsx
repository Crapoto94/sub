import { CheckCircle2, Eye, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { PieceRow } from '../../types/subventions';
import DossierSection from './DossierSection';
import { formatDate } from './format';

// 10. PIÈCES JUSTIFICATIVES : liste de documents avec icône vert/rouge et prévisualisation.
export default function SectionPieces({ pieces }: { pieces: PieceRow[] }) {
  const [preview, setPreview] = useState<PieceRow | null>(null);

  return (
    <DossierSection numero={10} titre="Pièces justificatives" id="section-10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-[12px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-medium">Document</th>
              <th className="px-3 py-2 font-medium">Fichier</th>
              <th className="px-3 py-2 font-medium">Date de dépôt</th>
              <th className="px-3 py-2 text-right font-medium">Statut</th>
              <th className="px-3 py-2 text-right font-medium">Aperçu</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2.5 text-[13px] font-medium text-slate-800">{p.typePiece ?? '—'}</td>
                <td className="px-3 py-2.5 text-[13px] text-slate-600">{p.fichier ?? '—'}</td>
                <td className="px-3 py-2.5 text-[13px] tabular-nums text-slate-600">{formatDate(p.dateDepot)}</td>
                <td className="px-3 py-2.5 text-right">
                  {p.valide ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                      <CheckCircle2 size={15} /> Présent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-600">
                      <XCircle size={15} /> Absent
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    disabled={!p.fichier}
                    onClick={() => setPreview(p)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Eye size={13} />
                    Voir
                  </button>
                </td>
              </tr>
            ))}
            {!pieces.length && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">Aucune pièce justificative</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {preview && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <FileText size={20} className="mt-0.5 shrink-0 text-[#173F73]" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-800">{preview.typePiece}</p>
            <p className="break-all text-[12px] text-slate-500">{preview.fichier}</p>
          </div>
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="rounded-md border border-slate-300 px-2 py-1 text-[12px] font-medium text-slate-600 hover:bg-slate-100"
          >
            Fermer
          </button>
        </div>
      )}
    </DossierSection>
  );
}
