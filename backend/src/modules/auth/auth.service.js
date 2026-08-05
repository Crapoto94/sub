const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');
const { authenticateAD, getUserAD } = require('../../services/apm');
const repository = require('./auth.repository');

// En local (sans APM) ou sans clé APM configurée, on court-circuite l'AD.
function isLocalMode() {
  return env.authMode === 'local' || !env.apm.key;
}

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

async function enrichFromAD(username) {
  try {
    const info = await getUserAD(username);
    return {
      displayName: info.displayName || info.name || username,
      mail: info.mail || info.email || null,
      service: info.service || info.department || null,
    };
  } catch {
    // L'enrichissement est best-effort : on ne bloque pas le login.
    return { displayName: username, mail: null, service: null };
  }
}

async function login(username, password) {
  if (!username || !password) {
    const err = new Error('Identifiants manquants');
    err.status = 400;
    throw err;
  }

  let adInfo;
  if (isLocalMode()) {
    adInfo = { displayName: username, mail: null, service: null };
  } else {
    const result = await authenticateAD(username, password);
    if (!result || result.success !== true) {
      const err = new Error('Identifiants invalides');
      err.status = 401;
      throw err;
    }
    adInfo = await enrichFromAD(username);
  }

  let user = repository.findUserByUsername(username);
  if (!user) {
    const role =
      username.toLowerCase() === env.initialAdminLogin.toLowerCase() ? 'admin' : 'membre';
    user = repository.createUser({
      username,
      display_name: adInfo.displayName,
      email: adInfo.mail,
      service: adInfo.service,
      role,
    });
  }

  if (!user.is_active) {
    const err = new Error('Compte désactivé');
    err.status = 403;
    throw err;
  }

  repository.touchLogin(user.id);

  const token = jwt.sign(
    { sub: String(user.id), username: user.username, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return { token, user: publicUser(user) };
}

function me(id) {
  const user = repository.findUserById(id);
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }
  return publicUser(user);
}

module.exports = { login, me };
