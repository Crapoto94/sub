import { CalendarCheck, CalendarClock, CheckCircle2, ListChecks, Users } from 'lucide-react';
import type { ProjetRow } from '../../types/subventions';
import DossierSection from './DossierSection';

interface SectionProjetsProps {
  numero: number;
  titre: string;
  id: string;
  projets: ProjetRow[];
  prevu?: boolean;
}

// 5. PROJETS RÉALISÉS / 6. PROJETS PRÉVUS : blocs chronologiques.
export default function SectionProjets({ numero, titre, id, projets, prevu = false }: SectionProjetsProps) {
  return (
    <DossierSection numero={numero} titre={titre} id={id}>
      {!projets.length && <p className="text-[13px] text-slate-400">Aucun projet renseigné.</p>}
      <div className="space-y-4">
        {projets.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {prevu ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-semibold text-amber-700">
                  <CalendarClock size={13} />
                  Prévu 2026-2027
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-semibold text-emerald-700">
                  <CheckCircle2 size={13} />
                  Réalisé
                </span>
              )}
              <h3 className="text-[14px] font-semibold text-slate-800">{p.intitule}</h3>
            </div>
            {p.description && <p className="mt-2 text-[13px] text-slate-600">{p.description}</p>}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {p.objectifs && (
                <div>
                  <p className="mb-0.5 flex items-center gap-1 text-[12px] font-semibold text-slate-500">
                    <ListChecks size={13} /> Objectifs
                  </p>
                  <p className="text-[13px] text-slate-700">{p.objectifs}</p>
                </div>
              )}
              {p.moyensMisEnOeuvre && (
                <div>
                  <p className="mb-0.5 flex items-center gap-1 text-[12px] font-semibold text-slate-500">
                    <CalendarCheck size={13} /> Moyens mis en œuvre
                  </p>
                  <p className="text-[13px] text-slate-700">{p.moyensMisEnOeuvre}</p>
                </div>
              )}
              {p.publicsVises && (
                <div>
                  <p className="mb-0.5 flex items-center gap-1 text-[12px] font-semibold text-slate-500">
                    <Users size={13} /> Publics visés
                  </p>
                  <p className="text-[13px] text-slate-700">{p.publicsVises}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </DossierSection>
  );
}
