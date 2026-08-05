import type { FinancementRow } from '../../types/subventions';
import DossierSection from './DossierSection';
import { formatEur } from './format';

// 9. AUTRES SUBVENTIONS ET FINANCEMENTS : tableau Financeur / 2025 / 2026 / 2027 / Objet + total.
export default function SectionFinancements({ financements }: { financements: FinancementRow[] }) {
  const total = (k: 'montantAccorde2025' | 'montantAccorde2026' | 'montantSollicite2027') =>
    financements.reduce((acc, f) => acc + (f[k] ?? 0), 0);

  return (
    <DossierSection numero={9} titre="Autres subventions et financements" id="section-9">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-[12px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-medium">Financeur</th>
              <th className="px-3 py-2 text-right font-medium">2025</th>
              <th className="px-3 py-2 text-right font-medium">2026</th>
              <th className="px-3 py-2 text-right font-medium">2027 (sollicité)</th>
              <th className="px-3 py-2 font-medium">Objet</th>
            </tr>
          </thead>
          <tbody>
            {financements.map((f) => (
              <tr key={f.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="px-3 py-2 text-[13px] font-medium text-slate-800">{f.financeur ?? '—'}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatEur(f.montantAccorde2025)}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatEur(f.montantAccorde2026)}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatEur(f.montantSollicite2027)}</td>
                <td className="px-3 py-2 text-[13px] text-slate-600">{f.objetFinancement ?? '—'}</td>
              </tr>
            ))}
            {!financements.length && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">Aucun financement renseigné</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50/60">
              <td className="px-3 py-2 text-[13px] font-bold text-slate-800">TOTAL</td>
              <td className="px-3 py-2 text-right text-[13px] font-bold tabular-nums text-slate-800">{formatEur(total('montantAccorde2025'))}</td>
              <td className="px-3 py-2 text-right text-[13px] font-bold tabular-nums text-slate-800">{formatEur(total('montantAccorde2026'))}</td>
              <td className="px-3 py-2 text-right text-[13px] font-bold tabular-nums text-slate-800">{formatEur(total('montantSollicite2027'))}</td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </DossierSection>
  );
}
