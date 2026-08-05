const { query } = require('../../db/sqlite');

const findUserByUsername = (username) =>
  query.get('SELECT * FROM users WHERE username = ?', [username]);

const findUserById = (id) =>
  query.get('SELECT * FROM users WHERE id = ?', [id]);

const createUser = ({ username, display_name, email, service, role, password_hash }) =>
  query.get(
    `INSERT INTO users (username, display_name, email, service, role, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING *`,
    [username, display_name, email, service, role, password_hash]
  );

const touchLogin = (id) =>
  query.run(
    `UPDATE users
     SET last_login_at = datetime('now'), updated_at = datetime('now')
     WHERE id = ?`,
    [id]
  );

const setPasswordHash = (id, hash) =>
  query.run(
    `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
    [hash, id]
  );

const promoteToAdmin = (id) =>
  query.run(
    `UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE id = ?`,
    [id]
  );

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  touchLogin,
  setPasswordHash,
  promoteToAdmin,
};
