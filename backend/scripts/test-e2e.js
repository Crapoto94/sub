// Test de bout en bout de l'import : DB temporaire + migrations + importFiles.
process.env.DB_FILE = require('path').join(require('os').tmpdir(), 'sub-e2e-' + Date.now() + '.sqlite');
const XLSX = require('xlsx');
const { setupDb } = require('../src/db/sqlite');
const { importFiles } = require('../src/modules/import/import.service');
const { parseDossierFile } = require('../src/modules/import/parse.dossier');

const file = 'C:/Users/claffrat/dev/sub/DOCS/1_Dossier_Demande_Subvention_Fonctionnement_2027 def .xlsx';
const wb = XLSX.readFile(file, { cellStyles: true });
const ws = wb.Sheets['Dossier Demande Subvention'];
const set = (r) => (c, v) => { ws[c + r] = { t: 's', v }; };

// Remplissage d'un échantillon réaliste.
set(10)('G', 'Cercle des Nageurs d\'Ivry');
set(11)('G', 'CNI');
set(13)('D', '94200'); set(13)('J', 'Ivry-sur-Seine');
set(14)('D', 'cni@ivry.fr');
set(16)('D', 'W941001111'); set(16)('J', '789123456');
set(17)('D', '1965');
set(20)('G', 'FFN');
set(21)('D', 'Natation');
set(32)('C', 10); set(32)('E', 12); set(32)('H', 15);
set(36)('C', 5);  set(36)('E', 6);  set(36)('H', 8);
set(63)('B', 'Basket-santé seniors');
set(69)('D', '2015-01-10'); set(69)('J', 'OUI');
set(73)('D', 20); set(73)('G', 22); set(73)('J', 1500);
set(87)('A', 'Section compétition'); set(87)('I', 'X');
set(93)('B', 'Championne de France 2026');
set(101)('B', 'Tournoi de rentrée avec 16 équipes');
set(129)('D', 40); set(129)('F', 60); set(129)('H', 100); set(129)('J', 5000);
set(145)('D', 100000); set(145)('G', 110000); set(145)('J', 120000);  // charges
set(146)('D', 120000); set(146)('G', 130000); set(146)('J', 140000);  // produits
set(153)('G', 25000);
set(160)('D', 3000); set(160)('F', 3500); set(160)('H', 4000); set(160)('J', 'Fonctionnement');
set(155)('B', 'La subvention finance l\'encadrement');

const dossierBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
const finBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }); // template reel (totaux 0)

setupDb();
const result = importFiles({
  annee: 2027,
  files: [
    { field: 'dossier', buffer: dossierBuf, originalname: 'dossier.xlsx' },
    { field: 'financier', buffer: finBuf, originalname: 'financier.xlsx' },
  ],
}, null);

console.log('RESULT:', JSON.stringify(result, null, 1));
console.log('\n--- Verify DB ---');
const repo = require('../src/modules/dossiers/dossiers.repository');
const d = repo.findById(result.dossierId);
console.log('ref:', d.reference, 'statut:', d.statut, 'annee:', d.annee);
const eff = repo.getSection(result.dossierId, 'effectifs');
console.log('effectifs.ivryens:', eff.ivryens, 'ivryens_n1:', eff.ivryens_n1, 'ivryens_prev:', eff.ivryens_prev, 'passsport handled, actions:', eff.actions_publics_eloignes);
const sfin = repo.getSection(result.dossierId, 'situation-financiere');
console.log('situation total_charges:', sfin.total_charges, 'subvent sollicitee:', sfin.montant_subvention_sollicitee);
const niveaux = repo.getSection(result.dossierId, 'niveaux-sportifs');
console.log('niveaux[0]:', JSON.stringify(niveaux[0]));
const proj = repo.getSection(result.dossierId, 'projets-realises');
console.log('projets[0]:', JSON.stringify(proj[0]));
const tarifs = repo.getSection(result.dossierId, 'politique-tarifaire');
console.log('tarifs[0]:', JSON.stringify(tarifs[0]));
const subv = repo.getSection(result.dossierId, 'autres-subventions');
console.log('subv[0]:', JSON.stringify(subv[0]));
const pieces = repo.getSection(result.dossierId, 'pieces');
console.log('pieces count:', pieces.length);