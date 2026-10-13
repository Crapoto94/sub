import type { Dossier } from '../../api/dossiers';
import type { Association } from '../../api/associations';
import type {
  EffectifsSection,
  VieAssociativeSection,
  NiveauSportifRow,
  ProjetRow,
  TarifRow,
  SituationFinanciereSection,
  TableauFinancierRow,
  FinancementRow,
  PieceRow,
  SyntheseSection,
} from '../../types/subventions';
import { formatDate, formatEur, formatNumber, formatPercent, pctChange, sign } from './format';

// Export PDF d'un dossier complet via la boîte de dialogue d'impression du
// navigateur (Enregistrer en PDF). Le document reproduit, rubrique par
// rubrique, la présentation de la page « Dossier » (bandeaux numérotés,
// tableaux, cartes de synthèse), dans un format A4 portrait imprimable.

const STATUT_LABELS: Record<Dossier['statut'], string> = {
  brouillon: 'Brouillon',
  depose: 'Déposé',
  instruction: 'En instruction',
  decision: 'Décision',
  accorde: 'Validé',
  refuse: 'Refusé',
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Valeur texte affichable, ou tiret cadratin si absente.
function text(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return esc(value);
}

const eur = (v: number | null | undefined): string => esc(formatEur(v));
const num = (v: number | null | undefined): string => esc(formatNumber(v));

// Évolution d'un pourcentage : hausse en vert, baisse en rouge, stable en gris.
function evClass(v: number | null): string {
  if (v === null) return 'muted';
  if (v > 0.05) return 'pos';
  if (v < -0.05) return 'neg';
  return 'muted';
}

const evSign = (v: number | null): string => esc(sign(v));

// Formatage d'un pourcentage stocké en valeur brute (ex. 12,3 -> « 12,3 % »).
function formatPctPlain(v: number | null): string {
  if (v === null || v === undefined) return '—';
  return `${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}

// L'évolution du tableau financier peut être stockée en ratio (0,12) ou en % (12).
function evolPercent(v: number | null): number | null {
  if (v === null || v === undefined) return null;
  return Math.abs(v) <= 1 ? v * 100 : v;
}

function formatBenevole(l: TableauFinancierRow, v: number | null): string {
  if (v === null || v === undefined) return '—';
  if (/taux horaire/i.test(l.libelle ?? '')) {
    return `${v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  }
  if (/heure/i.test(l.libelle ?? '')) return formatNumber(v);
  return formatEur(v);
}

// --- Construction des tableaux -------------------------------------------

interface Col {
  label: string;
  right?: boolean;
}

// Tableau générique. Les cellules contiennent déjà du HTML échappé.
function table(cols: Col[], rows: string[][], footer?: string[], empty?: string): string {
  const head = cols
    .map((c) => `<th${c.right ? ' class="right"' : ''}>${esc(c.label)}</th>`)
    .join('');
  const bodies = rows.length
    ? rows
        .map(
          (r) =>
            `<tr>${r
              .map((cell, i) => `<td${cols[i]?.right ? ' class="right"' : ''}>${cell}</td>`)
              .join('')}</tr>`
        )
        .join('')
    : `<tr><td class="empty" colspan="${cols.length}">${esc(empty ?? 'Aucune donnée')}</td></tr>`;
  const foot = footer
    ? `<tfoot><tr>${footer
        .map((cell, i) => `<td${cols[i]?.right ? ' class="right"' : ''}>${cell}</td>`)
        .join('')}</tr></tfoot>`
    : '';
  return `<table><thead><tr>${head}</tr></thead><tbody>${bodies}</tbody>${foot}</table>`;
}

interface EffRow {
  label: string;
  n1: number | null;
  n: number | null;
  prev: number | null;
}

function effTr(r: EffRow, bold = false): string {
  const ev1 = pctChange(r.n1, r.n);
  const ev2 = pctChange(r.n, r.prev);
  return `<tr${bold ? ' class="total"' : ''}>
    <td>${esc(r.label)}</td>
    <td class="right">${num(r.n1)}</td>
    <td class="right strong">${num(r.n)}</td>
    <td class="right ${evClass(ev1)}">${evSign(ev1)}</td>
    <td class="right">${num(r.prev)}</td>
    <td class="right ${evClass(ev2)}">${evSign(ev2)}</td>
  </tr>`;
}

function effTable(title: string, rows: EffRow[]): string {
  const sum = (k: 'n1' | 'n' | 'prev') => rows.reduce((acc, r) => acc + (r[k] ?? 0), 0);
  const total: EffRow = { label: 'TOTAL', n1: sum('n1'), n: sum('n'), prev: sum('prev') };
  const head = `<tr>
    <th>Catégorie</th>
    <th class="right">Saison N-1</th>
    <th class="right">Saison N</th>
    <th class="right">Évolution</th>
    <th class="right">Prévisionnel</th>
    <th class="right">Évolution</th>
  </tr>`;
  const body = rows.map((r) => effTr(r)).join('') + effTr(total, true);
  return `<h3 class="subtitle">${esc(title)}</h3><table><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

function section(numero: number, titre: string, contenu: string): string {
  return `<section class="section">
    <h2 class="section-title"><span class="section-num">${numero}</span>${esc(titre)}</h2>
    <div class="section-body">${contenu}</div>
  </section>`;
}

function cards(items: Array<{ label: string; value: string }>): string {
  return `<div class="cards">${items
    .map(
      (c) =>
        `<div class="card"><span class="card-label">${esc(c.label)}</span><span class="card-value">${c.value}</span></div>`
    )
    .join('')}</div>`;
}

// --- Rubriques ------------------------------------------------------------

function headerHtml(dossier: Dossier): string {
  const fin = dossier.sections['situation-financiere'] as SituationFinanciereSection | undefined;
  return `<header class="doc-header">
    <p class="doc-ref">${esc(dossier.reference)} — Année ${esc(dossier.annee)}</p>
    <h1>DOSSIER DE DEMANDE DE SUBVENTION DE FONCTIONNEMENT ${esc(dossier.annee)}</h1>
    <p class="doc-sub">Associations Sportives — Ville d'Ivry-sur-Seine</p>
    <div class="doc-meta">
      <div><span class="doc-asso">${esc(dossier.nomAssociation ?? '—')}</span></div>
      <div class="doc-right">
        <span class="badge">${esc(STATUT_LABELS[dossier.statut])}</span>
        <div class="doc-amount">
          <span>Montant demandé</span>
          <strong>${eur(fin?.montantSubventionSollicitee ?? null)}</strong>
        </div>
      </div>
    </div>
  </header>`;
}

function identificationHtml(association: Association): string {
  const rows: Array<[string, string]> = [
    ['Nom officiel de l’association', association.nomOfficielAssociation ?? '—'],
    ['Sigle / abréviation usuelle', association.sigleAbreviation ?? '—'],
    ['Objet de l’association', association.objetAssociation ?? '—'],
    ['Adresse du siège social', association.adresseSiegeSocial ?? '—'],
    [
      'Code postal / Ville',
      association.codePostal && association.ville
        ? `${association.codePostal} ${association.ville}`
        : association.ville ?? '—',
    ],
    ['E-mail', association.email ?? '—'],
    ['Téléphone', association.telephone ?? '—'],
    ['Site web / réseaux sociaux', association.siteWebReseauxSociaux ?? '—'],
    ['N° RNA', association.numeroRna ?? '—'],
    ['SIREN', association.numeroSiren ?? '—'],
    ['Date de création', formatDate(association.dateCreation)],
    ['Agrément Jeunesse et Sports', association.agrementJeunesseSports ?? '—'],
    ['Fédération sportive d’affiliation', association.federationSportiveAffiliation ?? '—'],
    ['Disciplines pratiquées', association.disciplinesPratiquees ?? '—'],
    ['N° d’affiliation', association.numeroAffiliation ?? '—'],
    ['Catégorie sportive', association.categorieSportive ?? '—'],
  ];
  const inner = `<div class="grid2">${rows
    .map(
      ([label, value]) =>
        `<div class="grid2-row"><span class="grid2-label">${esc(label)}</span><span class="grid2-value">${esc(
          value
        )}</span></div>`
    )
    .join('')}</div>`;
  return section(1, 'Identification de l’association', inner);
}

function effectifsHtml(effectifs: EffectifsSection): string {
  const ageRows: EffRow[] = [
    { label: 'Petite enfance (0-5 ans)', n1: effectifs.petiteEnfance0_5N1, n: effectifs.petiteEnfance0_5, prev: effectifs.petiteEnfance0_5Prev },
    { label: 'Enfance (6-14 ans)', n1: effectifs.enfance6_14N1, n: effectifs.enfance6_14, prev: effectifs.enfance6_14Prev },
    { label: 'Adolescents (15-18 ans)', n1: effectifs.adolescents15_18N1, n: effectifs.adolescents15_18, prev: effectifs.adolescents15_18Prev },
    { label: 'Jeunes (19-29 ans)', n1: effectifs.jeunes19_29N1, n: effectifs.jeunes19_29, prev: effectifs.jeunes19_29Prev },
    { label: 'Adultes (30-59 ans)', n1: effectifs.adultes30_59N1, n: effectifs.adultes30_59, prev: effectifs.adultes30_59Prev },
    { label: 'Seniors (60-74 ans)', n1: effectifs.seniors60_74N1, n: effectifs.seniors60_74, prev: effectifs.seniors60_74Prev },
    { label: 'Grand âge (75 ans et plus)', n1: effectifs.grandAge75PlusN1, n: effectifs.grandAge75Plus, prev: effectifs.grandAge75PlusPrev },
  ];

  const inner: string[] = [
    effTable('Répartition géographique', [
      { label: 'Ivryens', n1: effectifs.ivryensN1, n: effectifs.ivryens, prev: effectifs.ivryensPrev },
      { label: 'Non-Ivryens', n1: effectifs.nonIvryensN1, n: effectifs.nonIvryens, prev: effectifs.nonIvryensPrev },
    ]),
    effTable('Répartition par genre', [
      { label: 'Femmes', n1: effectifs.femmesN1, n: effectifs.femmes, prev: effectifs.femmesPrev },
      { label: 'Hommes', n1: effectifs.hommesN1, n: effectifs.hommes, prev: effectifs.hommesPrev },
    ]),
    effTable('CSP (catégorie socioprofessionnelle)', [
      { label: 'Salariés', n1: effectifs.salariesN1, n: effectifs.salaries, prev: effectifs.salariesPrev },
      { label: 'Étudiants', n1: effectifs.etudiantsN1, n: effectifs.etudiants, prev: effectifs.etudiantsPrev },
      { label: 'Demandeurs d’emploi', n1: effectifs.demandeursEmploiN1, n: effectifs.demandeursEmploi, prev: effectifs.demandeursEmploiPrev },
      { label: 'Retraités', n1: effectifs.retraitesN1, n: effectifs.retraites, prev: effectifs.retraitesPrev },
      { label: 'Non communiqué', n1: effectifs.nonCommuniqueN1, n: effectifs.nonCommunique, prev: effectifs.nonCommuniquePrev },
    ]),
    effTable('Tranches d’âge', ageRows),
    effTable('Accessibilité', [
      { label: 'Personnes en situation de handicap', n1: effectifs.personnesSituationHandicapN1, n: effectifs.personnesSituationHandicap, prev: effectifs.personnesSituationHandicapPrev },
      { label: 'Bénéficiaires de tarifs réduits / sociaux', n1: effectifs.beneficiairesTarifsReduitsSociauxN1, n: effectifs.beneficiairesTarifsReduitsSociaux, prev: effectifs.beneficiairesTarifsReduitsSociauxPrev },
      { label: 'Bénéficiaires Pass’Sport', n1: effectifs.nombreBeneficiairesPassSportN1, n: effectifs.nombreBeneficiairesPassSport, prev: effectifs.nombreBeneficiairesPassSportPrev },
    ]),
  ];

  if (effectifs.actionsPublicsEloignes) {
    inner.push(
      `<p class="callout"><strong>Actions vers les publics éloignés :</strong> ${esc(effectifs.actionsPublicsEloignes)}</p>`
    );
  }

  // Données des graphiques de la page (répartition et évolution).
  const totalN1 = ageRows.reduce((a, r) => a + (r.n1 ?? 0), 0);
  const totalN = ageRows.reduce((a, r) => a + (r.n ?? 0), 0);
  const totalPrev = ageRows.reduce((a, r) => a + (r.prev ?? 0), 0);
  inner.push(
    `<h3 class="subtitle">Répartition (Saison N)</h3>` +
      table(
        [{ label: 'Indicateur' }, { label: 'Valeur', right: true }],
        [
          [`Femmes`, num(effectifs.femmes)],
          [`Hommes`, num(effectifs.hommes)],
          [`Ivryens`, num(effectifs.ivryens)],
          [`Non-Ivryens`, num(effectifs.nonIvryens)],
        ]
      ) +
      `<h3 class="subtitle">Évolution des adhérents N-1 → N → Prévisionnel</h3>` +
      table(
        [{ label: 'Période' }, { label: 'Total', right: true }],
        [
          [`Saison N-1`, num(totalN1)],
          [`Saison N`, num(totalN)],
          [`Prévisionnel`, num(totalPrev)],
        ]
      )
  );

  return section(2, 'Adhérents et licenciés', inner.join(''));
}

function benevolatHtml(vie: VieAssociativeSection): string {
  const rhRows: Array<[string, number | null, number | null]> = [
    ['Bénévoles actifs', vie.benevolesActifsN1, vie.benevolesActifs],
    ['Salariés permanents (ETP)', vie.salariesPermanentsEtpN1, vie.salariesPermanentsEtp],
    ['CDD / CDDU', vie.salariesCddCdduN1, vie.salariesCddCddu],
    ['Emplois aidés', vie.emploisAidesN1, vie.emploisAides],
    ['Agents mis à disposition', vie.agentsMisADispositionN1, vie.agentsMisADisposition],
    ['Vacataires / intervenants', vie.vacatairesIntervenantsN1, vie.vacatairesIntervenants],
  ];
  const rhTable = table(
    [
      { label: 'Ressources humaines' },
      { label: 'Saison N-1', right: true },
      { label: 'Saison N', right: true },
      { label: 'Valorisation (N)', right: true },
    ],
    rhRows.map(([label, n1, n]) => [
      esc(label),
      num(n1),
      num(n),
      label === 'Bénévoles actifs' ? eur(vie.montantValorisationBenevolat) : '—',
    ])
  );

  const inner =
    cards([
      { label: 'Bénévoles actifs', value: num(vie.benevolesActifs) },
      { label: 'Heures de bénévolat', value: num(vie.nombreHeuresBenevoles) },
      { label: 'Valorisation du bénévolat', value: eur(vie.montantValorisationBenevolat) },
    ]) +
    rhTable +
    `<div class="grid2">
      <div class="box"><span class="grid2-label">Dernière assemblée générale</span><span class="grid2-value">${text(
        formatDate(vie.dateDerniereAssembleeGenerale)
      )}</span></div>
      <div class="box"><span class="grid2-label">Règlement intérieur à jour</span><span class="grid2-value ${
        vie.reglementInterieurAJour ? 'pos' : 'neg'
      }">${vie.reglementInterieurAJour ? 'Oui' : 'Non'}</span></div>
    </div>` +
    (vie.actionsFormationsRealisees
      ? `<p class="callout"><strong>Actions de formation réalisées :</strong> ${esc(
          vie.actionsFormationsRealisees
        )}</p>`
      : '');

  return section(3, 'Vie associative et bénévolat', inner);
}

function niveauxHtml(niveaux: NiveauSportifRow[]): string {
  const rowsTable = table(
    [
      { label: 'Section' },
      { label: 'Niveau' },
      { label: 'Résultats' },
      { label: 'Déplacements', right: true },
      { label: 'Lieux' },
    ],
    niveaux.map((n) => [
      text(n.categorieSection),
      text(n.niveauSportif),
      text(n.principauxResultatsSportifs),
      num(n.nombreDeplacements),
      text(n.lieuxDeplacements),
    ]),
    undefined,
    'Aucun niveau renseigné'
  );

  const objectifs = niveaux.filter((n) => n.objectifsSportifsSaisonSuivante);
  const inner =
    rowsTable +
    (objectifs.length
      ? `<h3 class="subtitle">Objectifs sportifs saison suivante</h3>` +
        objectifs
          .map(
            (n) =>
              `<p class="bullet"><strong>${text(n.categorieSection)} :</strong> ${esc(
                n.objectifsSportifsSaisonSuivante
              )}</p>`
          )
          .join('')
      : '');

  return section(4, 'Niveaux sportifs atteints — Résultats', inner);
}

function projetsHtml(numero: number, titre: string, projets: ProjetRow[], prevu: boolean): string {
  if (!projets.length) {
    return section(numero, titre, `<p class="empty-text">Aucun projet renseigné.</p>`);
  }
  const blocks = projets
    .map((p) => {
      const details: string[] = [];
      if (p.objectifs) details.push(`<p class="bullet"><strong>Objectifs :</strong> ${esc(p.objectifs)}</p>`);
      if (p.moyensMisEnOeuvre)
        details.push(`<p class="bullet"><strong>Moyens mis en œuvre :</strong> ${esc(p.moyensMisEnOeuvre)}</p>`);
      if (p.publicsVises) details.push(`<p class="bullet"><strong>Publics visés :</strong> ${esc(p.publicsVises)}</p>`);
      return `<div class="project">
        <p class="project-head"><span class="tag ${prevu ? 'tag-warn' : 'tag-ok'}">${
          prevu ? 'Prévu 2026-2027' : 'Réalisé'
        }</span><strong>${text(p.intitule)}</strong></p>
        ${p.description ? `<p class="project-desc">${esc(p.description)}</p>` : ''}
        ${details.join('')}
      </div>`;
    })
    .join('');
  return section(numero, titre, blocks);
}

function tarifaireHtml(tarifs: TarifRow[]): string {
  const totalGeneral = tarifs.reduce((acc, t) => acc + (t.montantTotalEstime ?? 0), 0);
  const inner = table(
    [
      { label: 'Catégorie' },
      { label: 'Cotisation Ivryens', right: true },
      { label: 'Cotisation Non-Ivryens', right: true },
      { label: 'Nb adhérents', right: true },
      { label: 'Total', right: true },
    ],
    tarifs.map((t) => [
      text(t.categorieCotisation),
      eur(t.cotisationIvryens),
      eur(t.cotisationNonIvryens),
      num(t.nombreAdherents),
      `<span class="strong">${eur(t.montantTotalEstime)}</span>`,
    ]),
    ['<span class="strong">TOTAL GÉNÉRAL</span>', '', '', '', `<span class="strong">${eur(totalGeneral)}</span>`],
    'Aucune catégorie renseignée'
  );
  return section(7, 'Politique tarifaire', inner);
}

function financiereHtml(fin: SituationFinanciereSection, detail: TableauFinancierRow[], associationNom?: string | null): string {
  const inner: string[] = [];

  const titreDocument = detail.find((d) => d.type === 'titre-document');
  const sousTitre = detail.find((d) => d.type === 'sous-titre');
  const association = detail.find((d) => d.type === 'association');
  const periode = detail.find((d) => d.type === 'periode');
  const noteLegale = detail.find((d) => d.type === 'note-legale');
  const nomAssociation = association?.note ?? associationNom ?? null;

  if (titreDocument || sousTitre || association || periode) {
    inner.push(`<div class="doc-subhead">
      ${titreDocument ? `<h3>${text(titreDocument.libelle)}</h3>` : ''}
      ${sousTitre ? `<p class="muted-text">${text(sousTitre.libelle)}</p>` : ''}
      <p class="muted-text">
        ${association ? `${esc(association.libelle)} <strong>${text(nomAssociation)}</strong>` : ''}
        ${periode ? `&nbsp;·&nbsp; Période de référence : <strong>${text(periode.libelle ?? 'non renseignée')}</strong>` : ''}
      </p>
    </div>`);
  }

  inner.push(
    cards([
      { label: 'Charges', value: eur(fin.totalCharges) },
      { label: 'Produits', value: eur(fin.totalProduits) },
      { label: 'Résultat net', value: eur(fin.resultatNet) },
      { label: 'Trésorerie disponible', value: eur(fin.tresorerieDisponible) },
      { label: 'Fonds propres / réserves', value: eur(fin.fondsPropresReserves) },
    ])
  );

  const historique = [
    { annee: '2025', charges: fin.totalCharges2025, produits: fin.totalProduits2025, subvention: fin.subventionVille2025 },
    { annee: '2026', charges: fin.totalCharges, produits: fin.totalProduits, subvention: fin.subventionVille },
    { annee: '2027 (prévisionnel)', charges: fin.totalCharges2027, produits: fin.totalProduits2027, subvention: fin.subventionVille2027 },
  ];
  inner.push(
    `<h3 class="subtitle">Historique</h3>` +
      table(
        [
          { label: 'Exercice' },
          { label: 'Charges', right: true },
          { label: 'Produits', right: true },
          { label: 'Subvention Ville', right: true },
          { label: 'Résultat', right: true },
        ],
        historique.map((h) => {
          const resultat = (h.produits ?? 0) - (h.charges ?? 0);
          return [
            esc(h.annee),
            eur(h.charges),
            eur(h.produits),
            eur(h.subvention),
            `<span class="${resultat < 0 ? 'neg' : 'pos'} strong">${eur(resultat)}</span>`,
          ];
        })
      )
  );

  inner.push(
    `<p class="callout"><strong>Montant de la subvention demandée : ${eur(
      fin.montantSubventionSollicitee
    )}</strong>${
      fin.justificationMontantDemande ? `<br/>Justification : ${esc(fin.justificationMontantDemande)}` : ''
    }</p>`
  );

  const lignes = detail.filter((d) => d.categorie === 'charge' || d.categorie === 'produit');
  if (lignes.length) {
    inner.push(`<h3 class="subtitle">Détail du tableau financier — charges / produits</h3>`);
    inner.push(financialDetailTable(lignes));
  }

  const indicateurs = detail.filter((d) => d.categorie === 'indicateur');
  if (indicateurs.length) {
    inner.push(`<h3 class="subtitle">Indicateurs automatiques</h3>`);
    inner.push(
      table(
        [
          { label: 'Indicateur' },
          { label: 'Exercice 2025', right: true },
          { label: 'Exercice 2026', right: true },
          { label: 'Prévi. 2027', right: true },
        ],
        indicateurs.map((l) =>
          l.type === 'titre'
            ? [`<strong>${text(l.libelle)}</strong>`, '', '', '']
            : [text(l.libelle), esc(formatPctPlain(l.montant2025)), esc(formatPctPlain(l.montant2026)), esc(formatPctPlain(l.montant2027))]
        )
      )
    );
  }

  const contributions = detail.filter((d) => d.categorie === 'benevole');
  if (contributions.length) {
    inner.push(`<h3 class="subtitle">Contributions volontaires en nature</h3>`);
    inner.push(
      table(
        [
          { label: 'Élément' },
          { label: 'Exercice 2025', right: true },
          { label: 'Exercice 2026', right: true },
          { label: 'Prévi. 2027', right: true },
        ],
        contributions.map((l) =>
          l.type === 'titre'
            ? [`<strong>${text(l.libelle)}</strong>`, '', '', '']
            : [
                text(l.libelle),
                esc(formatBenevole(l, l.montant2025)),
                esc(formatBenevole(l, l.montant2026)),
                esc(formatBenevole(l, l.montant2027)),
              ]
        )
      )
    );
  }

  if (noteLegale) {
    inner.push(`<p class="legend">${text(noteLegale.libelle)}</p>`);
  }

  return section(8, 'Situation financière', inner.join(''));
}

// Reproduction du grand tableau financier, avec les mêmes styles de lignes
// (titres sur fond bleu, rubriques sur fond gris, totaux en gras).
function financialDetailTable(lignes: TableauFinancierRow[]): string {
  const head = `<tr>
    <th>N° Cpte</th>
    <th>Libellé</th>
    <th class="right">Exercice 2025</th>
    <th class="right">Exercice 2026</th>
    <th class="right">Prévi. 2027</th>
    <th class="right">Écart</th>
    <th class="right">Évol.</th>
    <th>Notes / Justifications</th>
  </tr>`;

  const body = lignes
    .map((l) => {
      if (l.type === 'titre') {
        return `<tr class="row-title"><td colspan="8">${text(l.libelle)}</td></tr>`;
      }
      if (l.type === 'rubrique') {
        return `<tr class="row-rubrique"><td colspan="8">${text(l.libelle)}</td></tr>`;
      }
      const cls = l.type === 'total' ? ' class="row-total"' : l.type === 'sous-total' ? ' class="row-subtotal"' : '';
      return `<tr${cls}>
        <td class="mono">${esc(l.numeroCompte ?? '')}</td>
        <td>${text(l.libelle)}</td>
        <td class="right">${eur(l.montant2025)}</td>
        <td class="right">${eur(l.montant2026)}</td>
        <td class="right">${eur(l.montant2027)}</td>
        <td class="right ${(l.ecart ?? 0) < 0 ? 'neg' : ''}">${eur(l.ecart)}</td>
        <td class="right ${evClass(evolPercent(l.evol))}">${esc(formatPercent(evolPercent(l.evol)))}</td>
        <td class="note">${esc(l.note ?? '')}</td>
      </tr>`;
    })
    .join('');

  return `<table class="fin-detail"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

function financementsHtml(financements: FinancementRow[]): string {
  const total = (k: 'montantAccorde2025' | 'montantAccorde2026' | 'montantSollicite2027') =>
    financements.reduce((acc, f) => acc + (f[k] ?? 0), 0);

  const inner = table(
    [
      { label: 'Financeur' },
      { label: '2025', right: true },
      { label: '2026', right: true },
      { label: '2027 (sollicité)', right: true },
      { label: 'Objet' },
    ],
    financements.map((f) => [
      text(f.financeur),
      eur(f.montantAccorde2025),
      eur(f.montantAccorde2026),
      eur(f.montantSollicite2027),
      text(f.objetFinancement),
    ]),
    [
      '<span class="strong">TOTAL</span>',
      `<span class="strong">${eur(total('montantAccorde2025'))}</span>`,
      `<span class="strong">${eur(total('montantAccorde2026'))}</span>`,
      `<span class="strong">${eur(total('montantSollicite2027'))}</span>`,
      '',
    ],
    'Aucun financement renseigné'
  );
  return section(9, 'Autres subventions et financements', inner);
}

function piecesHtml(pieces: PieceRow[]): string {
  const inner = table(
    [
      { label: 'Document' },
      { label: 'Fichier' },
      { label: 'Date de dépôt' },
      { label: 'Statut', right: true },
    ],
    pieces.map((p) => [
      text(p.typePiece),
      text(p.fichier),
      text(formatDate(p.dateDepot)),
      p.valide
        ? '<span class="pos strong">Présent</span>'
        : '<span class="neg strong">Absent</span>',
    ]),
    undefined,
    'Aucune pièce justificative'
  );
  return section(10, 'Pièces justificatives', inner);
}

function syntheseHtml(synthese: SyntheseSection | undefined): string {
  const introduction = synthese?.introduction || null;
  const compteRendu = synthese?.compteRendu || [];
  const appreciation = synthese?.appreciation || null;
  if (!introduction && !compteRendu.length && !appreciation) return '';

  const inner =
    (introduction ? `<p class="synthese-intro">${esc(introduction)}</p>` : '') +
    (compteRendu.length
      ? `<div class="synthese-block">${compteRendu.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`
      : '') +
    (appreciation ? `<p class="synthese-appreciation">${esc(appreciation)}</p>` : '');

  return section(11, 'Synthèse de l’association', inner);
}

function bodyHtml(dossier: Dossier, association: Association | null): string {
  const sections = dossier.sections;
  const parts: string[] = [headerHtml(dossier)];
  if (association) {
    parts.push(identificationHtml(association));
  }
  parts.push(effectifsHtml(sections.effectifs as EffectifsSection));
  parts.push(benevolatHtml(sections['vie-associative'] as VieAssociativeSection));
  parts.push(niveauxHtml((sections['niveaux-sportifs'] ?? []) as NiveauSportifRow[]));
  parts.push(projetsHtml(5, 'Projets réalisés', (sections['projets-realises'] ?? []) as ProjetRow[], false));
  parts.push(projetsHtml(6, 'Projets prévus', (sections['projets-prevus'] ?? []) as ProjetRow[], true));
  parts.push(tarifaireHtml((sections['politique-tarifaire'] ?? []) as TarifRow[]));
  parts.push(
    financiereHtml(
      sections['situation-financiere'] as SituationFinanciereSection,
      (sections['tableau-financier'] ?? []) as TableauFinancierRow[],
      dossier.nomAssociation
    )
  );
  parts.push(financementsHtml((sections['autres-subventions'] ?? []) as FinancementRow[]));
  parts.push(piecesHtml((sections.pieces ?? []) as PieceRow[]));
  parts.push(syntheseHtml(sections.synthese as SyntheseSection | undefined));
  return parts.join('');
}

function buildHtml(dossier: Dossier, association: Association | null): string {
  const dated = new Date().toLocaleString('fr-FR');
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Dossier ${esc(dossier.reference)}</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; font-size: 9.5px; color: #1e293b; margin: 0; }
  h1 { font-size: 16px; margin: 0; }
  /* En-tête du dossier */
  .doc-header { border: 1px solid #173F73; border-radius: 6px; padding: 14px 16px; margin-bottom: 14px; background: #173F73; color: #fff; }
  .doc-ref { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #bfdbfe; margin: 0 0 2px; }
  .doc-sub { font-size: 9.5px; color: #dbeafe; margin: 3px 0 0; }
  .doc-meta { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-top: 10px; }
  .doc-asso { font-size: 14px; font-weight: 600; }
  .doc-right { text-align: right; }
  .doc-amount { margin-top: 6px; }
  .doc-amount span { display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: #bfdbfe; }
  .doc-amount strong { font-size: 18px; }
  .badge { display: inline-block; border-radius: 999px; padding: 2px 10px; font-size: 9px; font-weight: 600; background: rgba(255,255,255,0.16); }
  /* Rubriques */
  .section { margin-bottom: 14px; page-break-inside: auto; }
  .section-title { display: flex; align-items: center; gap: 8px; background: #173F73; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 10px; margin: 0; border-radius: 4px 4px 0 0; page-break-after: avoid; }
  .section-num { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 3px; background: rgba(255,255,255,0.16); font-size: 10px; font-weight: 700; }
  .section-body { border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 4px 4px; padding: 10px 12px; }
  h3.subtitle { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #173F73; margin: 12px 0 5px; }
  h3.subtitle:first-child { margin-top: 0; }
  /* Tableaux */
  table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
  th, td { border: 0.5pt solid #cbd5e1; padding: 3px 5px; vertical-align: top; text-align: left; word-wrap: break-word; overflow-wrap: anywhere; }
  thead th { background: #eef2f7; color: #173F73; font-weight: 600; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.3px; }
  td.right, th.right { text-align: right; font-variant-numeric: tabular-nums; }
  tr.total td, tfoot td { background: #dbe4f0; font-weight: 700; color: #173F73; }
  .strong { font-weight: 600; }
  td.strong { color: #0f172a; }
  .mono { font-family: Consolas, monospace; font-size: 8px; color: #94a3b8; }
  .note { font-size: 8px; color: #64748b; }
  .empty { text-align: center; color: #94a3b8; padding: 12px; }
  .empty-text { color: #94a3b8; }
  .row-title td { background: #173F73; color: #fff; font-weight: 600; text-transform: uppercase; font-size: 9px; }
  .row-rubrique td { background: #f1f5f9; color: #334155; font-weight: 600; }
  .row-total td { background: #dbe4f0; font-weight: 700; color: #0f172a; }
  .row-subtotal td { background: #f8fafc; font-weight: 600; }
  /* Divers */
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
  .grid2-row { display: grid; grid-template-columns: 42% 58%; gap: 6px; border-bottom: 0.5pt solid #f1f5f9; padding: 3px 0; }
  .grid2-label { color: #64748b; font-weight: 600; }
  .grid2-value { color: #1e293b; }
  .box { border: 0.5pt solid #e2e8f0; border-radius: 4px; padding: 6px 8px; margin-top: 8px; }
  .box .grid2-label, .box .grid2-value { display: block; }
  .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 10px; }
  .card { border: 0.5pt solid #e2e8f0; border-radius: 4px; padding: 6px 8px; background: #f8fafc; }
  .card-label { display: block; font-size: 8px; color: #64748b; }
  .card-value { display: block; font-size: 11px; font-weight: 600; color: #1e293b; margin-top: 2px; }
  .callout { border: 0.5pt solid #bfdbfe; background: #eff6ff; border-radius: 4px; padding: 6px 8px; margin: 8px 0 0; }
  .bullet { margin: 3px 0; }
  .project { border: 0.5pt solid #e2e8f0; border-radius: 4px; padding: 7px 9px; margin-bottom: 6px; page-break-inside: avoid; }
  .project-head { display: flex; align-items: center; gap: 6px; margin: 0 0 3px; font-size: 11px; }
  .project-desc { margin: 3px 0; color: #475569; }
  .tag { display: inline-block; border-radius: 999px; padding: 1px 8px; font-size: 8px; font-weight: 600; }
  .tag-ok { background: #ecfdf5; color: #047857; }
  .tag-warn { background: #fffbeb; color: #b45309; }
  .pos { color: #059669; }
  .neg { color: #dc2626; }
  .muted { color: #94a3b8; }
  .muted-text { color: #64748b; margin: 2px 0; font-size: 9px; }
  .doc-subhead { border-bottom: 0.5pt solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
  .doc-subhead h3 { margin: 0 0 3px; font-size: 11px; color: #173F73; text-transform: uppercase; letter-spacing: 0.4px; }
  .legend { margin-top: 8px; border-top: 0.5pt solid #e2e8f0; padding-top: 5px; font-size: 8px; font-style: italic; color: #64748b; }
  .synthese-intro { font-style: italic; color: #475569; margin: 0 0 8px; }
  .synthese-block { border: 0.5pt solid #e2e8f0; background: #f8fafc; border-radius: 4px; padding: 8px 10px; margin-bottom: 8px; }
  .synthese-block p { margin: 0 0 6px; }
  .synthese-appreciation { border-left: 3px solid #173F73; background: #f1f5f9; padding: 8px 10px; font-weight: 500; }
  .fin-detail th, .fin-detail td { font-size: 8.5px; padding: 2px 4px; }
</style>
</head>
<body>
  ${bodyHtml(dossier, association)}
  <p class="legend">Document généré automatiquement le ${esc(dated)} — Outil de gestion des subventions, Ville d'Ivry-sur-Seine.</p>
</body>
</html>`;
}

// Ouvre une fenêtre d'impression (Enregistrer en PDF). Repose sur le même
// mécanisme que l'export de la « Synthèse Globale ».
export function exportDossierPdf(dossier: Dossier, association?: Association | null) {
  const html = buildHtml(dossier, association ?? null);
  const title = `Dossier ${dossier.reference}`;
  const printWindow = window.open('', '_blank', 'width=1000,height=900');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.document.title = title;
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
    return;
  }

  // Bloqueur de popups : repli sur un iframe masqué de la page courante.
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 300);
  }
}
