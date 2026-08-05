const { setupDb } = require('../src/db/sqlite');
setupDb();
const assoc = require('../src/modules/associations/associations.service');
const svc = require('../src/modules/dossiers/dossiers.service');

const checks = [];
const check = (label, ok) => checks.push(`${label} => ${ok ? 'OK' : 'KO'}`);

const a = assoc.get(1);
check('nom CNI', a.nomOfficielAssociation === 'Cercle des Nageurs d’Ivry' || a.nomOfficielAssociation === "Cercle des Nageurs d'Ivry");
check('fédération CNI', a.federationSportiveAffiliation === 'Fédération Française de Natation');
check('objet CNI (école de natation)', a.objetAssociation.includes('école de natation'));
check('discipline CNI', a.disciplinesPratiquees.includes('water-polo, natation artistique'));

const b = assoc.get(2);
check('fédération FCI', b.federationSportiveAffiliation === 'Fédération Française de Football');
check('objet FCI', b.objetAssociation.includes('section féminine'));

const d = svc.get(1);
check('effectifs publics éloignés', d.sections.effectifs.actionsPublicsEloignes.includes('Séances') && d.sections.effectifs.actionsPublicsEloignes.includes('quartiers'));
check('niveau sportif', d.sections['niveaux-sportifs'][0].niveauSportif === 'National');
check('projet prévu (natation adaptée)', d.sections['projets-prevus'][0].intitule.includes('natation adaptée'));
check('tarif (jeunes 6-18)', d.sections['politique-tarifaire'][1].categorieCotisation === 'Jeunes (6-18 ans)');
check('pièce récépissé', d.sections.pieces[2].typePiece.includes('Récépissé'));
check('justification financière', d.sections['situation-financiere'].justificationMontantDemande.includes('Hausse'));

console.log(checks.join('\n'));
process.exit(checks.some((c) => c.endsWith('KO')) ? 1 : 0);
