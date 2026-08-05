const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { env } = require('../../config/env');
const { authenticateAD, getUserAD } = require('../../services/apm');
const repository = require('./auth.repository');

// En local (sans APM) ou sans clé APM configurée, on court-circuite l'AD.
function isLocalMode() {
  return env.authMode === 'local' || !env.apm.key;
}

function isInitialAdmin(username) {
  return env.initialAdminLogin && username.toLowerCase() === env.initialAdminLogin.toLowerCase();
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
    isLocal: !!u.password_hash,
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

function issueSession(user) {
  if (!user.is_active) {
    const err = new Error('Compte désactivé');
    err.status = 403;
    throw err;
  }

  // L'admin initial (config) est toujours admin, même s'il a été créé avant.
  if (isInitialAdmin(user.username) && user.role !== 'admin') {
    repository.promoteToAdmin(user.id);
    user = repository.findUserByUsername(user.username);
  }

  repository.touchLogin(user.id);

  const token = jwt.sign(
    { sub: String(user.id), username: user.username, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return { token, user: publicUser(user) };
}

async function login(username, password) {
  if (!username || !password) {
    const err = new Error('Identifiants manquants');
    err.status = 400;
    throw err;
  }

  const existing = repository.findUserByUsername(username);

  // Compte local : vérification du mot de passe stocké (bcrypt).
  if (existing && existing.password_hash) {
    const ok = await bcrypt.compare(password, existing.password_hash);
    if (!ok) {
      const err = new Error('Identifiants invalides');
      err.status = 401;
      throw err;
    }
    return issueSession(existing);
  }

  // Sinon : authentification Active Directory (ou fallback dev sans APM).
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

  let user = existing;
  if (!user) {
    user = repository.createUser({
      username,
      display_name: adInfo.displayName,
      email: adInfo.mail,
      service: adInfo.service,
      role: isInitialAdmin(username) ? 'admin' : 'membre',
      password_hash: null,
    });
  }

  return issueSession(user);
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

// Seed au démarrage : compte local admin si LOCAL_ADMIN_USERNAME / PASSWORD sont définis.
// Permet de démarrer sans APM/AD et d'avoir immédiatement un accès admin.
function seedLocalAdmin() {
  const { username, password } = env.localAdmin;
  if (!username || !password) return;
  const hash = bcrypt.hashSync(password, 10);
  let user = repository.findUserByUsername(username);
  if (!user) {
    user = repository.createUser({
      username,
      display_name: username,
      email: null,
      service: null,
      role: 'admin',
      password_hash: hash,
    });
    console.log(`[AUTH] Compte local admin créé : ${username}`);
  } else {
    repository.setPasswordHash(user.id, hash);
    if (user.role !== 'admin') repository.promoteToAdmin(user.id);
    console.log(`[AUTH] Compte local admin mis à jour : ${username}`);
  }
}

module.exports = { login, me, seedLocalAdmin };
