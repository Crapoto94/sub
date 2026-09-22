const fs = require('fs');
const { parseDossierFile } = require('../src/modules/import/parse.dossier');
const { parseTableauFinancier } = require('../src/modules/import/parse.tableau');
const { parseBilanCpo } = require('../src/modules/import/parse.bilan');

const files = {
  dossier: 'C:/Users/claffrat/dev/sub/DOCS/1_Dossier_Demande_Subvention_Fonctionnement_2027 def .xlsx',
  financier: 'C:/Users/claffrat/dev/sub/DOCS/2_Tableau_Financier_2027.xlsx',
  bilan: 'C:/Users/claffrat/dev/sub/DOCS/3_Bilan_Convention_Objectif_2027 def.xlsx',
};

for (const [key, file] of Object.entries(files)) {
  console.log('\n===== ' + key.toUpperCase() + ' =====');
  try {
    const buf = fs.readFileSync(file);
    const out = key === 'dossier' ? parseDossierFile(buf)
      : key === 'financier' ? parseTableauFinancier(buf)
      : parseBilanCpo(buf);
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message, e.stack);
  }
}