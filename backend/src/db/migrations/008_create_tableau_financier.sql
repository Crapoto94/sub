-- Section 8 : détail du « Tableau financier » (charges / produits).
-- Une ligne par poste, dans l'ordre du fichier : titres de bloc, rubriques
-- comptables, lignes détaillées, sous-totaux et totaux. Les exercices 2025
-- (N-1), 2026 (N) et 2027 prévisionnel sont conservés, ainsi que l'écart et
-- l'évolution calculés par le classeur.
CREATE TABLE IF NOT EXISTS dossier_tableau_financier (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  dossier_id    INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  ordre         INTEGER NOT NULL,
  categorie     TEXT    NOT NULL, -- 'charge' | 'produit'
  type          TEXT    NOT NULL, -- 'titre' | 'rubrique' | 'ligne' | 'sous-total' | 'total'
  numero_compte TEXT,
  libelle       TEXT,
  montant_2025  REAL,
  montant_2026  REAL,
  montant_2027  REAL,
  ecart         REAL,
  evol          REAL,
  note          TEXT
);

CREATE INDEX IF NOT EXISTS idx_tableau_financier_dossier ON dossier_tableau_financier(dossier_id);
