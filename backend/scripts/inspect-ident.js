const XLSX = require('xlsx');
const file = 'C:/Users/claffrat/dev/sub/DOCS/1_Dossier_Demande_Subvention_Fonctionnement_2027 def .xlsx';
const wb = XLSX.readFile(file);
const ws = wb.Sheets['Dossier Demande Subvention'];
console.log('Merges:', JSON.stringify(ws['!merges']));
// Print styles for identifier rows to find input cells (yellow fill)
console.log('\n=== identifier rows 6-21 ===');
for (let r = 6; r <= 21; r++) {
  const row = [];
  for (let c = 0; c < 9; c++) {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = ws[addr];
    if (cell) {
      let fill = null;
      if (cell.s && cell.s.fgColor && cell.s.fgColor.rgb) fill = cell.s.fgColor.rgb;
      row.push(addr + '=' + (cell.v !== undefined ? JSON.stringify(cell.v) : '') + (fill ? '/fill:' + fill : ''));
    }
  }
  if (row.length) console.log('R' + r + ':', row.join(' | '));
}