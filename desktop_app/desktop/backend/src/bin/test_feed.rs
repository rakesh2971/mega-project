use sqlx::postgres::PgPoolOptions;
use std::env;

fn main() -> Result<(), sqlx::Error> {
    dotenv::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    
    tauri::async_runtime::block_on(async {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await?;

        println!("Dropping old tables...");
        sqlx::query("DROP TABLE IF EXISTS post_insights CASCADE").execute(&pool).await?;
        sqlx::query("DROP TABLE IF EXISTS saved_posts CASCADE").execute(&pool).await?;
        sqlx::query("DROP TABLE IF EXISTS post_comments CASCADE").execute(&pool).await?;
        sqlx::query("DROP TABLE IF EXISTS nm_community_posts CASCADE").execute(&pool).await?;

        println!("Recreating tables...");
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
                created_at TIMESTAMPTZ DEFAULT NOW(),
                original_post_id UUID REFERENCES nm_community_posts(id) ON DELETE SET NULL
            )"
        ).execute(&pool).await?;

        sqlx::query(
            "CREATE TABLE IF NOT EXISTS post_comments (
                id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                post_id    UUID REFERENCES nm_community_posts(id) ON DELETE CASCADE,
                author_id  UUID REFERENCES app_users(id) ON DELETE CASCADE,
                content    TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )"
        ).execute(&pool).await?;

        sqlx::query(
            "CREATE TABLE IF NOT EXISTS saved_posts (
                id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id    UUID REFERENCES app_users(id) ON DELETE CASCADE,
                post_id    UUID REFERENCES nm_community_posts(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(user_id, post_id)
            )"
        ).execute(&pool).await?;

        sqlx::query(
            "CREATE TABLE IF NOT EXISTS post_insights (
                id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                post_id    UUID REFERENCES nm_community_posts(id) ON DELETE CASCADE,
                insight    TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )"
        ).execute(&pool).await?;

        println!("Inserting dummy user 1...");
        sqlx::query(
            "INSERT INTO app_users (id, username, password_hash, display_name, avatar_seed) 
             VALUES ('00000000-0000-0000-0000-000000000001', 'dummyuser1', 'hash', 'Sarah Chen', 'Sarah')
             ON CONFLICT (id) DO NOTHING"
        ).execute(&pool).await?;

        println!("Inserting dummy user 2...");
        sqlx::query(
            "INSERT INTO app_users (id, username, password_hash, display_name, avatar_seed) 
             VALUES ('00000000-0000-0000-0000-000000000002', 'dummyuser2', 'hash', 'Maya Rodriguez', 'Maya')
             ON CONFLICT (id) DO NOTHING"
        ).execute(&pool).await?;

        // Add 6 sample posts
        let posts = vec![
            ("Just completed my first 7-day focus challenge! The Pomodoro technique really works. Started with 2 sessions a day and now I'm consistently doing 6. My productivity has improved so much! 🎯", '1', "motivated", "🔥", 85, 24, 8),
            ("Does anyone have tips for maintaining evening routines? I struggle with consistency after 8 PM. Would love to hear what works for you!", '2', "calm", "😌", 72, 12, 15),
            ("Sharing my weekly dashboard! This app has been a game-changer for tracking my mental health journey. The AI insights are incredibly helpful. 📊", '2', "productive", "🟢", 91, 45, 12),
            ("Started journaling every morning for 10 minutes. Day 14 and already noticing my anxiety levels dropping. Highly recommend trying it if you haven't already.", '1', "curious", "🤔", 68, 31, 6),
            ("Just discovered a new feature in the app and I'm obsessed! Has anyone else tried the advanced focus timer yet?", '1', "curious", "🤔", 60, 5, 2),
            ("Reminder to drink water and take a quick 5-minute stretch break. Your posture will thank you later! 💧🧘", '2', "calm", "😌", 80, 50, 10),
            ("I've been feeling a bit burnt out recently, but seeing everyone's progress here really keeps me motivated to push through. We got this! 💪", '1', "motivated", "🔥", 95, 120, 30),
        ];

        let u1 = uuid::Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();
        let u2 = uuid::Uuid::parse_str("00000000-0000-0000-0000-000000000002").unwrap();

        for (content, author, mood, emoji, score, likes, comments) in posts {
            let uid = if author == '1' { u1 } else { u2 };
            sqlx::query(
                "INSERT INTO nm_community_posts (author_id, content, mood, mood_emoji, productivity_score, likes, comments)
                 SELECT $1, $2, $3, $4, $5, $6, $7
                 WHERE NOT EXISTS (SELECT 1 FROM nm_community_posts WHERE content = $2)"
            )
            .bind(uid).bind(content).bind(mood).bind(emoji).bind(score).bind(likes).bind(comments)
            .execute(&pool).await?;
        }

        println!("Successfully wiped old tables and seeded exactly 7 new posts!");

        Ok(())
    })
}
