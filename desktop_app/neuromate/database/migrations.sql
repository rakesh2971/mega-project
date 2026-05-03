-- database/migrations.sql
-- NeuroMate Desktop App — Database Migrations
-- Run AFTER init.sql (which sets up the database and pgvector extension)
-- Connect to monika_db before running this file

-- ── Users / Auth ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username     VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100),
    avatar_seed   VARCHAR(100),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Chat ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL,
    content    TEXT NOT NULL,
    mood       VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Community ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id  UUID REFERENCES app_users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    mood       VARCHAR(30) NOT NULL,
    mood_emoji VARCHAR(10) NOT NULL,
    image_url  TEXT,
    likes      INT DEFAULT 0,
    comments   INT DEFAULT 0,
    is_helpful BOOLEAN DEFAULT FALSE,
    productivity_score INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trending_topics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag         VARCHAR(100) UNIQUE NOT NULL,
    volume      INT DEFAULT 1,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_insights (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    insight    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
