use sqlx::{PgPool, FromRow};
use uuid::Uuid;

// ── User struct returned to the frontend ──────────────────────────────────

#[derive(serde::Serialize, FromRow, Clone)]
pub struct DbUser {
    pub id: Uuid,
    pub username: String,
    pub display_name: Option<String>,
    pub avatar_seed: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

// Internal row that also includes password_hash (never sent to frontend)
#[derive(FromRow)]
struct DbUserFull {
    pub id: Uuid,
    pub username: String,
    pub password_hash: String,
    pub display_name: Option<String>,
    pub avatar_seed: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

// ── Table setup ───────────────────────────────────────────────────────────

pub async fn ensure_table(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS app_users (
            id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username      VARCHAR(50) UNIQUE NOT NULL,
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

// ── Register (create new user) ────────────────────────────────────────────

pub async fn register_user(pool: &PgPool, username: &str, password: &str, display_name: Option<&str>) -> Result<DbUser, String> {
    // Check username not taken
    let existing: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM app_users WHERE username = $1"
    )
    .bind(username)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("Username already taken".to_string());
    }

    // Hash password
    let hash = bcrypt::hash(password, bcrypt::DEFAULT_COST)
        .map_err(|e| e.to_string())?;

    let avatar_seed = format!("{}{}", username, chrono::Utc::now().timestamp());

    let row = sqlx::query_as::<_, DbUser>(
        "INSERT INTO app_users (username, password_hash, display_name, avatar_seed)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, display_name, avatar_seed, created_at"
    )
    .bind(username)
    .bind(&hash)
    .bind(display_name.unwrap_or(username))
    .bind(&avatar_seed)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(row)
}

// ── Login (verify password) ───────────────────────────────────────────────

pub async fn login(pool: &PgPool, username: &str, password: &str) -> Result<DbUser, String> {
    let full = sqlx::query_as::<_, DbUserFull>(
        "SELECT id, username, password_hash, display_name, avatar_seed, created_at
         FROM app_users WHERE username = $1"
    )
    .bind(username)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?;

    let full = full.ok_or_else(|| "Invalid username or password".to_string())?;

    let valid = bcrypt::verify(password, &full.password_hash)
        .map_err(|e| e.to_string())?;

    if !valid {
        return Err("Invalid username or password".to_string());
    }

    Ok(DbUser {
        id: full.id,
        username: full.username,
        display_name: full.display_name,
        avatar_seed: full.avatar_seed,
        created_at: full.created_at,
    })
}

// ── Get by ID ─────────────────────────────────────────────────────────────

pub async fn get_user_by_id(pool: &PgPool, user_id: Uuid) -> Result<Option<DbUser>, sqlx::Error> {
    let row = sqlx::query_as::<_, DbUser>(
        "SELECT id, username, display_name, avatar_seed, created_at
         FROM app_users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    Ok(row)
}

// ── Update profile ────────────────────────────────────────────────────────

pub async fn update_profile(pool: &PgPool, user_id: Uuid, display_name: Option<&str>, avatar_seed: Option<&str>) -> Result<DbUser, String> {
    let row = sqlx::query_as::<_, DbUser>(
        "UPDATE app_users
         SET display_name = COALESCE($2, display_name),
             avatar_seed  = COALESCE($3, avatar_seed)
         WHERE id = $1
         RETURNING id, username, display_name, avatar_seed, created_at"
    )
    .bind(user_id)
    .bind(display_name)
    .bind(avatar_seed)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(row)
}
