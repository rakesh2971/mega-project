use serde::Serialize;

#[derive(Serialize)]
pub struct Insight {
    pub text: String,
}

#[tauri::command]
pub async fn generate_post_insight(post_content: String) -> Result<Insight, String> {
    // Basic mock connection to Ollama logic.
    // Replace with real ollama HTTP request in future.
    Ok(Insight {
        text: format!("AI Insight generated based on: {}...", &post_content.chars().take(20).collect::<String>()),
    })
}

#[tauri::command]
pub async fn get_mood() -> Result<String, String> {
    Ok("Focused".into())
}
