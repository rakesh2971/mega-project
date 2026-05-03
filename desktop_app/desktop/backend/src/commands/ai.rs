use serde::{Deserialize, Serialize};
use tauri::command;
use std::env;

#[derive(Serialize)]
pub struct Insight {
    pub text: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct OllamaOptions {
    num_predict: Option<i32>,
}

#[derive(Serialize)]
struct OllamaChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    stream: bool,
    options: OllamaOptions,
}

#[derive(Deserialize)]
struct OllamaChatResponse {
    message: ChatMessage,
}

#[command]
pub async fn generate_post_insight(post_content: String) -> Result<Insight, String> {
    Ok(Insight {
        text: format!("AI Insight generated based on: {}...", &post_content.chars().take(20).collect::<String>()),
    })
}

#[command]
pub async fn get_mood() -> Result<String, String> {
    Ok("Focused".into())
}

#[command]
pub async fn chat_with_ai(messages: Vec<ChatMessage>) -> Result<String, String> {
    let ollama_url = env::var("OLLAMA_URL").unwrap_or_else(|_| "http://localhost:11434".to_string());
    let url = format!("{}/api/chat", ollama_url.trim_end_matches('/'));
    
    let num_predict: Option<i32> = env::var("OLLAMA_NUM_PREDICT")
        .ok()
        .and_then(|val| val.parse().ok());

    let request_body = OllamaChatRequest {
        model: env::var("OLLAMA_MODEL").unwrap_or_else(|_| "llama3".to_string()),
        messages,
        stream: false,
        options: OllamaOptions {
            num_predict,
        },
    };

    let client = reqwest::Client::new();
    let res = client.post(&url)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Ollama: {}", e))?;

    if res.status().is_success() {
        let response_data = res.json::<OllamaChatResponse>().await
            .map_err(|e| format!("Failed to parse response: {}", e))?;
        Ok(response_data.message.content)
    } else {
        Err(format!("Ollama server returned an error: {}", res.status()))
    }
}
