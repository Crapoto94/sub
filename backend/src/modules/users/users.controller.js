const usersService = require('./users.service');

function list(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    res.json(usersService.list({ limit, offset }));
  } catch (err) {
    next(err);
  }
}

function get(req, res, next) {
  try {
    res.json(usersService.get(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    res.status(201).json(usersService.create(req.body || {}));
  } catch (err) {
    next(err);
  }
}

function patch(req, res, next) {
  try {
    res.json(usersService.patch(Number(req.params.id), req.body || {}, req.user));
  } catch (err) {
    next(err);
  }
}

function setPassword(req, res, next) {
  try {
    res.json(usersService.setPassword(Number(req.params.id), (req.body || {}).password));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, patch, setPassword };
