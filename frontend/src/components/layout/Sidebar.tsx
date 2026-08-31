import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, LogOut, FolderOpen, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_VERSION } from '../../lib/appMeta';
import WhatsNewModal from './WhatsNewModal';

const sections = [
  {
    title: 'Synthèse',
    items: [{ to: '/', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Subventions',
    items: [
      { to: '/dossiers', label: 'Dossiers', icon: FolderOpen, end: false },
      { to: '/associations', label: 'Associations', icon: Users, end: false },
    ],
  },
  {
    title: 'Administration',
    adminOnly: true,
    items: [{ to: '/administration/utilisateurs', label: 'Utilisateurs', icon: ShieldCheck, end: false }],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  return (
    <motion.aside
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <img src="/logo-ivry.jpg" alt="Logo Ville d'Ivry" className="h-10 w-10 rounded-lg object-cover" />
          <div>
            <p className="text-sm font-semibold text-slate-800">Subventions</p>
            <p className="text-xs text-slate-500">Ville d’Ivry-sur-Seine</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <p className="text-xs font-medium text-slate-500">Version {APP_VERSION}</p>
          <button
            type="button"
            onClick={() => setWhatsNewOpen(true)}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
          >
            <Sparkles size={12} />
            Quoi de neuf ?
          </button>
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

      <WhatsNewModal open={whatsNewOpen} onClose={() => setWhatsNewOpen(false)} />
    </motion.aside>
  );
}
