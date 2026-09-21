// Export du tableau « Consolidation » en classeur Excel (.xlsx).
// Reproduit la mise en page du fichier Consolidation.xlsx (DOCS) :
// ligne 1 = titre fusionné, ligne 2 = groupes fusionnés, ligne 3 = titres
// de colonnes, puis une ligne par association et la ligne « TOTAUX ».

const XLSX = require('xlsx');
const { buildConsolidation } = require('./consolidation');

const NUMBER_FORMATS = {
  int: '0',
  dec: '0.0',
  eur: '#,##0',
  pct: '0.0%',
  evol: '0.0%',
  text: null,
};

function toXlsxValue(cell) {
  if (!cell || cell.v === null || cell.v === undefined) return '';
  return cell.v;
}

function numberFormat(type) {
  return NUMBER_FORMATS[type] || null;
}

function buildWorkbook({ annee }) {
  const c = buildConsolidation({ annee });
  const keys = c.groupes.flatMap((g) => g.colonnes.map((col) => col.key));
  const totalCols = keys.length;

  // Ligne 1 : titre fusionné sur toute la largeur.
  const rows = [[c.titre]];
  for (let i = 1; i < totalCols; i += 1) rows[0].push('');

  // Ligne 2 : groupes (fusionnés) + Ligne 3 : titres de colonnes.
  const groupsRow = [];
  const headersRow = [];
  for (const g of c.groupes) {
    for (let i = 0; i < g.colonnes.length; i += 1) {
      groupsRow.push(i === 0 ? g.titre : '');
      headersRow.push(g.colonnes[i].titre);
    }
  }
  rows.push(groupsRow, headersRow);

  // Lignes associations puis totaux.
  for (const l of c.lignes) {
    rows.push(keys.map((k) => toXlsxValue(l.cells[k])));
  }
  const totauxRow = ['', 'TOTAUX'];
  for (const k of keys.slice(2)) {
    totauxRow.push(toXlsxValue(c.totaux[k]));
  }
  rows.push(totauxRow);

  // Formats numériques et largeurs de colonnes.
  const ws = XLSX.utils.aoa_to_sheet(rows);
  for (let ri = 3; ri < rows.length; ri += 1) {
    for (let ci = 0; ci < totalCols; ci += 1) {
      const type = ri === rows.length - 1 ? (c.totaux[keys[ci]] ? c.totaux[keys[ci]].t : 'text') : (c.lignes[0] ? c.lignes[0].cells[keys[ci]].t : 'text');
      const fmt = numberFormat(type);
      if (fmt) {
        const cell = ws[XLSX.utils.encode_cell({ r: ri, c: ci })];
        if (cell && typeof cell.v === 'number') cell.z = fmt;
      }
    }
  }
  ws['!cols'] = keys.map((k) => ({ wch: ['A', 'B'].includes(k) ? 22 : 12 }));
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    ...c.groupes.map((g, gi) => {
      const start = c.groupes.slice(0, gi).reduce((n, g2) => n + g2.colonnes.length, 0);
      return { s: { r: 1, c: start }, e: { r: 1, c: start + g.colonnes.length - 1 } };
    }),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Consolidation');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function buildxlsxExport({ annee }) {
  const filename = annee ? `Consolidation_${annee}.xlsx` : 'Consolidation.xlsx';
  return { filename, buffer: buildWorkbook({ annee }) };
}

module.exports = { buildxlsxExport };