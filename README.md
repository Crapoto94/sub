# Subventions — Gestion des demandes de subvention des associations

Socle technique de l'application de gestion des demandes de subvention des
associations, construit selon les recommandations de
[`GUIDE_NOUVELLE_APP_VILLE.md`](./GUIDE_NOUVELLE_APP_VILLE.md).

> **Différence assumée vs guide** : la base de données est une base locale
> **SQLite 3** (`better-sqlite3`), et non le PostgreSQL partagé de la Ville.
> Le reste de la stack suit le guide (Express 5, React 18 + Vite + Tailwind,
> auth Active Directory via l'APM, JWT applicatif, Swagger, Docker Compose).

## Ports

| Service | Port |
|---------|------|
| Frontend (BO) | **3260** |
| Backend (API) | **3261** |

## Stack

- **Backend** : Node.js + Express 5, `better-sqlite3`, `jsonwebtoken`, `axios`,
  `cors`, `dotenv`, `express-rate-limit`, `swagger-jsdoc` + `swagger-ui-express`,
  `bcryptjs`, `multer` (réservé aux futurs uploads).
- **Frontend** : React 18 + TypeScript + Vite, Tailwind CSS, `react-router-dom`,
  `axios`, `lucide-react`, `framer-motion`.
- **Auth** : connexion des agents via `POST /api/v1/ad/authenticate` (APM),
  puis **JWT applicatif** généré par le backend pour la session.

## Structure

```
.
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/env.js          # toute la config centralisée (.env)
│       ├── db/sqlite.js           # connexion SQLite + wrapper + migrations
│       ├── db/migrations/         # migrations SQL versionnées
│       ├── services/apm.js        # appels API centrale (AD, mail, SMS…)
│       ├── services/hubdsi.js     # appels API métier Hub DSI
│       ├── middlewares/           # authRequired / adminRequired / erreurs
│       └── modules/
│           ├── auth/              # login AD, JWT, /me
│           ├── users/             # gestion des utilisateurs (rôles)
│           └── system/            # GET /api/status (santé de l'app)
└── frontend/
    ├── vite.config.ts             # port 3260
    └── src/
        ├── api/                   # client axios + appels API
        ├── context/AuthContext.tsx
        ├── components/layout/     # menu latéral (Synthèse / Administration)
        └── pages/                 # Login, Synthèse, Administration/Utilisateurs
```

## Démarrage en développement

### Backend

```bash
cd backend
copy .env.example .env      # renseigner APM_API_KEY (ou AUTH_MODE=local en dev)
npm install
npm run dev                 # API sur http://localhost:3261
```

- Doc Swagger : http://localhost:3261/api-docs
- Santé : http://localhost:3261/api/status

### Frontend

```bash
cd frontend
copy .env.example .env      # VITE_API_URL=http://localhost:3261
npm install
npm run dev                 # http://localhost:3260
```

### Authentification

- **`AUTH_MODE=apm`** (production) : le backend appelle l'APM
  (`POST /api/v1/ad/authenticate`) pour vérifier le login Ville.
- **`AUTH_MODE=local`** (développement, sans APM) : tout login est accepté ;
  l'utilisateur est créé automatiquement.

Le premier login de l'identifiant `INITIAL_ADMIN_LOGIN` (`.env`) obtient le rôle
`admin` (gestion des utilisateurs). Les autres utilisateurs sont créés avec le
rôle `membre`.

## Démarrage en production (Docker)

```bash
copy .env.example .env      # renseigner les secrets
docker-compose up -d --build
```

- Frontend : http://localhost:3260
- Backend : http://localhost:3261

Le volume `sub_data` persiste la base SQLite du backend.

## Prochaines étapes (fonctionnel)

- Module `demandes` (dossiers de demande de subvention) + tables SQLite associées.
- Module `associations`.
- Workflow métier (dépôt, instruction, décision), envois mail/SMS via APM.
- Données Ville (élus, sites…) via l'API Hub DSI.
