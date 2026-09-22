-- Historique de suppression / réactivation des comptes utilisateurs.
-- Chaque changement d'état est horodaté (date + heure) avec l'auteur
-- (compte administrateur à l'origine de l'action). La désactivation est
-- un soft delete : le compte peut être réactivé à tout moment.
CREATE TABLE IF NOT EXISTS users_audit (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action                TEXT NOT NULL, -- 'suppression' | 'reactivation'
  performed_by_id       INTEGER REFERENCES users(id),
  performed_by_username TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_audit_user ON users_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_users_audit_created_at ON users_audit(created_at);