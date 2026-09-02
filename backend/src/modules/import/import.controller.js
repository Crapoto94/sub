const importService = require('./import.service');

// Multi-fichiers via multer (req.files = [{ fieldname, originalname, buffer, ... }]).
function upload(req, res, next) {
  try {
    const files = (req.files || []).map((f) => ({
      field: f.fieldname,
      originalname: f.originalname,
      buffer: f.buffer,
      mimetype: f.mimetype,
    }));
    const annee = req.body.annee ? Number(req.body.annee) : 2027;
    const result = importService.importFiles({ annee, files }, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { upload };