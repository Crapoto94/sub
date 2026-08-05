const associationsService = require('./associations.service');

function list(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    res.json(associationsService.list({ q: req.query.q, limit, offset }));
  } catch (err) {
    next(err);
  }
}

function get(req, res, next) {
  try {
    res.json(associationsService.get(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    res.status(201).json(associationsService.create(req.body || {}));
  } catch (err) {
    next(err);
  }
}

function patch(req, res, next) {
  try {
    res.json(associationsService.patch(Number(req.params.id), req.body || {}));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, patch };
