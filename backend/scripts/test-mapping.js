// Test de bout en bout : remplit les cellules jaunes du modèle réel puis
// vérifie que parseDossierFile récupère les bonnes valeurs.
const XLSX = require('xlsx');
const { parseDossierFile } = require('../src/modules/import/parse.dossier');

const file = 'C:/Users/claffrat/dev/sub/DOCS/1_Dossier_Demande_Subvention_Fonctionnement_2027 def .xlsx';
const wb = XLSX.readFile(file, { cellStyles: true });
const ws = wb.Sheets['Dossier Demande Subvention'];
const set = (r) => (c, v) => { ws[c + r] = { t: 's', v }; };

// ---- Identification ----
set(10)('A', '⚠  Nom officiel de l\'association'); // already there
set(10)('G', 'Cercle des Nageurs d\'Ivry');
set(11)('G', 'CNI');
set(12)('G', '12 Rue de la Gare');
// two-column: R13 Code postal | G Ville
set(13)('D', '94200');
set(13)('J', 'Ivry-sur-Seine');
set(14)('D', 'cni@ivry.fr');
set(14)('J', '01 23 45 67 89');
set(15)('G', 'www.cni-ivry.fr');
// R16 N° RNA | G SIREN
set(16)('D', 'W941001111');
set(16)('J', '789 123 456');
set(17)('D', '1965');
set(17)('J', 'OUI');
set(20)('G', 'FFN');
set(21)('D', 'Natation');
set(21)('J', 'NAT-001');
set(22)('G', 'Locale');

// ---- Effectifs ----
const effLabel = (label, row) => {
  // find row by label
  const keys = Object.keys(ws).filter(k => k[0] === 'A');
};
// set known rows per style dump: Ivryens=31? use actual: find via value
// R31 Ivryens, C=N-1, E=N, H=Prev (from inspect-styles2)
set(32)('C', 10); set(32)('E', 12); set(32)('H', 15);   // Ivryens
set(36)('C', 5);  set(36)('E', 6);  set(36)('H', 8);   // Femmes

// Publics éloignés R63 (jaune A..L)
set(63)('B', 'Basket-santé seniors');

const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

const out = parseDossierFile(buf);
const id = out.identification;
const checks = [
  ['nomOfficiel', id.nomOfficielAssociation, 'Cercle des Nageurs d\'Ivry'],
  ['sigle', id.sigleAbreviation, 'CNI'],
  ['adresse', id.adresseSiegeSocial, '12 Rue de la Gare'],
  ['codePostal', id.codePostal, '94200'],
  ['ville', id.ville, 'Ivry-sur-Seine'],
  ['email', id.email, 'cni@ivry.fr'],
  ['telephone', id.telephone, '01 23 45 67 89'],
  ['siteWeb', id.siteWebReseauxSociaux, 'www.cni-ivry.fr'],
  ['rna', id.numeroRna, 'W941001111'],
  ['siren', id.numeroSiren, '789 123 456'],
  ['dateCreation', id.dateCreation, '1965'],
  ['agrement', id.agrementJeunesseSports, 'OUI'],
  ['federation', id.federationSportiveAffiliation, 'FFN'],
  ['disciplines', id.disciplinesPratiquees, 'Natation'],
  ['numAffiliation', id.numeroAffiliation, 'NAT-001'],
  ['categorie', id.categorieSportive, 'Locale'],
];
console.log('--- IDENTIFICATION ---');
for (const [name, got, want] of checks) {
  const ok = String(got) === String(want);
  console.log((ok ? 'OK ' : 'FAIL ') + name + ': got=' + JSON.stringify(got) + (ok ? '' : ' want=' + JSON.stringify(want)));
}
console.log('\n--- EFFECTIFS ---');
console.log('ivryensN1=' + out.effectifs.ivryensN1 + ' (want 10), ivryens=' + out.effectifs.ivryens + ' (want 12), ivryensPrev=' + out.effectifs.ivryensPrev + ' (want 15)');
console.log('femmes=' + out.effectifs.femmes + ' (want 6), femmesPrev=' + out.effectifs.femmesPrev + ' (want 8)');
console.log('actionsPublicsEloignes=' + JSON.stringify(out.effectifs.actionsPublicsEloignes) + ' (want "Basket-santé seniors")');

// ---- Vie asso ----
set(69)('D', '2015-01-10');   // AG
set(69)('J', 'OUI');          // Règlement intérieur
set(73)('D', 20); set(73)('G', 22); set(73)('J', 1500); // Bénévoles actifs
set(80)('F', 100); set(80)('J', 1231);  // Valorisation heures/montant
set(82)('B', 'Formation arbitres');
const buf2 = XLSX.write(wb, { type:'buffer', bookType:'xlsx' });
const o2 = parseDossierFile(buf2).vieAssociative;
console.log('\n--- VIE ASSO ---');
console.log('AG=' + JSON.stringify(o2.dateDerniereAssembleeGenerale) + ' (want 2015-01-10)');
console.log('reglementInterieur=' + JSON.stringify(o2.reglementInterieurAJour) + ' (want 1)');
console.log('benevoles=' + o2.benevolesActifs + ' (want 22), benevolesN1=' + o2.benevolesActifsN1 + ' (want 20)');
console.log('heures=' + o2.nombreHeuresBenevoles + ' (want 100), montant=' + o2.montantValorisationBenevolat + ' (want 1231)');
console.log('actionsFormations=' + JSON.stringify(o2.actionsFormationsRealisees) + ' (want "Formation arbitres")');

// ---- Niveaux sportifs ----
set(87)('A', 'Section compétition'); set(87)('I', 'X'); // I=National
set(93)('B', 'Championne de France 2026');   // résultats sportifs (R93 = zone jaune)
const n = parseDossierFile(XLSX.write(wb,{type:'buffer',bookType:'xlsx'})).niveauxSportifs;
console.log('\n--- NIVEAUX ---');
console.log('count=' + n.length + ', cat=' + JSON.stringify(n[0] && n[0].categorieSection) + ', niveau=' + JSON.stringify(n[0] && n[0].niveauSportif) + ', resultats=' + JSON.stringify(n[0] && n[0].principauxResultatsSportifs));

// ---- Projets réalisés ----
set(101)('B', 'Tournoi de rentrée avec 16 équipes');  // R101 = zone jaune
const pr = parseDossierFile(XLSX.write(wb,{type:'buffer',bookType:'xlsx'})).projetsRealises;
console.log('\n--- PROJETS REALISES ---');
console.log('count=' + pr.length + ', desc=' + JSON.stringify(pr[0] && pr[0].description));

// ---- Tarifs ----
set(129)('D', 40); set(129)('F', 60); set(129)('H', 100); set(129)('J', 5000);
const t = parseDossierFile(XLSX.write(wb,{type:'buffer',bookType:'xlsx'})).politiqueTarifaire;
console.log('\n--- TARIFS ---');
console.log('cat=' + JSON.stringify(t[0] && t[0].categorieCotisation) + ', ivry=' + (t[0]&&t[0].cotisationIvryens) + ', nonIvry=' + (t[0]&&t[0].cotisationNonIvryens) + ', nb=' + (t[0]&&t[0].nombreAdherents) + ', total=' + (t[0]&&t[0].montantTotalEstime));

// ---- Situation financière ----
set(145)('D', 100000); set(145)('G', 110000); set(145)('J', 120000);   // Total des charges
set(153)('G', 25000);   // Montant subvention sollicitée (R153, valeur en G)
const s = parseDossierFile(XLSX.write(wb,{type:'buffer',bookType:'xlsx'})).situationFinanciere;
console.log('\n--- SITUATION ---');
console.log('charges2025=' + s.totalCharges2025 + ', 2026=' + s.totalCharges + ', 2027=' + s.totalCharges2027 + ' (want 100000/110000/120000)');
console.log('subSolicitee=' + s.montantSubventionSollicitee + ' (want 25000)');

// ---- Autres subventions ----
set(160)('D', 3000); set(160)('F', 3500); set(160)('H', 4000); set(160)('J', 'Fonctionnement');
const a = parseDossierFile(XLSX.write(wb,{type:'buffer',bookType:'xlsx'})).autresSubventions;
console.log('\n--- AUTRES SUBVENTIONS ---');
console.log('fin=' + JSON.stringify(a[0] && a[0].financeur) + ', accorde25=' + (a[0]&&a[0].montantAccorde2025) + ', sollicite27=' + (a[0]&&a[0].montantSollicite2027) + ', objet=' + JSON.stringify(a[0]&&a[0].objetFinancement));

// ---- Pièces ----
const pc = parseDossierFile(XLSX.write(wb,{type:'buffer',bookType:'xlsx'})).pieces;
console.log('\n--- PIECES ---');
console.log('count=' + pc.length + ', first=' + JSON.stringify(pc[0] && pc[0].typePiece));