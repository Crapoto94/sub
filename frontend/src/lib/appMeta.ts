export interface ChangelogEntry {
  version: string;
  date: string;
  features: string[];
}

export const APP_VERSION = '0.1.0';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.0',
    date: '2026-08-05',
    features: [
      'Socle technique Express 5 + React 18 + SQLite (démarrage via dev.bat)',
      'Authentification et gestion des comptes (compte admin local)',
      'Référentiel des associations sportives',
      'Dossiers de subvention : consultation type « classeur Excel » (10 rubriques, historique N-1 / Prévisionnel, exercices 2025-2027)',
      'Graphiques Recharts (adhérents, situation financière)',
      'Synthèse : vue d’ensemble, KPIs, répartition par statut',
      'Sommaire toujours visible avec scroll-spy',
      'Version affichée et notes de version',
    ],
  },
];
