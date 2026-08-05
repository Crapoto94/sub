import type { TarifRow } from '../../types/subventions';
import DossierSection from './DossierSection';
import { formatEur, formatNumber } from './format';

// 7. POLITIQUE TARIFAIRE : tableau Excel Catégorie / Ivryens / Non-Ivryens / Nb adhérents / Total.
export default function SectionTarifaire({ tarifs }: { tarifs: TarifRow[] }) {
  const totalGeneral = tarifs.reduce((acc, t) => acc + (t.montantTotalEstime ?? 0), 0);

  return (
    <DossierSection numero={7} titre="Politique tarifaire" id="section-7">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-[12px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-medium">Catégorie</th>
              <th className="px-3 py-2 text-right font-medium">Cotisation Ivryens</th>
              <th className="px-3 py-2 text-right font-medium">Cotisation Non-Ivryens</th>
              <th className="px-3 py-2 text-right font-medium">Nb adhérents</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {tarifs.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 text-[13px] text-slate-700">{t.categorieCotisation ?? '—'}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatEur(t.cotisationIvryens)}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatEur(t.cotisationNonIvryens)}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatNumber(t.nombreAdherents)}</td>
                <td className="px-3 py-2 text-right text-[13px] font-semibold tabular-nums text-slate-800">{formatEur(t.montantTotalEstime)}</td>
              </tr>
            ))}
            {!tarifs.length && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">Aucune catégorie renseignée</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50/60">
              <td colSpan={4} className="px-3 py-2 text-[13px] font-bold text-slate-800">TOTAL GÉNÉRAL</td>
              <td className="px-3 py-2 text-right text-[13px] font-bold tabular-nums text-slate-800">{formatEur(totalGeneral)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </DossierSection>
  );
}
