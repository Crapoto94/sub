const { query } = require('../../db/sqlite');

const findUserByUsername = (username) =>
  query.get('SELECT * FROM users WHERE username = ?', [username]);

const findUserById = (id) =>
  query.get('SELECT * FROM users WHERE id = ?', [id]);

const createUser = ({ username, display_name, email, service, role }) =>
  query.get(
    `INSERT INTO users (username, display_name, email, service, role)
     VALUES (?, ?, ?, ?, ?)
     RETURNING *`,
    [username, display_name, email, service, role]
  );

const touchLogin = (id) =>
  query.run(
    `UPDATE users
     SET last_login_at = datetime('now'), updated_at = datetime('now')
     WHERE id = ?`,
    [id]
  );

module.exports = { findUserByUsername, findUserById, createUser, touchLogin };
