-- Comptes locaux : mot de passe haché (bcrypt) stocké localement.
-- Si password_hash est NULL, l'utilisateur s'authentifie via l'Active Directory (APM).
ALTER TABLE users ADD COLUMN password_hash TEXT;
