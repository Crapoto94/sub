-- Historique des données par section pour la consultation type classeur Excel.
-- effectifs : Saison N-1 (_n1) et Prévisionnel (_prev) pour chaque indicateur.
ALTER TABLE dossier_effectifs ADD COLUMN ivryens_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN non_ivryens_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN femmes_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN hommes_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN salaries_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN etudiants_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN demandeurs_emploi_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN retraites_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN non_communique_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN petite_enfance_0_5_ans_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN enfance_6_14_ans_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN adolescents_15_18_ans_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN jeunes_19_29_ans_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN adultes_30_59_ans_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN seniors_60_74_ans_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN grand_age_75_ans_et_plus_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN personnes_en_situation_handicap_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN beneficiaires_tarifs_reduits_sociaux_n1 INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN nombre_beneficiaires_passsport_n1 INTEGER;

ALTER TABLE dossier_effectifs ADD COLUMN ivryens_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN non_ivryens_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN femmes_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN hommes_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN salaries_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN etudiants_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN demandeurs_emploi_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN retraites_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN non_communique_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN petite_enfance_0_5_ans_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN enfance_6_14_ans_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN adolescents_15_18_ans_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN jeunes_19_29_ans_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN adultes_30_59_ans_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN seniors_60_74_ans_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN grand_age_75_ans_et_plus_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN personnes_en_situation_handicap_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN beneficiaires_tarifs_reduits_sociaux_prev INTEGER;
ALTER TABLE dossier_effectifs ADD COLUMN nombre_beneficiaires_passsport_prev INTEGER;

-- Vie associative : RH en Saison N-1.
ALTER TABLE dossier_vie_associative ADD COLUMN benevoles_actifs_n1 INTEGER;
ALTER TABLE dossier_vie_associative ADD COLUMN salaries_permanents_etp_n1 REAL;
ALTER TABLE dossier_vie_associative ADD COLUMN salaries_cdd_cddu_n1 INTEGER;
ALTER TABLE dossier_vie_associative ADD COLUMN emplois_aides_n1 INTEGER;
ALTER TABLE dossier_vie_associative ADD COLUMN agents_mis_a_disposition_n1 INTEGER;
ALTER TABLE dossier_vie_associative ADD COLUMN vacataires_intervenants_n1 INTEGER;
ALTER TABLE dossier_vie_associative ADD COLUMN nombre_heures_benevoles_n1 INTEGER;

-- Situation financière : exercices 2025 (réalisé) et 2027 (prévisionnel).
ALTER TABLE dossier_situation_financiere ADD COLUMN total_charges_2025 REAL;
ALTER TABLE dossier_situation_financiere ADD COLUMN total_produits_2025 REAL;
ALTER TABLE dossier_situation_financiere ADD COLUMN subvention_ville_2025 REAL;
ALTER TABLE dossier_situation_financiere ADD COLUMN total_charges_2027 REAL;
ALTER TABLE dossier_situation_financiere ADD COLUMN total_produits_2027 REAL;
ALTER TABLE dossier_situation_financiere ADD COLUMN subvention_ville_2027 REAL;
