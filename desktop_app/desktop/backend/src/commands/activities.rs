use tauri::State;
use crate::{DbState, db};
use uuid::Uuid;

// A dummy user ID used until real auth is wired; matches community.rs convention.
const DUMMY_USER_ID: &str = "00000000-0000-0000-0000-000000000001";

fn user_uuid(user_id: Option<String>) -> Result<Uuid, String> {
    let id = user_id.unwrap_or_else(|| DUMMY_USER_ID.to_string());
    Uuid::parse_str(&id).map_err(|e| e.to_string())
}

// ── Tasks ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn create_task(
    db_state: State<'_, DbState>,
    title: String,
    description: Option<String>,
    completed: Option<bool>,
    user_id: Option<String>,
) -> Result<db::activities::Task, String> {
    let uid = user_uuid(user_id)?;
    db::activities::create_task(&db_state.0, uid, &title, description.as_deref(), completed.unwrap_or(false))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_tasks(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<Vec<db::activities::Task>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_tasks(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_task(
    db_state: State<'_, DbState>,
    id: String,
    completed: bool,
    user_id: Option<String>,
) -> Result<(), String> {
    let uid = user_uuid(user_id)?;
    let task_id = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    db::activities::update_task(&db_state.0, task_id, uid, completed)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_task(
    db_state: State<'_, DbState>,
    id: String,
    user_id: Option<String>,
) -> Result<(), String> {
    let uid = user_uuid(user_id)?;
    let task_id = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    db::activities::delete_task(&db_state.0, task_id, uid)
        .await
        .map_err(|e| e.to_string())
}

// ── Moods ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn create_mood(
    db_state: State<'_, DbState>,
    mood_level: i32,
    mood_type: Option<String>,
    notes: Option<String>,
    user_id: Option<String>,
) -> Result<db::activities::MoodEntry, String> {
    let uid = user_uuid(user_id)?;
    db::activities::create_mood(&db_state.0, uid, mood_level, mood_type.as_deref(), notes.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_moods(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<Vec<db::activities::MoodEntry>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_moods(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_mood(
    db_state: State<'_, DbState>,
    id: String,
    user_id: Option<String>,
) -> Result<(), String> {
    let uid = user_uuid(user_id)?;
    let mood_id = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    db::activities::delete_mood(&db_state.0, mood_id, uid)
        .await
        .map_err(|e| e.to_string())
}

// ── Focus Sessions ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn create_focus_session(
    db_state: State<'_, DbState>,
    activity: String,
    duration_minutes: i32,
    notes: Option<String>,
    user_id: Option<String>,
) -> Result<db::activities::FocusSession, String> {
    let uid = user_uuid(user_id)?;
    db::activities::create_focus_session(&db_state.0, uid, &activity, duration_minutes, notes.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_focus_sessions(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<Vec<db::activities::FocusSession>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_focus_sessions(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_focus_session(
    db_state: State<'_, DbState>,
    id: String,
    user_id: Option<String>,
) -> Result<(), String> {
    let uid = user_uuid(user_id)?;
    let fid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    db::activities::delete_focus_session(&db_state.0, fid, uid)
        .await
        .map_err(|e| e.to_string())
}

// ── Journals ──────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn create_journal(
    db_state: State<'_, DbState>,
    title: String,
    content: String,
    mood: Option<String>,
    user_id: Option<String>,
) -> Result<db::activities::JournalEntry, String> {
    let uid = user_uuid(user_id)?;
    db::activities::create_journal(&db_state.0, uid, &title, &content, mood.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_journals(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<Vec<db::activities::JournalEntry>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_journals(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_journal(
    db_state: State<'_, DbState>,
    id: String,
    user_id: Option<String>,
) -> Result<(), String> {
    let uid = user_uuid(user_id)?;
    let jid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    db::activities::delete_journal(&db_state.0, jid, uid)
        .await
        .map_err(|e| e.to_string())
}

// ── Routines ──────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn create_routine(
    db_state: State<'_, DbState>,
    name: String,
    description: Option<String>,
    completed: Option<bool>,
    user_id: Option<String>,
) -> Result<db::activities::Routine, String> {
    let uid = user_uuid(user_id)?;
    db::activities::create_routine(&db_state.0, uid, &name, description.as_deref(), completed.unwrap_or(false))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_routines(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<Vec<db::activities::Routine>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_routines(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_routine(
    db_state: State<'_, DbState>,
    id: String,
    completed: bool,
    user_id: Option<String>,
) -> Result<(), String> {
    let uid = user_uuid(user_id)?;
    let rid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    db::activities::update_routine(&db_state.0, rid, uid, completed)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_routine(
    db_state: State<'_, DbState>,
    id: String,
    user_id: Option<String>,
) -> Result<(), String> {
    let uid = user_uuid(user_id)?;
    let rid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    db::activities::delete_routine(&db_state.0, rid, uid)
        .await
        .map_err(|e| e.to_string())
}

// ── Meditations ───────────────────────────────────────────────────────────

#[tauri::command]
pub async fn create_meditation(
    db_state: State<'_, DbState>,
    meditation_type: String,
    duration_minutes: i32,
    notes: Option<String>,
    user_id: Option<String>,
) -> Result<db::activities::MeditationSession, String> {
    let uid = user_uuid(user_id)?;
    db::activities::create_meditation(&db_state.0, uid, &meditation_type, duration_minutes, notes.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_meditations(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<Vec<db::activities::MeditationSession>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_meditations(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_meditation(
    db_state: State<'_, DbState>,
    id: String,
    user_id: Option<String>,
) -> Result<(), String> {
    let uid = user_uuid(user_id)?;
    let mid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    db::activities::delete_meditation(&db_state.0, mid, uid)
        .await
        .map_err(|e| e.to_string())
}

// ── Dashboard aggregate commands ──────────────────────────────────────────

#[tauri::command]
pub async fn get_recent_activities(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<db::activities::ActivityItem>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_recent_activities(&db_state.0, uid, limit.unwrap_or(10))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_heatmap(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
    year: Option<i32>,
) -> Result<Vec<db::activities::HeatmapDay>, String> {
    let uid = user_uuid(user_id)?;
    let y = year.unwrap_or_else(|| chrono::Utc::now().format("%Y").to_string().parse().unwrap_or(2025));
    db::activities::get_heatmap(&db_state.0, uid, y)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_dashboard_stats(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<db::activities::DashboardStats, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_dashboard_stats(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_productivity_analytics(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
    range_days: Option<i32>,
) -> Result<Vec<db::activities::ProductivityDay>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_productivity_analytics(&db_state.0, uid, range_days.unwrap_or(7))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_mood_analytics(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
    range_days: Option<i32>,
) -> Result<Vec<db::activities::MoodDay>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_mood_analytics(&db_state.0, uid, range_days.unwrap_or(7))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_work_distribution(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<Vec<db::activities::WorkCategory>, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_work_distribution(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_habit_metrics(
    db_state: State<'_, DbState>,
    user_id: Option<String>,
) -> Result<db::activities::HabitMetrics, String> {
    let uid = user_uuid(user_id)?;
    db::activities::get_habit_metrics(&db_state.0, uid)
        .await
        .map_err(|e| e.to_string())
}
