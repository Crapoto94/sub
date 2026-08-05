const dossiersService = require('./dossiers.service');

function list(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    res.json(dossiersService.list({
      annee: req.query.annee ? Number(req.query.annee) : undefined,
      statut: req.query.statut,
      q: req.query.q,
      limit,
      offset,
    }));
  } catch (err) {
    next(err);
  }
}

function get(req, res, next) {
  try {
    res.json(dossiersService.get(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    res.status(201).json(dossiersService.create(req.body || {}, req.user));
  } catch (err) {
    next(err);
  }
}

function patch(req, res, next) {
  try {
    res.json(dossiersService.patch(Number(req.params.id), req.body || {}));
  } catch (err) {
    next(err);
  }
}

function saveSection(req, res, next) {
  try {
    res.json(dossiersService.saveSection(Number(req.params.id), req.params.section, req.body));
  } catch (err) {
    next(err);
  }
}

function stats(req, res, next) {
  try {
    res.json(dossiersService.stats({ annee: req.query.annee ? Number(req.query.annee) : undefined }));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, patch, saveSection, stats };
