use sqlx::PgPool;

pub async fn ensure_tables(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS chat_sessions (
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
        );"
    )
    .execute(pool)
    .await?;
    Ok(())
}
