// Seed de démonstration : 2 associations avec un dossier de subvention 2027 complet.
// Usage : npm run seed  (ou  node src/db/seed.js)
// Idempotent : une association déjà présente (même SIREN) voit simplement ses sections ré-appliquées.
const { setupDb } = require('../db/sqlite');
const associationsRepo = require('../modules/associations/associations.repository');
const dossiersRepo = require('../modules/dossiers/dossiers.repository');

const DOSSIER_ANNEE = 2027;

// Noms de sections dans le CDC (snake_case) -> noms utilisés par le module dossiers.
const SECTION_KEYS = {
  effectifs: 'effectifs',
  vie_associative: 'vie-associative',
  niveaux_sportifs: 'niveaux-sportifs',
  projets_realises: 'projets-realises',
  projets_prevus: 'projets-prevus',
  politique_tarifaire: 'politique-tarifaire',
  situation_financiere: 'situation-financiere',
  autres_subventions: 'autres-subventions',
  pieces: 'pieces',
};

const ASSOCIATIONS = [
  {
    association: {
      nom_officiel_association: "Cercle des Nageurs d'Ivry",
      sigle_abreviation: 'CNI',
      objet_association:
        "La pratique de la natation sous toutes ses formes : école de natation, natation course, water-polo, natation artistique et aquagym, pour tous les publics.",
      adresse_siege_social: 'Complexe sportif du Plateau, 10 quai de la Seine',
      code_postal: '94200',
      ville: 'Ivry-sur-Seine',
      email: 'contact@cercle-nageurs-ivry.fr',
      telephone: '01 46 72 10 10',
      site_web_reseaux_sociaux: 'https://cercle-nageurs-ivry.fr',
      numero_rna: 'W943005684',
      numero_siren: '784356921',
      date_creation: '1968-04-15',
      agrement_jeunesse_sports: 'Oui (agrément JEP valable 5 ans)',
      federation_sportive_affiliation: 'Fédération Française de Natation',
      disciplines_pratiquees:
        'Natation course, water-polo, natation artistique, aquagym, école de natation',
      numero_affiliation: 'FFN-945210',
      categorie_sportive: 'Natation',
    },
    dossier: {
      effectifs: {
        ivryens: 438, non_ivryens: 126, femmes: 258, hommes: 306,
        salaries: 214, etudiants: 98, demandeurs_emploi: 62, retraites: 76, non_communique: 114,
        petite_enfance_0_5_ans: 42, enfance_6_14_ans: 136, adolescents_15_18_ans: 89,
        jeunes_19_29_ans: 74, adultes_30_59_ans: 158, seniors_60_74_ans: 51, grand_age_75_ans_et_plus: 14,
        personnes_en_situation_handicap: 18, beneficiaires_tarifs_reduits_sociaux: 87,
        actions_publics_eloignes:
          "Séances d'aisance aquatique dans les quartiers prioritaires (Ivanaj, Robespierre)",
        nombre_beneficiaires_passsport: 46,
        ivryens_n1: 421, non_ivryens_n1: 112, femmes_n1: 246, hommes_n1: 287,
        salaries_n1: 198, etudiants_n1: 92, demandeurs_emploi_n1: 58, retraites_n1: 72, non_communique_n1: 113,
        petite_enfance_0_5_ans_n1: 38, enfance_6_14_ans_n1: 128, adolescents_15_18_ans_n1: 85,
        jeunes_19_29_ans_n1: 70, adultes_30_59_ans_n1: 152, seniors_60_74_ans_n1: 48, grand_age_75_ans_et_plus_n1: 12,
        personnes_en_situation_handicap_n1: 16, beneficiaires_tarifs_reduits_sociaux_n1: 82,
        nombre_beneficiaires_passsport_n1: 41,
        ivryens_prev: 452, non_ivryens_prev: 128, femmes_prev: 268, hommes_prev: 312,
        salaries_prev: 222, etudiants_prev: 102, demandeurs_emploi_prev: 64, retraites_prev: 78, non_communique_prev: 114,
        petite_enfance_0_5_ans_prev: 44, enfance_6_14_ans_prev: 140, adolescents_15_18_ans_prev: 92,
        jeunes_19_29_ans_prev: 76, adultes_30_59_ans_prev: 162, seniors_60_74_ans_prev: 52, grand_age_75_ans_et_plus_prev: 14,
        personnes_en_situation_handicap_prev: 20, beneficiaires_tarifs_reduits_sociaux_prev: 92,
        nombre_beneficiaires_passsport_prev: 50,
      },
      vie_associative: {
        date_derniere_assemblee_generale: '2026-12-05',
        reglement_interieur_a_jour: 1,
        benevoles_actifs: 34, benevoles_actifs_n1: 32,
        salaries_permanents_etp: 3.8, salaries_permanents_etp_n1: 3.5,
        salaries_cdd_cddu: 2, salaries_cdd_cddu_n1: 2,
        emplois_aides: 1, emplois_aides_n1: 1,
        agents_mis_a_disposition: 0, agents_mis_a_disposition_n1: 0,
        vacataires_intervenants: 8, vacataires_intervenants_n1: 6,
        nombre_heures_benevoles: 3420, nombre_heures_benevoles_n1: 3180,
        montant_valorisation_benevolat: 34200,
        actions_formations_realisees:
          'Formation BNSSA pour 4 surveillants de bassin ; formation PSC1 pour 12 bénévoles ; formation de cadres pour 5 jeunes.',
      },
      niveaux_sportifs: [
        {
          categorie_section: 'Natation course', niveau_sportif: 'National',
          principaux_resultats_sportifs:
            '1 titre de champion de France masters, 3 podiums aux championnats régionaux, 12 records du club battus',
          nombre_deplacements: 12, lieux_deplacements: 'Ligue Île-de-France, championnat de France à Nîmes',
          objectifs_sportifs_saison_suivante: 'Qualification de 2 nageurs aux championnats de France élite',
        },
        {
          categorie_section: 'Water-polo', niveau_sportif: 'Régional',
          principaux_resultats_sportifs:
            '2e du championnat régional, demi-finale de la coupe du Val-de-Marne',
          nombre_deplacements: 8, lieux_deplacements: "Piscines d'Île-de-France",
          objectifs_sportifs_saison_suivante: 'Maintien en régional, visée National 3',
        },
        {
          categorie_section: 'École de natation', niveau_sportif: 'Départemental',
          principaux_resultats_sportifs: "450 enfants formés au savoir-nager (test Pass'Nage)",
          nombre_deplacements: 0, lieux_deplacements: '',
          objectifs_sportifs_saison_suivante: "Poursuite du dispositif 'J'apprends à nager' dans les écoles",
        },
      ],
      projets_realises: [
        {
          intitule: 'Aisance aquatique dans les quartiers',
          description:
            "Dispositif d'apprentissage de la natation dans les quartiers prioritaires (Ivanaj, Robespierre) pendant les vacances scolaires.",
          objectifs: "Réduire les inégalités d'accès à l'eau et les risques de noyade",
          moyens_mis_en_oeuvre: '4 maîtres-nageurs, 12 créneaux bassin, 60 places',
          publics_vises: 'Enfants de 6 à 12 ans des quartiers prioritaires',
        },
        {
          intitule: 'Challenge interassociations du Val-de-Marne',
          description: 'Rencontre sportive entre les clubs de natation du département.',
          objectifs: "Favoriser l'esprit sportif et la mixité sociale",
          moyens_mis_en_oeuvre: 'Bénévoles, matériel de chronométrage, logistique Ville',
          publics_vises: 'Adhérents du club et associations invitées',
        },
        {
          intitule: "Opération J'apprends à nager",
          description: "Stage d'aisance aquatique en lien avec les écoles d'Ivry-sur-Seine.",
          objectifs: 'Amener 60 enfants de CE2 au savoir-nager',
          moyens_mis_en_oeuvre: '2 maîtres-nageurs, piscine municipale, bus scolaire',
          publics_vises: "Élèves de CE2 des écoles d'Ivry",
        },
      ],
      projets_prevus: [
        {
          intitule: 'Handi-Nat : natation adaptée',
          description:
            "Création d'une section de natation adaptée aux personnes en situation de handicap.",
          objectifs: 'Accessibilité et inclusion par le sport',
          moyens_mis_en_oeuvre: '1 éducateur spécialisé, matériel adapté, partenariat IME',
          publics_vises: 'Personnes en situation de handicap mental et moteur',
        },
        {
          intitule: 'Stage intensif de préparation aux compétitions nationales',
          description: 'Stage de 10 jours pendant les vacances de printemps.',
          objectifs: 'Préparer la qualification aux championnats de France',
          moyens_mis_en_oeuvre: '3 entraîneurs, 25 nageurs, encadrement médical',
          publics_vises: 'Nageurs compétiteurs du club',
        },
        {
          intitule: 'Tournoi international juniors de water-polo',
          description: "Organisation d'un tournoi de water-polo pour les équipes juniors.",
          objectifs: 'Rayonnement du club et du territoire',
          moyens_mis_en_oeuvre: 'Bénévoles, club house, partenaires locaux',
          publics_vises: 'Équipes juniors françaises et européennes',
        },
      ],
      politique_tarifaire: [
        { categorie_cotisation: 'Enfants (moins de 6 ans)', cotisation_ivryens: 190, cotisation_non_ivryens: 240, nombre_adherents: 42, montant_total_estime: 8080 },
        { categorie_cotisation: 'Jeunes (6-18 ans)', cotisation_ivryens: 220, cotisation_non_ivryens: 270, nombre_adherents: 136, montant_total_estime: 30820 },
        { categorie_cotisation: 'Adultes (19-59 ans)', cotisation_ivryens: 320, cotisation_non_ivryens: 370, nombre_adherents: 158, montant_total_estime: 52060 },
        { categorie_cotisation: 'Seniors (60 ans et plus)', cotisation_ivryens: 180, cotisation_non_ivryens: 220, nombre_adherents: 51, montant_total_estime: 9540 },
        { categorie_cotisation: 'Tarif familles', cotisation_ivryens: 580, cotisation_non_ivryens: 680, nombre_adherents: 20, montant_total_estime: 12000 },
      ],
      situation_financiere: {
        total_charges: 236000, total_produits: 238500, subvention_ville: 85000, resultat_net: 2500,
        tresorerie_disponible: 61500, fonds_propres_reserves: 120000,
        montant_subvention_sollicitee: 95000,
        justification_montant_demande:
          "Hausse des charges d'énergie et du personnel d'encadrement, investissement dans la section natation adaptée.",
        total_charges_2025: 224000, total_produits_2025: 226800, subvention_ville_2025: 82000,
        total_charges_2027: 244000, total_produits_2027: 246500, subvention_ville_2027: 95000,
      },
      autres_subventions: [
        { financeur: 'Département du Val-de-Marne', montant_accorde_2025: 20000, montant_accorde_2026: 21000, montant_sollicite_2027: 22000, objet_financement: 'Subvention de fonctionnement sport' },
        { financeur: 'Région Île-de-France', montant_accorde_2025: 12000, montant_accorde_2026: 12500, montant_sollicite_2027: 13000, objet_financement: 'Aide au développement du sport de haut niveau' },
        { financeur: 'Fédération Française de Natation', montant_accorde_2025: 8000, montant_accorde_2026: 8500, montant_sollicite_2027: 9000, objet_financement: 'Aide fédérale aux clubs' },
        { financeur: 'Agence Nationale du Sport', montant_accorde_2025: 15000, montant_accorde_2026: 16000, montant_sollicite_2027: 17000, objet_financement: "Pass'Sport et projets territoriaux" },
      ],
      pieces: [
        { type_piece: 'RIB du club', fichier: 'rib_cni.pdf', date_depot: '2026-12-15', valide: 1 },
        { type_piece: "Statuts de l'association", fichier: 'statuts_cni.pdf', date_depot: '2025-06-10', valide: 1 },
        { type_piece: 'Récépissé de déclaration (RNA)', fichier: 'recepisse_cni.pdf', date_depot: '2026-01-20', valide: 1 },
        { type_piece: 'Compte de résultat 2026', fichier: 'compte_resultat_cni_2026.pdf', date_depot: '2027-02-01', valide: 1 },
        { type_piece: "Rapport d'activité 2026", fichier: 'rapport_activite_cni_2026.pdf', date_depot: '2027-02-01', valide: 1 },
        { type_piece: 'Liste du bureau exécutif', fichier: 'bureau_cni.pdf', date_depot: '2026-12-05', valide: 1 },
        { type_piece: 'Dernier bilan', fichier: 'bilan_cni_2026.pdf', date_depot: '2027-02-01', valide: 1 },
        { type_piece: "Attestation d'assurance", fichier: 'assurance_cni.pdf', date_depot: '2026-09-30', valide: 0 },
      ],
    },
  },
  {
    association: {
      nom_officiel_association: "Football Club d'Ivry",
      sigle_abreviation: 'FCI',
      objet_association:
        'La pratique du football amateur sous toutes ses formes, de l’école de football aux équipes seniors, en passant par la section féminine et le futsal.',
      adresse_siege_social: 'Stade Léo Lagrange, 2 avenue Maurice Thorez',
      code_postal: '94200',
      ville: 'Ivry-sur-Seine',
      email: 'contact@fc-ivry.fr',
      telephone: '01 46 72 20 20',
      site_web_reseaux_sociaux: 'https://fc-ivry.fr',
      numero_rna: 'W943007412',
      numero_siren: '478591036',
      date_creation: '1975-09-01',
      agrement_jeunesse_sports: 'Oui (agrément JEP)',
      federation_sportive_affiliation: 'Fédération Française de Football',
      disciplines_pratiquees: 'Football, futsal, section féminine',
      numero_affiliation: 'FFF-945632',
      categorie_sportive: 'Football',
    },
    dossier: {
      effectifs: {
        ivryens: 331, non_ivryens: 81, femmes: 96, hommes: 316,
        salaries: 138, etudiants: 104, demandeurs_emploi: 86, retraites: 42, non_communique: 42,
        petite_enfance_0_5_ans: 0, enfance_6_14_ans: 152, adolescents_15_18_ans: 88,
        jeunes_19_29_ans: 92, adultes_30_59_ans: 64, seniors_60_74_ans: 16, grand_age_75_ans_et_plus: 0,
        personnes_en_situation_handicap: 12, beneficiaires_tarifs_reduits_sociaux: 108,
        actions_publics_eloignes: 'Ateliers football dans les quartiers prioritaires',
        nombre_beneficiaires_passsport: 38,
        ivryens_n1: 314, non_ivryens_n1: 74, femmes_n1: 88, hommes_n1: 300,
        salaries_n1: 132, etudiants_n1: 98, demandeurs_emploi_n1: 82, retraites_n1: 40, non_communique_n1: 36,
        petite_enfance_0_5_ans_n1: 0, enfance_6_14_ans_n1: 144, adolescents_15_18_ans_n1: 84,
        jeunes_19_29_ans_n1: 88, adultes_30_59_ans_n1: 60, seniors_60_74_ans_n1: 12, grand_age_75_ans_et_plus_n1: 0,
        personnes_en_situation_handicap_n1: 10, beneficiaires_tarifs_reduits_sociaux_n1: 101,
        nombre_beneficiaires_passsport_n1: 34,
        ivryens_prev: 338, non_ivryens_prev: 82, femmes_prev: 102, hommes_prev: 318,
        salaries_prev: 141, etudiants_prev: 106, demandeurs_emploi_prev: 88, retraites_prev: 44, non_communique_prev: 41,
        petite_enfance_0_5_ans_prev: 0, enfance_6_14_ans_prev: 156, adolescents_15_18_ans_prev: 90,
        jeunes_19_29_ans_prev: 94, adultes_30_59_ans_prev: 66, seniors_60_74_ans_prev: 14, grand_age_75_ans_et_plus_prev: 0,
        personnes_en_situation_handicap_prev: 14, beneficiaires_tarifs_reduits_sociaux_prev: 112,
        nombre_beneficiaires_passsport_prev: 42,
      },
      vie_associative: {
        date_derniere_assemblee_generale: '2026-11-21',
        reglement_interieur_a_jour: 1,
        benevoles_actifs: 28, benevoles_actifs_n1: 26,
        salaries_permanents_etp: 2.1, salaries_permanents_etp_n1: 2.0,
        salaries_cdd_cddu: 1, salaries_cdd_cddu_n1: 1,
        emplois_aides: 2, emplois_aides_n1: 1,
        agents_mis_a_disposition: 0, agents_mis_a_disposition_n1: 0,
        vacataires_intervenants: 5, vacataires_intervenants_n1: 4,
        nombre_heures_benevoles: 1980, nombre_heures_benevoles_n1: 1840,
        montant_valorisation_benevolat: 19800,
        actions_formations_realisees:
          "Formation d'éducateur fédéral pour 3 éducateurs ; formation CFF2 ; sensibilisation aux règles du jeu.",
      },
      niveaux_sportifs: [
        {
          categorie_section: 'Seniors A', niveau_sportif: 'Régional',
          principaux_resultats_sportifs: 'Maintien en Régional 1, 8e de finale de la coupe du Val-de-Marne',
          nombre_deplacements: 10, lieux_deplacements: "Départements d'Île-de-France",
          objectifs_sportifs_saison_suivante: 'Visée de montée en National 3',
        },
        {
          categorie_section: 'U19', niveau_sportif: 'Départemental',
          principaux_resultats_sportifs: 'Finaliste du championnat départemental',
          nombre_deplacements: 6, lieux_deplacements: 'Clubs du Val-de-Marne',
          objectifs_sportifs_saison_suivante: 'Podium départemental',
        },
        {
          categorie_section: 'U15', niveau_sportif: 'Départemental',
          principaux_resultats_sportifs: 'Titre départemental, qualification en coupe régionale',
          nombre_deplacements: 6, lieux_deplacements: '',
          objectifs_sportifs_saison_suivante: 'Défendre le titre',
        },
        {
          categorie_section: 'Vétérans', niveau_sportif: 'Local',
          principaux_resultats_sportifs: 'Tournoi annuel interne',
          nombre_deplacements: 2, lieux_deplacements: 'Ligue de Paris Île-de-France',
          objectifs_sportifs_saison_suivante: 'Pérenniser la section',
        },
      ],
      projets_realises: [
        {
          intitule: "Téléthon d'Ivry",
          description: "Organisation d'un tournoi caritatif au profit de l'AFM-Téléthon.",
          objectifs: 'Collecter des fonds et mobiliser le club',
          moyens_mis_en_oeuvre: 'Bénévoles, restauration, tombola',
          publics_vises: 'Public familial et partenaires',
        },
        {
          intitule: 'Stage football dans les quartiers',
          description: 'Stages gratuits de football pendant les vacances scolaires.',
          objectifs: 'Lien social et prévention',
          moyens_mis_en_oeuvre: '2 éducateurs diplômés, 40 places',
          publics_vises: 'Enfants 8-14 ans des quartiers prioritaires',
        },
        {
          intitule: 'Lancement de la section féminine U15',
          description: "Création d'une équipe féminine U15 engagée en championnat départemental.",
          objectifs: 'Développer le football féminin',
          moyens_mis_en_oeuvre: '1 éducatrice, équipements',
          publics_vises: 'Filles de 12 à 15 ans',
        },
      ],
      projets_prevus: [
        {
          intitule: "Création d'une équipe féminine seniors",
          description: "Engagement d'une équipe féminine seniors en District 1.",
          objectifs: 'Structuration du football féminin',
          moyens_mis_en_oeuvre: 'Recrutement, 2 éducateurs, budget équipement',
          publics_vises: 'Joueuses de 16 à 40 ans',
        },
        {
          intitule: 'Tournoi de Noël interquartiers',
          description: "Tournoi festif rassemblant les quartiers d'Ivry.",
          objectifs: 'Mixité et convivialité',
          moyens_mis_en_oeuvre: 'Salle municipale, bénévoles, goûters',
          publics_vises: 'Enfants et familles',
        },
        {
          intitule: 'Formation des éducateurs et encadrants',
          description: 'Formation CFF et BPJEPS pour 5 encadrants.',
          objectifs: 'Qualification du cadre associatif',
          moyens_mis_en_oeuvre: 'Budget formation, partenariat Ligue',
          publics_vises: 'Éducateurs et dirigeants bénévoles',
        },
      ],
      politique_tarifaire: [
        { categorie_cotisation: 'École de football (6-13 ans)', cotisation_ivryens: 110, cotisation_non_ivryens: 140, nombre_adherents: 152, montant_total_estime: 17380 },
        { categorie_cotisation: 'Jeunes (14-18 ans)', cotisation_ivryens: 150, cotisation_non_ivryens: 190, nombre_adherents: 88, montant_total_estime: 13760 },
        { categorie_cotisation: 'Seniors', cotisation_ivryens: 220, cotisation_non_ivryens: 280, nombre_adherents: 64, montant_total_estime: 14800 },
        { categorie_cotisation: 'Vétérans', cotisation_ivryens: 140, cotisation_non_ivryens: 180, nombre_adherents: 16, montant_total_estime: 2360 },
        { categorie_cotisation: 'Licence féminine', cotisation_ivryens: 120, cotisation_non_ivryens: 160, nombre_adherents: 96, montant_total_estime: 12240 },
      ],
      situation_financiere: {
        total_charges: 155000, total_produits: 158200, subvention_ville: 55000, resultat_net: 3200,
        tresorerie_disponible: 28400, fonds_propres_reserves: 65000,
        montant_subvention_sollicitee: 62000,
        justification_montant_demande:
          'Développement de la section féminine et formation des éducateurs et encadrants.',
        total_charges_2025: 147000, total_produits_2025: 149500, subvention_ville_2025: 52000,
        total_charges_2027: 159000, total_produits_2027: 161200, subvention_ville_2027: 62000,
      },
      autres_subventions: [
        { financeur: 'Département du Val-de-Marne', montant_accorde_2025: 15000, montant_accorde_2026: 16000, montant_sollicite_2027: 17000, objet_financement: 'Subvention de fonctionnement' },
        { financeur: 'Région Île-de-France', montant_accorde_2025: 8000, montant_accorde_2026: 8500, montant_sollicite_2027: 9000, objet_financement: 'Aide au sport de proximité' },
        { financeur: 'Fédération Française de Football', montant_accorde_2025: 5000, montant_accorde_2026: 5500, montant_sollicite_2027: 6000, objet_financement: 'Aide fédérale' },
        { financeur: 'Agence Nationale du Sport', montant_accorde_2025: 10000, montant_accorde_2026: 11000, montant_sollicite_2027: 12000, objet_financement: "Pass'Sport, équité territoriale" },
        { financeur: 'Ligue de Paris Île-de-France', montant_accorde_2025: 2000, montant_accorde_2026: 2500, montant_sollicite_2027: 3000, objet_financement: 'Aide à la formation des éducateurs' },
      ],
      pieces: [
        { type_piece: 'RIB du club', fichier: 'rib_fci.pdf', date_depot: '2026-12-15', valide: 1 },
        { type_piece: "Statuts de l'association", fichier: 'statuts_fci.pdf', date_depot: '2025-06-10', valide: 1 },
        { type_piece: 'Récépissé de déclaration (RNA)', fichier: 'recepisse_fci.pdf', date_depot: '2026-01-20', valide: 1 },
        { type_piece: 'Compte de résultat 2026', fichier: 'compte_resultat_fci_2026.pdf', date_depot: '2027-02-01', valide: 1 },
        { type_piece: "Rapport d'activité 2026", fichier: 'rapport_activite_fci_2026.pdf', date_depot: '2027-02-01', valide: 1 },
        { type_piece: 'Liste du bureau exécutif', fichier: 'bureau_fci.pdf', date_depot: '2026-11-21', valide: 1 },
        { type_piece: 'Dernier bilan', fichier: 'bilan_fci_2026.pdf', date_depot: '2027-02-01', valide: 1 },
        { type_piece: 'Liste des éducateurs diplômés', fichier: 'educateurs_fci.pdf', date_depot: null, valide: 0 },
        { type_piece: "Attestation d'assurance", fichier: 'assurance_fci.pdf', date_depot: '2026-09-30', valide: 1 },
      ],
    },
  },
];

function seedOne({ association, dossier }) {
  const existing = associationsRepo.listAssociations({ q: association.numero_siren, limit: 5, offset: 0 });
  const found = existing.items.find((a) => a.numero_siren === association.numero_siren);
  let asso;
  if (found) {
    asso = associationsRepo.update(found.id, association);
    console.log(`[SEED] Association déjà présente (SIREN ${association.numero_siren}) : ${association.nom_officiel_association} — champs et sections ré-appliqués`);
  } else {
    asso = associationsRepo.create(association);
    console.log(`[SEED] Association créée : ${association.nom_officiel_association}`);
  }

  let d = dossiersRepo.findByAssociationAndYear(asso.id, DOSSIER_ANNEE);
  if (!d) {
    d = dossiersRepo.createDossier({ associationId: asso.id, annee: DOSSIER_ANNEE, statut: 'depose', dateDepot: '2027-02-15', createdBy: null });
  }

  for (const [key, data] of Object.entries(dossier)) {
    const sectionName = SECTION_KEYS[key];
    if (!sectionName) throw new Error(`Section inconnue dans le seed : ${key}`);
    dossiersRepo.upsertSection(d.id, sectionName, data);
  }
  console.log(`[SEED] Dossier ${d.reference} (${asso.nom_officiel_association}) à jour.`);
  return asso;
}

function main() {
  setupDb();
  for (const entry of ASSOCIATIONS) {
    seedOne(entry);
  }
  console.log('[SEED] Terminé.');
}

if (require.main === module) {
  main();
}

module.exports = { main };
