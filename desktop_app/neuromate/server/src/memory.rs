use sqlx::{postgres::PgPoolOptions, Pool, Postgres, Row};
use pgvector::Vector;
use serde_json::Value;
use std::env;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub enum MemoryLayer {
    Recent,
    Episodic,
    Trait,
}

impl MemoryLayer {
    pub fn as_str(&self) -> &'static str {
        match self {
            MemoryLayer::Recent => "recent",
            MemoryLayer::Episodic => "episodic",
            MemoryLayer::Trait => "trait",
        }
    }
}

#[derive(Clone)]
pub struct MemoryService {
    pool: Pool<Postgres>,
    ollama_url: String,
    embedding_model: String,
}

#[derive(Debug)]
pub struct MemoryResult {
    pub layer: String,
    pub content: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub importance_score: f64,
    pub similarity: f64,
}

impl MemoryService {
    pub async fn new(database_url: &str, ollama_url: String) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;
            
        sqlx::query(
            r#"
            CREATE EXTENSION IF NOT EXISTS vector;
            
            -- Relational Table for Users
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Vector Table for User Memories
            CREATE TABLE IF NOT EXISTS memory_entries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                layer VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                embedding vector,
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                importance_score FLOAT DEFAULT 1.0,
                metadata JSONB DEFAULT '{}'::jsonb
            );
            CREATE INDEX IF NOT EXISTS memory_user_idx ON memory_entries (user_id);
            CREATE INDEX IF NOT EXISTS memory_embedding_idx ON memory_entries USING hnsw (embedding vector_cosine_ops);
            CREATE INDEX IF NOT EXISTS memory_layer_time_idx ON memory_entries (layer, timestamp);
            "#
        )
        .execute(&pool)
        .await?;

        let embedding_model = env::var("OLLAMA_EMBEDDING_MODEL").unwrap_or_else(|_| "nomic-embed-text".to_string());

        Ok(Self { pool, ollama_url, embedding_model })
    }

    pub async fn get_embedding(&self, text: &str) -> Result<Vector, Box<dyn std::error::Error + Send + Sync>> {
        let mut base_url = self.ollama_url.clone();
        if base_url.ends_with("/api/generate") {
            base_url = base_url.replace("/api/generate", "");
        }
        let url = format!("{}/api/embeddings", base_url);
        
        let payload = serde_json::json!({
            "model": self.embedding_model,
            "prompt": text
        });

        let client = reqwest::Client::new();
        let res = client.post(&url).json(&payload).send().await?.error_for_status()?;
        let json: Value = res.json().await?;
        
        let embedding: Vec<f32> = serde_json::from_value(json["embedding"].clone())?;
        Ok(Vector::from(embedding))
    }

    pub async fn register_user(&self, username: &str, password_hash: &str) -> Result<Uuid, Box<dyn std::error::Error + Send + Sync>> {
        let row = sqlx::query("INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id")
            .bind(username)
            .bind(password_hash)
            .fetch_one(&self.pool)
            .await?;
        Ok(row.get("id"))
    }

    pub async fn login_user(&self, username: &str, password_hash: &str) -> Result<Option<Uuid>, Box<dyn std::error::Error + Send + Sync>> {
        let row = sqlx::query("SELECT id FROM users WHERE username = $1 AND password_hash = $2")
            .bind(username)
            .bind(password_hash)
            .fetch_optional(&self.pool)
            .await?;
            
        Ok(row.map(|r| r.get("id")))
    }

    pub async fn get_or_create_user(&self, client_id: &str) -> Result<Uuid, Box<dyn std::error::Error + Send + Sync>> {
        let row = sqlx::query("SELECT id FROM users WHERE username = $1")
            .bind(client_id)
            .fetch_optional(&self.pool)
            .await?;
            
        if let Some(r) = row {
            Ok(r.get("id"))
        } else {
            self.register_user(client_id, "dummy_hash").await
        }
    }

    pub async fn add_memory(&self, user_id: Uuid, layer: MemoryLayer, content: &str, importance: f64) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let embedding = self.get_embedding(content).await?;
        
        sqlx::query(
            "INSERT INTO memory_entries (user_id, layer, content, embedding, importance_score) VALUES ($1, $2, $3, $4, $5)"
        )
        .bind(user_id)
        .bind(layer.as_str())
        .bind(content)
        .bind(embedding)
        .bind(importance)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }

    pub async fn retrieve_context(&self, user_id: Uuid, query: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let embedding = self.get_embedding(query).await?;
        
        let rows = sqlx::query(
            r#"
            (
                SELECT layer, content, timestamp, importance_score,
                       1 - (embedding <=> $1::vector) AS similarity
                FROM memory_entries
                WHERE layer = 'recent' AND user_id = $2
                ORDER BY embedding <=> $1::vector
                LIMIT 5
            )
            UNION ALL
            (
                SELECT layer, content, timestamp, importance_score,
                       1 - (embedding <=> $1::vector) AS similarity
                FROM memory_entries
                WHERE layer = 'episodic' AND user_id = $2
                ORDER BY embedding <=> $1::vector
                LIMIT 5
            )
            UNION ALL
            (
                SELECT layer, content, timestamp, importance_score,
                       1 - (embedding <=> $1::vector) AS similarity
                FROM memory_entries
                WHERE layer = 'trait' AND user_id = $2
                ORDER BY embedding <=> $1::vector
                LIMIT 5
            )
            "#
        )
        .bind(embedding)
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;

        let mut recent = Vec::new();
        let mut episodic = Vec::new();
        let mut traits = Vec::new();

        for row in rows {
            let layer: String = row.get("layer");
            let content: String = row.get("content");
            let importance: f64 = row.get("importance_score");
            let similarity: f64 = row.get("similarity");
            
            let result = MemoryResult {
                layer: layer.clone(),
                content,
                timestamp: row.get("timestamp"),
                importance_score: importance,
                similarity,
            };

            match layer.as_str() {
                "recent" => recent.push(result),
                "episodic" => episodic.push(result),
                "trait" => traits.push(result),
                _ => {}
            }
        }
        
        let ranker = |a: &MemoryResult, b: &MemoryResult| {
            let rank_a = a.similarity * a.importance_score;
            let rank_b = b.similarity * b.importance_score;
            rank_b.partial_cmp(&rank_a).unwrap_or(std::cmp::Ordering::Equal)
        };
        
        recent.sort_by(ranker);
        episodic.sort_by(ranker);
        traits.sort_by(ranker);

        let mut context = String::new();
        
        if !traits.is_empty() {
            context.push_str("### Persistent User Traits:\n");
            for t in traits {
                context.push_str(&format!("- {}\n", t.content));
            }
            context.push_str("\n");
        }
        
        if !episodic.is_empty() {
            context.push_str("### Relevant Past Episodes:\n");
            for e in episodic {
                context.push_str(&format!("- {}\n", e.content));
            }
            context.push_str("\n");
        }
        
        if !recent.is_empty() {
            context.push_str("### Recent Context:\n");
            for r in recent {
                context.push_str(&format!("- {}\n", r.content));
            }
            context.push_str("\n");
        }
        
        Ok(context)
    }

    /// Run memory decay on older entries to gradually reduce their importance
    pub async fn apply_decay(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        sqlx::query(
            r#"
            UPDATE memory_entries 
            SET importance_score = importance_score * 0.95
            WHERE timestamp < NOW() - INTERVAL '1 day'
            "#
        )
        .execute(&self.pool)
        .await?;
        
        // Optionally delete very low importance scores
        sqlx::query("DELETE FROM memory_entries WHERE importance_score < 0.1")
            .execute(&self.pool)
            .await?;
            
        Ok(())
    }

    /// Consolidates recent memory into episodic memory
    pub async fn process_episodic_memory(&self, _llm_url: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Step 1: Fetch unsummarized 'Recent' memories for the day
        // Step 2: Use Ollama to generate a structured summary of the conversation
        // Step 3: Insert the generated summary into 'Episodic' layer
        // Example LLM Prompt: "Summarize the following conversation log into key events..."
        // self.add_memory(MemoryLayer::Episodic, &summary_text, 1.0).await?;
        Ok(())
    }

    /// Extracts traits from episodic memories and merges them
    pub async fn process_traits(&self, _llm_url: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Step 1: Fetch all Episodic memories
        // Step 2: Use Ollama to extract long-term user preferences or traits
        // Step 3: Compare with existing 'Trait' memories via vector similarity
        // Step 4: Merge similar traits (update text & embedding) or insert new
        Ok(())
    }
}
