export interface ChangelogEntry {
  version: string;
  date: string;
  features: string[];
}

export const APP_VERSION = '0.5.3';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.5.3',
    date: '2026-10-04',
    features: [
      'Liste des dossiers : colonne « Qualité des données » au regard de l’API Entreprise (score 0-100 et niveau Conformes / À vérifier / Écarts critiques / Non évalué)',
      'Qualification pondérée : les champs structurants (SIREN, RNA, nom officiel, date de création) pèsent plus lourd dans le score',
      'Filtre par niveau de qualité et bouton « Actualiser la qualité » (recalcul depuis l’API Entreprise)',
      'La qualité est aussi exposée sur le détail d’un dossier',
    ],
  },
  {
    version: '0.5.2',
    date: '2026-10-04',
    features: [
      'Contrôle API Entreprise : affichage explicite de la requête effectuée (endpoint, identifiant, périmètre, résultat) pour la rubrique 9',
      'Distinction claire entre « aucune donnée API » et « subvention non confirmée » (absence ≠ contradiction), avec détail par dispositif détecté (ANS, FDVA…)',
    ],
  },
  {
    version: '0.5.1',
    date: '2026-10-04',
    features: [
      'Contrôle API Entreprise : comparaison de la rubrique 9 « autres subventions » (dossier) avec les subventions État / opérateurs (DataSubvention), ligne par ligne',
      'Marquage des financeurs rattachables à l’API (ANS, FDVA, Service civique) et alerte quand un montant déclaré n’est pas confirmé par l’API',
      'Nouveaux champs exploités : régime, groupement, utilité publique, éligibilité CEC, impôts commerciaux, objet social (code RNA), champ d’action territorial, réseaux/affiliations, adresse de gestion',
      'Liste des établissements (DJEPVA/INSEE) : SIRET, adresse, rôle (siège/secondaire), état (actif/fermé)',
    ],
  },
  {
    version: '0.5.0',
    date: '2026-10-04',
    features: [
      'Nouveau module « Contrôle API Entreprise » : confrontation des données de chaque association (INSEE, DJEPVA/RNA, DataSubvention) à la base locale',
      'Détection automatique des écarts : SIREN invalide ou mal formé, dates de création divergentes, nom / RNA / adresse non concordants',
      'Vue champ par champ (base locale vs API), avec statut Conforme / Écart / Local seul / API seul / Hors périmètre API',
      'Mise en évidence des données fournies par l’API et absentes de la base (SIRET, forme juridique, NAF, effectif, ESS…)',
      'Consultation des subventions État / opérateurs (rubrique 9) et des points d’attention par association',
    ],
  },
  {
    version: '0.4.4',
    date: '2026-09-22',
    features: [
      'Import : le fichier « Tableau financier » est désormais obligatoire (mention rouge dans le menu Importer)',
      'Import : contrôle à la saisie — il faut sélectionner le dossier de demande et le tableau financier avant de lancer l\'import',
      'Administration : suppression des comptes utilisateurs (bouton « Supprimer ») — désactivation historisée avec date, heure et auteur, puis réactivation possible',
      'Administration : historique des suppressions / réactivations consultable pour chaque compte (bouton « Historique »)',
    ],
  },
  {
    version: '0.4.3',
    date: '2026-09-21',
    features: [
      'Section 8 (tableau financier) : scrollbars toujours visibles pour naviguer dans le détail du fichier',
      'Ajout de la colonne « Notes / Justifications » du tableau financier, affichée dans la rangée et en info-bulle du libellé',
    ],
  },
  {
    version: '0.4.2',
    date: '2026-09-21',
    features: [
      'Section 8 (tableau financier) : affichage de toutes les lignes du fichier, avec défilement vertical et horizontal dans une zone dédiée',
    ],
  },
  {
    version: '0.4.1',
    date: '2026-09-21',
    features: [
      'Synthèse Globale : barre de défilement épaissie à 96 px et barre horizontale flottante synchronisée en bas du tableau',
      'Synthèse Globale : en-têtes en alternance bleu ciel / rose clair pour distinguer les groupes',
    ],
  },
  {
    version: '0.4.0',
    date: '2026-09-21',
    features: [
      'Synthèse Globale : tableau de consolidation recalculé à la volée (14 groupes, 155 colonnes A→EY) depuis les dossiers (hors brouillons)',
      'Rubrique 11 : synthèse rédigée automatiquement par dossier (compte-rendu par rubrique + appréciation), sans donnée inventée',
      'Colonnes ER → EY saisies en libre (bilan convention d\'objectifs, avis instructeur / élu·e), enregistrées à la sortie du champ',
      'Contrôle du seuil réglementaire de 23 000 € d\'aides publiques cumulées (bilan de convention à compléter au-delà)',
      'Export Excel (.xlsx) du tableau de consolidation et export PDF via l\'impression navigateur (A4 paysage)',
    ],
  },
  {
    version: '0.3.0',
    date: '2026-09-02',
    features: [
      'Module Import Excel : création ou mise à jour d\'un dossier de subvention (exercice 2027)',
      'Lecture de 3 fichiers : dossier de demande (obligatoire), tableau financier (obligatoire) et bilan de convention d\'objectifs (optionnel)',
      'Parsing automatique des rubriques 1 à 10, détail du tableau financier (charges/produits, indicateurs, contributions) et bilan CPO',
      'Rapprochement de l\'association par RNA, puis SIREN, puis nom exact — un dossier par association et par an',
      'Passage automatique du statut « brouillon » à « déposé » dès qu\'une section est enregistrée',
      'Limites contrôlées : 10 Mo par fichier, 3 fichiers maximum, année de campagne au choix (2025-2027)',
    ],
  },
  {
    version: '0.2.2',
    date: '2026-08-31',
    features: [
      'Documentation : ajout du cahier des charges « Outil d\'analyse et de restitution 2027 » (exigences de restitution analytique et de synthèse globale)',
    ],
  },
  {
    version: '0.2.1',
    date: '2026-08-31',
    features: [
      'Accueil : ajout du logo Ville d\'Ivry en haut à gauche de la barre latérale',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-08-24',
    features: [
      'Corbeille des dossiers : suppression logique avec traçabilité (date et auteur de la suppression)',
      'Restauration des dossiers supprimés, sous réserve de l\'unicité dossier / association / année',
      'Purge définitive (efface aussi les sections du dossier), réservée aux administrateurs',
    ],
  },
  {
    version: '0.1.1',
    date: '2026-08-24',
    features: [
      'Documentation : ajout des spécifications MarkDown (UI « classeur Excel » d\'un dossier et structure de la base) au dépôt',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-08-05',
    features: [
      'Socle technique Express 5 + React 18 + SQLite (backend :3261, frontend :3260, démarrage via dev.bat)',
      'Authentification JWT : comptes locaux (bcrypt) ou Active Directory via l\'APM, rôles admin / membre, session 8 h',
      'Référentiel des associations sportives',
      'Dossiers de subvention : consultation type « classeur Excel » (10 rubriques, historique N-1 / Prévisionnel, exercices 2025-2027)',
      'Graphiques Recharts (adhérents, situation financière)',
      'Synthèse : vue d\'ensemble, KPIs, répartition par statut',
      'Sommaire toujours visible avec scroll-spy',
      'API documentée (Swagger /api-docs), endpoint de santé /api/status',
      'Version affichée et notes de version (« Quoi de neuf ? »)',
    ],
  },
];