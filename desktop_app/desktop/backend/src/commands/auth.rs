use tauri::State;
use uuid::Uuid;
use crate::{DbState, AuthState, db};

#[tauri::command]
pub async fn get_current_user(auth: State<'_, AuthState>) -> Result<Option<db::auth::DbUser>, String> {
    let guard = auth.0.lock().unwrap();
    Ok(guard.clone())
}

#[tauri::command]
pub async fn login_user(
    username: String,
    _db_state: State<'_, DbState>,
    auth: State<'_, AuthState>,
) -> Result<db::auth::DbUser, String> {
    // For now, mock a successful login by returning the first user or creating a mock
    let mut guard = auth.0.lock().unwrap();
    
    // In real app, query by username from db_state
    let user = db::auth::DbUser {
        id: Uuid::new_v4(),
        username: username.clone(),
        display_name: Some(username),
        avatar_seed: Some("12345".to_string()),
    };
    
    *guard = Some(user.clone());
    Ok(user)
}

#[tauri::command]
pub async fn get_user_by_id(db_state: State<'_, DbState>, user_id: String) -> Result<Option<db::auth::DbUser>, String> {
    let uuid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    db::auth::get_user_by_id(&db_state.0, uuid).await.map_err(|e| e.to_string())
}
