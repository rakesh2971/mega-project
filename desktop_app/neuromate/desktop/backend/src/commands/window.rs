use tauri::AppHandle;
use tauri::Manager;

/// Hide the main window completely and show the floating avatar widget.
/// The main window disappears from the taskbar — only the always-on-top
/// avatar overlay is visible so the user can chat while working.
#[tauri::command]
pub fn show_avatar_float(app: AppHandle) {
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
pub fn show_main_window(app: AppHandle) {
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
pub fn trigger_kill_switch(app: AppHandle) {
    // In a real implementation, this would send shutdown signals to FastAPI
    // For now, we just exit the app
    app.exit(0);
}

/// Greet command (kept from scaffold for testing)
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to NeuroMate!", name)
}
