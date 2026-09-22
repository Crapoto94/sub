# manifest.md — La « bible » de l'application Subventions

**Application :** Subventions — gestion des demandes de subvention de fonctionnement des **associations sportives de la Ville d'Ivry-sur-Seine**.

**Portée :** automate l'extraction, le contrôle, la consolidation et la restitution analytique des dossiers de demande de subvention (campagne **2027**). L'outil ne remplace ni l'instructeur ni la décision municipale : il **prépare l'analyse et en améliore la fiabilité**.

Ce document est la **référence unique** de l'application : il consolide les exigences du cahier des charges (CCTP), la stack technique, les conventions de la DSI, et **toutes les règles métier, techniques et fonctionnelles** en vigueur dans le code.

---

## 1. Sources du projet (inputs)

| Document | Rôle |
|---|---|
| `MarkDown/CDC_Outil_Analyse_Restitution_2027_COMPLET.md` | **CCTP** — cahier des charges « Outil d'analyse et de restitution des demandes de subvention de fonctionnement », campagne 2027. Référence fonctionnelle (objectifs, périmètre, données à extraire, contrôles, restitution analytique, synthèse globale). |
| `MarkDown/Structure base.md` | CDC de la base — structure 10 rubriques d'un dossier + exemple (Cercle des Nageurs d'Ivry). |
| `MarkDown/OpenCode_UI_Dossier_Subvention.md` | Spec UI — consultation d'un dossier « type classeur Excel », charte, composants. |
| `GUIDE_NOUVELLE_APP_VILLE.md` | Guide DSI — stack obligatoire, config `.env`, API centrale APM, API Hub DSI, bonnes pratiques. |
| `applicationdub.md` | Document d'application — architecture, schéma, versioning (complément de ce manifest). |
| Repo GitHub `Crapoto94/sub` | Historique des commits → source du versionnage (section 3). |

### Règles héritées du CCTP (engagements fonctionnels)

- **Suppression des ressaisies** : une donnée est saisie une seule fois par l'association.
- **Réduction du temps d'instruction** : préremplissage automatique des indicateurs et génération de commentaires.
- **Homogénéisation de l'analyse** : toutes les associations analysées selon la même méthodologie.
- **Traçabilité** : conservation des données extraites, contrôles réalisés, anomalies détectées, opérations journalisées.
- **Identification** : RNA, SIREN et code interne ; **le rapprochement par nom seul est interdit** (exception tolérée à l'import : RNA > SIREN > nom exact).
- **Règles de gestion** : jamais de rapprochement par nom seul ; aucune donnée inventée ; signalement des données manquantes ; seuils paramétrables ; distinction **réel / prévisionnel** ; respect des temporalités sportives et budgétaires.
- **Restitution analytique** : analyse **descriptive, factuelle et argumentée** (9 paragraphes : présentation, adhérents, publics prioritaires, niveaux sportifs, ressources humaines, projet, politique tarifaire, situation financière, financements). Charges et produits présentés en **ordre décroissant**.
- **Hors périmètre** : décision d'attribution, arbitrages politiques, rédaction finale des avis, saisie initiale, calcul de valorisation des aides en nature.
- **Contraintes techniques** : lecture de fichiers Excel verrouillés, non-modification des sources, journalisation complète, conformité RGPD.

### Périmètre population

- ~**38 associations sportives** + nouveaux entrants ; codes stables (code interne obligatoire, nomenclature par catégorie sportive, code provisoire pour les entrants, exclusion des codes OpenSub).
- **Seuil réglementaire** de convention d'objectifs : **23 000 €** d'aides publiques cumulées (Bilan de convention — CPO obligatoire au-delà).

---

## 2. Stack technique & architecture

### Stack (guide DSI + différences assumées)

- **Backend** : Node.js + **Express 5**, `better-sqlite3`, `jsonwebtoken`, `axios`, `cors`, `dotenv`, `express-rate-limit`, `swagger-jsdoc` + `swagger-ui-express`, `bcryptjs`, `multer`, `xlsx`.
- **Frontend** : **React 18** + **TypeScript** + **Vite** + **Tailwind CSS**, `react-router-dom`, `axios`, `recharts`, `lucide-react`, `framer-motion`.
- **Différence assumée vs guide** : base locale **SQLite 3** (et non le PostgreSQL partagé de la Ville) — voir README.
- **Ports** : frontend **3260**, backend **3261**.

### Organisation backend (`backend/src/`)

```
server.js                    # montage Express, CORS, JSON, Swagger (/api-docs), seed local admin
config/env.js                # TOUTE la configuration centralisée (lecture .env, aucun secret en dur)
db/sqlite.js                 # wrapper better-sqlite3, WAL, foreign_keys=ON, migrations versionnées
db/migrations/               # 001 → 008, appliquées dans l'ordre (table schema_migrations)
db/seed.js                   # données de démonstration (idempotente)
services/apm.js              # API centrale APM (authentification AD) — X-API-KEY, timeout 10 s
services/hubdsi.js           # client API Hub DSI (clé dsk_…) — déclaré mais non utilisé
middlewares/                 # authRequired, adminRequired, errorHandler
modules/
  auth/  users/  associations/  dossiers/  import/  system/
```

Chaque module suit le découpage : `*.repository.js` (SQL brut) → `*.service.js` (métier, mapping camelCase↔snake_case) → `*.controller.js` (HTTP) → `*.routes.js` (routes + Swagger JSDoc).

### Frontend (`frontend/src/`)

```
api/              # client axios (baseURL VITE_API_URL || http://localhost:3261) + modules par ressource
context/AuthContext.tsx   # localStorage 'sub_token', login/fetchMe/logout
components/layout/        # AppLayout, Sidebar (logo Ivry, version, « Quoi de neuf ? »), WhatsNewModal
components/dossier/       # DossierHeader, DossierToc, DossierSection + Section{1..11}, format, exports
pages/                    # Synthèse, Dossiers, Import, DossierAssociation, Associations, Users, Login
lib/appMeta.ts            # APP_VERSION + CHANGELOG (notes de version) → « Quoi de neuf ? »
types/subventions.ts      # types des sections
```

### Conteneurisation & déploiement

- `docker-compose.yml` : services `backend` + `frontend`, `restart: always`, `VITE_API_URL` injectée au build, volume `sub_data` pour la base SQLite.
- Reverse-proxy prévu pour une exposition en `https://…ivry.local` (jamais en IP:port).
- Santé : `GET /api/status` (DB + état APM/Hub DSI).

---

## 3. Convention de versionnage

Format utilisé : **0.MINOR.PATCH** (stade instable, majeure fixée à 0).

- **0.x.0** — mise à jour avec nouveau module ou grosse fonctionnalité : on incrémente le **mineur** (`x`).
- **0.0.x** — version mineure corrective ou légère amélioration : on incrémente la **corrective** (`x`).

### Règles d'application

- La **version courante** est définie dans `frontend/src/lib/appMeta.ts` (`APP_VERSION`) et reflétée côté backend (`/api/status`, Swagger `server.js`) et dans les `package.json`/`package-lock.json` (backend + frontend), ainsi que dans `applicationdub.md`.
- Toute évolution doit **incrémenter** la version selon la convention ci-dessus et **ajouter une entrée détaillée** dans `CHANGELOG` (version, date, liste des nouveautés).
- Le **« Quoi de neuf ? »** (WhatsNewModal) affiche les nouveautés de **chaque version**, de la plus récente à la plus ancienne, depuis `frontend/src/lib/appMeta.ts`.
- Le manifest (ce document) est la **bible** : toute règle nouvelle doit y être consignée.

### Historique des versions (analysé depuis les commits `Crapoto94/sub`)

- **0.4.3 – 2026-09-21** — Section 8 : scrollbars visibles et colonne « Notes » du tableau financier.
- **0.4.2 – 2026-09-21** — Section 8 : affichage de toutes les lignes du tableau financier.
- **0.4.1 – 2026-09-21** — Synthèse Globale : barre de défilement épaisse, barre horizontale flottante, en-têtes bleu/rose.
- **0.4.0 – 2026-09-21** — Synthèse Globale (consolidation), rubrique 11, colonnes ER→EY éditables.
- **0.3.0 – 2026-09-02** — Import Excel (création/mise à jour dossier 2027).
- **0.2.2 – 2026-08-31** — Ajout du CDC « Outil d'analyse et restitution 2027 ».
- **0.2.1 – 2026-08-31** — Logo Ville d'Ivry (sidebar).
- **0.2.0 – 2026-08-24** — Corbeille des dossiers (migration 006).
- **0.1.1 – 2026-08-24** — Spécifications MarkDown (UI, structure base) au dépôt.
- **0.1.0 – 2026-08-05** — Socle technique initial.

---

## 4. Règles métier — Dossiers de subvention

### Statuts et cycle de vie

- Statuts (ordre du parcours) : `brouillon` → `depose` → `instruction` → `decision` → `accorde` | `refuse`.
- **Aucune transition n'est verrouillée** : `PATCH /api/v1/dossiers/:id` accepte tout statut valide.
- **Seule transition automatique** : à l'import Excel, un dossier `brouillon` passant au moins une section enregistrée passe `depose`.
- Création : statut par défaut `brouillon` ; `dateDepot` null si absent ; **un seul dossier par `(association_id, annee)`** (conflit → 409).
- Année : entier, **2000 ≤ annee ≤ 2100** (sinon 400).

### Référence de dossier

Format : **`SUB-{annee}-{associationId}-{id}`**, généré après l'insertion (unique en base).

### Sections d'un dossier (rubriques 1 à 11)

- La rubrique **1 Identification** est portée par la table `associations` (pas une section du dossier).
- Rubriques **2 à 10** : sections stockées ; la rubrique **11 « Synthèse »** est **générée à la volée** (jamais persistée).
- **Sections `single` (mise à jour partielle / upsert)** : `effectifs`, `vie-associative`, `situation-financiere`.
- **Sections multiples (remplacement complet par PUT)** : `niveaux-sportifs`, `projets-realises`, `projets-prevus`, `politique-tarifaire`, `tableau-financier`, `autres-subventions`, `pieces`.

| Clé API | Table | CDC | Single | Remarques |
|---|---|---|---|---|
| — (associations) | `associations` | 1 | – | identification |
| `effectifs` | `dossier_effectifs` | 2 | oui | indicateurs × N-1 (`_n1`) / N / Prévisionnel (`_prev`) |
| `vie-associative` | `dossier_vie_associative` | 3 | oui | RH ETP en REAL, valorisation bénévolat |
| `niveaux-sportifs` | `dossier_niveaux_sportifs` | 4 | non | badges Local→International |
| `projets-realises` | `dossier_projets_realises` | 5 | non | |
| `projets-prevus` | `dossier_projets_prevus` | 6 | non | badge « Prévu 2026-2027 » |
| `politique-tarifaire` | `dossier_politique_tarifaire` | 7 | non | |
| `situation-financiere` | `dossier_situation_financiere` | 8 | oui | exercices `_2025`/`_2027` |
| `tableau-financier` | `dossier_tableau_financier` | 8² | non | détail du fichier : types `titre/rubrique/ligne/sous-total/total` + `indicateur/benevole/meta` |
| `autres-subventions` | `dossier_autres_subventions` | 9 | non | financeur + 2025/2026/2027 |
| `pieces` | `dossier_pieces` | 10 | non | `valide` 0/1 |

> ⚠️ La doc Swagger de `PUT /:id/sections/:section` annonce un « remplacement complet », exact uniquement pour les sections multiples ; les sections `single` sont en mise à jour partielle.

### Exercices (campagne 2027)

- **N-1 = 2025** (réalisé), **N = 2026** (exercice courant), **N+1 = 2027** (prévisionnel / objet de la demande).
- Stockage en **colonnes** (suffixes `_n1`, `_prev`, `_2025`, `_2027`) — jamais en lignes.

### Corbeille (v0.2.0, migration 006)

- Suppression logique : `deleted_at = datetime('now')` + `deleted_by` (traçabilité).
- **Restaurer** (`POST /:id/restore`) : impossible (409) si un dossier actif existe déjà pour même asso/année (pas d'unicité SQL).
- **Purge** (`DELETE /:id/purge`) : suppression définitive, sections effacées en cascade.
- Routes corbeille/restore/purge : **admin uniquement**.

### Liste & stats

- Filtres `GET /api/v1/dossiers` : `annee`, `statut`, `q` (recherche `LIKE %q%` sur **référence** ou **nom d'association**), `limit` (1..200, défaut 50), `offset`. Exclut les dossiers supprimés ; tri `annee DESC, reference COLLATE NOCASE`.
- `GET /dossiers/stats` : total, associations distinctes, par statut, `subventions.sollicitees` (somme), `subventions.accordees` (somme **uniquement statut `accorde`**).

---

## 5. Synthèse Générale — consolidation (v0.4.0)

- Tableau **« CONSOLIDATION — ASSOCIATIONS SPORTIVES · CAMPAGNE 2027 »** : **14 groupes, 155 colonnes (A → EY)**, reproduit depuis `DOCS/Consolidation.xlsx` (`consolidation.structure.js`).
- **Recalculé à la volée** depuis les dossiers (jamais lu depuis un fichier) ; **les dossiers `brouillon` sont exclus** ; une ligne = une association/dossier ; une ligne **TOTAUX** recalcule les ratios sur les sommes.
- Signature de cellule `{ v, t }`, `t ∈ { text, int, evol, pct, eur, dec }` :
  - `evol` = `cur/prev − 1` (précédent nul → null) ; `pct` = ratio brut (formaté `0.0%`) ; `eur` montants (format `#,##0`) ; `dec` (`0.0`).
- Grands principes de calcul (`buildRow`) :
  - Total adhérents = ivryens + non-ivryens, sinon femmes + hommes (N-1 / N / prévisionnel).
  - **Jeunes < 30 ans** = 0-5 + 6-14 + 15-18 + 19-29 ; **seniors** = 60-74 + 75+.
  - Nouvels sportifs comptés par `niveauSportif` (local/départemental/régional/national/international) ; cotisation moyenne = Σ montants / Σ adhérents.
  - **Aides publiques cumulées = subvention Ville 2026 + autres subventions 2026** → seuil `SEUIL_CONVENTION = 23000 €` : colonne EQ « Association conventionnée, bilan à compléter obligatoirement » OU « Section sans objet… ».
  - Résultat 2025/2027 = produits − charges ; résultat 2026 = celui saisi.
  - Colonnes sans source (années 2024, tranches fines, QPV/REP, licences…) → `null` → « - ».
- **Colonnes saisies libres ER → EY** : `CONSOLIDATION_AVIS_COLONNES = ['ER','ES','ET','EU','EV','EW','EX','EY']` (bilan convention d'objectifs + avis instructeur/élu·e). Stockées dans `consolidation_avis` (PK `(dossier_id, colonne)`, cascade), **sauvegarde au blur** dans le tableau, **valeur vide = suppression de l'entrée**. Validation : colonne en majuscules et dans la liste, sinon 400.
- **Export Excel** (`GET /dossiers/consolidation/export`) : feuille « Consolidation », titre fusionné, groupes fusionnés, formats numériques/%, largeurs (A/B = 22, autres = 12), fichier `Consolidation_{annee}.xlsx`.
- **Export PDF** : généré côté **frontend** via l'impression navigateur (`export-consolidation-pdf.ts` ; A4 paysage, en-tête 2 niveaux) — aucune dépendance PDF.

### Groupes de la consolidation

IDENTITÉ (5) · 2a EFFECTIFS (6) · 2b TERRITOIRE (8) · 2c GENRE (10) · 2d TRANCHES D'ÂGE / PART DE JEUNES (29) · 2f CATÉGORIES SOCIO-PRO (16) · 3 ACCESSIBILITÉ / PUBLICS PRIORITAIRES (17) · 4 NIVEAUX SPORTIFS (6) · 5 RESSOURCES HUMAINES (28) · 7 COTIS. (3) · 8 SITUATION FINANCIÈRE (9) · 9 FINANCEMENTS (9) · 10 BILAN CONVENTION D'OBJECTIFS (6) · ANALYSE & AVIS (3).

---

## 6. Rubrique 11 — Synthèse d'un dossier (génération)

`backend/src/modules/dossiers/synthese.js` génère le **compte-rendu rédigé** à chaque `GET /dossiers/:id`, **sans inventer de donnée** (une phrase n'est émise que si la donnée existe).

- **Introduction** : présentation de l'association, sigle, ville, fédération, référence et exercice.
- **Paragraphes (compte-rendu)** : effectifs (totaux, évolution vs 2025 : hausse ≥ +0,5 %, baisse ≤ −0,5 %, sinon stable ; publics prioritaires), vie associative (RH, AG, règlement intérieur), niveaux sportifs (niveaux + principaux résultats), projets réalisés/prévus, politique tarifaire (nb catégories, fourchette de cotisations, volume annuel), situation financière (charges/produits 2026, prévisionnel 2027, excédent/déficit, subvention municipale 2026, montant sollicité 2027), autres financements (montants 2026), pièces justificatives.
- **Appréciation** : complétude du dossier (pièces), proportionnalité du montant sollicité (**seuil : sollicité/produits > 0,5 → « soutenu », sinon « proportionné »**), équilibre financier, dynamique des effectifs (positive si ivryens N > ivryens N-1).
- La section **n'est pas affichée** (rend `null`) si tous les paragraphes sont vides → disparaît alors aussi du sommaire.

---

## 7. Import Excel (v0.3.0)

### Entrée

- `POST /api/v1/import/excel` (auth), multipart **mémoire**, **10 Mo max / fichier, 3 fichiers max**, champ `annee` (défaut **2027**).
- 3 fichiers (feuilles attendues) :
  1. `dossier` (**obligatoire**) — feuille « Dossier Demande Subvention ».
  2. `financier` (optionnel) — feuille « Tableau Financier ».
  3. `bilan` (optionnel) — feuille « Complément pour CPO ».

### Règles de parsing (extrait)

- **Identification** : champs pleine largeur en colonne G (repli D) ; paires (Code postal/Ville, Email/Téléphone, RNA/SIREN, Date création/Agrément, Disciplines/№ affiliation) avec valeur gauche en D, droite en J.
- **Effectifs** : colonnes `n1 = C` (2025), `n = E` (2026), `prev = H` (2027) ; **Pass'Sport : `_prev = N` (repli codé en dur)**.
- **Situation financière** : D=2025, G=2026, J=2027 ; « MONTANT DE LA SUBVENTION SOLLICITÉE POUR 2027 » + justification ligne suivante.
- **Tableau financier** : `TOTAL DES CHARGES / TOTAL DES PRODUITS / RÉSULTAT` en C=2025, D=2026, E=2027 ; blocs `▌CHARGES / ▌PRODUITS / ▌INDICATEURS / ▌CONTRIBUTIONS` (autres blocs hors périmètre) ; types `titre / rubrique / ligne / sous-total / total` ; **indicateurs automatiques calculés si vides** (part subventions = comptes `74…`, part cotisations = `70…`, taux de couverture charges/produits) ; période de référence (case ☒/☑/✔/✓/X) → `civile` ou `sportive` ; note légale conservée.
- **Bilan CPO** : lignes « Intitulé de l'action » + « Descriptif concret » (6 lignes suivantes) → `projetsRealises`.
- **Toilettage** : `str` trim ; `num` (gère « 1 234,56 € »), `bool` (`x/oui/yes/1/true/✓/☑` → 1 ; `non/no/0/false/☐` → 0) ; `findRowByLabel` (normalisation minuscules + glyphes ⚠ retirés + espaces unifiés ; égalité exacte puis préfixe).
- Parsers **lénients** : libellé absent → valeur null/vide silencieuse.

### Création / mise à jour

1. **Rapprochement association** : priorité **RNA > SIREN > nom exact** (sur `is_active = 1`) ; si trouvée, complète les champs vides ; sinon **crée** l'association (jamais de doublon volontaire).
2. Dossier `findByAssociationAndYear` : absent → création `brouillon` (`dateDepot` null, `createdBy = user.id ?? user.sub`).
3. Assemblage des sections (situation financière = **fusion** dossier + tableau financier ; tableau-financier = détail brut ; projets = dossier + bilan CPO ; pièces converties).
4. Écriture en **remplacement complet** pour les multiples.
5. **Statut** : `brouillon` + ≥ 1 section importée → **`depose`**.

### Erreurs connues

400 « Champ inconnu » · « Nom officiel de l'association absent du fichier » · « annee (2000-2100) est obligatoire » · « Le fichier du dossier de demande est obligatoire » · multer (fichier > 10 Mo, > 3 fichiers).

---

## 8. Authentification, comptes, rôles

- **Mode** (`AUTH_MODE`, défaut `apm`) : `apm` = authentification Active Directory via l'**APM** (`POST /api/v1/ad/authenticate`, header `X-API-KEY`) ; mode **local** (dev) si `AUTH_MODE=local` ou absence de clé APM → tout login accepté, compte auto-créé.
- **Login** : `POST /api/v1/auth/login` (rate limit **20 / 15 min**) — bcrypt si `password_hash` (compte local), sinon AD ; enrichissement `GET /api/v1/ad/user` best-effort.
- **JWT applicatif** : signé `{ sub, username, role }`, `JWT_SECRET` (défaut dev), expiration **8h** ; session gérée par le backend (pas de redemande de mot de passe).
- **Compte inactif** → 403 ; **admin initial** (`INITIAL_ADMIN_LOGIN`) auto-créé admin au premier login et **ré-promu admin à chaque login**.
- **Rôles** : `admin` / `membre`. Un admin **ne peut pas se retirer lui-même** le rôle admin. Mot de passe local : min **8** caractères, bcrypt cost 10. Comptes AD : pas de mot de passe stocké.
- **Seed** : compte local admin créé au démarrage depuis `LOCAL_ADMIN_USERNAME`/`LOCAL_ADMIN_PASSWORD` (idempotent).
- **Middlewares** : `authRequired` (401), `adminRequired` (403).

### Droits par route

- `GET /auth/me`, `GET/POST /associations`, `GET /associations/:id`, `GET/POST /dossiers*`, `PUT sections`, `PUT avis`, `GET consolidation*`, `GET stats`, `POST /import/excel` → **authentifié**.
- `POST/PATCH /associations` (création/MAJ), `POST/PATCH /users*`, `DELETE /dossiers/:id`, `GET /dossiers/corbeille`, `POST /:id/restore`, `DELETE /:id/purge` → **admin**.

---

## 9. Règles de données, bases, migrations

- **SQLite 3** (fichier `DB_FILE`, défaut `./data/sub.sqlite`), WAL, `foreign_keys = ON`.
- **Migrations versionnées** dans `backend/src/db/migrations/*.sql` (001 → 008), appliquées dans l'ordre via `schema_migrations`.
- **Ne jamais committer** : `backend/data/*.sqlite`, `.env`, artefacts TypeScript, `node_modules`, documents métier `DOCS/`.
- **Encodage UTF-8 partout** ; seed idempotent qui **ré-écrit les champs des associations existantes** (auto-réparation après mojibake) — ne jamais réécrire les sources via PowerShell ici-string.
- **Seed de démo** (`npm run seed`) : **Cercle des Nageurs d'Ivry** (SIREN 784356921, RNA W943005684) et **Football Club d'Ivry** (SIREN 478591036, RNA W943007412), chacune avec un **dossier 2027 `depose`** et toutes les sections remplies (effectifs, vie associative, niveaux 3-4, projets 3+3, tarifs 5 catégories, situation financière, tableau financier détaillé, autres subventions 4-5, pièces 8-9).

---

## 10. Règles techniques et d'API

### Configuration / environnement

- **Toutes les URLs, ports, clés et accès sont des paramètres** — jamais de valeur en dur (règle DSI impérative). Centralisées dans `backend/src/config/env.js`, lues depuis `.env` (non committé), documentées dans `.env.example`.
- Frontend : `VITE_API_URL` injectée **au build**.
- CORS restreint aux origines connues (`CORS_ORIGINS`, défaut `http://localhost:3260`). `express.json({ limit: '1mb' })`.

### API

- Routes **versionnées `/api/v1/...`** ; documentation **Swagger** (JSDoc) exposée sur `/api-docs` ; santé sur `/api/status`.
- Codes HTTP cohérents : 200/201/400/401/403/404/409/500 ; erreurs normalisées `{ error: message }` (les messages 500 internes sont masqués) ; `notFound` → 404 `{ error: 'Ressource introuvable' }`.
- Pagination `?limit=&offset=` (bornes : dossiers et associations 1..200, users 1..200).
- Requêtes SQL **paramétrées** uniquement ; inputs validés ; ne jamais logger de secret.

### Sécurité

- Secrets uniquement côté backend (`.env`) ; **le frontend ne connaît que l'URL de son propre backend**.
- Rate-limiting sur le login ; rotation des jetons ; uploads `multer` limités (10 Mo / 3 fichiers).

---

## 11. Règles frontend — charte graphique & UI

### Chart & UX (spec « classeur Excel »)

- **Philosophie** : reproduire l'expérience du dossier Excel original — mêmes sections, ordre, intitulés et tableaux ; **pas** de formulaire modernisé à onglets.
- Page **pleine largeur max 1800px**, fond `bg-slate-50`, **document blanc centré** (`border-slate-200 bg-white`, ombre légère, coins arrondis, padding important).
- **Couleur institutionnelle : bleu foncé `#173F73`** (en-têtes de dossier, bandeaux de section, sommaire, graphiques, icônes KPI). Variante hover `#0f2a52`.
- **Évolutions** : hausse ≥ +0,05 ppt → **vert** (`text-emerald-600`), baisse ≤ −0,05 → **rouge** (`text-red-600`), stable → gris. Pourcentages avec signe `+`.
- Statuts (StatutBadge) : brouillon gris, déposé bleu, instruction ambre, décision violet, accordé vert, refusé rouge.
- KPI : cartes `rounded-xl border-slate-200 bg-white p-5`, valeur `text-3xl`, icône teintée en haut à droite.
- **Sommaire sticky** (vertical lg+, horizontal < lg) avec **scroll-spy** ; sections animées `framer-motion` (fade/slide discret).
- Graphiques **Recharts** : donuts (femmes/hommes, ivryens/non-ivryens), barres (tranches d'âge), ligne (évolution), composé (charges/produits + subvention). Couleurs : `#173F73`, `#94a3b8`, `#3b82f6`, `#f59e0b`.
- **Scrollbars** : personnalisées `.scrollbar-thick` (poignée `#173f73`, piste `#dbe4f0`) et `.scrollbar-thick-6` (épaisseur 96px) pour la Synthèse Globale et le tableau financier.

### Section 8 — « Situation financière / Tableau financier » (détail)

- Zone de défilement `max-h-[70vh]` avec **scrollbar épaisse visible** ; **toutes les lignes du fichier affichées**.
- Colonnes : N° Cpte (fixe, monospace) / Libellé / 2025 / 2026 / Prévi. 2027 / Écart / Évol. / **Notes** (affichée dans la rangée et en tooltip du libellé).
- Types de rangée : `titre` (fond `#173F73` blanc), `rubrique` (`slate-100`), `ligne`, `sous-total` (gras), `total` (`#dbe4f0` gras) ; en-têtes `sticky top-0`.
- Encadrés Indicateurs automatiques (pourcentages sans signe), Contributions volontaires en nature (`formatBenevole`), Note légale (`note-legale`, italique).

### Synthèse Globale (page d'accueil, v0.4.0-0.4.1)

- En-tête 3 lignes (titre fusionné, groupes, colonnes), **en-têtes alternés bleu ciel `#E0F2FE` / rose clair `#FCE7F3`**.
- Colonnes figées A (« Code », 100px) et B (« Association », 224px) ; rangées zébrées ; TOTAUX `#dbe4f0`.
- **8 colonnes ER→EY** : `<textarea>` édition locale, sauvegarde au **blur**, fond ambre pendant la sauvegarde, message d'erreur + revert en cas d'échec.
- **Barre de défilement horizontale flottante** synchronisée (stickée en bas) ; boutons **Excel** / **PDF**.

### Navigation & pages

- Routes : `/` Synthèse · `/dossiers` · `/dossiers/:id` · `/import` · `/associations` · `/administration/utilisateurs` (admin) · `/login` · `*` → `/`.
- Sidebar `w-64` : logo Ville d'Ivry, version (`Version {APP_VERSION}`), bouton « Quoi de neuf ? » ; bas de sidebar : utilisateur + déconnexion.
- **« Modifier le dossier »** (DossierHeader) : volontairement **désactivé** — « La modification du dossier s'effectue côté association ».
- Année de campagne par défaut : **2027** (Synthèse, Dossiers, Import) ; options 2025/2026/2027.

---

## 12. Qualité & process de développement

- Backend modulaire (un dossier par domaine : controller / routes / service / repository) ; fonctions courtes, pas de duplication, `async/await`, erreurs explicites.
- Frontend : TypeScript strict ; **ESLint** (`npm run lint` frontend, max-warnings 0) ; build `tsc -b && vite build`.
- Tests : au minimum sur la logique métier critique et les intégrations API (à développer).
- README de démarrage + `.env.example` ; workflow git propre ; **jamais de commit** sans demande explicite.
- Documentation : `manifest.md` (bible, ce document), `applicationdub.md` (référence d'application), `MarkDown/` (CCTP + specs).