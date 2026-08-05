import { Trophy } from 'lucide-react';
import type { NiveauSportifRow } from '../../types/subventions';
import DossierSection from './DossierSection';
import { formatNumber } from './format';

const NIVEAU_STYLES: Record<string, string> = {
  Local: 'bg-slate-100 text-slate-700',
  'Départemental': 'bg-emerald-50 text-emerald-700',
  'Régional': 'bg-blue-50 text-blue-700',
  'National': 'bg-violet-50 text-violet-700',
  'International': 'bg-amber-50 text-amber-700',
};

// 4. NIVEAUX SPORTIFS ATTEINTS : tableau fédéral avec badges de niveau.
export default function SectionNiveaux({ niveaux }: { niveaux: NiveauSportifRow[] }) {
  return (
    <DossierSection numero={4} titre="Niveaux sportifs atteints — Résultats" id="section-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-[12px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-medium">Section</th>
              <th className="px-3 py-2 font-medium">Niveau</th>
              <th className="px-3 py-2 font-medium">Résultats</th>
              <th className="px-3 py-2 text-right font-medium">Déplacements</th>
              <th className="px-3 py-2 font-medium">Lieux</th>
            </tr>
          </thead>
          <tbody>
            {niveaux.map((n) => (
              <tr key={n.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="px-3 py-2.5 text-[13px] font-medium text-slate-800">{n.categorieSection ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${NIVEAU_STYLES[n.niveauSportif ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
                    {n.niveauSportif ?? '—'}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[13px] text-slate-700">{n.principauxResultatsSportifs ?? '—'}</td>
                <td className="px-3 py-2.5 text-right text-[13px] tabular-nums text-slate-700">{formatNumber(n.nombreDeplacements)}</td>
                <td className="px-3 py-2.5 text-[13px] text-slate-600">{n.lieuxDeplacements || '—'}</td>
              </tr>
            ))}
            {!niveaux.length && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">Aucun niveau renseigné</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {niveaux.some((n) => n.objectifsSportifsSaisonSuivante) && (
        <div className="mt-4 space-y-2">
          {niveaux
            .filter((n) => n.objectifsSportifsSaisonSuivante)
            .map((n) => (
              <p key={n.id} className="flex items-start gap-2 text-[13px] text-slate-700">
                <Trophy size={15} className="mt-0.5 shrink-0 text-[#173F73]" />
                <span>
                  <span className="font-semibold">{n.categorieSection} :</span> {n.objectifsSportifsSaisonSuivante}
                </span>
              </p>
            ))}
        </div>
      )}
    </DossierSection>
  );
}
