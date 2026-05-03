use sqlx::{PgPool, FromRow, Row};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(serde::Serialize, FromRow)]
pub struct ChatMessage {
    pub id: Uuid,
    pub session_id: Uuid,
    pub role: String,
    pub content: String,
    pub mood: Option<String>,
    pub created_at: DateTime<Utc>,
}

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

pub async fn get_chat_history(pool: &PgPool, session_id: Uuid) -> Result<Vec<ChatMessage>, sqlx::Error> {
    let rows = sqlx::query_as::<_, ChatMessage>(
        r#"
        SELECT id, session_id, role, content, mood, created_at
        FROM chat_messages
        WHERE session_id = $1
        ORDER BY created_at ASC
        "#
    )
    .bind(session_id)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn save_chat_message(pool: &PgPool, session_id: Uuid, role: &str, content: &str, mood: Option<&str>) -> Result<Uuid, sqlx::Error> {
    let row = sqlx::query(
        r#"
        INSERT INTO chat_messages (session_id, role, content, mood)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        "#
    )
    .bind(session_id)
    .bind(role)
    .bind(content)
    .bind(mood)
    .fetch_one(pool)
    .await?;
    
    Ok(row.try_get("id")?)
}
