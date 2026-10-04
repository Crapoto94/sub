require('dotenv').config();

// Toute la configuration de l'application est centralisée ici.
// Aucune URL, clé ou port n'est codé en dur dans le code applicatif.
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3261),

  dbFile: process.env.DB_FILE || './data/sub.sqlite',

  jwtSecret: process.env.JWT_SECRET || 'dev-secret-a-changer',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',

  authMode: process.env.AUTH_MODE || 'apm',
  initialAdminLogin: (process.env.INITIAL_ADMIN_LOGIN || '').trim(),
  localAdmin: {
    username: (process.env.LOCAL_ADMIN_USERNAME || '').trim(),
    password: process.env.LOCAL_ADMIN_PASSWORD || '',
  },

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3260')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  apm: {
    url: process.env.APM_API_URL || 'https://api.ivry.local',
    key: process.env.APM_API_KEY || '',
    // Certificat interne (auto-signé) à faire confiance : chemin d'un PEM.
    caCert: (process.env.APM_CA_CERT || '').trim(),
    // Échappatoire DEV uniquement : désactive la vérification TLS. Jamais en production.
    tlsInsecure: process.env.APM_TLS_INSECURE === 'true',
  },

  hubDsi: {
    url: process.env.HUBDSI_API_URL || '',
    key: process.env.HUBDSI_API_KEY || '',
  },

  // API Entreprise (données publiques INSEE / DJEPVA / DataSubvention).
  // Le token JWT est transmis en Authorization: Bearer. Les paramètres
  // recipient (SIRET de la collectivité), object et context sont obligatoires.
  apiEntreprise: {
    url: process.env.API_ENTREPRISE_URL || 'https://entreprise.api.gouv.fr',
    key: process.env.API_ENTREPRISE_KEY || '',
    recipient: process.env.API_ENTREPRISE_RECIPIENT || '21940041300015',
    object: process.env.API_ENTREPRISE_OBJECT || 'Controle des donnees associations',
    context: process.env.API_ENTREPRISE_CONTEXT || 'Instruction dossier de subvention',
  },
};

module.exports = { env };
