use tauri::State;
use crate::{DbState, db};
use uuid::Uuid;

#[tauri::command]
pub async fn get_community_feed(db_state: State<'_, DbState>) -> Result<Vec<db::community::CommunityPost>, String> {
    db::community::get_feed(&db_state.0).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_trending_topics(db_state: State<'_, DbState>) -> Result<Vec<db::community::TrendingTopic>, String> {
    db::community::get_trending_topics(&db_state.0).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn repost(db_state: State<'_, DbState>, post_id: String, author_id: String, thought: Option<String>) -> Result<String, String> {
    let p_uuid = Uuid::parse_str(&post_id).map_err(|e| e.to_string())?;
    let a_uuid = Uuid::parse_str(&author_id).map_err(|e| e.to_string())?;
    db::community::repost(&db_state.0, p_uuid, a_uuid, thought.as_deref())
        .await
        .map(|id| id.to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_post(
    db_state: State<'_, DbState>,
    author_id: String,
    content: String,
    mood: String,
    mood_emoji: String,
    image_url: Option<String>,
    productivity_score: Option<i32>
) -> Result<String, String> {
    let author_uuid = Uuid::parse_str(&author_id).map_err(|e| e.to_string())?;
    db::community::create_post(
        &db_state.0,
        author_uuid,
        &content,
        &mood,
        &mood_emoji,
        image_url.as_deref(),
        productivity_score
    )
    .await
    .map(|id| id.to_string())
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_post_comment(db_state: State<'_, DbState>, post_id: String, author_id: String, content: String) -> Result<String, String> {
    let p_uuid = Uuid::parse_str(&post_id).map_err(|e| e.to_string())?;
    let a_uuid = Uuid::parse_str(&author_id).map_err(|e| e.to_string())?;
    db::community::add_comment(&db_state.0, p_uuid, a_uuid, &content)
        .await
        .map(|id| id.to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_post_comments(db_state: State<'_, DbState>, post_id: String) -> Result<Vec<db::community::PostComment>, String> {
    let p_uuid = Uuid::parse_str(&post_id).map_err(|e| e.to_string())?;
    db::community::get_post_comments(&db_state.0, p_uuid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn toggle_helpful_post(db_state: State<'_, DbState>, user_id: String, post_id: String) -> Result<bool, String> {
    let u_uuid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    let p_uuid = Uuid::parse_str(&post_id).map_err(|e| e.to_string())?;
    db::community::toggle_saved_post(&db_state.0, u_uuid, p_uuid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_helpful_posts(db_state: State<'_, DbState>, user_id: String) -> Result<Vec<db::community::CommunityPost>, String> {
    let u_uuid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    db::community::get_saved_posts(&db_state.0, u_uuid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_my_posts(db_state: State<'_, DbState>, author_id: String) -> Result<Vec<db::community::CommunityPost>, String> {
    let a_uuid = Uuid::parse_str(&author_id).map_err(|e| e.to_string())?;
    db::community::get_my_posts(&db_state.0, a_uuid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_ai_post_insight(db_state: State<'_, DbState>, post_id: String, content: String) -> Result<String, String> {
    let post_uuid = Uuid::parse_str(&post_id).map_err(|e| e.to_string())?;
    
    // Check if it already has an insight
    if let Some(insight) = db::community::get_post_insight(&db_state.0, post_uuid).await.unwrap_or(None) {
        return Ok(insight);
    }
    
    // Call Ollama
    let ollama_url = std::env::var("OLLAMA_URL").unwrap_or_else(|_| "http://127.0.0.1:11434".to_string());
    let ollama_model = std::env::var("OLLAMA_MODEL").unwrap_or_else(|_| "qwen2.5:7b".to_string());
    
    let client = reqwest::Client::new();
    let prompt = format!("Provide a 1-2 sentence insightful, encouraging observation about this community post: '{}'", content);
    
    let req_body = serde_json::json!({
        "model": ollama_model,
        "prompt": prompt,
        "stream": false
    });
    
    let res = client.post(format!("{}/api/generate", ollama_url))
        .json(&req_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
    let res_json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let insight = res_json["response"].as_str().unwrap_or("Great job on your progress! Keep sharing your journey with the community.").trim().to_string();
    
    // Save insight
    let _ = db::community::save_post_insight(&db_state.0, post_uuid, &insight).await;
    
    Ok(insight)
}
