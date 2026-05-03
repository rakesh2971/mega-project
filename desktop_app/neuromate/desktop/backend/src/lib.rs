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
            // auth
            commands::auth::get_current_user,
            commands::auth::login_user,
            // community
            commands::community::get_community_feed,
            commands::community::get_trending_topics,
            commands::community::repost,
            // ai
            commands::ai::generate_post_insight,
            commands::ai::get_mood,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
