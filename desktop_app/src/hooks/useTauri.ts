import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/store/useAppStore";

// ── Window helpers ────────────────────────────────────────────────────────

/**
 * Minimize main window and show the floating avatar overlay.
 * Calls the Rust `show_avatar_float` command.
 */
export async function minimizeToFloat(): Promise<void> {
  try {
    await invoke("show_avatar_float");
    useAppStore.getState().setAvatarFloating(true);
  } catch (err) {
    console.error("[useTauri] show_avatar_float failed:", err);
  }
}

/**
 * Restore the main window from float mode.
 * Calls the Rust `show_main_window` command.
 */
export async function restoreFromFloat(): Promise<void> {
  try {
    await invoke("show_main_window");
    useAppStore.getState().setAvatarFloating(false);
  } catch (err) {
    console.error("[useTauri] show_main_window failed:", err);
  }
}

/**
 * Trigger the kill switch — shuts down all AI processes.
 * Calls the Rust `trigger_kill_switch` command.
 */
export async function triggerKillSwitch(): Promise<void> {
  try {
    await invoke("trigger_kill_switch");
  } catch (err) {
    console.error("[useTauri] trigger_kill_switch failed:", err);
  }
}

/**
 * Set the main window always-on-top status.
 */
export async function setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
  try {
    const win = getCurrentWindow();
    await win.setAlwaysOnTop(alwaysOnTop);
  } catch (err) {
    console.error("[useTauri] setAlwaysOnTop failed:", err);
  }
}

/**
 * Minimize the main window without triggering float mode.
 */
export async function minimizeWindow(): Promise<void> {
  try {
    const win = getCurrentWindow();
    await win.minimize();
  } catch (err) {
    console.error("[useTauri] minimize failed:", err);
  }
}

/**
 * Toggle maximize/restore for the main window.
 */
export async function toggleMaximize(): Promise<void> {
  try {
    const win = getCurrentWindow();
    const isMaximized = await win.isMaximized();
    if (isMaximized) {
      await win.unmaximize();
    } else {
      await win.maximize();
    }
  } catch (err) {
    console.error("[useTauri] toggleMaximize failed:", err);
  }
}

/**
 * Close the application window.
 */
export async function closeWindow(): Promise<void> {
  try {
    const win = getCurrentWindow();
    await win.close();
  } catch (err) {
    console.error("[useTauri] close failed:", err);
  }
}

/**
 * Test the Rust bridge (returns greeting).
 */
export async function greet(name: string): Promise<string> {
  try {
    return await invoke<string>("greet", { name });
  } catch (err) {
    console.error("[useTauri] greet failed:", err);
    return "";
  }
}
