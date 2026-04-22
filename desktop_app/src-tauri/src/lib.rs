// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{AppHandle, Manager};

// ── Window management commands ──────────────────────────────────────────────

/// Hide the main window completely and show the floating avatar widget.
/// The main window disappears from the taskbar — only the always-on-top
/// avatar overlay is visible so the user can chat while working.
#[tauri::command]
fn show_avatar_float(app: AppHandle) {
    if let Some(float_win) = app.get_webview_window("avatar-float") {
        let _ = float_win.show();
        let _ = float_win.set_focus();
    }
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.hide(); // fully hidden, not on taskbar
    }
}

/// Hide the floating avatar window and restore the main window
#[tauri::command]
fn show_main_window(app: AppHandle) {
    if let Some(float_win) = app.get_webview_window("avatar-float") {
        let _ = float_win.hide();
    }
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.show();
        let _ = main_win.unminimize();
        let _ = main_win.set_focus();
    }
}

/// Kill switch: terminates all background processes and closes
#[tauri::command]
fn trigger_kill_switch(app: AppHandle) {
    // In a real implementation, this would send shutdown signals to FastAPI
    // For now, we just exit the app
    app.exit(0);
}

/// Greet command (kept from scaffold for testing)
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to NeuroMate!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            show_avatar_float,
            show_main_window,
            trigger_kill_switch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
