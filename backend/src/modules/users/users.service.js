const repository = require('./users.repository');

const ROLES = ['admin', 'membre'];

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    email: u.email,
    service: u.service,
    role: u.role,
    isActive: !!u.is_active,
    lastLoginAt: u.last_login_at ? `${u.last_login_at.replace(' ', 'T')}Z` : null,
  };
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
    if (!ROLES.includes(body.role)) {
      const err = new Error('Rôle invalide');
      err.status = 400;
      throw err;
    }
    fields.role = body.role;
  }
  if (body.isActive !== undefined) fields.is_active = body.isActive ? 1 : 0;
  if (body.displayName !== undefined) fields.display_name = String(body.displayName).slice(0, 255);
  if (body.email !== undefined) fields.email = body.email ? String(body.email).slice(0, 255) : null;
  if (body.service !== undefined) fields.service = body.service ? String(body.service).slice(0, 255) : null;

  if (id === Number(current.sub) && fields.role === 'membre') {
    const err = new Error("Impossible de retirer votre propre rôle administrateur");
    err.status = 400;
    throw err;
  }

  const updated = repository.updateUser(id, fields);
  if (!updated) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  return publicUser(updated);
}

module.exports = { list, get, patch };
