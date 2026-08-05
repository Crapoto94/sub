import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { listUsers, updateUser } from '../../api/users';
import type { User } from '../../api/auth';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  async function toggleRole(user: User) {
    const role = user.role === 'admin' ? 'membre' : 'admin';
    setError('');
    try {
      await updateUser(user.id, { role });
      await load();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      setError(anyErr?.response?.data?.error || 'Mise à jour impossible');
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

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Dernière connexion</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
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
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleRole(u)}
                      disabled={loading}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {u.role === 'admin' ? 'Retirer admin' : 'Promouvoir'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
