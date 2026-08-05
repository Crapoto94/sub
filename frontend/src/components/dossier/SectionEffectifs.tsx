import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EffectifsSection } from '../../types/subventions';
import DossierSection from './DossierSection';
import { formatNumber, pctChange, evolutionClass, sign } from './format';

interface EffRow {
  label: string;
  n1: number | null;
  n: number | null;
  prev: number | null;
}

const PIE_COLORS = ['#173F73', '#94a3b8'];

function TableRow({ row }: { row: EffRow }) {
  const ev1 = pctChange(row.n1, row.n);
  const ev2 = pctChange(row.n, row.prev);
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-3 py-2 text-[13px] text-slate-700">{row.label}</td>
      <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-600">{formatNumber(row.n1)}</td>
      <td className="px-3 py-2 text-right text-[13px] font-medium tabular-nums text-slate-800">{formatNumber(row.n)}</td>
      <td className={`px-3 py-2 text-right text-[13px] tabular-nums ${evolutionClass(ev1)}`}>{sign(ev1)}</td>
      <td className="px-3 py-2 text-right text-[13px] tabular-nums text-slate-600">{formatNumber(row.prev)}</td>
      <td className={`px-3 py-2 text-right text-[13px] tabular-nums ${evolutionClass(ev2)}`}>{sign(ev2)}</td>
    </tr>
  );
}

function EffTable({ title, rows }: { title: string; rows: EffRow[] }) {
  const sum = (k: 'n1' | 'n' | 'prev') => rows.reduce((acc, r) => acc + (r[k] ?? 0), 0);
  const totals: EffRow = { label: 'TOTAL', n1: sum('n1'), n: sum('n'), prev: sum('prev') };
  return (
    <div className="mb-6">
      <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#173F73]">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-[12px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 font-medium">Catégorie</th>
              <th className="px-3 py-2 text-right font-medium">Saison N-1</th>
              <th className="px-3 py-2 text-right font-medium">Saison N</th>
              <th className="px-3 py-2 text-right font-medium">Évolution</th>
              <th className="px-3 py-2 text-right font-medium">Prévisionnel</th>
              <th className="px-3 py-2 text-right font-medium">Évolution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <TableRow key={r.label} row={r} />
            ))}
            <tr className="bg-blue-50/60 font-semibold">
              <td className="px-3 py-2 text-[13px] font-bold text-slate-800">TOTAL</td>
              <td className="px-3 py-2 text-right text-[13px] font-bold tabular-nums text-slate-800">{formatNumber(totals.n1)}</td>
              <td className="px-3 py-2 text-right text-[13px] font-bold tabular-nums text-slate-800">{formatNumber(totals.n)}</td>
              <td className={`px-3 py-2 text-right text-[13px] font-bold tabular-nums ${evolutionClass(pctChange(totals.n1, totals.n))}`}>{sign(pctChange(totals.n1, totals.n))}</td>
              <td className="px-3 py-2 text-right text-[13px] font-bold tabular-nums text-slate-800">{formatNumber(totals.prev)}</td>
              <td className={`px-3 py-2 text-right text-[13px] font-bold tabular-nums ${evolutionClass(pctChange(totals.n, totals.prev))}`}>{sign(pctChange(totals.n, totals.prev))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 2. ADHÉRENTS ET LICENCIÉS : tableaux à l'identique du classeur Excel + graphiques Recharts.
export default function SectionEffectifs({ effectifs }: { effectifs: EffectifsSection }) {
  const ageRows: EffRow[] = [
    { label: 'Petite enfance (0-5 ans)', n1: effectifs.petiteEnfance0_5N1, n: effectifs.petiteEnfance0_5, prev: effectifs.petiteEnfance0_5Prev },
    { label: 'Enfance (6-14 ans)', n1: effectifs.enfance6_14N1, n: effectifs.enfance6_14, prev: effectifs.enfance6_14Prev },
    { label: 'Adolescents (15-18 ans)', n1: effectifs.adolescents15_18N1, n: effectifs.adolescents15_18, prev: effectifs.adolescents15_18Prev },
    { label: 'Jeunes (19-29 ans)', n1: effectifs.jeunes19_29N1, n: effectifs.jeunes19_29, prev: effectifs.jeunes19_29Prev },
    { label: 'Adultes (30-59 ans)', n1: effectifs.adultes30_59N1, n: effectifs.adultes30_59, prev: effectifs.adultes30_59Prev },
    { label: 'Seniors (60-74 ans)', n1: effectifs.seniors60_74N1, n: effectifs.seniors60_74, prev: effectifs.seniors60_74Prev },
    { label: 'Grand âge (75 ans et plus)', n1: effectifs.grandAge75PlusN1, n: effectifs.grandAge75Plus, prev: effectifs.grandAge75PlusPrev },
  ];

  const totalN = ageRows.reduce((acc, r) => acc + (r.n ?? 0), 0);
  const pieSex = [
    { name: 'Femmes', value: effectifs.femmes ?? 0 },
    { name: 'Hommes', value: effectifs.hommes ?? 0 },
  ];
  const pieGeo = [
    { name: 'Ivryens', value: effectifs.ivryens ?? 0 },
    { name: 'Non-Ivryens', value: effectifs.nonIvryens ?? 0 },
  ];
  const evolutionData = [
    { name: 'Saison N-1', Total: ageRows.reduce((a, r) => a + (r.n1 ?? 0), 0) },
    { name: 'Saison N', Total: totalN },
    { name: 'Prévisionnel', Total: ageRows.reduce((a, r) => a + (r.prev ?? 0), 0) },
  ];

  return (
    <DossierSection numero={2} titre="Adhérents et licenciés" id="section-2">
      <EffTable
        title="Répartition géographique"
        rows={[
          { label: 'Ivryens', n1: effectifs.ivryensN1, n: effectifs.ivryens, prev: effectifs.ivryensPrev },
          { label: 'Non-Ivryens', n1: effectifs.nonIvryensN1, n: effectifs.nonIvryens, prev: effectifs.nonIvryensPrev },
        ]}
      />
      <EffTable
        title="Répartition par genre"
        rows={[
          { label: 'Femmes', n1: effectifs.femmesN1, n: effectifs.femmes, prev: effectifs.femmesPrev },
          { label: 'Hommes', n1: effectifs.hommesN1, n: effectifs.hommes, prev: effectifs.hommesPrev },
        ]}
      />
      <EffTable
        title="CSP (catégorie socioprofessionnelle)"
        rows={[
          { label: 'Salariés', n1: effectifs.salariesN1, n: effectifs.salaries, prev: effectifs.salariesPrev },
          { label: 'Étudiants', n1: effectifs.etudiantsN1, n: effectifs.etudiants, prev: effectifs.etudiantsPrev },
          { label: 'Demandeurs d’emploi', n1: effectifs.demandeursEmploiN1, n: effectifs.demandeursEmploi, prev: effectifs.demandeursEmploiPrev },
          { label: 'Retraités', n1: effectifs.retraitesN1, n: effectifs.retraites, prev: effectifs.retraitesPrev },
          { label: 'Non communiqué', n1: effectifs.nonCommuniqueN1, n: effectifs.nonCommunique, prev: effectifs.nonCommuniquePrev },
        ]}
      />
      <EffTable title="Tranches d'âge" rows={ageRows} />
      <EffTable
        title="Accessibilité"
        rows={[
          { label: 'Personnes en situation de handicap', n1: effectifs.personnesSituationHandicapN1, n: effectifs.personnesSituationHandicap, prev: effectifs.personnesSituationHandicapPrev },
          { label: 'Bénéficiaires de tarifs réduits / sociaux', n1: effectifs.beneficiairesTarifsReduitsSociauxN1, n: effectifs.beneficiairesTarifsReduitsSociaux, prev: effectifs.beneficiairesTarifsReduitsSociauxPrev },
          { label: 'Bénéficiaires Pass’Sport', n1: effectifs.nombreBeneficiairesPassSportN1, n: effectifs.nombreBeneficiairesPassSport, prev: effectifs.nombreBeneficiairesPassSportPrev },
        ]}
      />

      {effectifs.actionsPublicsEloignes && (
        <div className="rounded-md border border-blue-100 bg-blue-50/50 px-4 py-3 text-[13px] text-slate-700">
          <span className="font-semibold text-[#173F73]">Actions vers les publics éloignés : </span>
          {effectifs.actionsPublicsEloignes}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="mb-3 text-center text-[13px] font-semibold text-slate-600">Répartition Femmes / Hommes (Saison N)</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieSex} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieSex.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="mb-3 text-center text-[13px] font-semibold text-slate-600">Répartition Ivryens / Non-Ivryens (Saison N)</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieGeo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieGeo.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="mb-3 text-center text-[13px] font-semibold text-slate-600">Répartition par tranche d'âge (Saison N)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ageRows} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="n" name="Licenciés" fill="#173F73" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="mb-3 text-center text-[13px] font-semibold text-slate-600">Évolution des adhérents N-1 → N → Prévisionnel</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolutionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Total" name="Effectifs" stroke="#173F73" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DossierSection>
  );
}
