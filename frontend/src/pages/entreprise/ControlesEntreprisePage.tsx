import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { getControle, listControles } from '../../api/entreprise';
import type {
  ControleDetail,
  ControleResume,
  LigneComparaison,
  StatutComparaison,
} from '../../api/entreprise';
import { formatEur } from '../../components/dossier/format';

const STATUT_META: Record<StatutComparaison, { label: string; cls: string }> = {
  ok: { label: 'Conforme', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ecart: { label: 'Écart', cls: 'bg-red-50 text-red-700 border-red-200' },
  local_seul: { label: 'Local seul', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  api_seul: { label: 'API seul', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  non_verifiable: { label: 'Hors API', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  absent: { label: 'Absent', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
};

function StatutBadge({ statut }: { statut: StatutComparaison }) {
  const meta = STATUT_META[statut];
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function Kpi({
  label,
  value,
  tone = 'slate',
  icon: Icon,
}: {
  label: string;
  value: number | string;
  tone?: 'slate' | 'emerald' | 'red' | 'amber' | 'blue';
  icon: typeof CheckCircle2;
}) {
  const tones: Record<string, string> = {
    slate: 'text-slate-500',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <Icon size={18} className={tones[tone]} />
      </div>
      <p className={`mt-2 text-2xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function errorMessage(err: unknown, fallback: string): string {
  const anyErr = err as { response?: { data?: { error?: string } } };
  return anyErr?.response?.data?.error || fallback;
}

function LigneRow({ row }: { row: LigneComparaison }) {
  return (
    <tr className="align-top">
      <td className="px-3 py-2">
        <p className="font-medium text-slate-700">{row.libelle}</p>
        {row.source && <p className="text-[11px] text-slate-400">{row.source}</p>}
      </td>
      <td className="px-3 py-2 text-slate-700">{row.local ?? '—'}</td>
      <td className="px-3 py-2 text-slate-700">{row.api ?? '—'}</td>
      <td className="px-3 py-2">
        <StatutBadge statut={row.statut} />
      </td>
    </tr>
  );
}

function Detail({ detail, loading }: { detail: ControleDetail | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-10 text-slate-500">
        <Loader2 size={18} className="animate-spin" /> Chargement du contrôle…
      </div>
    );
  }
  if (!detail) return null;

  const { summary } = detail;
  const rowsApi = detail.rows.filter((r) => r.couverture === 'api');

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{detail.association.nom}</h2>
            <p className="text-sm text-slate-500">
              SIREN base locale :{' '}
              <span className="font-mono">{detail.association.sirenLocal ?? '—'}</span>
              {detail.association.sirenNormalise && detail.association.sirenNormalise !== detail.association.sirenLocal && (
                <> → normalisé <span className="font-mono text-slate-700">{detail.association.sirenNormalise}</span></>
              )}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              detail.apiDisponible
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {detail.apiDisponible ? 'API Entreprise : données reçues' : 'API Entreprise : indisponible'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Champs conformes" value={summary.ok} tone="emerald" icon={CheckCircle2} />
          <Kpi label="Écarts" value={summary.ecart} tone="red" icon={AlertTriangle} />
          <Kpi label="Local seul / API seul" value={`${summary.local_seul} / ${summary.api_seul}`} tone="amber" icon={Database} />
          <Kpi label="Hors périmètre API" value={summary.non_verifiable} tone="slate" icon={ShieldCheck} />
        </div>
      </div>

      {detail.issues.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-800">
            <AlertTriangle size={16} />
            <h3 className="text-sm font-semibold">Points d’attention ({detail.issues.length})</h3>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
            {detail.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-700">Comparaison champ par champ</h3>
          <p className="text-xs text-slate-400">
            {rowsApi.length} champs couverts par l’API Entreprise (INSEE / DJEPVA) — les autres en sont hors périmètre.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Champ</th>
              <th className="px-3 py-2">Base locale</th>
              <th className="px-3 py-2">API Entreprise</th>
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {detail.rows.map((row) => (
              <LigneRow key={row.cle} row={row} />
            ))}
          </tbody>
        </table>
      </div>

      {detail.apiSeul.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
          <div className="mb-3 flex items-center gap-2 text-blue-800">
            <Database size={16} />
            <h3 className="text-sm font-semibold">Données fournies par l’API, absentes de la base locale</h3>
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {detail.apiSeul.map((item) => (
              <div key={item.libelle} className="grid grid-cols-[220px_1fr] gap-3 border-b border-blue-100 py-1.5">
                <dt className="text-[13px] font-medium text-blue-900/70">{item.libelle}</dt>
                <dd className="text-[13px] text-blue-900">{item.valeur}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <Rubrique9Bloc rubrique9={detail.rubrique9} />

      {detail.etablissements.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-slate-700">
              Établissements (DJEPVA / INSEE) — {detail.etablissements.length}
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">SIRET</th>
                <th className="px-3 py-2">Adresse</th>
                <th className="px-3 py-2">Rôle</th>
                <th className="px-3 py-2">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detail.etablissements.map((e, i) => (
                <tr key={`${e.siret}-${i}`}>
                  <td className="px-3 py-2 font-mono text-[13px] text-slate-700">{e.siret ?? '—'}</td>
                  <td className="px-3 py-2 text-slate-700">{e.adresse ?? '—'}</td>
                  <td className="px-3 py-2 text-slate-700">{e.siege ? 'Siège' : 'Secondaire'}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${e.actif ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                      {e.actif ? 'Actif' : 'Fermé'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Rubrique9Bloc({ rubrique9 }: { rubrique9: import('../../api/entreprise').Rubrique9 }) {
  const rattachables = rubrique9.lignes.filter((l) => l.rattachableApi);
  return (
    <div className="overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50/40">
      <div className="border-b border-indigo-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-indigo-900">
          Rubrique 9 « autres subventions » vs DataSubvention
        </h3>
        <p className="text-xs text-indigo-900/60">
          Seules les lignes rattachables à un dispositif État (ANS, FDVA, Service civique) sont comparables à l’API ;
          Ville, Département, Région, EPT, fédérations, mécénat et sponsoring en sont hors périmètre.
        </p>
      </div>

      {rubrique9.constats.length > 0 && (
        <ul className="list-disc space-y-1 border-b border-indigo-100 px-8 py-3 text-sm text-indigo-900">
          {rubrique9.constats.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}

      {rubrique9.lignes.length > 0 && (
        <table className="w-full text-sm">
          <thead className="bg-indigo-100/60 text-left text-xs uppercase tracking-wider text-indigo-700">
            <tr>
              <th className="px-3 py-2">Financeur déclaré</th>
              <th className="px-3 py-2">Objet</th>
              <th className="px-3 py-2 text-right">2025</th>
              <th className="px-3 py-2 text-right">2026</th>
              <th className="px-3 py-2 text-right">2027 (sollicité)</th>
              <th className="px-3 py-2">Comparable API</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100">
            {rubrique9.lignes.map((l, i) => (
              <tr key={`${l.financeur}-${i}`} className={l.rattachableApi ? 'bg-white' : ''}>
                <td className="px-3 py-2 font-medium text-slate-700">{l.financeur ?? '—'}</td>
                <td className="px-3 py-2 text-slate-600">{l.objet ?? '—'}</td>
                <td className="px-3 py-2 text-right text-slate-700">{formatEur(l.montant2025)}</td>
                <td className="px-3 py-2 text-right text-slate-700">{formatEur(l.montant2026)}</td>
                <td className="px-3 py-2 text-right text-slate-700">{formatEur(l.montant2027)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      l.rattachableApi
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    {l.rattachableApi ? 'Oui (ANS/FDVA)' : 'Non'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {rattachables.length > 0 && (
        <div className="border-t border-indigo-100 bg-white px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Détail API DataSubvention</p>
          {rubrique9.apiAnsFdva.length === 0 ? (
            <p className="mt-1 text-sm text-slate-400">Aucune subvention État référencée pour ce SIREN.</p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-1.5 pr-3">Année</th>
                  <th className="py-1.5 pr-3">Dispositif</th>
                  <th className="py-1.5 pr-3">Instructeur</th>
                  <th className="py-1.5 pr-3">Statut</th>
                  <th className="py-1.5 pr-3 text-right">Demandé</th>
                  <th className="py-1.5 text-right">Accordé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rubrique9.apiAnsFdva.map((s, i) => (
                  <tr key={`${s.dispositif}-${s.annee}-${i}`}>
                    <td className="py-1.5 pr-3 text-slate-700">{s.annee ?? '—'}</td>
                    <td className="py-1.5 pr-3 text-slate-700">
                      {s.dispositif ?? '—'}
                      {s.sousDispositif && <p className="text-[11px] text-slate-400">{s.sousDispositif}</p>}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-700">{s.instructeur ?? '—'}</td>
                    <td className="py-1.5 pr-3 text-slate-700">{s.statut ?? '—'}</td>
                    <td className="py-1.5 pr-3 text-right text-slate-700">{formatEur(s.montantDemande)}</td>
                    <td className="py-1.5 text-right text-slate-700">{formatEur(s.montantAccorde)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function ControlesEntreprisePage() {
  const [items, setItems] = useState<ControleResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ControleDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (refresh = false) => {
    setError('');
    if (refresh) setRefreshing(true);
    try {
      const data = await listControles(refresh);
      setItems(data.items);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Impossible de charger les contrôles API Entreprise'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  async function openDetail(id: number, refresh = false) {
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      setDetail(await getControle(id, refresh));
    } catch (err: unknown) {
      setError(errorMessage(err, 'Impossible de charger le détail du contrôle'));
    } finally {
      setDetailLoading(false);
    }
  }

  async function refreshAll() {
    setSelectedId(null);
    setDetail(null);
    await load(true);
  }

  const totals = items.reduce(
    (acc, it) => {
      acc.ok += it.summary.ok;
      acc.ecart += it.summary.ecart;
      acc.alertes += it.issues;
      if (!it.apiDisponible) acc.indispo += 1;
      return acc;
    },
    { ok: 0, ecart: 0, alertes: 0, indispo: 0 }
  );

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-800">
            <ShieldCheck size={24} className="text-indigo-600" />
            Contrôle API Entreprise
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Confronte les données des associations (INSEE, DJEPVA/RNA, DataSubvention) à la base locale et liste les écarts.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Associations" value={items.length} tone="slate" icon={Database} />
        <Kpi label="Champs conformes" value={totals.ok} tone="emerald" icon={CheckCircle2} />
        <Kpi label="Écarts détectés" value={totals.ecart} tone="red" icon={AlertTriangle} />
        <Kpi label="API indisponible" value={totals.indispo} tone="amber" icon={ShieldCheck} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Association</th>
              <th className="px-4 py-3">SIREN (base locale)</th>
              <th className="px-4 py-3">API</th>
              <th className="px-4 py-3 text-center">Conformes</th>
              <th className="px-4 py-3 text-center">Écarts</th>
              <th className="px-4 py-3 text-center">Alertes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  <Loader2 size={18} className="mr-2 inline animate-spin" />
                  Chargement…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((it) => (
                <tr
                  key={it.associationId}
                  onClick={() => openDetail(it.associationId)}
                  className={`cursor-pointer hover:bg-slate-50 ${selectedId === it.associationId ? 'bg-indigo-50/60' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{it.nom}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-slate-600">
                    {it.sirenLocal ?? '—'}
                    {!it.sirenValide && (
                      <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
                        invalide
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        it.apiDisponible
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {it.apiDisponible ? 'Reçue' : 'Indispo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-emerald-600">{it.summary.ok}</td>
                  <td className="px-4 py-3 text-center font-medium text-red-600">{it.summary.ecart}</td>
                  <td className="px-4 py-3 text-center font-medium text-amber-600">{it.issues}</td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-indigo-600">Détail →</td>
                </tr>
              ))}
            {!loading && !items.length && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Aucune association à contrôler.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Detail detail={detail} loading={detailLoading} />
    </div>
  );
}
