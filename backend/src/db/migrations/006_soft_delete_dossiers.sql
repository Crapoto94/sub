-- Corbeille des dossiers : suppression logique avec traçabilité
-- (qui a supprimé, quand) et possibilité de restauration.
ALTER TABLE dossiers ADD COLUMN deleted_at TEXT;
ALTER TABLE dossiers ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_dossiers_deleted ON dossiers (deleted_at);
