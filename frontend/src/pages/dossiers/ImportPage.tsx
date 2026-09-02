import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import { importExcel } from '../../api/import';
import type { ImportResult } from '../../api/import';

interface FileSlot {
  key: 'dossier' | 'financier' | 'bilan';
  label: string;
  required: boolean;
  file: File | null;
}

function getApiError(err: unknown): string {
  const anyErr = err as { response?: { data?: { error?: string } } };
  return anyErr?.response?.data?.error || "L'import a échoué";
}

export default function ImportPage() {
  const navigate = useNavigate();
  const [annee, setAnnee] = useState(2027);
  const [slots, setSlots] = useState<FileSlot[]>([
    { key: 'dossier', label: '1. Dossier de demande', required: true, file: null },
    { key: 'financier', label: '2. Tableau financier', required: false, file: null },
    { key: 'bilan', label: '3. Bilan convention d\'objectifs', required: false, file: null },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  function setFile(key: FileSlot['key'], file: File | null) {
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, file } : s)));
    setResult(null);
  }

  async function handleSubmit() {
    const dossierSlot = slots.find((s) => s.key === 'dossier');
    if (!dossierSlot?.file) {
      setError('Le fichier « 1. Dossier de demande » est obligatoire.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await importExcel({
        annee,
        dossier: dossierSlot.file,
        financier: slots.find((s) => s.key === 'financier')?.file ?? undefined,
        bilan: slots.find((s) => s.key === 'bilan')?.file ?? undefined,
      });
      setResult(res);
    } catch (err: unknown) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Importer un dossier</h1>
      <p className="mt-1 text-sm text-slate-500">
        Créer ou mettre à jour un dossier de subvention (campagne {annee}) à partir des fichiers Excel.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-700">Campagne (année)</label>
        <select
          value={annee}
          onChange={(e) => setAnnee(Number(e.target.value))}
          className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="2027">2027</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>

        <div className="mt-6 space-y-4">
          {slots.map((slot) => (
            <label
              key={slot.key}
              className="block cursor-pointer rounded-lg border border-dashed border-slate-300 p-4 transition hover:border-indigo-400 hover:bg-indigo-50/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileSpreadsheet size={18} className="text-indigo-500" />
                  {slot.label}
                  {slot.required && <span className="text-xs text-red-500">obligatoire</span>}
                </span>
                {slot.file && (
                  <span className="text-xs text-slate-500 max-w-[40%] truncate">{slot.file.name}</span>
                )}
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => setFile(slot.key, e.target.files?.[0] ?? null)}
              />
            </label>
          ))}
        </div>

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Upload size={16} />
          {submitting ? 'Import en cours…' : 'Importer les fichiers'}
        </button>
      </div>

      {result && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 size={20} />
            <h2 className="text-lg font-semibold">Import réussi</h2>
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Dossier</dt>
              <dd className="font-mono text-slate-800">{result.reference}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Association</dt>
              <dd className="text-slate-800">{result.associationNom}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Type d'import</dt>
              <dd className="text-slate-800">{result.nouveauDossier ? 'Nouveau dossier' : 'Dossier mis à jour'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Fichiers traités</dt>
              <dd className="text-slate-800">
                {result.fichiers.map((f) => f).join(', ') || 'aucun'}
              </dd>
            </div>
          </dl>
          {result.sectionsImportees.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Sections alimentées : {result.sectionsImportees.join(' · ')}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/dossiers/${result.dossierId}`)}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Voir le dossier
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setSlots((prev) => prev.map((s) => ({ ...s, file: null })));
              }}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Importer un autre dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}