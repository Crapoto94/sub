/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react';
import { ListOrdered } from 'lucide-react';

export interface TocItem {
  id: string;
  label: string;
}

export const TOC: TocItem[] = [
  { id: 'section-1', label: '1. Identification' },
  { id: 'section-2', label: '2. Adhérents et licenciés' },
  { id: 'section-3', label: '3. Vie associative et bénévolat' },
  { id: 'section-4', label: '4. Niveaux sportifs atteints' },
  { id: 'section-5', label: '5. Projets réalisés' },
  { id: 'section-6', label: '6. Projets prévus' },
  { id: 'section-7', label: '7. Politique tarifaire' },
  { id: 'section-8', label: '8. Situation financière' },
  { id: 'section-9', label: '9. Financements' },
  { id: 'section-10', label: '10. Pièces justificatives' },
];

// Scroll-spy : surbrillance de la section affichée à l'écran.
function useScrollSpy() {
  const [active, setActive] = useState('section-1');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    for (const item of TOC) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Sommaire vertical (colonne gauche, écrans larges) : sticky, toujours visible.
export default function DossierToc() {
  const active = useScrollSpy();

  return (
    <nav className="sticky top-6 w-60 shrink-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <ListOrdered size={14} />
        Sommaire
      </p>
      <ul className="space-y-0.5">
        {TOC.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => scrollTo(item.id)}
              className={`w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                active === item.id
                  ? 'bg-[#173F73] font-medium text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Sommaire horizontal (petits écrans) : barre sticky en haut, défilement horizontal.
export function DossierTocBar() {
  const active = useScrollSpy();

  return (
    <nav className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur lg:hidden">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <ListOrdered size={14} className="shrink-0 text-slate-500" />
        {TOC.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              active === item.id
                ? 'bg-[#173F73] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {item.label.split('. ')[0]}
          </button>
        ))}
      </div>
    </nav>
  );
}
