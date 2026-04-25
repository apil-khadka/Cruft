pub mod analyzer;
pub mod global_cache;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            analyzer::start_scan,
            analyzer::delete_target,
            analyzer::reveal_in_explorer,
            global_cache::scan_global_caches,
            global_cache::prune_global_cache
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
