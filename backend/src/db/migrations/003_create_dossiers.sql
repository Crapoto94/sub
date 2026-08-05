-- Dossiers de subvention : 1 dossier annuel par association, contenant les
-- sections 1 à 10 décrites dans le cahier des charges (Structure base).

CREATE TABLE IF NOT EXISTS dossiers (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  reference      TEXT NOT NULL UNIQUE,
  association_id INTEGER NOT NULL REFERENCES associations(id),
  annee          INTEGER NOT NULL,
  statut         TEXT NOT NULL DEFAULT 'brouillon'
                 CHECK (statut IN ('brouillon', 'depose', 'instruction', 'decision', 'accorde', 'refuse')),
  date_depot     TEXT,
  created_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dossiers_association ON dossiers (association_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_annee ON dossiers (annee);
CREATE INDEX IF NOT EXISTS idx_dossiers_statut ON dossiers (statut);

-- Section 2 : adhérents et licenciés (1 ligne par dossier)
CREATE TABLE IF NOT EXISTS dossier_effectifs (
  id                                    INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id                            INTEGER NOT NULL UNIQUE REFERENCES dossiers(id) ON DELETE CASCADE,
  ivryens                               INTEGER,
  non_ivryens                           INTEGER,
  femmes                                INTEGER,
  hommes                                INTEGER,
  salaries                              INTEGER,
  etudiants                             INTEGER,
  demandeurs_emploi                     INTEGER,
  retraites                             INTEGER,
  non_communique                        INTEGER,
  petite_enfance_0_5_ans                INTEGER,
  enfance_6_14_ans                      INTEGER,
  adolescents_15_18_ans                 INTEGER,
  jeunes_19_29_ans                      INTEGER,
  adultes_30_59_ans                     INTEGER,
  seniors_60_74_ans                     INTEGER,
  grand_age_75_ans_et_plus              INTEGER,
  personnes_en_situation_handicap       INTEGER,
  beneficiaires_tarifs_reduits_sociaux  INTEGER,
  actions_publics_eloignes              TEXT,
  nombre_beneficiaires_passsport        INTEGER
);

-- Section 3 : vie associative et bénévolat (1 ligne par dossier)
CREATE TABLE IF NOT EXISTS dossier_vie_associative (
  id                                 INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id                         INTEGER NOT NULL UNIQUE REFERENCES dossiers(id) ON DELETE CASCADE,
  date_derniere_assemblee_generale   TEXT,
  reglement_interieur_a_jour         INTEGER DEFAULT 0,
  benevoles_actifs                   INTEGER,
  salaries_permanents_etp            REAL,
  salaries_cdd_cddu                  INTEGER,
  emplois_aides                      INTEGER,
  agents_mis_a_disposition           INTEGER,
  vacataires_intervenants            INTEGER,
  nombre_heures_benevoles            INTEGER,
  montant_valorisation_benevolat     REAL,
  actions_formations_realisees       TEXT
);

-- Section 4 : niveaux sportifs atteints (plusieurs lignes par dossier)
CREATE TABLE IF NOT EXISTS dossier_niveaux_sportifs (
  id                              INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id                      INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  categorie_section               TEXT,
  niveau_sportif                  TEXT,
  principaux_resultats_sportifs   TEXT,
  nombre_deplacements             INTEGER,
  lieux_deplacements              TEXT,
  objectifs_sportifs_saison_suivante TEXT
);

-- Section 5 : projets réalisés (plusieurs lignes par dossier)
CREATE TABLE IF NOT EXISTS dossier_projets_realises (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id             INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  intitule               TEXT,
  description            TEXT,
  objectifs              TEXT,
  moyens_mis_en_oeuvre   TEXT,
  publics_vises          TEXT
);

-- Section 6 : projets prévus (plusieurs lignes par dossier)
CREATE TABLE IF NOT EXISTS dossier_projets_prevus (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id             INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  intitule               TEXT,
  description            TEXT,
  objectifs              TEXT,
  moyens_mis_en_oeuvre   TEXT,
  publics_vises          TEXT
);

-- Section 7 : politique tarifaire (plusieurs lignes par dossier)
CREATE TABLE IF NOT EXISTS dossier_politique_tarifaire (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id            INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  categorie_cotisation  TEXT,
  cotisation_ivryens    REAL,
  cotisation_non_ivryens REAL,
  nombre_adherents      INTEGER,
  montant_total_estime  REAL
);

-- Section 8 : situation financière (1 ligne par dossier)
CREATE TABLE IF NOT EXISTS dossier_situation_financiere (
  id                               INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id                       INTEGER NOT NULL UNIQUE REFERENCES dossiers(id) ON DELETE CASCADE,
  total_charges                    REAL,
  total_produits                   REAL,
  subvention_ville                 REAL,
  resultat_net                     REAL,
  tresorerie_disponible            REAL,
  fonds_propres_reserves           REAL,
  montant_subvention_sollicitee    REAL,
  justification_montant_demande    TEXT
);

-- Section 9 : autres subventions et financements (plusieurs lignes par dossier)
CREATE TABLE IF NOT EXISTS dossier_autres_subventions (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id            INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  financeur             TEXT,
  montant_accorde_2025  REAL,
  montant_accorde_2026  REAL,
  montant_sollicite_2027 REAL,
  objet_financement     TEXT
);

-- Section 10 : pièces justificatives (plusieurs lignes par dossier)
CREATE TABLE IF NOT EXISTS dossier_pieces (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  type_piece TEXT,
  fichier    TEXT,
  date_depot TEXT,
  valide     INTEGER DEFAULT 0
);
