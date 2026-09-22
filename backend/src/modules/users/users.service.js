const bcrypt = require('bcryptjs');
const repository = require('./users.repository');

const ROLES = ['admin', 'membre'];
const PASSWORD_MIN = 8;

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    email: u.email,
    service: u.service,
    role: u.role,
    isActive: !!u.is_active,
    isLocal: !!u.password_hash,
    lastLoginAt: u.last_login_at ? `${u.last_login_at.replace(' ', 'T')}Z` : null,
  };
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function list({ limit, offset }) {
  const result = repository.listUsers({ limit, offset });
  return { total: result.total, items: result.items.map(publicUser) };
}

function get(id) {
  const user = repository.findUserById(id);
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  return publicUser(user);
}

function patch(id, body, current) {
  const fields = {};

  if (body.role !== undefined) {
    if (!ROLES.includes(body.role)) throw badRequest('Rôle invalide');
    fields.role = body.role;
  }
  if (body.isActive !== undefined) fields.is_active = body.isActive ? 1 : 0;
  if (body.displayName !== undefined) fields.display_name = String(body.displayName).slice(0, 255);
  if (body.email !== undefined) fields.email = body.email ? String(body.email).slice(0, 255) : null;
  if (body.service !== undefined) fields.service = body.service ? String(body.service).slice(0, 255) : null;

  if (id === Number(current.sub) && fields.role === 'membre') {
    throw badRequest("Impossible de retirer votre propre rôle administrateur");
  }

  const updated = repository.updateUser(id, fields);
  if (!updated) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  return publicUser(updated);
}

// Création d'un utilisateur (compte AD par défaut, compte local si password fourni).
function create(body) {
  const username = String(body.username || '').trim();
  if (!username) throw badRequest("Le nom d'utilisateur est obligatoire");
  if (repository.findUserByUsername(username)) throw badRequest("Ce nom d'utilisateur existe déjà");

  const role = ROLES.includes(body.role) ? body.role : 'membre';
  let password_hash = null;
  if (body.password) {
    password_hash = hashPassword(body.password);
  }

  return publicUser(
    repository.createUser({
      username,
      display_name: body.displayName ? String(body.displayName).slice(0, 255) : username,
      email: body.email ? String(body.email).slice(0, 255) : null,
      service: body.service ? String(body.service).slice(0, 255) : null,
      role,
      password_hash,
    })
  );
}

// Définit (ou remplace) le mot de passe local d'un utilisateur.
function setPassword(id, password, current) {
  const user = repository.findUserById(id);
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  repository.setPasswordHash(id, hashPassword(password));
  return publicUser(repository.findUserById(id));
}

// Suppression d'un utilisateur (soft delete historisé) : le compte est
// désactivé (plus de connexion possible) mais peut être réactivé.
function remove(id, current) {
  const user = repository.findUserById(id);
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  if (id === Number(current.sub)) {
    throw badRequest('Vous ne pouvez pas supprimer votre propre compte');
  }
  if (!user.is_active) throw badRequest('Ce compte est déjà désactivé');

  repository.setActive(id, false);
  repository.recordUserAction(id, 'suppression', Number(current.sub), current.username);
  return publicUser(repository.findUserById(id));
}

// Réactivation d'un utilisateur préalablement supprimé (historisée).
function reactivate(id, current) {
  const user = repository.findUserById(id);
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  if (user.is_active) throw badRequest('Ce compte est déjà actif');

  repository.setActive(id, true);
  repository.recordUserAction(id, 'reactivation', Number(current.sub), current.username);
  return publicUser(repository.findUserById(id));
}

// Historique des suppressions / réactivations d'un compte.
function history(id) {
  const user = repository.findUserById(id);
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  return repository.listUserAudit(id).map((row) => ({
    id: row.id,
    action: row.action,
    performedById: row.performed_by_id,
    performedByUsername: row.performed_by_username,
    createdAt: row.created_at ? `${row.created_at.replace(' ', 'T')}` : null,
  }));
}

function hashPassword(password) {
  if (!password || String(password).length < PASSWORD_MIN) {
    throw badRequest(`Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères`);
  }
  return bcrypt.hashSync(String(password), 10);
}

module.exports = { list, get, patch, create, setPassword, remove, reactivate, history };
