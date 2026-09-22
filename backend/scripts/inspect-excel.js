const XLSX = require('xlsx');
const path = require('path');

const file = 'C:/Users/claffrat/dev/sub/DOCS/1_Dossier_Demande_Subvention_Fonctionnement_2027 def .xlsx';
const wb = XLSX.readFile(file);
const ws = wb.Sheets['Dossier Demande Subvention'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });

function colLetter(n) { let s = ''; n++; while (n>0){ const m=(n-1)%26; s=String.fromCharCode(65+m)+s; n=Math.floor((n-1)/26);} return s; }

// Print cells with value for every row, using column letters
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const cells = [];
  for (let c = 0; c < Math.min(row.length, 20); c++) {
    const v = row[c];
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      cells.push(colLetter(c) + '=' + JSON.stringify(v));
    }
  }
  if (cells.length) console.log('R' + i + ':', cells.join(' | '));
}