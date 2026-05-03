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

#[derive(serde::Serialize, FromRow)]
pub struct PostComment {
    pub id: Uuid,
    pub post_id: Uuid,
    pub author_id: Uuid,
    pub author_name: String,
    pub author_avatar: Option<String>,
    pub content: String,
    pub created_at: DateTime<Utc>,
}

pub async fn ensure_tables(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS nm_community_posts (
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
        )"
    )
    .execute(pool)
    .await?;

    // Safe column addition for original_post_id
    sqlx::query(
        "ALTER TABLE nm_community_posts ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES nm_community_posts(id) ON DELETE SET NULL"
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS post_comments (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id    UUID REFERENCES nm_community_posts(id) ON DELETE CASCADE,
            author_id  UUID REFERENCES app_users(id) ON DELETE CASCADE,
            content    TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )"
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS saved_posts (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id    UUID REFERENCES app_users(id) ON DELETE CASCADE,
            post_id    UUID REFERENCES nm_community_posts(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, post_id)
        )"
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS trending_topics (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tag         VARCHAR(100) UNIQUE NOT NULL,
            volume      INT DEFAULT 1,
            description TEXT,
            created_at  TIMESTAMPTZ DEFAULT NOW(),
            updated_at  TIMESTAMPTZ DEFAULT NOW()
        )"
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS post_insights (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id    UUID REFERENCES nm_community_posts(id) ON DELETE CASCADE,
            insight    TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )"
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_feed(pool: &PgPool) -> Result<Vec<CommunityPost>, sqlx::Error> {
    let rows = sqlx::query_as::<_, CommunityPost>(
        r#"
        SELECT 
            p.id, p.author_id, COALESCE(u.display_name, u.username) as author_name, u.avatar_seed as author_avatar,
            p.content, p.mood, p.mood_emoji, p.image_url, p.likes, p.comments, 
            p.is_helpful, p.productivity_score, p.created_at
        FROM nm_community_posts p
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
        INSERT INTO nm_community_posts (author_id, content, mood, mood_emoji, image_url, productivity_score)
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

pub async fn add_comment(pool: &PgPool, post_id: Uuid, author_id: Uuid, content: &str) -> Result<Uuid, sqlx::Error> {
    let row = sqlx::query(
        "INSERT INTO post_comments (post_id, author_id, content) VALUES ($1, $2, $3) RETURNING id"
    )
    .bind(post_id)
    .bind(author_id)
    .bind(content)
    .fetch_one(pool)
    .await?;

    // Increment comment count
    sqlx::query("UPDATE nm_community_posts SET comments = comments + 1 WHERE id = $1")
        .bind(post_id)
        .execute(pool)
        .await?;

    Ok(row.try_get("id")?)
}

pub async fn get_post_comments(pool: &PgPool, post_id: Uuid) -> Result<Vec<PostComment>, sqlx::Error> {
    let rows = sqlx::query_as::<_, PostComment>(
        r#"
        SELECT c.id, c.post_id, c.author_id, COALESCE(u.display_name, u.username) as author_name, u.avatar_seed as author_avatar, c.content, c.created_at
        FROM post_comments c
        JOIN app_users u ON c.author_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
        "#
    )
    .bind(post_id)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn toggle_saved_post(pool: &PgPool, user_id: Uuid, post_id: Uuid) -> Result<bool, sqlx::Error> {
    // Check if exists
    let exists: Option<i64> = sqlx::query_scalar("SELECT 1 FROM saved_posts WHERE user_id = $1 AND post_id = $2")
        .bind(user_id)
        .bind(post_id)
        .fetch_optional(pool)
        .await?;

    if exists.is_some() {
        // Delete
        sqlx::query("DELETE FROM saved_posts WHERE user_id = $1 AND post_id = $2")
            .bind(user_id)
            .bind(post_id)
            .execute(pool)
            .await?;
        Ok(false)
    } else {
        // Insert
        sqlx::query("INSERT INTO saved_posts (user_id, post_id) VALUES ($1, $2)")
            .bind(user_id)
            .bind(post_id)
            .execute(pool)
            .await?;
        Ok(true)
    }
}

pub async fn get_saved_posts(pool: &PgPool, user_id: Uuid) -> Result<Vec<CommunityPost>, sqlx::Error> {
    let rows = sqlx::query_as::<_, CommunityPost>(
        r#"
        SELECT 
            p.id, p.author_id, COALESCE(u.display_name, u.username) as author_name, u.avatar_seed as author_avatar,
            p.content, p.mood, p.mood_emoji, p.image_url, p.likes, p.comments, 
            p.is_helpful, p.productivity_score, p.created_at
        FROM nm_community_posts p
        JOIN app_users u ON p.author_id = u.id
        JOIN saved_posts s ON p.id = s.post_id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
        "#
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn get_my_posts(pool: &PgPool, author_id: Uuid) -> Result<Vec<CommunityPost>, sqlx::Error> {
    let rows = sqlx::query_as::<_, CommunityPost>(
        r#"
        SELECT 
            p.id, p.author_id, COALESCE(u.display_name, u.username) as author_name, u.avatar_seed as author_avatar,
            p.content, p.mood, p.mood_emoji, p.image_url, p.likes, p.comments, 
            p.is_helpful, p.productivity_score, p.created_at
        FROM nm_community_posts p
        JOIN app_users u ON p.author_id = u.id
        WHERE p.author_id = $1
        ORDER BY p.created_at DESC
        "#
    )
    .bind(author_id)
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn get_post_insight(pool: &PgPool, post_id: Uuid) -> Result<Option<String>, sqlx::Error> {
    let insight: Option<String> = sqlx::query_scalar("SELECT insight FROM post_insights WHERE post_id = $1")
        .bind(post_id)
        .fetch_optional(pool)
        .await?;
    Ok(insight)
}

pub async fn save_post_insight(pool: &PgPool, post_id: Uuid, insight: &str) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO post_insights (post_id, insight) VALUES ($1, $2)")
        .bind(post_id)
        .bind(insight)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn repost(pool: &PgPool, original_post_id: Uuid, author_id: Uuid, thought: Option<&str>) -> Result<Uuid, sqlx::Error> {
    // fetch original post content
    let original_content: String = sqlx::query_scalar("SELECT content FROM nm_community_posts WHERE id = $1")
        .bind(original_post_id)
        .fetch_one(pool)
        .await?;

    let final_content = match thought {
        Some(t) if !t.trim().is_empty() => format!("{}\n\n[Repost]: {}", t, original_content),
        _ => format!("[Repost]: {}", original_content),
    };

    let row = sqlx::query(
        r#"
        INSERT INTO nm_community_posts (author_id, content, mood, mood_emoji, original_post_id)
        VALUES ($1, $2, 'inspired', '✨', $3)
        RETURNING id
        "#
    )
    .bind(author_id)
    .bind(final_content)
    .bind(original_post_id)
    .fetch_one(pool)
    .await?;
    
    Ok(row.try_get("id")?)
}
