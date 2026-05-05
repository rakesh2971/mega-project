// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
use std::sync::Mutex;

mod commands;
mod db;
mod state;

pub use state::{DbState, AuthState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = dotenv::dotenv(); // Load .env file

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            app.manage(AuthState(Mutex::new(None)));
            let handle = app.handle().clone();
            
            tauri::async_runtime::spawn(async move {
                match db::pool::create_pool().await {
                    Ok(pool) => {
                        if let Err(e) = db::auth::ensure_table(&pool).await { eprintln!("[neuromate] auth table error: {}", e); }
                        if let Err(e) = db::community::ensure_tables(&pool).await { eprintln!("[neuromate] community table error: {}", e); }
                        if let Err(e) = db::chat::ensure_tables(&pool).await { eprintln!("[neuromate] chat table error: {}", e); }
                        if let Err(e) = db::activities::ensure_tables(&pool).await { eprintln!("[neuromate] activities table error: {}", e); }
                        handle.manage(DbState(pool));
                        println!("[neuromate] Connected to DB successfully.");
                    }
                    Err(e) => eprintln!("[neuromate] Database connection failed: {}", e),
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // window
            commands::window::greet,
            commands::window::show_avatar_float,
            commands::window::show_main_window,
            commands::window::trigger_kill_switch,
            commands::window::check_connection,
            // auth
            commands::auth::get_current_user,
            commands::auth::login_user,
            commands::auth::get_user_by_id,
            // community
            commands::community::get_community_feed,
            commands::community::get_trending_topics,
            commands::community::repost,
            commands::community::create_post,
            commands::community::add_post_comment,
            commands::community::get_post_comments,
            commands::community::toggle_helpful_post,
            commands::community::get_helpful_posts,
            commands::community::get_my_posts,
            commands::community::get_ai_post_insight,
            commands::community::get_challenges,
            commands::community::join_challenge,
            commands::community::get_active_challenges,
            // ai
            commands::ai::generate_post_insight,
            commands::ai::get_mood,
            commands::ai::chat_with_ai,
            // chat
            commands::chat::get_chat_sessions,
            commands::chat::create_chat_session,
            commands::chat::update_session_title,
            commands::chat::get_chat_history,
            commands::chat::save_chat_message,
            // activities
            commands::activities::create_task,
            commands::activities::get_tasks,
            commands::activities::update_task,
            commands::activities::delete_task,
            commands::activities::create_mood,
            commands::activities::get_moods,
            commands::activities::delete_mood,
            commands::activities::create_focus_session,
            commands::activities::get_focus_sessions,
            commands::activities::delete_focus_session,
            commands::activities::create_journal,
            commands::activities::get_journals,
            commands::activities::delete_journal,
            commands::activities::create_routine,
            commands::activities::get_routines,
            commands::activities::update_routine,
            commands::activities::delete_routine,
            commands::activities::create_meditation,
            commands::activities::get_meditations,
            commands::activities::delete_meditation,
            commands::activities::get_recent_activities,
            commands::activities::get_heatmap,
            commands::activities::get_dashboard_stats,
            commands::activities::get_productivity_analytics,
            commands::activities::get_mood_analytics,
            commands::activities::get_work_distribution,
            commands::activities::get_habit_metrics,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
