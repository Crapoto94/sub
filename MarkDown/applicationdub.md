# Subventions — Document d'application

Application de gestion des **demandes de subvention de fonctionnement des associations sportives** de la Ville d'Ivry-sur-Seine.

Ce document est la **référence générale** de l'application : architecture, schéma de données, conventions, démarrage et versioning. Il est maintenu à jour au fil des évolutions.

---

## 1. Vue d'ensemble

- **Backend** : API REST Express 5 + SQLite (better-sqlite3), Swagger JSDoc sur `/docs`.
- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + Recharts (graphiques) + framer-motion (animations).
- **Base de données** : SQLite avec fichiers de migration SQL versionnés (`backend/src/db/migrations/`).
- **Authentification** : comptes locaux (bcrypt) ou Active Directory (APM/Hub DSI, non branché en dev). JWT porté en `Authorization: Bearer`.
- **Documentation API** : générée par Swagger UI (à `/api-docs` si montée — voir `server.js`).

### Démarrage en développement

```bat
dev.bat        :: lance backend (http://localhost:3261) + frontend (http://localhost:3260) dans 2 fenêtres
```

Ou manuellement :

```bat
cd backend && npm run dev      :: port 3261
cd frontend && npm run dev     :: port 3260
```

Peupler la base locale (2 associations + dossier 2027) :

```bat
cd backend && npm run seed
```

Vérifier l'intégrité des données seedées (accents, sections) :

```bat
cd backend && node scripts/verify-seed.js
```

---

## 2. Architecture backend

```
backend/src/
├── server.js                     :: montage Express, middlewares, routes
├── config/env.js                 :: variables d'environnement (DB_FILE, PORT, JWT_SECRET…)
├── db/
│   ├── sqlite.js                 :: wrapper better-sqlite3, application des migrations, WAL
│   ├── migrations/               :: 001 → 005 (SQL versionnés, appliqués dans l'ordre)
│   └── seed.js                   :: données de démonstration (idempotent, auto-réparation)
└── modules/
    ├── auth/                     :: login JWT, /me, logout
    ├── users/                    :: comptes + rôles (admin/membre), comptes locaux
    ├── associations/             :: référentiel des associations (section 1 du dossier)
    └── dossiers/                 :: dossiers de subvention + 9 sections + statistiques
```

Chaque module suit le même découpage : `*.repository.js` (SQL brut) → `*.service.js` (métier, mapping camelCase/snake_case) → `*.controller.js` (HTTP) → `*.routes.js` (routes + Swagger JSDoc).

### Migrations de base

| N° | Fichier | Contenu |
|----|---------|---------|
| 001 | `create_users.sql` | Table `users` (identité AD, rôle `admin`/`membre`). |
| 002 | `create_associations.sql` | Table `associations` = section 1 du dossier (identification). |
| 003 | `create_dossiers.sql` | Table `dossiers` + 9 tables de sections (2 → 10). |
| 004 | `add_local_accounts.sql` | `password_hash` sur `users` (comptes locaux bcrypt). |
| 005 | `add_historique.sql` | Colonnes d'historique : effectifs `_n1`/`_prev`, vie associative `_n1`, situation financière `_2025`/`_2027`. |

### Sections d'un dossier

| # | Section | Table | Multiple |
|---|---------|-------|----------|
| 1 | Identification | `associations` | non |
| 2 | Adhérents et licenciés | `dossier_effectifs` | non |
| 3 | Vie associative et bénévolat | `dossier_vie_associative` | non |
| 4 | Niveaux sportifs atteints | `dossier_niveaux_sportifs` | oui |
| 5 | Projets réalisés | `dossier_projets_realises` | oui |
| 6 | Projets prévus | `dossier_projets_prevus` | oui |
| 7 | Politique tarifaire | `dossier_politique_tarifaire` | oui |
| 8 | Situation financière | `dossier_situation_financiere` | non |
| 9 | Autres subventions / financements | `dossier_autres_subventions` | oui |
| 10 | Pièces justificatives | `dossier_pieces` | oui |
| 11 | Synthèse de l'association | *(générée)* | non |

### Endpoints API (`/api/v1`)

| Méthode | Chemin | Description |
|---------|--------|-------------|
| POST | `/auth/login` | Connexion (JWT). |
| GET | `/auth/me` | Utilisateur courant. |
| POST | `/auth/logout` | Déconnexion. |
| GET | `/users` · `/users/:id` | Liste / détail des comptes (admin). |
| POST | `/users` · PATCH `/users/:id` | Création / modification (admin). |
| GET | `/associations` · POST `/associations` | Liste (filtres `q`, pagination `limit/offset`) / création (admin). |
| GET | `/associations/:id` · PATCH `/associations/:id` | Détail / mise à jour (admin). |
| GET | `/dossiers` · POST `/dossiers` | Liste (filtres `annee`, `statut`, `q`) / création. |
| GET | `/dossiers/stats` | Statistiques annuelles (total, associations, par statut, montants sollicités/accordés). |
| GET | `/dossiers/consolidation` | Tableau « Synthèse Globale » (structure Consolidation.xlsx) recalculé à la volée depuis les dossiers (filtre `annee`). |
| GET | `/dossiers/consolidation/export` | Export Excel (`.xlsx`) du tableau de consolidation — titre/groupes fusionnés, ligne TOTAUX, formats numériques/%. |
| PUT | `/dossiers/:id/avis` | Enregistre une réponse libre de la Synthèse Globale (`colonne` ∈ ER→EY, `valeur` ; vide = suppression) dans `consolidation_avis`. |
| GET | `/dossiers/:id` | Détail dossier + toutes les sections. |
| PATCH | `/dossiers/:id` | Changement de `statut` / `dateDepot`. |
| PUT | `/dossiers/:id/sections/:section` | Écriture d'une section (upsert si unique, remplacement complet si multiple). |

---

## 3. Conventions générales

- **Référence de dossier** : `SUB-{année}-{associationId}-{id}` (ex. `SUB-2027-1-1`).
- **Statuts** (ordre du parcours) : `brouillon`, `depose`, `instruction`, `decision`, `accorde`, `refuse`.
- **Identifiant du créateur** : issu du JWT — `user.id ?? user.sub` (le JWT ne porte pas `id`, seulement `sub`).
- **Mapping API ↔ SQL** : le service dossiers centralise le mapping camelCase (API) → snake_case (SQL) dans `SECTION_API_MAP` ; toute nouvelle colonne doit y être déclarée.
- **Historique** : l'interface « classeur Excel » exige Saison N-1 / N / Prévisionnel et exercices 2025 / 2027 → stocké en **colonnes** (`_n1`, `_prev`, `_2025`, `_2027`), pas en lignes.
- **Consolidation (Synthèse Globale)** : la structure (groupes + 155 titres de colonnes) est reproduite dans `backend/src/modules/dossiers/consolidation.structure.js` depuis `DOCS/Consolidation.xlsx` ; `consolidation.js` recalcule chaque valeur depuis les dossiers (`service.list` → exclut les `brouillon`) à l'instant de la requête — jamais lue depuis le fichier Excel. Colonnes sans équivalent → « - ». Chaque cellule totale porte un type (`int`/`dec`/`eur`/`pct`/`evol`/`text`), repris des cellules de ligne.
- **Exports de la Synthèse Globale** : **Excel** généré côté backend (`consolidation-export.js`, dépendance `xlsx` déjà présente) ; **PDF** côté frontend via la boîte d'impression du navigateur (`export-consolidation-pdf.ts`, paysage A4, en-tête à deux niveaux) — pas de dépendance PDF ajoutée.
- **Colonnes ER à EY de la Synthèse Globale (saisie libre)** : bilan de la convention d'objectifs et avis de l'instructeur / de l'élu·e. Contrairement au reste du tableau, elles ne sont pas calculées : les valeurs sont saisies dans le tableau (`SectionSyntheseGlobale.tsx`, sauvegarde au `blur`) et stockées dans la table `consolidation_avis` (migration `007`, PK `(dossier_id, colonne)`, cascade sur le dossier). Colonnes valides centralisées dans `CONSOLIDATION_AVIS_COLONNES` (service backend + API frontend).
- **Sections multiples** : enregistrées par **remplacement complet** (PUT), pour coller au comportement « feuille Excel ».
- **Accents / encodage** : le seed est idempotent et **ré-écrit les champs des associations existantes** (auto-réparation après un premier seed exécuté avec un fichier corrompu — mojibake type `FÃ©dÃ©ration…`). Ne jamais réécrire les fichiers sources via PowerShell ici-string ; utiliser `node` pour vérifier (`scripts/verify-seed.js`).
- **Fichiers git** : ne jamais commiter la base (`backend/data/*.sqlite`), les `.env`, les artefacts TypeScript (`*.tsbuildinfo`) ni les documents métier en cours de retravail (`DOCS/`).

---

## 4. Architecture frontend

```
frontend/src/
├── api/                          :: clients axios (auth, users, associations, dossiers)
├── components/
│   ├── dossier/                  :: consultation d'un dossier
│   │   ├── DossierHeader.tsx     :: en-tête bleu #173F73, montant demandé, statut
│   │   ├── DossierToc.tsx        :: sommaire sticky (vertical lg+, barre horizontale < lg) + scroll-spy
│   │   ├── Section*.tsx          :: rubriques 1 → 10 (tableaux, Recharts)
│   │   └── format.ts             :: formatage fr-FR (€, %, dates, évolutions)
│   └── layout/                   :: AppLayout, Sidebar, WhatsNewModal
├── lib/appMeta.ts                :: APP_VERSION + CHANGELOG (notes de version)
├── pages/                        :: Synthèse, Dossiers, DossierAssociation, Associations, Utilisateurs, Login
└── types/subventions.ts          :: types des sections exposées
```

### Charte graphique

- Couleur institutionnelle : bleu foncé **`#173F73`** (en-têtes de dossier, sommaire).
- Page de consultation : pleine largeur **max 1800px**, fond gris très clair, **document blanc centré** (ombre légère, coins arrondis, padding) — fidèle à la spec `OpenCode_UI_Dossier_Subvention.md`.
- Évolutions : hausse **vert**, baisse **rouge**, stable **gris**.
- Graphiques : **Recharts** (Pie/Bar/Line/Composed).

### Routes

| Route | Page |
|-------|------|
| `/` | Synthèse (vue d'ensemble) |
| `/dossiers` | Liste des dossiers (filtres) |
| `/dossiers/:id` | Consultation d'un dossier |
| `/associations` | Référentiel des associations |
| `/administration/utilisateurs` | Gestion des comptes (admin) |
| `/login` | Connexion |

---

## 5. Versioning

La version de l'application est affichée **en haut à gauche** (sidebar) avec le bouton **« Quoi de neuf ? »** qui ouvre les notes de version.

- Version courante : **0.4.3** (`frontend/src/lib/appMeta.ts`).
- Convention de versionnage : **0.x.0** pour un nouveau module / grosse fonctionnalité, **0.0.x** pour une version mineure corrective ou légère amélioration — voir `manifest.md`.
- Chaque évolution majeure doit **incrémenter** `APP_VERSION` et **ajouter une entrée** dans `CHANGELOG` (version, date, liste des nouveautés), tout en mettant à jour ce document.

### Historique

**0.4.3 — 2026-09-21** : section 8 — scrollbars visibles et colonne « Notes » du tableau financier.

**0.4.2 — 2026-09-21** : section 8 (tableau financier) affiche toutes les lignes du fichier.

**0.4.1 — 2026-09-21** : Synthèse — barre de défilement épaisse, en-têtes en alternance bleu/rose.

**0.4.0 — 2026-09-21** : Synthèse Globale (consolidation des dossiers), section 11 et colonnes ER→EY éditables.

**0.3.0 — 2026-09-02** : Import Excel — création ou mise à jour d'un dossier de subvention (2027).

**0.2.2 — 2026-08-31** : ajout du CDC « Outil d'analyse et restitution 2027 » (documentation).

**0.2.1 — 2026-08-31** : accueil — ajout du logo Ville d'Ivry en haut à gauche.

**0.2.0 — 2026-08-24** : corbeille des dossiers — suppression logique, restauration et purge définitive.

**0.1.1 — 2026-08-24** : ajout des spécifications MarkDown (UI dossier, structure de base) au dépôt.

**0.1.0 — 2026-08-05** : socle technique, authentification, référentiel associations, dossiers de subvention (consultation type classeur Excel, 10 rubriques, historique), graphiques, synthèse, sommaire sticky, version + notes de version.

---

## 6. Documents de référence

- `MarkDown/Structure base.md` — CDC source (structure d'un dossier, 10 rubriques). *Lecture partielle (fichier tronqué à la ligne 75).*
- `C:\Users\machevalier\Downloads\OpenCode_UI_Dossier_Subvention.md` — spec UI de la consultation (design « classeur Excel »). *Lecture partielle (tronqué ~ligne 83).*
- Ce document (`applicationdub.md`) — référence générale de l'application.
