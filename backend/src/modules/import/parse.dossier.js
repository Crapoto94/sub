const { readWorkbook, sheetRows, cell, str, num, bool, findRowByLabel } = require('./excel.utils');

// Fichier 1 : « Dossier de demande de subvention de fonctionnement ».
// Une seule feuille « Dossier Demande Subvention ».
// Modèle stabilisé : les cellules saisissables sont en jaune (FFFACD) ; les
// libellés en bleu. Colonnes de valeurs déterminées par la disposition :
//   - champ pleine largeur : valeur en colonne G (index 6)
//   - ligne à 2 champs : champ gauche en D (3), champ droit en J (9)
//   - tableaux : colonnes N (C/E/H), N-1 (D), etc.
const SHEET = 'Dossier Demande Subvention';

const C = { B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10 };

// Repère une ligne par libellé exact de la colonne A (normalisé).
function rowIndex(rows, labels) {
  for (const label of labels) {
    const idx = findRowByLabel(rows, label);
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseIdentification(rows) {
  const out = {};
  // Champs pleine largeur : valeur en colonne G (index 6) — libellé en colonne A.
  const full = [
    ['nomOfficielAssociation', ['Nom officiel de l\'association']],
    ['sigleAbreviation', ['Sigle / abréviation usuelle', 'Sigle / abréviation']],
    ['adresseSiegeSocial', ['Adresse du siège social']],
    ['siteWebReseauxSociaux', ['Site web / Réseaux sociaux', 'Site web / réseaux sociaux']],
    ['federationSportiveAffiliation', ['Fédération sportive d\'affiliation']],
    ['categorieSportive', ['Catégorie']],
  ];
  for (const [key, labels] of full) {
    const r = rowIndex(rows, labels);
    if (r >= 0) out[key] = str(cell(rows, r, C.G)) || str(cell(rows, r, C.D)) || null;
  }
  // Champs sur 2 colonnes : repérés par le libellé gauche (colonne A) ;
  // valeur gauche en D (3), valeur droite en J (9).
  const pairs = [
    ['codePostal', 'ville', ['Code postal']],
    ['email', 'telephone', ['E-mail', 'Email']],
    ['numeroRna', 'numeroSiren', ['N° RNA', 'N° RNA (Répertoire National des Associations)']],
    ['dateCreation', 'agrementJeunesseSports', ['Date de création']],
    ['disciplinesPratiquees', 'numeroAffiliation', ['Discipline(s) pratiquée(s)', 'Disciplines pratiquées']],
  ];
  for (const [leftKey, rightKey, labels] of pairs) {
    const r = rowIndex(rows, labels);
    if (r < 0) continue;
    out[leftKey] = str(cell(rows, r, C.D)) || null;
    out[rightKey] = str(cell(rows, r, C.J)) || null;
  }
  return out;
}

function parseEffectifs(rows) {
  const cols = { n1: C.C, n: C.E, prev: C.H };
  const defs = [
    ['ivryens', 'Ivryens'],
    ['nonIvryens', 'Non-Ivryens'],
    ['femmes', 'Femmes'],
    ['hommes', 'Hommes'],
    ['salaries', 'Salariés'],
    ['etudiants', 'Étudiants'],
    ['demandeursEmploi', 'Demandeurs d\'emploi'],
    ['retraites', 'Retraités'],
    ['nonCommunique', 'Non communiqué'],
    ['petiteEnfance0_5', 'Petite enfance  0 – 5 ans'],
    ['enfance6_14', 'Enfant  6 – 14 ans'],
    ['adolescents15_18', 'Adolescents  15 – 18 ans'],
    ['jeunes19_29', 'Jeunes  19 – 29 ans'],
    ['adultes30_59', 'Adultes  30 – 59 ans'],
    ['seniors60_74', 'Seniors  60 – 74 ans'],
    ['grandAge75Plus', 'Grand âge  75 ans et +'],
    ['personnesSituationHandicap', 'En situation de handicap'],
    ['beneficiairesTarifsReduitsSociaux', 'Bénéficiaires tarifs réduits / sociaux'],
  ];

  const out = {};
  for (const [key, label] of defs) {
    const r = rowIndex(rows, [label]);
    if (r < 0) continue;
    out[key + 'N1'] = num(cell(rows, r, cols.n1));
    out[key] = num(cell(rows, r, cols.n));
    out[key + 'Prev'] = num(cell(rows, r, cols.prev));
  }

  // Publics éloignés : zone de saisie (ligne jaune) sous le libellé.
  const actLabel = rowIndex(rows, ['Quelles ont été vos actions en direction des publics éloignés']);
  if (actLabel >= 0) out.actionsPublicsEloignes = str(cell(rows, actLabel + 1, C.B));
  else out.actionsPublicsEloignes = null;

  // Pass'Sport : nombre de bénéficiaires (colonne D de la ligne « Bénéficiaires du Pass'Sport »).
  const passR = rowIndex(rows, ['Bénéficiaires du Pass\'Sport']);
  out.nombreBeneficiairesPassSport = passR >= 0 ? num(cell(rows, passR, C.D)) : null;
  out.nombreBeneficiairesPassSportPrev = out.nombreBeneficiairesPassSport;

  return out;
}

function parseVieAssociative(rows) {
  const out = {};

  const agR = rowIndex(rows, ['Date de la dernière Assemblée Générale']);
  out.dateDerniereAssembleeGenerale = agR >= 0 ? str(cell(rows, agR, C.D)) : null;
  // « Règlement intérieur à jour » est sur la même ligne (colonne G), valeur en J.
  out.reglementInterieurAJour = agR >= 0 ? bool(cell(rows, agR, C.J)) : null;

  const rh = [
    ['benevolesActifs', 'Bénévoles actifs'],
    ['salariesPermanentsEtp', 'Salariés permanents (ETP)'],
    ['salariesCddCddu', 'Salariés CDD / CDDU'],
    ['emploisAides', 'Emplois aidés (CUI-CAE…)'],
    ['agentsMisADisposition', 'Agents mis à disposition'],
    ['vacatairesIntervenants', 'Vacataires / intervenants'],
  ];
  for (const [key, label] of rh) {
    const r = rowIndex(rows, [label]);
    if (r < 0) continue;
    out[key] = num(cell(rows, r, C.G));        // Saison N
    out[key + 'N1'] = num(cell(rows, r, C.D)); // Saison N-1
  }

  const valR = rowIndex(rows, ['Valorisation du bénévolat']);
  if (valR >= 0) {
    out.nombreHeuresBenevoles = num(cell(rows, valR, C.F)) || num(cell(rows, valR, C.G)) || null;
    out.montantValorisationBenevolat = num(cell(rows, valR, C.J));
  }

  const actF = rowIndex(rows, ['Quelles actions ou formations avez-vous mis en place']);
  out.actionsFormationsRealisees = actF >= 0 ? str(cell(rows, actF + 1, C.B)) : null;

  return out;
}

function parseNiveauxSportifs(rows) {
  const headerR = rowIndex(rows, ['Catégorie / Section']);
  const results = [];
  if (headerR < 0) return results;

  const levelCols = [
    [C.D, 'Local'],
    [C.E, 'Départemental'],
    [C.G, 'Régional'],
    [C.I, 'National'],
    [C.K, 'International'],
  ];
  for (let r = headerR + 1; r < headerR + 6 && r < rows.length; r++) {
    const cat = str(cell(rows, r, 0)) || str(cell(rows, r, C.B)) || null;
    const levels = levelCols
      .filter(([c]) => cell(rows, r, c) !== null)
      .map(([, lvl]) => lvl);
    if (!cat && !levels.length) continue;
    results.push({
      categorieSection: cat,
      niveauSportif: levels[0] || null,
      principauxResultatsSportifs: null,
      nombreDeplacements: null,
      lieuxDeplacements: null,
      objectifsSportifsSaisonSuivante: null,
    });
  }

  const resR = rowIndex(rows, ['Principaux résultats sportifs']);
  if (resR >= 0 && results.length) results[0].principauxResultatsSportifs = str(cell(rows, resR + 1, C.B));
  const depR = rowIndex(rows, ['Déplacements réalisés']);
  if (depR >= 0 && results.length) {
    const dep = str(cell(rows, depR + 1, C.B)) || str(cell(rows, depR, C.B)) || '';
    const m = dep.match(/(\d+)\s*déplacements?/i);
    results[0].nombreDeplacements = m ? num(m[1]) : null;
    results[0].lieuxDeplacements = dep || null;
  }
  const objR = rowIndex(rows, ['Objectifs sportifs pour la saison']);
  if (objR >= 0 && results.length) results[0].objectifsSportifsSaisonSuivante = str(cell(rows, objR + 1, C.B));

  return results;
}

function parseProjets(rows, section) {
  const intro = section === 'realises'
    ? ['Décrire les projets sportifs mis en œuvre durant l\'année']
    : ['Décrire les projets sportifs prévus pour l\'année'];
  const r = rowIndex(rows, intro);
  if (r < 0) return [];
  // La zone de saisie (ligne jaune) se trouve sous l'introduction.
  let text = null;
  for (let i = r + 1; i < Math.min(r + 3, rows.length); i++) {
    const v = str(cell(rows, i, C.B)) || str(cell(rows, i, C.C));
    if (v && !v.startsWith('Ex.')) { text = v; break; }
  }
  return [{
    intitule: section === 'realises' ? 'Projets réalisés 2025/2026' : 'Projets prévus 2026/2027',
    description: text,
    objectifs: text,
    moyensMisEnOeuvre: null,
    publicsVises: null,
  }];
}

function parseTarifs(rows) {
  const headerR = rowIndex(rows, ['Catégorie de cotisation']);
  const out = [];
  if (headerR < 0) return out;
  for (let r = headerR + 1; r < headerR + 11 && r < rows.length; r++) {
    const cat = str(cell(rows, r, 0)) || str(cell(rows, r, C.B));
    if (!cat || cat.toUpperCase().startsWith('TOTAUX')) continue;
    out.push({
      categorieCotisation: cat,
      cotisationIvryens: num(cell(rows, r, C.D)),
      cotisationNonIvryens: num(cell(rows, r, C.F)),
      nombreAdherents: num(cell(rows, r, C.H)),
      montantTotalEstime: num(cell(rows, r, C.J)),
    });
  }
  return out;
}

function parseSituationFinanciere(rows) {
  const out = {};
  const defs = [
    ['totalCharges', 'Total des charges'],
    ['totalProduits', 'Total des produits'],
    ['resultatNet', 'Résultat net'],
    ['tresorerieDisponible', 'Trésorerie disponible'],
    ['fondsPropresReserves', 'Fonds propres / Réserves'],
  ];
  // Pour chaque ligne : col D = 2025, col G = 2026, col J = 2027.
  for (const [key, label] of defs) {
    const r = rowIndex(rows, [label]);
    if (r < 0) continue;
    out[key + '2025'] = num(cell(rows, r, C.D));
    out[key] = num(cell(rows, r, C.G));
    out[key + '2027'] = num(cell(rows, r, C.J));
  }
  // Subvention Ville : 2025 (D), 2026 (G), 2027 (J) depuis la ligne « Subvention Ville accordée ».
  const subR = rowIndex(rows, ['Subvention Ville accordée 2025', 'Subvention Ville accordée']);
  if (subR >= 0) {
    out.subventionVille2025 = num(cell(rows, subR, C.D));
    out.subventionVille = num(cell(rows, subR, C.G));
    out.subventionVille2027 = num(cell(rows, subR, C.J));
  }

  const montR = rowIndex(rows, ['MONTANT DE LA SUBVENTION SOLLICITÉE POUR 2027']);
  out.montantSubventionSollicitee = montR >= 0 ? num(cell(rows, montR, C.G)) : null;

  const justR = rowIndex(rows, ['Justification du montant demandé']);
  if (justR >= 0) {
    out.justificationMontantDemande = str(cell(rows, justR + 1, C.B)) || str(cell(rows, justR, C.B)) || null;
  }

  return out;
}

function parseAutresSubventions(rows) {
  const headerR = rowIndex(rows, ['Financeur']);
  const out = [];
  if (headerR < 0) return out;
  for (let r = headerR + 1; r < headerR + 12 && r < rows.length; r++) {
    const fin = str(cell(rows, r, 0)) || str(cell(rows, r, C.B));
    if (!fin || fin.toUpperCase().startsWith('TOTAL')) continue;
    out.push({
      financeur: fin,
      montantAccorde2025: num(cell(rows, r, C.D)),
      montantAccorde2026: num(cell(rows, r, C.F)),
      montantSollicite2027: num(cell(rows, r, C.H)),
      objetFinancement: str(cell(rows, r, C.J)),
    });
  }
  return out;
}

function parsePieces(rows) {
  const start = rowIndex(rows, ['PIÈCES À JOINDRE OBLIGATOIREMENT']);
  const out = [];
  if (start < 0) return out;
  for (let r = start + 2; r < start + 14 && r < rows.length; r++) {
    const typePiece = str(cell(rows, r, C.B));
    if (!typePiece) continue;
    out.push({
      typePiece,
      fichier: null,
      dateDepot: null,
      valide: null,
    });
  }
  return out;
}

function parseDossierFile(buffer) {
  const wb = readWorkbook(buffer);
  const rows = sheetRows(wb, SHEET, 0);
  return {
    identification: parseIdentification(rows),
    effectifs: parseEffectifs(rows),
    vieAssociative: parseVieAssociative(rows),
    niveauxSportifs: parseNiveauxSportifs(rows),
    projetsRealises: parseProjets(rows, 'realises'),
    projetsPrevus: parseProjets(rows, 'prevus'),
    politiqueTarifaire: parseTarifs(rows),
    situationFinanciere: parseSituationFinanciere(rows),
    autresSubventions: parseAutresSubventions(rows),
    pieces: parsePieces(rows),
  };
}

module.exports = { parseDossierFile };