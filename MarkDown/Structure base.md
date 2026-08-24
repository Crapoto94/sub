# Cahier des charges - Base de données des dossiers de subventions sportives

## Objectif
Créer une application permettant aux associations sportives de déposer leur dossier annuel de demande de subvention.

## Structure générale

Association
└── Dossiers de subvention
    ├── 1. Identification de l'association
    ├── 2. Adhérents et licenciés
    ├── 3. Vie associative et bénévolat
    ├── 4. Niveaux sportifs atteints - Résultats
    ├── 5. Projets réalisés
    ├── 6. Projets prévus
    ├── 7. Politique tarifaire
    ├── 8. Situation financière
    ├── 9. Autres subventions et financements
    └── 10. Pièces justificatives

## 1. Identification de l'association
- nom_officiel_association
- sigle_abreviation
- objet_association
- adresse_siege_social
- code_postal
- ville
- email
- telephone
- site_web_reseaux_sociaux
- numero_rna
- numero_siren
- date_creation
- agrement_jeunesse_sports
- federation_sportive_affiliation
- disciplines_pratiquees
- numero_affiliation
- categorie_sportive

## 2. Adhérents et licenciés
### Répartition géographique
- ivryens
- non_ivryens

### Répartition par genre
- femmes
- hommes

### CSP
- salaries
- etudiants
- demandeurs_emploi
- retraites
- non_communique

### Tranches d'âge
- petite_enfance_0_5_ans
- enfance_6_14_ans
- adolescents_15_18_ans
- jeunes_19_29_ans
- adultes_30_59_ans
- seniors_60_74_ans
- grand_age_75_ans_et_plus

### Accessibilité
- personnes_en_situation_handicap
- beneficiaires_tarifs_reduits_sociaux

### Publics éloignés
- actions_publics_eloignes
- nombre_beneficiaires_passsport

## 3. Vie associative et bénévolat
- date_derniere_assemblee_generale
- reglement_interieur_a_jour
- benevoles_actifs
- salaries_permanents_etp
- salaries_cdd_cddu
- emplois_aides
- agents_mis_a_disposition
- vacataires_intervenants
- nombre_heures_benevoles
- montant_valorisation_benevolat
- actions_formations_realisees

## 4. Niveaux sportifs atteints - Résultats
- categorie_section
- niveau_sportif
- principaux_resultats_sportifs
- nombre_deplacements
- lieux_deplacements
- objectifs_sportifs_saison_suivante

## 5. Projets réalisés
- intitule
- description
- objectifs
- moyens_mis_en_oeuvre
- publics_vises

## 6. Projets prévus
- intitule
- description
- objectifs
- moyens_mis_en_oeuvre
- publics_vises

## 7. Politique tarifaire
- categorie_cotisation
- cotisation_ivryens
- cotisation_non_ivryens
- nombre_adherents
- montant_total_estime

## 8. Situation financière
- total_charges
- total_produits
- subvention_ville
- resultat_net
- tresorerie_disponible
- fonds_propres_reserves
- montant_subvention_sollicitee
- justification_montant_demande

## 9. Autres subventions et financements
- financeur
- montant_accorde_2025
- montant_accorde_2026
- montant_sollicite_2027
- objet_financement

## 10. Pièces justificatives
- type_piece
- fichier
- date_depot
- valide

# Exemple de fiche association

## Cercle des Nageurs d'Ivry

### Identification
- Fédération Française de Natation
- Création : 1968
- 564 adhérents

### Effectifs
- Ivryens : 438
- Non Ivryens : 126
- Femmes : 258
- Hommes : 306

### Ressources humaines
- 34 bénévoles
- 3,8 ETP salariés
- 3420 heures de bénévolat

### Situation financière 2026
- Charges : 236 000 €
- Produits : 238 500 €
- Résultat : +2 500 €

### Subvention demandée 2027
- 95 000 €
