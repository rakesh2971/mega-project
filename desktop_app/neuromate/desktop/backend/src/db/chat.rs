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

#[derive(serde::Serialize, FromRow)]
pub struct ChatSession {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub title: Option<String>,
    pub preview: Option<String>,
    pub message_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn ensure_tables(pool: &PgPool) -> Result<(), sqlx::Error> {
    // Note: Remote database uses 'started_at' and 'ended_at'. 
    // We cannot alter the tables due to missing privileges for neuromate_app.
    // So we just rely on the existing schema.
    Ok(())
}

pub async fn create_chat_session(pool: &PgPool, user_id: Option<Uuid>, _title: Option<&str>) -> Result<Uuid, sqlx::Error> {
    // We don't insert title because the column doesn't exist.
    let row = sqlx::query(
        r#"
        INSERT INTO chat_sessions (user_id)
        VALUES ($1)
        RETURNING id
        "#
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;

    Ok(row.try_get("id")?)
}

pub async fn get_chat_sessions(pool: &PgPool, limit: i64) -> Result<Vec<ChatSession>, sqlx::Error> {
    // Dynamically derive title, preview, and timestamps to avoid needing schema changes
    let rows = sqlx::query_as::<_, ChatSession>(
        r#"
        SELECT
            s.id,
            s.user_id,
            (SELECT LEFT(content, 200) FROM chat_messages m WHERE m.session_id = s.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as title,
            (SELECT LEFT(content, 200) FROM chat_messages m WHERE m.session_id = s.id AND role = 'assistant' ORDER BY created_at DESC LIMIT 1) as preview,
            COALESCE((SELECT MAX(created_at) FROM chat_messages m WHERE m.session_id = s.id), s.started_at) as updated_at,
            s.started_at as created_at,
            (SELECT COUNT(*) FROM chat_messages m WHERE m.session_id = s.id) as message_count
        FROM chat_sessions s
        ORDER BY updated_at DESC
        LIMIT $1
        "#
    )
    .bind(limit)
    .fetch_all(pool)
    .await?;

    Ok(rows)
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

    // No need to update chat_sessions table manually since we dynamically derive preview/updated_at
    Ok(row.try_get("id")?)
}

pub async fn update_session_title(_pool: &PgPool, _session_id: Uuid, _title: &str) -> Result<(), sqlx::Error> {
    // Stubbed out because we dynamically derive title from the first message
    Ok(())
}
