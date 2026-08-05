const repository = require('./associations.repository');

// Correspondance API (camelCase) <-> colonnes SQL (snake_case).
const FIELDS = {
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

function publicAssociation(a) {
  const out = { id: a.id, isActive: !!a.is_active };
  for (const [key, column] of Object.entries(FIELDS)) out[key] = a[column] ?? null;
  return out;
}

function mapInput(body) {
  const out = {};
  for (const [key, column] of Object.entries(FIELDS)) {
    if (body[key] !== undefined && body[key] !== null) {
      const v = String(body[key]).trim();
      if (v !== '') out[column] = v;
    }
  }
  if (body.isActive !== undefined) out.is_active = body.isActive ? 1 : 0;
  return out;
}

function list({ q, limit, offset }) {
  const result = repository.listAssociations({ q, limit, offset });
  return { total: result.total, items: result.items.map(publicAssociation) };
}

function get(id) {
  const a = repository.findById(id);
  if (!a) {
    const err = new Error('Association introuvable');
    err.status = 404;
    throw err;
  }
  return publicAssociation(a);
}

function create(body) {
  if (!body.nomOfficielAssociation || !String(body.nomOfficielAssociation).trim()) {
    const err = new Error("Le nom officiel de l'association est obligatoire");
    err.status = 400;
    throw err;
  }
  return publicAssociation(repository.create(mapInput(body)));
}

function patch(id, body) {
  const updated = repository.update(id, mapInput(body));
  if (!updated) {
    const err = new Error('Association introuvable');
    err.status = 404;
    throw err;
  }
  return publicAssociation(updated);
}

module.exports = { list, get, create, patch };
