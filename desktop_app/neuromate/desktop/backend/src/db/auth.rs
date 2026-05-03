use sqlx::PgPool;
use uuid::Uuid;

#[derive(Clone, serde::Serialize)]
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
