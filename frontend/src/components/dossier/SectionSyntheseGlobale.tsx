import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { AlertCircle, FileSpreadsheet, LayoutGrid, Pencil, Printer } from 'lucide-react';
import type { Consolidation, ConsolidationCell, ConsolidationLigne } from '../../api/dossiers';
import { CONSOLIDATION_AVIS_COLONNES, exportConsolidationExcel, saveConsolidationAvis } from '../../api/dossiers';
import { formatEur, formatNumber, formatPercent } from './format';
import { downloadBlob } from './download';
import { exportConsolidationPdf } from './export-consolidation-pdf';

// « Synthèse Globale » : tableau de consolidation reproduisant la structure du
// fichier Consolidation.xlsx, recalculé à la volée depuis les dossiers.
// Une rubrique du dossier n'ayant pas d'équivalent affiche « - ».
// Les colonnes ER à EY sont à saisie libre (bilan de la convention d'objectifs
// et avis) et enregistrées au fil de l'eau.

function formatCell(cell: ConsolidationCell | null | undefined): string {
  if (!cell || cell.v === null || cell.v === undefined) return '—';
  switch (cell.t) {
    case 'text':
      return String(cell.v);
    case 'eur':
      return formatEur(Number(cell.v));
    case 'pct':
      return `${(Number(cell.v) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
    case 'dec':
      return (Number(cell.v)).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    case 'evol':
      return formatPercent(Number(cell.v) * 100);
    case 'int':
    default:
      return formatNumber(Number(cell.v));
  }
}

function formatTotaux(cell: ConsolidationCell | null): string {
  return formatCell(cell);
}

// Colonnes figées à gauche lors du défilement horizontal : « Code » (A) puis
// « Association » (B) — le nom de l'association reste ainsi toujours visible.
const CODE_WIDTH = 100;
const NAME_WIDTH = 224;
const AVIS_WIDTH = 240;

const AVIS_KEYS: Set<string> = new Set(CONSOLIDATION_AVIS_COLONNES);

function stickyStyle(globalIndex: number): CSSProperties | undefined {
  if (globalIndex === 0) return { left: 0, minWidth: CODE_WIDTH, maxWidth: CODE_WIDTH };
  if (globalIndex === 1) return { left: CODE_WIDTH, minWidth: NAME_WIDTH, maxWidth: NAME_WIDTH };
  return undefined;
}

function stickyClass(globalIndex: number, bg: string, z: string): string {
  if (globalIndex === 0) return `sticky left-0 ${z} ${bg} align-top shadow-[1px_0_0_0_#e2e8f0]`;
  if (globalIndex === 1) return `sticky ${z} ${bg} align-top shadow-[1px_0_0_0_#e2e8f0]`;
  return '';
}

function serverValue(ligne: ConsolidationLigne, colonne: string): string {
  const cell = ligne.cells[colonne];
  return cell && cell.v !== null && cell.v !== undefined ? String(cell.v) : '';
}

export default function SectionSyntheseGlobale({
  consolidation,
  loading,
  error,
}: {
  consolidation: Consolidation | null;
  loading: boolean;
  error: string;
}) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [avisEdits, setAvisEdits] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [avisError, setAvisError] = useState('');

  const colonnes = consolidation ? consolidation.groupes.flatMap((g) => g.colonnes) : [];

  // Nouvelle consolidation (changement d'année, rechargement) : on repart des valeurs serveur.
  useEffect(() => {
    setAvisEdits({});
    setAvisError('');
  }, [consolidation]);

  const handleExcel = useCallback(async () => {
    if (!consolidation) return;
    setExporting(true);
    setExportError('');
    try {
      const blob = await exportConsolidationExcel(consolidation.annee ?? undefined);
      downloadBlob(blob, consolidation.annee ? `Consolidation_${consolidation.annee}.xlsx` : 'Consolidation.xlsx');
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setExportError(anyErr?.response?.data?.error || "Impossible d'exporter le tableau Excel");
    } finally {
      setExporting(false);
    }
  }, [consolidation]);

  const handlePdf = useCallback(() => {
    if (!consolidation) return;
    setExportError('');
    exportConsolidationPdf(consolidation);
  }, [consolidation]);

  const avisValue = (ligne: ConsolidationLigne, colonne: string): string => {
    if (ligne.id === null) return '';
    const key = `${ligne.id}:${colonne}`;
    if (key in avisEdits) return avisEdits[key];
    return serverValue(ligne, colonne);
  };

  const handleAvisChange = (ligne: ConsolidationLigne, colonne: string, value: string) => {
    if (ligne.id === null) return;
    setAvisEdits((prev) => ({ ...prev, [`${ligne.id}:${colonne}`]: value }));
  };

  const handleAvisBlur = async (ligne: ConsolidationLigne, colonne: string) => {
    if (ligne.id === null) return;
    const key = `${ligne.id}:${colonne}`;
    const current = avisEdits[key];
    if (current === undefined) return;
    const server = serverValue(ligne, colonne);
    if (current === server) return;
    setSavingKey(key);
    setAvisError('');
    try {
      await saveConsolidationAvis(ligne.id, colonne, current);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setAvisError(anyErr?.response?.data?.error || 'Impossible d’enregistrer la saisie');
      setAvisEdits((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <LayoutGrid size={18} className="text-[#173F73]" />
            Synthèse Globale
          </h2>
          {consolidation && <p className="mt-1 text-xs italic text-slate-500">{consolidation.note}</p>}
          {consolidation && (
            <p className="mt-1 text-sm font-medium text-slate-700">{consolidation.titre}</p>
          )}
        </div>

        {consolidation && !loading && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleExcel}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              {exporting ? 'Export…' : 'Excel'}
            </button>
            <button
              type="button"
              onClick={handlePdf}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Printer size={15} className="text-red-600" />
              PDF
            </button>
          </div>
        )}
      </div>

      {exportError && (
        <p className="mt-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle size={16} />
          {exportError}
        </p>
      )}

      {avisError && (
        <p className="mt-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle size={16} />
          {avisError}
        </p>
      )}

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle size={16} />
          {error}
        </p>
      )}

      {loading && <p className="mt-6 text-sm text-slate-400">Chargement de la consolidation…</p>}

      {!loading && !error && consolidation && (
        <>
          {consolidation.lignes.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">
              Aucun dossier (hors brouillons) pour cette période. Lancez d’abord le seed :{' '}
              <code>npm run seed</code> (backend).
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <caption className="sr-only">{consolidation.titre}</caption>
                <thead>
                  <tr>
                    <th colSpan={consolidation.groupes.reduce((n, g) => n + g.colonnes.length, 0)}>
                      <div className="border-b border-slate-200 py-1 text-left text-[13px] font-semibold text-slate-700">
                        {consolidation.titre}
                      </div>
                    </th>
                  </tr>
                  <tr>
                    {consolidation.groupes.map((g) => (
                      <th
                        key={g.titre}
                        colSpan={g.colonnes.length}
                        className="border-b border-r border-slate-200 bg-[#173F73]/5 px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#173F73]"
                      >
                        {g.titre}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {colonnes.map((c, gi) => (
                      <th
                        key={c.key}
                        title={c.titre}
                        className={`border-b border-r border-slate-200 px-2 py-1.5 text-left text-[11px] font-medium text-slate-600 ${
                          AVIS_KEYS.has(c.key) ? 'bg-indigo-50/60' : 'bg-slate-50'
                        } ${stickyClass(gi, 'bg-slate-50', 'z-20')}`}
                        style={stickyStyle(gi) ?? (AVIS_KEYS.has(c.key) ? { minWidth: AVIS_WIDTH } : undefined)}
                      >
                        <span className="flex items-center gap-1 pb-0.5 font-mono text-[10px] text-slate-400">
                          {c.key}
                          {AVIS_KEYS.has(c.key) && <Pencil size={10} className="text-indigo-400" />}
                        </span>
                        {c.titre}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {consolidation.lignes.map((l) => (
                    <tr key={l.id ?? l.reference ?? l.nomAssociation ?? ''} className="odd:bg-white even:bg-slate-50">
                      {colonnes.map((c, gi) => {
                        const cell = l.cells[c.key];
                        const editable = l.id !== null && AVIS_KEYS.has(c.key);
                        if (editable) {
                          const key = `${l.id}:${c.key}`;
                          const saving = savingKey === key;
                          return (
                            <td
                              key={c.key}
                              className={`border-b border-r border-slate-100 px-1 py-1 align-top ${
                                saving ? 'bg-amber-50' : 'bg-inherit'
                              }`}
                              style={{ minWidth: AVIS_WIDTH }}
                            >
                              <textarea
                                value={avisValue(l, c.key)}
                                onChange={(e) => handleAvisChange(l, c.key, e.target.value)}
                                onBlur={() => handleAvisBlur(l, c.key)}
                                rows={2}
                                title="Saisie libre"
                                className="w-full resize-y rounded border border-slate-200 bg-white/80 px-1.5 py-1 text-[12px] leading-snug text-slate-700 placeholder:text-slate-300 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:outline-none"
                              />
                            </td>
                          );
                        }
                        return (
                          <td
                            key={c.key}
                            className={`border-b border-r border-slate-100 px-2 py-1.5 align-top text-slate-700 ${stickyClass(
                              gi,
                              'bg-inherit',
                              'z-10'
                            )} ${navAlign(cell)}`}
                            style={stickyStyle(gi)}
                          >
                            {formatCell(cell)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-[#dbe4f0] font-semibold text-slate-800">
                    {colonnes.map((c, gi) => (
                      <td
                        key={c.key}
                        className={`border-b border-r border-slate-200 px-2 py-1.5 align-top ${stickyClass(
                          gi,
                          'bg-[#dbe4f0]',
                          'z-10'
                        )}`}
                        style={stickyStyle(gi)}
                      >
                        {formatTotaux(consolidation.totaux[c.key])}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function navAlign(cell: ConsolidationCell | undefined): string {
  if (!cell || cell.v === null || cell.v === undefined) return '';
  if (cell.t === 'text') return '';
  return 'text-right tabular-nums';
}
