const service = require('./entreprise.service');

function wantsRefresh(req) {
  const v = String(req.query.refresh ?? '').toLowerCase();
  return v === '1' || v === 'true' || v === 'oui';
}

async function listControles(req, res, next) {
  try {
    res.json(await service.listControles({ refresh: wantsRefresh(req) }));
  } catch (err) {
    next(err);
  }
}

async function getControle(req, res, next) {
  try {
    res.json(
      await service.getAssociationControle(Number(req.params.id), { refresh: wantsRefresh(req) })
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { listControles, getControle };
