const { query } = require('../../db/sqlite');

const listAssociations = ({ q, limit, offset }) => {
  const where = [];
  const params = [];
  if (q) {
    where.push('(nom_officiel_association LIKE ? OR numero_siren LIKE ? OR numero_rna LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { n } = query.get(`SELECT COUNT(*) AS n FROM associations ${whereSql}`, params);
  const items = query.all(
    `SELECT * FROM associations ${whereSql} ORDER BY nom_officiel_association COLLATE NOCASE LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { total: n, items };
};

const findById = (id) => query.get('SELECT * FROM associations WHERE id = ?', [id]);

const create = (a) => {
  const columns = Object.keys(a);
  const placeholders = columns.map(() => '?');
  return query.get(
    `INSERT INTO associations (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    columns.map((c) => a[c])
  );
};

const update = (id, fields) => {
  const entries = Object.entries(fields);
  if (!entries.length) return findById(id);
  const sets = entries.map(([column]) => `${column} = ?`);
  const params = [...entries.map(([, value]) => value), id];
  query.run(
    `UPDATE associations SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
    params
  );
  return findById(id);
};

module.exports = { listAssociations, findById, create, update };
