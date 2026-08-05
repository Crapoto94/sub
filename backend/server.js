require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./src/config/env');
const { setupDb } = require('./src/db/sqlite');
const { notFound, errorHandler } = require('./src/middlewares/errorHandler');
const authRoutes = require('./src/modules/auth/auth.routes');
const usersRoutes = require('./src/modules/users/users.routes');
const statusRoutes = require('./src/modules/system/status.routes');

const app = express();
app.disable('x-powered-by');

// CORS restreint aux origines connues (jamais de * en production).
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '1mb' }));

// --- Documentation Swagger ---
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Subventions',
      version: '0.1.0',
      description: 'API de gestion des demandes de subvention des associations',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            email: { type: 'string' },
            service: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'membre'] },
            isActive: { type: 'boolean' },
            lastLoginAt: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes versionnées ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/status', statusRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  setupDb();
  app.listen(env.port, () => {
    console.log(`[SERVER] API Subventions démarrée sur le port ${env.port} (env: ${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('[SERVER] Démarrage impossible', err);
  process.exit(1);
});
