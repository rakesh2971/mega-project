use sqlx::{PgPool, FromRow};
use uuid::Uuid;

#[derive(serde::Serialize, FromRow)]
pub struct DbUser {
    pub id: Uuid,
    pub username: String,
    pub display_name: Option<String>,
    pub avatar_seed: Option<String>,
}

pub async fn ensure_table(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS app_users (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username     VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            display_name  VARCHAR(100),
            avatar_seed   VARCHAR(100),
            created_at    TIMESTAMPTZ DEFAULT NOW()
        )"
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_user_by_id(pool: &PgPool, user_id: Uuid) -> Result<Option<DbUser>, sqlx::Error> {
    let row = sqlx::query_as::<_, DbUser>(
        "SELECT id, username, display_name, avatar_seed FROM app_users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    Ok(row)
}
