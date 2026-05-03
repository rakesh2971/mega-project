use sqlx::PgPool;

pub async fn ensure_tables(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS community_posts (
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
        );"
    )
    .execute(pool)
    .await?;
    Ok(())
}
