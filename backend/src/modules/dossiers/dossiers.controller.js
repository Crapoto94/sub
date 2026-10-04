const dossiersService = require('./dossiers.service');
const { buildConsolidation } = require('./consolidation');
const { buildxlsxExport } = require('./consolidation-export');

async function list(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const refresh = ['1', 'true', 'oui'].includes(String(req.query.refresh ?? '').toLowerCase());
    res.json(await dossiersService.list({
      annee: req.query.annee ? Number(req.query.annee) : undefined,
      statut: req.query.statut,
      q: req.query.q,
      limit,
      offset,
      avecQualite: req.query.qualite !== '0',
      refresh,
    }));
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    res.json(await dossiersService.get(Number(req.params.id)));
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

function saveAvis(req, res, next) {
  try {
    const body = req.body || {};
    res.json(dossiersService.saveAvis(Number(req.params.id), body.colonne, body.valeur));
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

async function consolidation(req, res, next) {
  try {
    res.json(await buildConsolidation({ annee: req.query.annee ? Number(req.query.annee) : undefined }));
  } catch (err) {
    next(err);
  }
}

async function exportExcel(req, res, next) {
  try {
    const { filename, buffer } = await buildxlsxExport({ annee: req.query.annee ? Number(req.query.annee) : undefined });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function listCorbeille(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    res.json(await dossiersService.list({
      annee: req.query.annee ? Number(req.query.annee) : undefined,
      q: req.query.q,
      deleted: true,
      limit,
      offset,
    }));
  } catch (err) {
    next(err);
  }
}

function remove(req, res, next) {
  try {
    res.json(dossiersService.remove(Number(req.params.id), req.user));
  } catch (err) {
    next(err);
  }
}

function restore(req, res, next) {
  try {
    res.json(dossiersService.restore(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

function purge(req, res, next) {
  try {
    res.json(dossiersService.purge(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, listCorbeille, get, create, patch, remove, restore, purge, saveSection, saveAvis, stats, consolidation, exportExcel };
