const { query } = require('../../db/sqlite');

const listUsers = ({ limit, offset }) => {
  const { n } = query.get('SELECT COUNT(*) AS n FROM users');
  const items = query.all(
    'SELECT * FROM users ORDER BY username COLLATE NOCASE LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return { total: n, items };
};

const findUserById = (id) => query.get('SELECT * FROM users WHERE id = ?', [id]);

const updateUser = (id, fields) => {
  const entries = Object.entries(fields);
  if (!entries.length) return findUserById(id);
  const sets = entries.map(([column]) => `${column} = ?`);
  const params = [...entries.map(([, value]) => value), id];
  query.run(
    `UPDATE users SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
    params
  );
  return findUserById(id);
};

module.exports = { listUsers, findUserById, updateUser };
