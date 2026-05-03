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

        // Add more sample posts
        let post4 = "Just discovered a new feature in the app and I'm obsessed! Has anyone else tried the advanced focus timer yet?";
        let post5 = "Reminder to drink water and take a quick 5-minute stretch break. Your posture will thank you later! 💧🧘";
        let post6 = "I've been feeling a bit burnt out recently, but seeing everyone's progress here really keeps me motivated to push through. We got this! 💪";

        let user_id1 = uuid::Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();
        let user_id2 = uuid::Uuid::parse_str("00000000-0000-0000-0000-000000000002").unwrap();

        let _ = sqlx::query(
            "INSERT INTO community_posts (author_id, content, mood, mood_emoji, productivity_score, likes, comments)
             SELECT $1, $2, 'curious', '🤔', 60, 5, 2
             WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE content = $2)"
        )
        .bind(user_id1)
        .bind(post4)
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            "INSERT INTO community_posts (author_id, content, mood, mood_emoji, productivity_score, likes, comments)
             SELECT $1, $2, 'calm', '😌', 80, 50, 10
             WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE content = $2)"
        )
        .bind(user_id2)
        .bind(post5)
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            "INSERT INTO community_posts (author_id, content, mood, mood_emoji, productivity_score, likes, comments)
             SELECT $1, $2, 'motivated', '🔥', 95, 120, 30
             WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE content = $2)"
        )
        .bind(user_id1)
        .bind(post6)
        .execute(&pool)
        .await;

        println!("Additional 3 dummy feeds seeded successfully.");

        Ok(())
    })
}
