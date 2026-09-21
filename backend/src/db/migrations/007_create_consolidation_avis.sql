-- « Synthèse Globale » : réponses libres saisies dans les colonnes ER à EY
-- (bilan de la convention d'objectifs et avis de l'instructeur / de l'élu·e).
-- Une entrée par dossier et par colonne ; la ligne est supprimée si la valeur
-- est vide.
CREATE TABLE IF NOT EXISTS consolidation_avis (
  dossier_id INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  colonne    TEXT    NOT NULL,
  valeur     TEXT,
  updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (dossier_id, colonne)
);
