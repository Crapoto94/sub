import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Search } from 'lucide-react';
import { listAssociations, createAssociation, updateAssociation } from '../../api/associations';
import type { Association, AssociationInput } from '../../api/associations';

const emptyForm: AssociationInput = { nomOfficielAssociation: '', sigleAbreviation: '', objetAssociation: '', adresseSiegeSocial: '', codePostal: '', ville: '', email: '', telephone: '', siteWebReseauxSociaux: '', numeroRna: '', numeroSiren: '', dateCreation: '', agrementJeunesseSports: '', federationSportiveAffiliation: '', disciplinesPratiquees: '', numeroAffiliation: '', categorieSportive: '' };

export default function AssociationsPage() {
  const [items, setItems] = useState<Association[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<AssociationInput>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await listAssociations({ q: q || undefined, limit: 100, offset: 0 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setError(anyErr?.response?.data?.error || 'Impossible de charger les associations');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  function errorMessage(err: unknown, fallback: string): string {
    const anyErr = err as { response?: { data?: { error?: string } } };
    return anyErr?.response?.data?.error || fallback;
  }

  function startEdit(a: Association) {
    setEditId(a.id);
    const f: Record<string, unknown> = { ...emptyForm };
    const source = a as unknown as Record<string, unknown>;
    for (const key of Object.keys(emptyForm)) {
      const v = source[key];
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') f[key] = v;
    }
    setForm(f as AssociationInput);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editId) await updateAssociation(editId, form);
      else await createAssociation(form);
      setForm(emptyForm);
      setEditId(null);
      await load();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Enregistrement impossible'));
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof AssociationInput>(key: K, value: AssociationInput[K]) {
    setForm({ ...form, [key]: value });
  }

  const fields: Array<{ key: keyof AssociationInput; label: string; span2?: boolean; type?: string }> = [
    { key: 'nomOfficielAssociation', label: 'Nom officiel *', span2: true },
    { key: 'sigleAbreviation', label: 'Sigle / abréviation' },
    { key: 'objetAssociation', label: 'Objet de l’association', span2: true },
    { key: 'adresseSiegeSocial', label: 'Adresse du siège social', span2: true },
    { key: 'codePostal', label: 'Code postal' },
    { key: 'ville', label: 'Ville' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'siteWebReseauxSociaux', label: 'Site web / réseaux sociaux', span2: true },
    { key: 'numeroRna', label: 'N° RNA' },
    { key: 'numeroSiren', label: 'SIREN' },
    { key: 'dateCreation', label: 'Date de création', type: 'date' },
    { key: 'agrementJeunesseSports', label: 'Agrément Jeunesse et Sports' },
    { key: 'federationSportiveAffiliation', label: 'Fédération sportive d’affiliation' },
    { key: 'disciplinesPratiquees', label: 'Disciplines pratiquées', span2: true },
    { key: 'numeroAffiliation', label: 'N° d’affiliation' },
    { key: 'categorieSportive', label: 'Catégorie sportive' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Associations</h1>
      <p className="mt-1 text-sm text-slate-500">
        Référentiel des associations sportives ({total}).
      </p>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} className="text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-700">
            {editId ? `Modifier l’association (id ${editId})` : 'Nouvelle association'}
          </h2>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((f) => (
            <div key={String(f.key)} className={f.span2 ? 'lg:col-span-2' : ''}>
              <label className="mb-1 block text-xs font-medium text-slate-500">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                value={(form[f.key] ?? '') as string}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          ))}
          <div className="flex items-end gap-2 lg:col-span-4">
            <button
              type="submit"
              disabled={saving || !form.nomOfficielAssociation}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {editId ? 'Enregistrer les modifications' : 'Créer l’association'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm(emptyForm);
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (nom, SIREN, RNA)…"
            className="w-72 rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Association</th>
              <th className="px-4 py-3">Fédération</th>
              <th className="px-4 py-3">SIREN</th>
              <th className="px-4 py-3">RNA</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Chargement…</td>
              </tr>
            )}
            {!loading &&
              items.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{a.nomOfficielAssociation}</p>
                    {a.sigleAbreviation && <p className="text-xs text-slate-500">{a.sigleAbreviation}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.federationSportiveAffiliation || '—'}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-slate-600">{a.numeroSiren || '—'}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-slate-600">{a.numeroRna || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.ville || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => startEdit(a)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil size={13} />
                        Modifier
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && !items.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Aucune association. Lancez d’abord le seed : <code>npm run seed</code> (backend).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
