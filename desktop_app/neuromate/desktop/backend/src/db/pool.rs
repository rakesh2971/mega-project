use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;

pub async fn create_pool() -> Result<PgPool, String> {
    let database_url = env::var("DATABASE_URL")
        .map_err(|_| "DATABASE_URL environment variable not set".to_string())?;

    PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .map_err(|e| format!("Failed to connect to DB: {}", e))
}
