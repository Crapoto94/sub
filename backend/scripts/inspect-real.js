const XLSX = require('xlsx');
const file = 'C:/Users/claffrat/dev/sub/DOCS/Fiches_2027_Consolide.xlsx';
const wb = XLSX.readFile(file);
const ws = wb.Sheets["Cercle des Nageurs d'Ivry"] || wb.Sheets[wb.SheetNames[2]];
console.log('Sheet:', ws ? wb.SheetNames.find(n=>n.includes("Nageurs")) : 'none');
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
function colLetter(n){let s='';n++;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;}
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  const cells = [];
  for (let c = 0; c < Math.min(row.length, 12); c++) {
    const v = row[c];
    if (v !== null && v !== undefined && String(v).trim() !== '') cells.push(colLetter(c)+'='+JSON.stringify(v));
  }
  if (cells.length) console.log('R'+i+':', cells.join(' | '));
}