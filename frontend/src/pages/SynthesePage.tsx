import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, FileText, Users, Wallet } from 'lucide-react';
import { getDossierStats, listDossiers } from '../api/dossiers';
import type { DossierListItem, DossierStats, Statut } from '../api/dossiers';
import StatutBadge from '../components/dossier/StatutBadge';
import { formatEur, formatNumber } from '../components/dossier/format';

const STATUT_COLORS: Record<Statut, string> = {
  brouillon: 'bg-slate-300',
  depose: 'bg-blue-400',
  instruction: 'bg-amber-400',
  decision: 'bg-violet-400',
  accorde: 'bg-emerald-400',
  refuse: 'bg-red-400',
};

// Ordre de présentation : parcours de la demande.
const PIPELINE: Statut[] = ['depose', 'instruction', 'decision', 'accorde', 'refuse', 'brouillon'];

export default function SynthesePage() {
  const navigate = useNavigate();
  const [annee, setAnnee] = useState<number | undefined>(2027);
  const [stats, setStats] = useState<DossierStats | null>(null);
  const [items, setItems] = useState<DossierListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, d] = await Promise.all([
        getDossierStats(annee),
        listDossiers({ annee, limit: 8, offset: 0 }),
      ]);
      setStats(s);
      setItems(d.items);
      setTotal(d.total);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setError(anyErr?.response?.data?.error || 'Impossible de charger la synthèse');
    } finally {
      setLoading(false);
    }
  }, [annee]);

  useEffect(() => {
    load();
  }, [load]);

  const parStatut = stats?.parStatut;
  const totalDossiers = stats?.totalDossiers ?? 0;

  const kpis = [
    { label: 'Dossiers', value: formatNumber(totalDossiers), icon: FileText, tint: 'text-indigo-600' },
    { label: 'Associations', value: formatNumber(stats?.associations ?? 0), icon: Users, tint: 'text-sky-600' },
    { label: 'Montant sollicité', value: formatEur(stats?.subventions.sollicitees ?? 0), icon: Wallet, tint: 'text-emerald-600' },
    { label: 'Montant accordé', value: formatEur(stats?.subventions.accordees ?? 0), icon: BadgeCheck, tint: 'text-amber-600' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Synthèse</h1>
          <p className="mt-1 text-sm text-slate-500">
            Vue d’ensemble des demandes de subvention de fonctionnement des associations sportives.
          </p>
        </div>
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
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{k.label}</p>
              <k.icon size={18} className={k.tint} />
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-800">{loading ? '…' : k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-800">Répartition par statut</h2>
          <p className="mt-0.5 text-xs text-slate-500">Part des dossiers de l’année sélectionnée</p>

          {loading ? (
            <p className="mt-6 text-sm text-slate-400">Chargement…</p>
          ) : totalDossiers === 0 ? (
            <p className="mt-6 text-sm text-slate-400">Aucun dossier pour cette période.</p>
          ) : (
            <>
              <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                {PIPELINE.filter((s) => (parStatut?.[s] ?? 0) > 0).map((s) => (
                  <div
                    key={s}
                    style={{ width: `${((parStatut?.[s] ?? 0) / totalDossiers) * 100}%` }}
                    className={`${STATUT_COLORS[s]} h-full`}
                  />
                ))}
              </div>

              <ul className="mt-5 space-y-3">
                {PIPELINE.map((s) => {
                  const count = parStatut?.[s] ?? 0;
                  if (count === 0) return null;
                  const pct = totalDossiers ? Math.round((count / totalDossiers) * 100) : 0;
                  return (
                    <li key={s} className="flex items-center justify-between gap-3">
                      <StatutBadge statut={s} />
                      <span className="text-sm text-slate-500">
                        {count} dossier{count > 1 ? 's' : ''} · {pct} %
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Dossiers récents</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {annee ? `${annee} — ` : ''}
                {total} dossier{total > 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dossiers')}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Tous les dossiers
              <ArrowRight size={14} />
            </button>
          </div>

          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2 pr-3">Référence</th>
                <th className="py-2 pr-3">Association</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2 pr-3 text-right">Montant sollicité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`/dossiers/${d.id}`)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="py-3 pr-3 font-mono text-[13px] text-slate-600">{d.reference}</td>
                    <td className="py-3 pr-3 font-medium text-slate-800">{d.nomAssociation}</td>
                    <td className="py-3 pr-3">
                      <StatutBadge statut={d.statut} />
                    </td>
                    <td className="py-3 text-right font-medium text-slate-700">
                      {formatEur(d.sollicite)}
                    </td>
                  </tr>
                ))}
              {!loading && !items.length && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Aucun dossier trouvé. Lancez d’abord le seed : <code>npm run seed</code> (backend).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
