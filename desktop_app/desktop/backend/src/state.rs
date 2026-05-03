use sqlx::PgPool;
use std::sync::Mutex;
use crate::db;

/// Holds the shared PostgreSQL connection pool.
pub struct DbState(pub PgPool);

/// Holds the currently logged-in user (None = not logged in).
pub struct AuthState(pub Mutex<Option<db::auth::DbUser>>);
