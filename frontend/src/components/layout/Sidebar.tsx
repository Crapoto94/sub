import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, LogOut, HandCoins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const sections = [
  {
    title: 'Synthèse',
    items: [{ to: '/', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Administration',
    adminOnly: true,
    items: [{ to: '/administration/utilisateurs', label: 'Utilisateurs', icon: ShieldCheck, end: false }],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <HandCoins size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Subventions</p>
          <p className="text-xs text-slate-500">Ville d’Ivry-sur-Seine</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections
          .filter((section) => !section.adminOnly || user?.role === 'admin')
          .map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <p className="truncate text-sm font-medium text-slate-700">{user?.displayName || user?.username}</p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </motion.aside>
  );
}
