const { readWorkbook, sheetRows, cell, str, num, findRowByLabel } = require('./excel.utils');

// Fichier 3 : « Bilan de Convention d'Objectifs ».
// Feuille « Complément pour CPO ». Structure : objectifs n°1..n°, chacun avec
// intitulé d'action, descriptif, publics visés/touchés, moyens mobilisés.
// Ces actions alimentent la section « projets » (réalisés/prévus) du dossier.
const SHEET = 'Complément pour CPO';
const C = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10 };

function parseBilanCpo(buffer) {
  const wb = readWorkbook(buffer);
  const rows = sheetRows(wb, SHEET, 0);

  const projets = [];
  for (let r = 0; r < rows.length; r++) {
    const label = str(cell(rows, r, C.B)) || str(cell(rows, r, C.A)) || '';
    if (!/^Intitulé de l'action\s*:/i.test(label)) continue;
    const intitule = valueOf(rows, r);
    const description = nextText(rows, r + 1, ['Thématique de l\'action']);
    // Recherche du « Descriptif concret » associé (quelques lignes plus loin).
    let descriptif = null;
    for (let i = r + 1; i < Math.min(r + 6, rows.length); i++) {
      const l = str(cell(rows, i, C.B)) || str(cell(rows, i, C.A)) || '';
      if (/^Descriptif concret/i.test(l)) { descriptif = valueOf(rows, i); break; }
    }
    projets.push({
      intitule: intitule,
      description: descriptif || description,
      objectifs: description,
      moyensMisEnOeuvre: null,
      publicsVises: null,
    });
  }

  return { projetsRealises: projets, projetsPrevus: [] };
}

// Valeur à droite du libellé « ... :» (colonne B ou C selon la disposition).
function valueOf(rows, r) {
  const v = str(cell(rows, r, C.C)) || str(cell(rows, r, C.B)) || null;
  // Si la cellule = le libellé seul, chercher la valeur dans la ligne suivante.
  if (v && /^Intitulé/i.test(v)) {
    for (let i = r; i < Math.min(r + 3, rows.length); i++) {
      const cand = str(cell(rows, i, C.C));
      if (cand && !/^Intitulé/i.test(cand)) return cand;
    }
    return null;
  }
  return v;
}

function nextText(rows, from, excludePrefixes) {
  for (let i = from; i < Math.min(from + 5, rows.length); i++) {
    const t = str(cell(rows, i, C.A)) || str(cell(rows, i, C.B)) || '';
    if (excludePrefixes.some((p) => new RegExp(`^${p}`, 'i').test(t))) continue;
    if (t) return t;
  }
  return null;
}

module.exports = { parseBilanCpo };