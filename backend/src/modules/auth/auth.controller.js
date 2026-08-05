const authService = require('./auth.service');

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};
    res.json(await authService.login(username, password));
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    res.json(authService.me(Number(req.user.sub)));
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };
