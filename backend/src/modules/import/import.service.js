const { parseDossierFile } = require('./parse.dossier');
const { parseTableauFinancier } = require('./parse.tableau');
const { parseBilanCpo } = require('./parse.bilan');
const associationsRepo = require('../associations/associations.repository');
const dossiersRepo = require('../dossiers/dossiers.repository');
const { query } = require('../../db/sqlite');

// Ordre d'import des fichiers (tel que fourni par l'utilisateur).
const FILE_ORDER = ['dossier', 'financier', 'bilan'];

function parseByField(field, buffer) {
  switch (field) {
    case 'dossier': return parseDossierFile(buffer);
    case 'financier': return parseTableauFinancier(buffer);
    case 'bilan': return parseBilanCpo(buffer);
    default: {
      const err = new Error(`Champ inconnu : ${field}`);
      err.status = 400;
      throw err;
    }
  }
}

// Rapprochement d'une association à partir de l'identification extraite.
// Priorité : RNA > SIREN > nom exact (le CDC interdit le rapprochement par nom seul,
// mais celui-ci reste un repli — on ne crée jamais d'association en double).
function findOrCreateAssociation(ident) {
  const nom = ident.nomOfficielAssociation;
  if (!nom) {
    const err = new Error("Nom officiel de l'association absent du fichier");
    err.status = 400;
    throw err;
  }

  let found = null;
  if (ident.numeroRna) {
    found = query.get('SELECT * FROM associations WHERE numero_rna = ? AND is_active = 1', [String(ident.numeroRna).trim()]);
  }
  if (!found && ident.numeroSiren) {
    found = query.get('SELECT * FROM associations WHERE numero_siren = ? AND is_active = 1', [String(ident.numeroSiren).trim()]);
  }
  if (!found) {
    found = query.get('SELECT * FROM associations WHERE nom_officiel_association = ? AND is_active = 1', [nom.trim()]);
  }

  if (found) {
    // Mise à jour des champs d'identification non renseignés par ailleurs.
    const updates = {};
    const map = {
      nomOfficielAssociation: 'nom_officiel_association',
      sigleAbreviation: 'sigle_abreviation',
      objetAssociation: 'objet_association',
      adresseSiegeSocial: 'adresse_siege_social',
      codePostal: 'code_postal',
      ville: 'ville',
      email: 'email',
      telephone: 'telephone',
      siteWebReseauxSociaux: 'site_web_reseaux_sociaux',
      numeroRna: 'numero_rna',
      numeroSiren: 'numero_siren',
      dateCreation: 'date_creation',
      agrementJeunesseSports: 'agrement_jeunesse_sports',
      federationSportiveAffiliation: 'federation_sportive_affiliation',
      disciplinesPratiquees: 'disciplines_pratiquees',
      numeroAffiliation: 'numero_affiliation',
      categorieSportive: 'categorie_sportive',
    };
    for (const [api, col] of Object.entries(map)) {
      if (!col) continue;
      const v = ident[api];
      if (v !== undefined && v !== null && v !== '') updates[col] = v;
    }
    if (Object.keys(updates).length) {
      const sets = Object.keys(updates).map((c) => `${c} = ?`);
      query.run(
        `UPDATE associations SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
        [...Object.values(updates), found.id]
      );
      return associationsRepo.findById(found.id);
    }
    return found;
  }

  return associationsRepo.create({
    nom_officiel_association: nom.trim(),
    sigle_abreviation: ident.sigleAbreviation || null,
    objet_association: ident.objetAssociation || null,
    adresse_siege_social: ident.adresseSiegeSocial || null,
    code_postal: ident.codePostal || null,
    ville: ident.ville || null,
    email: ident.email || null,
    telephone: ident.telephone || null,
    site_web_reseaux_sociaux: ident.siteWebReseauxSociaux || null,
    numero_rna: ident.numeroRna || null,
    numero_siren: ident.numeroSiren || null,
    date_creation: ident.dateCreation || null,
    agrement_jeunesse_sports: ident.agrementJeunesseSports || null,
    federation_sportive_affiliation: ident.federationSportiveAffiliation || null,
    disciplines_pratiquees: ident.disciplinesPratiquees || null,
    numero_affiliation: ident.numeroAffiliation || null,
    categorie_sportive: ident.categorieSportive || null,
  });
}

function cleanSection(d) { return d !== undefined && d !== null; }

function importFiles({ annee, files }, user) {
  if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
    const err = new Error('annee (2000-2100) est obligatoire');
    err.status = 400;
    throw err;
  }

  const parsed = { dossier: null, financier: null, bilan: null, order: [] };
  for (const field of FILE_ORDER) {
    const f = files.find((x) => x.field === field);
    if (f) {
      parsed[field] = parseByField(field, f.buffer);
      parsed.order.push(field);
    }
  }

  if (!parsed.dossier) {
    const err = new Error('Le fichier du dossier de demande est obligatoire');
    err.status = 400;
    throw err;
  }

  // 1) Association.
  const association = findOrCreateAssociation(parsed.dossier.identification);

  // 2) Dossier (création ou mise à jour).
  let wasNew = false;
  let dossier = dossiersRepo.findByAssociationAndYear(association.id, annee);
  if (!dossier) {
    dossier = dossiersRepo.createDossier({
      associationId: association.id,
      annee,
      statut: 'brouillon',
      dateDepot: null,
      createdBy: user ? (user.id ?? user.sub) : null,
    });
    wasNew = true;
  }

  const sections = {};

  // 3a) Effectifs.
  if (parsed.dossier.effectifs && Object.keys(parsed.dossier.effectifs).length) {
    sections.effectifs = parsed.dossier.effectifs;
  }

  // 3b) Vie associative.
  if (parsed.dossier.vieAssociative && Object.keys(parsed.dossier.vieAssociative).length) {
    sections['vie-associative'] = parsed.dossier.vieAssociative;
  }

  // 3c) Situation financière — fusion dossier + tableau financier.
  const fin = { 
    ...(parsed.dossier.situationFinanciere || {}),
    ...(parsed.financier ? mapBilanToFin(parsed.financier.bilan) : {}),
  };
  if (Object.keys(fin).some((k) => cleanSection(fin[k]))) {
    sections['situation-financiere'] = Object.fromEntries(Object.entries(fin).filter(([, v]) => cleanSection(v)));
  }

  // 3d) Niveaux sportifs.
  if (Array.isArray(parsed.dossier.niveauxSportifs) && parsed.dossier.niveauxSportifs.length) {
    sections['niveaux-sportifs'] = parsed.dossier.niveauxSportifs;
  }

  // 3e) Politique tarifaire.
  if (Array.isArray(parsed.dossier.politiqueTarifaire) && parsed.dossier.politiqueTarifaire.length) {
    sections['politique-tarifaire'] = parsed.dossier.politiqueTarifaire;
  }

  // 3f) Autres subventions.
  if (Array.isArray(parsed.dossier.autresSubventions) && parsed.dossier.autresSubventions.length) {
    sections['autres-subventions'] = parsed.dossier.autresSubventions;
  }

  // 3g) Projets réalisés / prévus : dossier + bilan CPO.
  const projetsRealises = [
    ...(parsed.dossier.projetsRealises || []),
    ...((parsed.bilan && parsed.bilan.projetsRealises) || []),
  ];
  const projetsPrevus = parsed.dossier.projetsPrevus || [];
  if (projetsRealises.length) sections['projets-realises'] = projetsRealises;
  if (projetsPrevus.length) sections['projets-prevus'] = projetsPrevus;

  // 3h) Pièces.
  const pieces = parsed.dossier.pieces || [];
  if (pieces.length) sections.pieces = pieces.map((p) => ({
    type_piece: p.typePiece,
    fichier: p.fichier || null,
    date_depot: p.dateDepot || null,
    valide: p.valide || 0,
  }));

  // Enregistrement de chaque section (remplacement complet).
  const savedSections = [];
  for (const [sectionName, data] of Object.entries(sections)) {
    dossiersRepo.upsertSection(dossier.id, sectionName, data);
    savedSections.push(sectionName);
  }

  // Marque le dossier comme déposé dès qu'au moins une donnée est importée.
  if (dossier.statut === 'brouillon' && savedSections.length) {
    dossiersRepo.updateDossier(dossier.id, { statut: 'depose' });
  }

  const refreshed = dossiersRepo.findById(dossier.id);
  return {
    dossierId: refreshed.id,
    reference: refreshed.reference,
    associationId: association.id,
    associationNom: association.nom_officiel_association,
    sectionsImportees: savedSections,
    fichiers: parsed.order,
    nouveauDossier: wasNew,
  };
}

// Convertit les totaux du tableau financier dans la forme des colonnes de la
// section 8 (colonnes *_2025 / *_2027 / actuelles).
function mapBilanToFin(bilan) {
  const out = {};
  if (bilan.totalCharges) {
    out.totalCharges = bilan.totalCharges[2026] ?? null;
    out.totalCharges2025 = bilan.totalCharges[2025] ?? null;
    out.totalCharges2027 = bilan.totalCharges[2027] ?? null;
  }
  if (bilan.totalProduits) {
    out.totalProduits = bilan.totalProduits[2026] ?? null;
    out.totalProduits2025 = bilan.totalProduits[2025] ?? null;
    out.totalProduits2027 = bilan.totalProduits[2027] ?? null;
  }
  if (bilan.subventionVille) {
    out.subventionVille = bilan.subventionVille[2026] ?? null;
    out.subventionVille2025 = bilan.subventionVille[2025] ?? null;
    out.subventionVille2027 = bilan.subventionVille[2027] ?? null;
  }
  if (bilan.resultat) {
    out.resultatNet = bilan.resultat[2026] ?? null;
    out.resultatNet2025 = bilan.resultat[2025] ?? null;
  }
  return out;
}

module.exports = { importFiles, parseByField, FILE_ORDER };