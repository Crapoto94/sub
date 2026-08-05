-- Utilisateurs de l'application, alimentés à la connexion AD.
-- Le référentiel d'identité reste l'Active Directory (via l'APM) :
-- cette table ne fait que mémoriser le rôle applicatif et quelques infos AD.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,               -- login Ville (sAMAccountName)
  display_name  TEXT,
  email         TEXT,
  service       TEXT,
  role          TEXT NOT NULL DEFAULT 'membre' CHECK (role IN ('admin', 'membre')),
  is_active     INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
