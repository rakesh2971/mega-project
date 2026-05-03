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
    db_state: State<'_, DbState>,
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
