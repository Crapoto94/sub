// Génération automatique de la rubrique 11 « Synthèse de l'association ».
// Compte-rendu clair, synthétique et professionnel rédigé à partir des
// rubriques précédentes (sections 1 à 10). Aucune donnée n'est inventée :
// chaque phrase n'est émise que si la donnée correspondante est renseignée.

function present(v) {
  return v !== null && v !== undefined && v !== '';
}

function fmtInt(n) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
}

function fmtEur(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toLocaleDateString('fr-FR');
  const s = String(v || '').trim();
  if (!s) return null;
  const iso = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const d = new Date(`${iso}T00:00:00`);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('fr-FR');
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString('fr-FR');
}

function frList(items) {
  const list = items.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return String(list[0]);
  if (list.length === 2) return `${list[0]} et ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} et ${list[list.length - 1]}`;
}

// Phrase d'introduction : présentation de l'association et de son dossier.
function introduction(association, dossier) {
  const nom = (association && association.nom_officiel_association) || 'l\'association';
  const sigle = association && association.sigle_abreviation;
  const ville = association && association.ville;
  const federation = association && association.federation_sportive_affiliation;
  const cadre = [
    ville && `basée à ${ville}`,
    federation && (/^fédération/i.test(String(federation))
      ? `affiliée à la ${federation}`
      : `affiliée à ${federation}`),
  ].filter(Boolean);
  const qui = `l'association ${nom}${sigle ? ` (${sigle})` : ''}${cadre.length ? `, ${cadre.join(' et ')}` : ''}`;
  const ref = dossier.reference ? ` (${dossier.reference})` : '';
  return `Le présent compte-rendu synthétise le dossier de demande de subvention de fonctionnement déposé par ${qui}, pour l'exercice ${dossier.annee}${ref}.`;
}

// Rubrique 2 : adhérents et licenciés, publics prioritaires.
function paragraphEffectifs(e) {
  if (!e) return null;
  const hasCounts = present(e.ivryens) || present(e.nonIvryens);
  const total = hasCounts
    ? (e.ivryens || 0) + (e.nonIvryens || 0)
    : present(e.femmes)
      ? (e.femmes || 0) + (e.hommes || 0)
      : null;
  const clauses = [];
  if (total !== null) {
    const genre = present(e.femmes) || present(e.hommes)
      ? `${fmtInt(e.femmes || 0)} femmes et ${fmtInt(e.hommes || 0)} hommes, dont `
      : '';
    const ivryens = present(e.ivryens)
      ? `${fmtInt(e.ivryens)} résidant à Ivry-sur-Seine`
      : `${fmtInt(total)} licenciés`;
    clauses.push(`l'association comptait ${fmtInt(total)} licenciés sur l'exercice 2026 (${genre}${ivryens})`);
  }
  const prevTotal = present(e.ivryensN1) || present(e.nonIvryensN1)
    ? (e.ivryensN1 || 0) + (e.nonIvryensN1 || 0)
    : null;
  if (total !== null && prevTotal !== null && prevTotal > 0) {
    const evo = ((total - prevTotal) / prevTotal) * 100;
    const sens = evo >= 0.5 ? 'en hausse' : evo <= -0.5 ? 'en baisse' : 'stable';
    clauses.push(`des effectifs ${sens} par rapport à l'exercice 2025 (${fmtInt(prevTotal)} licenciés)`);
  }
  const publics = [];
  const jeunes = (e.petiteEnfance0_5 || 0) + (e.enfance6_14 || 0) + (e.adolescents15_18 || 0) + (e.jeunes19_29 || 0);
  if (jeunes > 0) publics.push(`${fmtInt(jeunes)} jeunes de moins de 30 ans`);
  if ((e.personnesSituationHandicap || 0) > 0) publics.push(`${fmtInt(e.personnesSituationHandicap)} personnes en situation de handicap`);
  if ((e.beneficiairesTarifsReduitsSociaux || 0) > 0) publics.push(`${fmtInt(e.beneficiairesTarifsReduitsSociaux)} adhérents à tarif réduit ou solidaire`);
  if ((e.nombreBeneficiairesPassSport || 0) > 0) publics.push(`${fmtInt(e.nombreBeneficiairesPassSport)} bénéficiaires du Pass'Sport`);
  if (publics.length) clauses.push(`une attention particulière est portée aux publics prioritaires (${frList(publics)})`);
  return clauses.length ? `Sur le plan des effectifs, ${clauses.join(' ; ')}.` : null;
}

// Rubrique 3 : vie associative et bénévolat.
function paragraphVieAssociative(v) {
  if (!v) return null;
  const clauses = [];
  const benevoles = present(v.benevolesActifs) ? `${fmtInt(v.benevolesActifs)} bénévoles actifs` : null;
  const salaries = present(v.salariesPermanentsEtp)
    ? `${String(v.salariesPermanentsEtp).replace('.', ',')} ETP de salariés permanents`
    : null;
  const equipe = frList([benevoles, salaries]);
  if (equipe) clauses.push(`celle-ci s'appuie sur ${equipe}`);
  const dateAg = fmtDate(v.dateDerniereAssembleeGenerale);
  if (dateAg) clauses.push(`la dernière assemblée générale s'est tenue le ${dateAg}`);
  if (v.reglementInterieurAJour) clauses.push('le règlement intérieur est à jour');
  return clauses.length ? `S'agissant de la vie associative, ${clauses.join(' ; ')}.` : null;
}

// Rubrique 4 : niveaux sportifs atteints.
function paragraphNiveaux(rows) {
  if (!rows || !rows.length) return null;
  const niveaux = [...new Set(rows.map((r) => r.niveauSportif).filter(present))].map((n) => n.toLowerCase());
  const sections = rows.map((r) => r.categorieSection).filter(present).slice(0, 4);
  const resultats = rows.map((r) => r.principauxResultatsSportifs).filter(present).slice(0, 2);
  const clauses = [];
  if (niveaux.length) clauses.push(`les sections évoluent aux niveaux ${frList(niveaux)}${sections.length ? ` (${frList(sections)})` : ''}`);
  if (resultats.length) {
    const r = resultats.map((x) => x.trim().replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase()));
    clauses.push(`les principales réalisations sont : ${frList(r)}`);
  }
  return clauses.length ? `Au plan sportif, ${clauses.join(' ; ')}.` : null;
}

// Rubriques 5 et 6 : projets réalisés et prévus.
function paragraphProjets(realises, prevus) {
  const clauses = [];
  const anciens = (realises || []).map((p) => p.intitule).filter(present);
  const nouveaux = (prevus || []).map((p) => p.intitule).filter(present);
  if (anciens.length) clauses.push(`la saison écoulée a été marquée par ${frList(anciens)}`);
  if (nouveaux.length) clauses.push(`pour la saison à venir, l'association prévoit notamment ${frList(nouveaux)}`);
  return clauses.length ? `S'agissant des projets, ${clauses.join(' ; ')}.` : null;
}

// Rubrique 7 : politique tarifaire.
function paragraphTarifaire(rows) {
  if (!rows || !rows.length) return null;
  const montants = rows
    .map((r) => [r.cotisationIvryens, r.cotisationNonIvryens])
    .flat()
    .filter(present);
  const clauses = [`la grille tarifaire compte ${rows.length} catégories de cotisation`];
  if (montants.length) clauses.push(`les cotisations s'échelonnent de ${fmtEur(Math.min(...montants))} à ${fmtEur(Math.max(...montants))} selon la catégorie`);
  const recette = rows.reduce((s, r) => s + (r.montantTotalEstime || 0), 0);
  if (rows.some((r) => present(r.montantTotalEstime)) && recette > 0) clauses.push(`le volume annuel des cotisations est estimé à ${fmtEur(recette)}`);
  return `La politique tarifaire est cohérente : ${frList(clauses)}.`;
}

// Rubrique 8 : situation financière (comptes + prévisionnel).
function paragraphFinanciere(f) {
  if (!f) return null;
  const hasComptes = present(f.totalProduits) || present(f.totalCharges) || present(f.resultatNet);
  if (!hasComptes && !present(f.totalCharges2027) && !present(f.totalProduits2027)) return null;
  const clauses = [];
  if (hasComptes) {
    const charges = present(f.totalCharges) ? fmtEur(f.totalCharges) : 'non renseignées';
    const produits = present(f.totalProduits) ? fmtEur(f.totalProduits) : 'non renseignés';
    if (present(f.totalCharges) && present(f.totalProduits)) {
      clauses.push(`les charges de l'exercice 2026 se sont établies à ${charges} et les produits à ${produits}`);
    } else if (present(f.totalCharges)) {
      clauses.push(`les charges de l'exercice 2026 se sont établies à ${charges}, les produits n'étant pas renseignés`);
    } else if (present(f.totalProduits)) {
      clauses.push(`les produits de l'exercice 2026 se sont établis à ${produits}, les charges n'étant pas renseignées`);
    }
    if (present(f.resultatNet)) {
      clauses.push(f.resultatNet >= 0
        ? `un excédent de ${fmtEur(f.resultatNet)} est dégagé`
        : `un déficit de ${fmtEur(Math.abs(f.resultatNet))} est constaté`);
    } else if (present(f.totalCharges) && present(f.totalProduits)) {
      clauses.push(f.totalProduits >= f.totalCharges
        ? 'l\'exercice s\'équilibre'
        : 'les charges excèdent les produits');
    }
  }
  if (present(f.totalCharges2027) && present(f.totalProduits2027)) {
    clauses.push(`pour 2027, le prévisionnel table sur ${fmtEur(f.totalCharges2027)} de charges et ${fmtEur(f.totalProduits2027)} de produits`);
  }
  if (present(f.subventionVille)) clauses.push(`la subvention municipale perçue en 2026 s'élevait à ${fmtEur(f.subventionVille)}`);
  if (present(f.montantSubventionSollicitee)) clauses.push(`le concours sollicité auprès de la Ville s'élève à ${fmtEur(f.montantSubventionSollicitee)} pour 2027`);
  return `Sur le plan financier, ${clauses.join(' ; ')}.`;
}

// Rubrique 9 : autres subventions et financements.
function paragraphFinancements(rows) {
  if (!rows || !rows.length) return null;
  const items = rows
    .map((r) => r.financeur
      ? `${r.financeur}${present(r.montantAccorde2026) ? ` (${fmtEur(r.montantAccorde2026)} en 2026)` : ''}`
      : null)
    .filter(present);
  if (!items.length) return null;
  return `En complément, l'association mobilise d'autres financements : ${frList(items)}.`;
}

// Rubrique 10 : pièces justificatives.
function paragraphPieces(pieces) {
  if (!pieces || !pieces.length) return null;
  const total = pieces.length;
  const fournies = pieces.filter((p) => p.valide).length;
  const manquantes = total - fournies;
  if (manquantes === 0) return `Les ${fmtInt(total)} pièces justificatives attendues sont toutes fournies.`;
  return `Sur les ${fmtInt(total)} pièces justificatives attendues, ${fmtInt(fournies)} sont fournies et ${fmtInt(manquantes)} ${manquantes > 1 ? 'restent' : 'reste'} à produire.`;
}

// Phrase d'appréciation de l'ensemble du dossier : qualités constatées,
// complétude et cohérence financière / dynamique des effectifs.
function appreciation(association, sections) {
  const nom = (association && association.nom_officiel_association) || 'l\'association';
  const pieces = sections.pieces;
  const fin = sections['situation-financiere'];
  const effectifs = sections.effectifs;
  const clauses = [];

  const totalPieces = pieces && pieces.length ? pieces.length : 0;
  const fournies = pieces ? pieces.filter((p) => p.valide).length || 0 : 0;
  const manquantes = totalPieces - fournies;

  let qualite = 'complet et exploitable';
  if (fournies === 0 && totalPieces > 0) qualite = 'partiellement renseigné, aucune pièce justificative n\'étant fournie';
  else if (manquantes > 0) qualite = 'globalement complet, quelques pièces restant toutefois à fournir';
  if (totalPieces === 0) qualite = 'renseigné, sans liste de pièces justificatives annexée';

  if (fin) {
    const sollicite = fin.montantSubventionSollicitee;
    const produits = fin.totalProduits;
    if (present(sollicite) && present(produits) && produits > 0) {
      clauses.push(sollicite / produits > 0.5
        ? 'le montant sollicité est toutefois soutenu au regard des produits de l\'association'
        : 'le montant sollicité apparaît proportionné aux produits de l\'association');
    }
    if (present(fin.resultatNet)) {
      clauses.push(fin.resultatNet >= 0
        ? 'la situation financière présentée est saine et équilibrée'
        : 'la situation financière fait toutefois apparaître un déficit qu\'il conviendra de suivre');
    } else if (present(fin.totalCharges) && present(fin.totalProduits) && fin.totalProduits !== 0) {
      clauses.push(fin.totalProduits >= fin.totalCharges
        ? 'la situation financière présentée est équilibrée'
        : 'les charges excèdent toutefois les produits de l\'exercice');
    }
  }

  if (effectifs && present(effectifs.ivryens) && present(effectifs.ivryensPrev) && effectifs.ivryensPrev > 0 && effectifs.ivryens > effectifs.ivryensPrev) {
    clauses.push('la dynamique des effectifs est positive');
  }

  const extra = clauses.length ? ` ; ${frList(clauses)}` : '';
  return `Dans l'ensemble, le dossier déposé par l'association ${nom} est ${qualite}${extra}.`;
}

function buildSynthese({ association, dossier, sections }) {
  return {
    introduction: introduction(association, dossier),
    compteRendu: [
      paragraphEffectifs(sections.effectifs),
      paragraphVieAssociative(sections['vie-associative']),
      paragraphNiveaux(sections['niveaux-sportifs']),
      paragraphProjets(sections['projets-realises'], sections['projets-prevus']),
      paragraphTarifaire(sections['politique-tarifaire']),
      paragraphFinanciere(sections['situation-financiere']),
      paragraphFinancements(sections['autres-subventions']),
      paragraphPieces(sections.pieces),
    ].filter(Boolean),
    appreciation: appreciation(association, sections),
  };
}

module.exports = { buildSynthese };