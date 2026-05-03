-- Run these commands as the default `postgres` superuser

-- 1. Create the dedicated database
CREATE DATABASE monika_db;

-- 2. Connect to the new database (if using psql: \c monika_db)
-- (If using pgAdmin, right-click the `monika_db` and open the Query Tool)

-- 3. Create the user role
CREATE USER monika WITH PASSWORD 'monika_password';

-- 4. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE monika_db TO monika;

-- 5. Enable the vector extension (requires superuser, hence do it before fully switching)
CREATE EXTENSION IF NOT EXISTS vector;
