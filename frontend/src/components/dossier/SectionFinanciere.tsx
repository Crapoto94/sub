import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowDownCircle, ArrowUpCircle, Landmark, PiggyBank, Wallet } from 'lucide-react';
import type { SituationFinanciereSection } from '../../types/subventions';
import DossierSection from './DossierSection';
import { formatEur } from './format';

// 8. SITUATION FINANCIÈRE : carte synthèse + tableau historique 2025 / 2026 / 2027 + graphiques.
export default function SectionFinanciere({ fin }: { fin: SituationFinanciereSection }) {
  const historique = [
    { annee: '2025', charges: fin.totalCharges2025, produits: fin.totalProduits2025, subvention: fin.subventionVille2025 },
    { annee: '2026', charges: fin.totalCharges, produits: fin.totalProduits, subvention: fin.subventionVille },
    { annee: '2027 (prévisionnel)', charges: fin.totalCharges2027, produits: fin.totalProduits2027, subvention: fin.subventionVille2027 },
  ];

  const cards = [
    { label: 'Charges', value: formatEur(fin.totalCharges), icon: ArrowDownCircle },
    { label: 'Produits', value: formatEur(fin.totalProduits), icon: ArrowUpCircle },
    { label: 'Résultat net', value: formatEur(fin.resultatNet), icon: Wallet },
    { label: 'Trésorerie disponible', value: formatEur(fin.tresorerieDisponible), icon: PiggyBank },
    { label: 'Fonds propres / réserves', value: formatEur(fin.fondsPropresReserves), icon: Landmark },
  ];

  return (
    <DossierSection numero={8} titre="Situation financière" id="section-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{c.label}</p>
              <c.icon size={16} className="text-[#173F73]" />
            </div>
            <p className={`mt-1 text-lg font-semibold ${c.label === 'Résultat net' && (fin.resultatNet ?? 0) < 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-[12px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-medium">Exercice</th>
              <th className="px-3 py-2 text-right font-medium">Charges</th>
              <th className="px-3 py-2 text-right font-medium">Produits</th>
              <th className="px-3 py-2 text-right font-medium">Subvention Ville</th>
              <th className="px-3 py-2 text-right font-medium">Résultat</th>
            </tr>
          </thead>
          <tbody>
            {historique.map((h) => (
              <tr key={h.annee} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700">{h.annee}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatEur(h.charges)}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatEur(h.produits)}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-700">{formatEur(h.subvention)}</td>
                <td className={`px-3 py-2 text-right text-[13px] font-semibold tabular-nums ${((h.produits ?? 0) - (h.charges ?? 0)) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatEur((h.produits ?? 0) - (h.charges ?? 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 p-4">
        <p className="mb-3 text-center text-[13px] font-semibold text-slate-600">Charges / Produits / Subvention Ville (2025 → 2027)</p>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={historique} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => formatEur(Number(value))} />
            <Legend />
            <Bar dataKey="charges" name="Charges" fill="#173F73" radius={[3, 3, 0, 0]} />
            <Bar dataKey="produits" name="Produits" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Line type="monotone" dataKey="subvention" name="Subvention Ville" stroke="#f59e0b" strokeWidth={2.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 rounded-md border border-blue-100 bg-blue-50/50 px-4 py-3 text-[13px] text-slate-700">
        <span className="font-semibold text-[#173F73]">Montant de la subvention demandée : {formatEur(fin.montantSubventionSollicitee)}</span>
        {fin.justificationMontantDemande && (
          <p className="mt-1">Justification : {fin.justificationMontantDemande}</p>
        )}
      </div>
    </DossierSection>
  );
}
