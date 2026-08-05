import { FormEvent, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react';
import { createUser, listUsers, resetPassword, updateUser } from '../../api/users';
import type { User } from '../../api/auth';

interface FormState {
  username: string;
  displayName: string;
  email: string;
  role: 'admin' | 'membre';
  password: string;
}

const emptyForm: FormState = { username: '', displayName: '', email: '', role: 'membre', password: '' };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [creating, setCreating] = useState(false);

  async function load() {
    setError('');
    try {
      const data = await listUsers();
      setUsers(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setError(anyErr?.response?.data?.error || 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function errorMessage(err: unknown, fallback: string) {
    const anyErr = err as { response?: { data?: { error?: string } } };
    return anyErr?.response?.data?.error || fallback;
  }

  async function toggleRole(user: User) {
    const role = user.role === 'admin' ? 'membre' : 'admin';
    setError('');
    try {
      await updateUser(user.id, { role });
      await load();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Mise à jour impossible'));
    }
  }

  async function onResetPassword(user: User) {
    const password = window.prompt(`Nouveau mot de passe pour ${user.username} (min. 8 caractères)`);
    if (!password) return;
    setError('');
    try {
      await resetPassword(user.id, password);
      await load();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Réinitialisation impossible'));
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await createUser({
        username: form.username,
        displayName: form.displayName || undefined,
        email: form.email || undefined,
        role: form.role,
        password: form.password || undefined,
      });
      setForm(emptyForm);
      await load();
    } catch (err: unknown) {
      setError(errorMessage(err, "Création impossible"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Administration</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gestion des utilisateurs de l’application ({total}).
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-700">Nouvel utilisateur</h2>
        </div>
        <form onSubmit={onCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            required
            placeholder="Identifiant *"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            placeholder="Nom affiché"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'membre' })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="membre">Membre</option>
            <option value="admin">Administrateur</option>
          </select>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Mot de passe local (option)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Créer
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-slate-400">
          Sans mot de passe, le compte s’authentifiera via l’Active Directory. Avec un mot de passe, il
          devient un compte local (sans AD).
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dernière connexion</th>
              <th className="px-4 py-3">Rôle</th>
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
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{u.displayName || u.username}</p>
                    <p className="text-xs text-slate-500">
                      {u.username}
                      {u.email ? ` — ${u.email}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.service || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isLocal ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.isLocal ? 'Local' : 'AD'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ShieldCheck size={12} />
                      {u.role === 'admin' ? 'Administrateur' : 'Membre'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onResetPassword(u)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        title="Définir / réinitialiser le mot de passe local"
                      >
                        <KeyRound size={12} />
                        MDP local
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleRole(u)}
                        disabled={loading}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {u.role === 'admin' ? 'Retirer admin' : 'Promouvoir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
