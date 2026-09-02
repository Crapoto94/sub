const XLSX = require('xlsx');

// Utilitaires de lecture d'un classeur Excel (SheetJS / xlsx).
// Les fichiers sont stabilisés (cf. CDC) : les positions (lignes/colonnes)
// servent de référence. On préfère le repérage par libellé quand c'est possible,
// avec repli sur des indices fixes.

const COL = (ref) => XLSX.utils.decode_col(ref); // ex. 'B' -> 1
const ROW = (ref) => XLSX.utils.decode_row(ref); // ex. '9' -> 8

function readWorkbook(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  return wb;
}

function sheetRows(wb, sheetName, sheetIndex = 0) {
  const ws = wb.Sheets[sheetName] || wb.Sheets[wb.SheetNames[sheetIndex]];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
}

function cell(rows, r, c) {
  const row = rows[r];
  if (!row) return null;
  const v = row[c];
  return v === undefined ? null : v;
}

function str(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function num(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(/[^\d.,\-]/g, '');
  if (s === '') return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function bool(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = String(v).trim().toLowerCase();
  if (['x', 'oui', 'yes', '1', 'true', '✓', '☑'].includes(s)) return 1;
  if (['', 'non', 'no', '0', 'false', '☐'].includes(s)) return 0;
  return null;
}

// Normalise un libellé : minuscules, espaces unifiés, suppression des
// glyphes d'avertissement en tête (ex. « ⚠  »).
function normalizeLabel(v) {
  return String(v || '')
    .replace(/^[⚠️⚠▸▪•*\s]+/, '')
    .replace(/^\d+\s+/, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\-\.\/&'’()"]+/gu, ' ')
    .trim();
}

// Repère l'index de la 1re ligne dont la colonne A contient le libellé (normalisé).
// Priorité à l'égalité exacte, puis au préfixe (ex. « Résultat net » → 
// « Résultat net (excédent / déficit) »).
function findRowByLabel(rows, needle, col = 0) {
  const n = normalizeLabel(needle);
  if (!n) return -1;
  let prefixMatch = -1;
  for (let i = 0; i < rows.length; i++) {
    const label = normalizeLabel(str(rows[i] && rows[i][col]));
    if (!label) continue;
    if (label === n) return i;
    if (prefixMatch < 0 && label.startsWith(n + ' ') && label.length > n.length) prefixMatch = i;
  }
  return prefixMatch;
}

module.exports = { readWorkbook, sheetRows, cell, str, num, bool, findRowByLabel, COL, ROW };