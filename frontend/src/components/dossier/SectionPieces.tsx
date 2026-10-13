import { CheckCircle2, Eye, Printer, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { getPieceFichier } from '../../api/dossiers';
import type { PieceRow } from '../../types/subventions';
import DossierSection from './DossierSection';
import { formatDate } from './format';

// 10. PIÈCES JUSTIFICATIVES : liste de documents avec icône vert/rouge.
// Le bouton « Voir » affiche le PDF de la pièce (généré côté serveur) dans
// un panneau de prévisualisation : consultation + impression.
export default function SectionPieces({ pieces, dossierId }: { pieces: PieceRow[]; dossierId: number }) {
  const [previewPiece, setPreviewPiece] = useState<PieceRow | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState('');

  async function onVoir(piece: PieceRow) {
    setPdfError('');
    setPdfUrl(null);
    setPreviewPiece(piece);
    try {
      const blob = await getPieceFichier(dossierId, piece.id);
      const url = URL.createObjectURL(blob);
      setPdfUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
    } catch {
      setPdfError('Impossible de charger le PDF de cette pièce.');
    }
  }

  function fermerPreview() {
    setPreviewPiece(null);
    setPdfUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setPdfError('');
  }

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
                    onClick={() => onVoir(p)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
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

      {previewPiece && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={fermerPreview}
        >
          <div
            className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-800">
                  {previewPiece.typePiece ?? 'Pièce justificative'}
                </h3>
                <p className="truncate text-xs text-slate-500">{previewPiece.fichier ?? '—'}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                  >
                    <Printer size={14} />
                    Imprimer
                  </a>
                )}
                <button
                  type="button"
                  onClick={fermerPreview}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              {pdfError && <p className="p-4 text-sm text-red-600">{pdfError}</p>}
              {pdfUrl && (
                <iframe
                  title={`Aperçu de ${previewPiece.typePiece ?? 'la pièce'}`}
                  src={pdfUrl}
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </DossierSection>
  );
}