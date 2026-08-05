const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { env } = require('../config/env');

// Base SQLite locale (dérogation au guide : PostgreSQL Ville non utilisé).
const dataDir = path.dirname(path.resolve(env.dbFile));
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(env.dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Applique les migrations SQL versionnées (dossier migrations/).
function setupDb() {
  const migrationsDir = path.join(__dirname, 'migrations');
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    db.prepare('SELECT name FROM schema_migrations').all().map((r) => r.name)
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file);
    })();
    console.log(`[DB] Migration appliquée : ${file}`);
  }
  console.log(`[DB] Base initialisée : ${env.dbFile}`);
}

// Wrapper pratique (placeholders SQLite ?), équivalent de pg_db.js du guide.
const query = {
  all: (sql, params = []) => db.prepare(sql).all(...params),
  get: (sql, params = []) => db.prepare(sql).get(...params),
  run: (sql, params = []) => db.prepare(sql).run(...params),
};

module.exports = { db, setupDb, query };
