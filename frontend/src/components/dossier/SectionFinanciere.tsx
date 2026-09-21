import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowDownCircle, ArrowUpCircle, Landmark, PiggyBank, Wallet } from 'lucide-react';
import type { SituationFinanciereSection, TableauFinancierRow } from '../../types/subventions';
import DossierSection from './DossierSection';
import { evolutionClass, formatEur, formatNumber, formatPercent } from './format';

// Zone de défilement (largeur + hauteur) avec barre épaissie visible,
// pour consulter toutes les colonnes et toutes les lignes des tableaux.
const SCROLL_AREA = 'scrollbar-thick max-h-[70vh] overflow-auto rounded-md border border-slate-100';

function formatPctPlain(v: number | null): string {
  if (v === null || v === undefined) return '—';
  return `${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}

function formatBenevole(l: TableauFinancierRow, v: number | null): string {
  if (v === null || v === undefined) return '—';
  if (/taux horaire/i.test(l.libelle ?? '')) {
    return `${v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  }
  if (/heure/i.test(l.libelle ?? '')) return formatNumber(v);
  return formatEur(v);
}

// L'évolution du fichier peut être stockée en ratio (0,12) ou en pourcentage (12).
function evolPercent(v: number | null): number | null {
  if (v === null || v === undefined) return null;
  return Math.abs(v) <= 1 ? v * 100 : v;
}

// 8. SITUATION FINANCIÈRE : carte synthèse + tableau historique 2025 / 2026 / 2027
// + graphiques + reproduction complète du fichier « Tableau financier »
// (titre, association, période, charges/produits, indicateurs, bénévolat, note).
export default function SectionFinanciere({
  fin,
  detail,
  associationNom,
}: {
  fin: SituationFinanciereSection;
  detail: TableauFinancierRow[];
  associationNom?: string | null;
}) {
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

  const lignes = detail.filter((d) => d.categorie === 'charge' || d.categorie === 'produit');
  const indicateurs = detail.filter((d) => d.categorie === 'indicateur');
  const contributions = detail.filter((d) => d.categorie === 'benevole');
  const titreDocument = detail.find((d) => d.type === 'titre-document');
  const sousTitre = detail.find((d) => d.type === 'sous-titre');
  const association = detail.find((d) => d.type === 'association');
  const periode = detail.find((d) => d.type === 'periode');
  const noteLegale = detail.find((d) => d.type === 'note-legale');
  const nomAssociation = association?.note ?? associationNom ?? null;

  return (
    <DossierSection numero={8} titre="Situation financière" id="section-8">
      {(titreDocument || sousTitre || association || periode) && (
        <div className="mb-6 border-b border-slate-200 pb-4">
          {titreDocument && (
            <h3 className="text-[15px] font-semibold uppercase tracking-wide text-[#173F73]">{titreDocument.libelle}</h3>
          )}
          {sousTitre && <p className="mt-1 text-[12px] text-slate-500">{sousTitre.libelle}</p>}
          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-1 text-[12.5px] text-slate-600">
            {association && (
              <span>
                {association.libelle}{' '}
                <span className="font-medium text-slate-800">{nomAssociation ?? '—'}</span>
              </span>
            )}
            {periode && (
              <span>
                Période de référence :{' '}
                <span className="font-medium text-slate-800">
                  {periode.libelle ?? 'non renseignée (case à cocher dans le fichier)'}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

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

      {detail.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-[13px] font-semibold text-slate-600">
            Détail du tableau financier — charges / produits
          </p>
          {lignes.length > 0 && (
          <div className={SCROLL_AREA}>
            <table className="w-full min-w-[1100px] border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="sticky top-0 z-10 w-20 bg-slate-50 px-2 py-2 font-medium">N° Cpte</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 font-medium">Libellé</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Exercice 2025</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Exercice 2026</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Prévi. 2027</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Écart</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Évol.</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 font-medium">Notes / Justifications</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => {
                  if (l.type === 'titre') {
                    return (
                      <tr key={l.id} className="bg-[#173F73] text-white">
                        <td colSpan={8} className="px-2 py-1.5 text-[12px] font-semibold uppercase tracking-wide">
                          {l.libelle}
                        </td>
                      </tr>
                    );
                  }
                  if (l.type === 'rubrique') {
                    return (
                      <tr key={l.id} className="bg-slate-100 text-slate-700">
                        <td colSpan={8} className="px-2 py-1.5 text-[12px] font-medium">
                          {l.libelle}
                        </td>
                      </tr>
                    );
                  }
                  const isTotal = l.type === 'total';
                  const isSousTotal = l.type === 'sous-total';
                  return (
                    <tr
                      key={l.id}
                      className={`border-b border-slate-100 ${
                        isTotal
                          ? 'bg-[#dbe4f0] font-semibold text-slate-900'
                          : isSousTotal
                            ? 'bg-slate-50 font-semibold text-slate-800'
                            : ''
                      }`}
                    >
                      <td className="px-2 py-1.5 font-mono text-[11px] text-slate-400">{l.numeroCompte ?? ''}</td>
                      <td className="px-2 py-1.5 text-slate-700" title={l.note ?? undefined}>
                        {l.libelle}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatEur(l.montant2025)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatEur(l.montant2026)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatEur(l.montant2027)}</td>
                      <td
                        className={`px-2 py-1.5 text-right tabular-nums ${
                          (l.ecart ?? 0) < 0 ? 'text-red-600' : 'text-slate-700'
                        }`}
                      >
                        {formatEur(l.ecart)}
                      </td>
                      <td className={`px-2 py-1.5 text-right tabular-nums ${evolutionClass(l.evol)}`}>
                        {formatPercent(evolPercent(l.evol))}
                      </td>
                      <td className="px-2 py-1.5 text-[11.5px] text-slate-500">{l.note ?? ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {indicateurs.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-[13px] font-semibold text-slate-600">Indicateurs automatiques</p>
          <div className={SCROLL_AREA}>
            <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 font-medium">Indicateur</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Exercice 2025</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Exercice 2026</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Prévi. 2027</th>
                </tr>
              </thead>
              <tbody>
                {indicateurs.map((l) =>
                  l.type === 'titre' ? (
                    <tr key={l.id} className="bg-[#173F73] text-white">
                      <td colSpan={4} className="px-2 py-1.5 text-[12px] font-semibold uppercase tracking-wide">
                        {l.libelle}
                      </td>
                    </tr>
                  ) : (
                    <tr key={l.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-1.5 text-slate-700">{l.libelle}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatPctPlain(l.montant2025)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatPctPlain(l.montant2026)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatPctPlain(l.montant2027)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contributions.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-[13px] font-semibold text-slate-600">Contributions volontaires en nature</p>
          <div className={SCROLL_AREA}>
            <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 font-medium">Élément</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Exercice 2025</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Exercice 2026</th>
                  <th className="sticky top-0 z-10 bg-slate-50 px-2 py-2 text-right font-medium">Prévi. 2027</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((l) =>
                  l.type === 'titre' ? (
                    <tr key={l.id} className="bg-[#173F73] text-white">
                      <td colSpan={4} className="px-2 py-1.5 text-[12px] font-semibold uppercase tracking-wide">
                        {l.libelle}
                      </td>
                    </tr>
                  ) : (
                    <tr key={l.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-1.5 text-slate-700" title={l.note ?? undefined}>
                        {l.libelle}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatBenevole(l, l.montant2025)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatBenevole(l, l.montant2026)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{formatBenevole(l, l.montant2027)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {noteLegale && (
        <p className="mt-6 border-t border-slate-200 pt-3 text-[11.5px] italic text-slate-500">{noteLegale.libelle}</p>
      )}
    </DossierSection>
  );
}
