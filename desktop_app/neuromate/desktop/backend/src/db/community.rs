use sqlx::{PgPool, FromRow, Row};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(serde::Serialize, FromRow)]
pub struct CommunityPost {
    pub id: Uuid,
    pub author_id: Uuid,
    pub author_name: String,
    pub author_avatar: Option<String>,
    pub content: String,
    pub mood: String,
    pub mood_emoji: String,
    pub image_url: Option<String>,
    pub likes: i32,
    pub comments: i32,
    pub is_helpful: bool,
    pub productivity_score: Option<i32>,
    pub created_at: DateTime<Utc>,
}

#[derive(serde::Serialize, FromRow)]
pub struct TrendingTopic {
    pub id: Uuid,
    pub tag: String,
    pub volume: i32,
    pub description: Option<String>,
}

pub async fn ensure_tables(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS community_posts (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            author_id  UUID REFERENCES app_users(id) ON DELETE CASCADE,
            content    TEXT NOT NULL,
            mood       VARCHAR(30) NOT NULL,
            mood_emoji VARCHAR(10) NOT NULL,
            image_url  TEXT,
            likes      INT DEFAULT 0,
            comments   INT DEFAULT 0,
            is_helpful BOOLEAN DEFAULT FALSE,
            productivity_score INT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS trending_topics (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tag         VARCHAR(100) UNIQUE NOT NULL,
            volume      INT DEFAULT 1,
            description TEXT,
            created_at  TIMESTAMPTZ DEFAULT NOW(),
            updated_at  TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS post_insights (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id    UUID REFERENCES community_posts(id) ON DELETE CASCADE,
            insight    TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );"
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_feed(pool: &PgPool) -> Result<Vec<CommunityPost>, sqlx::Error> {
    let rows = sqlx::query_as::<_, CommunityPost>(
        r#"
        SELECT 
            p.id, p.author_id, u.display_name as author_name, u.avatar_seed as author_avatar,
            p.content, p.mood, p.mood_emoji, p.image_url, p.likes, p.comments, 
            p.is_helpful, p.productivity_score, p.created_at
        FROM community_posts p
        JOIN app_users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 50
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn create_post(pool: &PgPool, author_id: Uuid, content: &str, mood: &str, mood_emoji: &str, image_url: Option<&str>, productivity_score: Option<i32>) -> Result<Uuid, sqlx::Error> {
    let row = sqlx::query(
        r#"
        INSERT INTO community_posts (author_id, content, mood, mood_emoji, image_url, productivity_score)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        "#
    )
    .bind(author_id)
    .bind(content)
    .bind(mood)
    .bind(mood_emoji)
    .bind(image_url)
    .bind(productivity_score)
    .fetch_one(pool)
    .await?;
    
    Ok(row.try_get("id")?)
}

pub async fn get_trending_topics(pool: &PgPool) -> Result<Vec<TrendingTopic>, sqlx::Error> {
    let rows = sqlx::query_as::<_, TrendingTopic>(
        "SELECT id, tag, volume, description FROM trending_topics ORDER BY volume DESC LIMIT 10"
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}
