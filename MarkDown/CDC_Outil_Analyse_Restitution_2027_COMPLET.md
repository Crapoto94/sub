# Cahier des charges
## Outil d'analyse et de restitution des demandes de subvention de fonctionnement
### Campagne 2027

**Commanditaire :** Direction des Sports - Ville d'Ivry-sur-Seine  
**Destinataire :** Direction des Systèmes d'Information (DSI)

---

# 1. Résumé exécutif

La Direction des Sports instruit chaque année les demandes de subvention de fonctionnement des associations sportives de la Ville. L'objectif du présent projet est d'automatiser l'extraction, le contrôle, la consolidation et la restitution analytique des données contenues dans les dossiers de demande de subvention.

L'outil doit permettre :

- d'extraire automatiquement les données ;
- de contrôler leur cohérence ;
- de consolider les informations ;
- de générer des analyses rédigées ;
- de produire une synthèse globale.

L'outil ne remplace ni l'instructeur ni la décision municipale mais prépare l'analyse et en améliore la fiabilité.

---

# 2. Contexte

Depuis la dissolution de l'USI Omnisports en 2024, la Direction des Sports assure le suivi direct des associations sportives.

La campagne 2027 s'appuie sur les documents suivants :

- dossier de demande de subvention ;
- tableau financier ;
- bilan de convention d'objectifs ;
- guide du demandeur ;
- tableau des aides en nature.

Ces documents sont stabilisés et constituent la référence de l'outil.

---

# 3. Objectifs métier

## 3.1 Suppression des ressaisies
Toute donnée doit être saisie une seule fois par l'association.

## 3.2 Réduction du temps d'instruction
Préremplissage automatique des indicateurs et génération de commentaires.

## 3.3 Homogénéisation de l'analyse
Toutes les associations doivent être analysées selon la même méthodologie.

## 3.4 Traçabilité
Conservation des données extraites, contrôles réalisés et anomalies détectées.

---

# 4. Périmètre

## 4.1 Fichiers sources

### Dossier de demande
- identité
- adhérents
- publics prioritaires
- bénévolat
- vie associative
- niveaux sportifs
- projets
- tarifs
- financements

### Tableau financier
- charges
- produits
- résultats
- trésorerie
- fonds propres
- contributions volontaires en nature

### Bilan de convention d'objectifs
- objectifs
- actions
- résultats
- évaluation prévu/réalisé

### Tableau des aides en nature
- créneaux
- valorisation financière

## 4.2 Fichier cible

Production :
- fiche par association ;
- tableau global ;
- restitution analytique.

## 4.3 Population concernée

Environ 38 associations sportives et les nouveaux entrants.

## 4.4 Hors périmètre

- décision d'attribution ;
- arbitrages politiques ;
- rédaction finale des avis ;
- saisie initiale ;
- calcul de valorisation des aides en nature.

---

# 5. Architecture fonctionnelle

## Étape 1 - Identification

Identification via RNA, SIREN et code interne.

Le rapprochement par nom seul est interdit.

## Étape 2 - Extraction

Lecture automatisée des données sources.

## Étape 3 - Consolidation

Alimentation des fiches et tableaux de synthèse.

## Étape 4 - Contrôles

Détection des anomalies et incohérences.

## Étape 5 - Analyse

Production d'une analyse individuelle et d'une synthèse globale.

---

# 6. Gestion des identifiants

- code interne obligatoire ;
- nomenclature par catégorie sportive ;
- code stable dans le temps ;
- nouveaux entrants avec code provisoire ;
- exclusion des codes OpenSub.

---

# 7. Données à extraire

## Identité
- nom
- RNA
- SIREN
- coordonnées

## Effectifs
Répartition par :
- géographie
- sexe
- âge
- catégorie socioprofessionnelle

## Publics prioritaires
- femmes et jeunes filles
- personnes handicapées
- bénéficiaires Pass'Sport
- publics fragiles

## Vie associative
- assemblée générale
- gouvernance
- bénévoles

## Activité sportive
- disciplines
- niveaux
- résultats

## Projet associatif
- activité passée
- activité future

## Tarification
- cotisations
- réductions
- dispositifs solidaires

## Financements
- financements reçus
- financements demandés

---

# 8. Contrôles de cohérence

## Effectifs
Vérification des répartitions entre catégories.

## Cotisations
Contrôle du lien adhérents / cotisations.

## Produits
Contrôle des recettes de cotisation.

## Subventions
Comparaison montant déclaré / montant voté.

## Convention d'objectifs
Contrôle du seuil réglementaire de 23 000 € d'aides publiques cumulées.

---

# 9. Restitution analytique

L'analyse doit rester descriptive, factuelle et argumentée.

## Paragraphe 1 - Présentation
Présentation générale de l'association.

## Paragraphe 2 - Adhérents et licenciés
- évolution des effectifs
- part des Ivryens
- dynamique de développement

## Paragraphe 3 - Publics prioritaires
- inclusion
- égalité femmes/hommes
- accès au sport

## Paragraphe 4 - Niveaux sportifs
- niveau atteint
- progression
- résultats marquants

## Paragraphe 5 - Ressources humaines
- bénévoles
- salariés
- vacataires
- bénévolat valorisé

## Paragraphe 6 - Projet associatif
- projets réalisés
- projets futurs
- participation à la vie locale

## Paragraphe 7 - Politique tarifaire
- niveau de cotisation
- effort demandé aux familles
- modulations tarifaires

## Paragraphe 8 - Situation financière

### Equilibre
- excédents
- déficits

### Solidité
- trésorerie
- fonds propres

### Structure
- dépendance aux subventions
- poids des cotisations
- charges de personnel
- évolution sur 3 exercices
- effet de ciseau éventuel

Les charges et produits doivent être présentés dans l'ordre décroissant.

## Paragraphe 9 - Financements et subventions
- financements publics
- diversification
- dépendance à la Ville
- bénévolat valorisé
- convention d'objectifs

---

# 10. Synthèse globale

Analyse consolidée portant sur :

- les effectifs ;
- les publics prioritaires ;
- la santé financière ;
- la dépendance aux subventions ;
- les associations présentant des fragilités.

---

# 11. Règles de gestion

- jamais de rapprochement par nom seul ;
- aucune donnée inventée ;
- signalement des données manquantes ;
- seuils paramétrables ;
- distinction réel/prévisionnel ;
- respect des temporalités sportives et budgétaires.

---

# 12. Contraintes techniques

- lecture de fichiers Excel verrouillés ;
- absence de modification des sources ;
- accès aux valeurs et aux formules ;
- journalisation complète ;
- conformité RGPD ;
- traçabilité des opérations.

---

# 13. Livrables

1. Outil d'extraction et d'analyse.
2. Fichier de synthèse.
3. Restitution analytique.
4. Journal de traitement.
5. Table de correspondance.
6. Documentation utilisateur.

---

# 14. Validation

Validation sur dossiers pilotes :

- contrôle valeur par valeur ;
- vérification des recoupements ;
- test des anomalies ;
- vérification de la restitution ;
- généralisation après validation.
