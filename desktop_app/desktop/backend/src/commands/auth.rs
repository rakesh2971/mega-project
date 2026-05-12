use tauri::State;
use uuid::Uuid;
use crate::{DbState, AuthState, db};

// ── Get currently logged-in user ──────────────────────────────────────────

#[tauri::command]
pub async fn get_current_user(auth: State<'_, AuthState>) -> Result<Option<db::auth::DbUser>, String> {
    let guard = auth.0.lock().unwrap();
    Ok(guard.clone())
}

// ── Login ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn login_user(
    username: String,
    password: String,
    db_state: State<'_, DbState>,
    auth: State<'_, AuthState>,
) -> Result<db::auth::DbUser, String> {
    let user = db::auth::login(&db_state.0, &username, &password).await?;
    let mut guard = auth.0.lock().unwrap();
    *guard = Some(user.clone());
    Ok(user)
}

// ── Register ──────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn register_user(
    username: String,
    password: String,
    display_name: Option<String>,
    db_state: State<'_, DbState>,
    auth: State<'_, AuthState>,
) -> Result<db::auth::DbUser, String> {
    let user = db::auth::register_user(&db_state.0, &username, &password, display_name.as_deref()).await?;
    let mut guard = auth.0.lock().unwrap();
    *guard = Some(user.clone());
    Ok(user)
}

// ── Logout ────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn logout_user(auth: State<'_, AuthState>) -> Result<(), String> {
    let mut guard = auth.0.lock().unwrap();
    *guard = None;
    Ok(())
}

// ── Update profile ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn update_profile(
    display_name: Option<String>,
    avatar_seed: Option<String>,
    db_state: State<'_, DbState>,
    auth: State<'_, AuthState>,
) -> Result<db::auth::DbUser, String> {
    let user_id = {
        let guard = auth.0.lock().unwrap();
        guard.as_ref().map(|u| u.id).ok_or_else(|| "Not logged in".to_string())?
    };

    let updated = db::auth::update_profile(
        &db_state.0,
        user_id,
        display_name.as_deref(),
        avatar_seed.as_deref(),
    ).await?;

    let mut guard = auth.0.lock().unwrap();
    *guard = Some(updated.clone());
    Ok(updated)
}

// ── Get user by ID ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_user_by_id(db_state: State<'_, DbState>, user_id: String) -> Result<Option<db::auth::DbUser>, String> {
    let uuid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    db::auth::get_user_by_id(&db_state.0, uuid).await.map_err(|e| e.to_string())
}
