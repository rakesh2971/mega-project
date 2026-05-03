use tauri::State;
use crate::{DbState, db};
use uuid::Uuid;

#[tauri::command]
pub async fn get_chat_sessions(
    db_state: State<'_, DbState>,
    limit: Option<i64>,
) -> Result<Vec<db::chat::ChatSession>, String> {
    db::chat::get_chat_sessions(&db_state.0, limit.unwrap_or(50))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_chat_session(
    db_state: State<'_, DbState>,
    title: Option<String>,
) -> Result<String, String> {
    db::chat::create_chat_session(&db_state.0, None, title.as_deref())
        .await
        .map(|id| id.to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_session_title(
    db_state: State<'_, DbState>,
    session_id: String,
    title: String,
) -> Result<(), String> {
    let session_uuid = Uuid::parse_str(&session_id).map_err(|e| e.to_string())?;
    db::chat::update_session_title(&db_state.0, session_uuid, &title)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_chat_history(
    db_state: State<'_, DbState>,
    session_id: String,
) -> Result<Vec<db::chat::ChatMessage>, String> {
    let session_uuid = Uuid::parse_str(&session_id).map_err(|e| e.to_string())?;
    db::chat::get_chat_history(&db_state.0, session_uuid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_chat_message(
    db_state: State<'_, DbState>,
    session_id: String,
    role: String,
    content: String,
    mood: Option<String>,
) -> Result<String, String> {
    let session_uuid = Uuid::parse_str(&session_id).map_err(|e| e.to_string())?;
    db::chat::save_chat_message(&db_state.0, session_uuid, &role, &content, mood.as_deref())
        .await
        .map(|id| id.to_string())
        .map_err(|e| e.to_string())
}
