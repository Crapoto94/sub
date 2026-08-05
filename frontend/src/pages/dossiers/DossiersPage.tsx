import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus } from 'lucide-react';
import { listDossiers, STATUTS } from '../../api/dossiers';
import type { DossierListItem, Statut } from '../../api/dossiers';
import StatutBadge from '../../components/dossier/StatutBadge';

const STATUT_LABELS: Record<Statut, string> = {
  brouillon: 'Brouillon',
  depose: 'Déposé',
  instruction: 'En instruction',
  decision: 'Décision',
  accorde: 'Validé',
  refuse: 'Refusé',
};

export default function DossiersPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DossierListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [annee, setAnnee] = useState<number | undefined>(2027);
  const [statut, setStatut] = useState<Statut | ''>('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await listDossiers({ annee, statut: statut || undefined, q: q || undefined, limit: 100, offset: 0 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setError(anyErr?.response?.data?.error || 'Impossible de charger les dossiers');
    } finally {
      setLoading(false);
    }
  }, [annee, statut, q]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Dossiers de subvention</h1>
      <p className="mt-1 text-sm text-slate-500">
        Demandes de subvention de fonctionnement des associations sportives ({total} dossier{total > 1 ? 's' : ''}).
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (association, référence)…"
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={annee ?? ''}
          onChange={(e) => setAnnee(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Toutes les années</option>
          <option value="2027">2027</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value as Statut | '')}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {STATUT_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => navigate('/associations')}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} />
          Gérer les associations
        </button>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Association</th>
              <th className="px-4 py-3">Année</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Dernière mise à jour</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Chargement…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-[13px] text-slate-600">{d.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{d.nomAssociation}</p>
                    {d.sigleAssociation && <p className="text-xs text-slate-500">{d.sigleAssociation}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{d.annee}</td>
                  <td className="px-4 py-3">
                    <StatutBadge statut={d.statut} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(d.updatedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`/dossiers/${d.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <FolderOpen size={14} />
                        Consulter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && !items.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Aucun dossier trouvé. Lancez d’abord le seed : <code>npm run seed</code> (backend).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
