use sqlx::{PgPool, postgres::{PgPoolOptions, PgConnectOptions, PgSslMode}};
use std::env;
use std::str::FromStr;

pub async fn create_pool() -> Result<PgPool, String> {
    let database_url = env::var("DATABASE_URL")
        .map_err(|_| "DATABASE_URL environment variable not set".to_string())?;

    // Use SSL Disable since server doesn't have TLS; pg_hba.conf must allow the host
    let opts = PgConnectOptions::from_str(&database_url)
        .map_err(|e| format!("Invalid DATABASE_URL: {}", e))?
        .ssl_mode(PgSslMode::Disable);

    PgPoolOptions::new()
        .max_connections(5)
        .connect_with(opts)
        .await
        .map_err(|e| format!("Failed to connect to DB: {}", e))
}
