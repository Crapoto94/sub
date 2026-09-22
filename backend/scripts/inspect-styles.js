const XLSX = require('xlsx');
const file = 'C:/Users/claffrat/dev/sub/DOCS/1_Dossier_Demande_Subvention_Fonctionnement_2027 def .xlsx';
const wb = XLSX.readFile(file, { cellStyles: true });
const ws = wb.Sheets['Dossier Demande Subvention'];

function colLetter(n){let s='';n++;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;}

// Identify rows: 6..21 (0-based row = sheet row 7..22). Print every cell that has a fill or a value.
const rows = [6,9,10,11,12,13,14,15,16,18,19,20,21,23,24,25];
for (const r of rows) {
  const parts = [];
  for (let c = 0; c < 12; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r, c })];
    if (!cell) continue;
    const fill = cell.s ? JSON.stringify(cell.s.fill || cell.s.fgColor || null) : null;
    const v = cell.v !== undefined ? String(cell.v) : '';
    parts.push(colLetter(c) + '[' + r + ']' + (v ? '="' + v + '"' : '') + (fill ? ' F:' + fill : ''));
  }
  if (parts.length) console.log('ROW', r, '|', parts.join('  '));
}