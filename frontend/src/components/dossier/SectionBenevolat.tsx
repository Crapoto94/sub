import { HeartHandshake, Clock3, Coins, CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import type { VieAssociativeSection } from '../../types/subventions';
import DossierSection from './DossierSection';
import { formatEur, formatNumber, formatDate } from './format';

// 3. VIE ASSOCIATIVE ET BÉNÉVOLAT : tableau RH + KPI.
export default function SectionBenevolat({ vie }: { vie: VieAssociativeSection }) {
  const rows = [
    { label: 'Bénévoles actifs', n1: vie.benevolesActifsN1, n: vie.benevolesActifs, type: 'count' as const },
    { label: 'Salariés permanents (ETP)', n1: vie.salariesPermanentsEtpN1, n: vie.salariesPermanentsEtp, type: 'etp' as const },
    { label: 'CDD / CDDU', n1: vie.salariesCddCdduN1, n: vie.salariesCddCddu, type: 'count' as const },
    { label: 'Emplois aidés', n1: vie.emploisAidesN1, n: vie.emploisAides, type: 'count' as const },
    { label: 'Agents mis à disposition', n1: vie.agentsMisADispositionN1, n: vie.agentsMisADisposition, type: 'count' as const },
    { label: 'Vacataires / intervenants', n1: vie.vacatairesIntervenantsN1, n: vie.vacatairesIntervenants, type: 'count' as const },
  ];

  const kpis = [
    { label: 'Bénévoles actifs', value: formatNumber(vie.benevolesActifs), icon: HeartHandshake },
    { label: 'Heures de bénévolat', value: formatNumber(vie.nombreHeuresBenevoles), icon: Clock3 },
    { label: 'Valorisation du bénévolat', value: formatEur(vie.montantValorisationBenevolat), icon: Coins },
  ];

  return (
    <DossierSection numero={3} titre="Vie associative et bénévolat" id="section-3">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#173F73] text-white">
              <k.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className="text-lg font-semibold text-slate-800">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-[12px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-medium">Ressources humaines</th>
              <th className="px-3 py-2 text-right font-medium">Saison N-1</th>
              <th className="px-3 py-2 text-right font-medium">Saison N</th>
              <th className="px-3 py-2 text-right font-medium">Valorisation (N)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 text-[13px] text-slate-700">{r.label}</td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-600">
                  {r.type === 'etp' ? (r.n1 ?? '—') : formatNumber(r.n1)}
                </td>
                <td className="px-3 py-2 text-right text-[13px] font-medium tabular-nums text-slate-800">
                  {r.type === 'etp' ? (r.n ?? '—') : formatNumber(r.n)}
                </td>
                <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-600">
                  {r.label === 'Bénévoles actifs' ? formatEur(vie.montantValorisationBenevolat) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 px-4 py-3 text-[13px]">
          <p className="mb-1 flex items-center gap-2 font-semibold text-slate-700">
            <CalendarCheck size={15} className="text-[#173F73]" />
            Dernière assemblée générale
          </p>
          <p className="text-slate-600">{formatDate(vie.dateDerniereAssembleeGenerale)}</p>
        </div>
        <div className="rounded-md border border-slate-200 px-4 py-3 text-[13px]">
          <p className="mb-1 flex items-center gap-2 font-semibold text-slate-700">
            Règlement intérieur à jour
          </p>
          <p className={`flex items-center gap-1.5 ${vie.reglementInterieurAJour ? 'text-emerald-600' : 'text-red-600'}`}>
            {vie.reglementInterieurAJour ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {vie.reglementInterieurAJour ? 'Oui' : 'Non'}
          </p>
        </div>
      </div>

      {vie.actionsFormationsRealisees && (
        <div className="mt-4 rounded-md border border-blue-100 bg-blue-50/50 px-4 py-3 text-[13px] text-slate-700">
          <span className="font-semibold text-[#173F73]">Actions de formation réalisées : </span>
          {vie.actionsFormationsRealisees}
        </div>
      )}
    </DossierSection>
  );
}
