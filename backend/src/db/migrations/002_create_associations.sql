-- Référentiel des associations (section 1 du dossier : identification).
CREATE TABLE IF NOT EXISTS associations (
  id                              INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_officiel_association        TEXT NOT NULL,
  sigle_abreviation               TEXT,
  objet_association               TEXT,
  adresse_siege_social            TEXT,
  code_postal                     TEXT,
  ville                           TEXT,
  email                           TEXT,
  telephone                       TEXT,
  site_web_reseaux_sociaux        TEXT,
  numero_rna                      TEXT,
  numero_siren                    TEXT,
  date_creation                   TEXT,
  agrement_jeunesse_sports        TEXT,
  federation_sportive_affiliation TEXT,
  disciplines_pratiquees          TEXT,
  numero_affiliation              TEXT,
  categorie_sportive              TEXT,
  is_active                       INTEGER NOT NULL DEFAULT 1,
  created_at                      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at                      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_associations_nom ON associations (nom_officiel_association);
