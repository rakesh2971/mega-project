use tauri::State;
use crate::{DbState, db};

#[tauri::command]
pub async fn get_community_feed(db_state: State<'_, DbState>) -> Result<Vec<db::community::CommunityPost>, String> {
    db::community::get_feed(&db_state.0).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_trending_topics(db_state: State<'_, DbState>) -> Result<Vec<db::community::TrendingTopic>, String> {
    db::community::get_trending_topics(&db_state.0).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn repost(post_id: String, thought: Option<String>) -> Result<(), String> {
    // Just a placeholder since the full logic requires fetching post_id, creating new, etc.
    println!("Reposting {} with thought {:?}", post_id, thought);
    Ok(())
}
