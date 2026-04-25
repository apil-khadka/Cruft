use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectInfo {
    pub name: String,
    pub path: String,
    pub target_dir: String,
    pub size: u64,
    pub project_type: String,
    pub last_modified: u64,
}

pub const TARGETS: &[&str] = &[
    "node_modules",
    "target",
    "vendor",
    ".venv",
    "venv",
    "dist",
    ".next",
    ".nuxt",
];

pub fn calculate_dir_size(path: &Path) -> u64 {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .map(|e| e.metadata().map(|m| m.len()).unwrap_or(0))
        .sum()
}

pub fn get_project_type(dir_name: &str) -> String {
    match dir_name {
        "node_modules" => "Node.js".to_string(),
        "target" => "Rust".to_string(),
        "vendor" => "PHP/Laravel".to_string(),
        ".venv" | "venv" => "Python".to_string(),
        "dist" | ".next" | ".nuxt" => "Build Artifact".to_string(),
        _ => "Unknown".to_string(),
    }
}

pub fn get_last_modified(path: &Path) -> u64 {
    fs::metadata(path)
        .and_then(|m| m.modified())
        .unwrap_or_else(|_| SystemTime::now())
        .duration_since(SystemTime::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

#[tauri::command]
pub async fn start_scan(path: String, on_event: tauri::ipc::Channel<ProjectInfo>) -> Result<(), String> {
    println!("Starting scan at: {}", path);
    let root = PathBuf::from(path);

    if !root.exists() {
        return Err("Path does not exist".to_string());
    }

    std::thread::spawn(move || {
        println!("Scanner thread started");
        
        // Use follow_links(true) to handle Windows junctions/symlinks
        let mut it = WalkDir::new(&root)
            .follow_links(true)
            .into_iter();

        loop {
            let entry = match it.next() {
                None => {
                    println!("Scan finished: No more entries");
                    break;
                },
                Some(Ok(entry)) => entry,
                Some(Err(e)) => {
                    println!("Scan error at {:?}: {}", e.path(), e);
                    continue;
                },
            };

            let path = entry.path();
            let file_name = entry.file_name().to_string_lossy();
            let depth = entry.depth();

            // Check if this is a target directory
            if entry.file_type().is_dir() && TARGETS.contains(&file_name.as_ref()) {
                println!("[MATCH] Found target: {}", path.display());
                let parent = path.parent().unwrap_or(path);

                let info = ProjectInfo {
                    name: parent
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string(),
                    path: parent.to_string_lossy().to_string(),
                    target_dir: path.to_string_lossy().to_string(),
                    size: calculate_dir_size(path),
                    project_type: get_project_type(&file_name),
                    last_modified: get_last_modified(path),
                };

                if let Err(e) = on_event.send(info) {
                    println!("Failed to send project info via channel: {}", e);
                    break;
                }
                
                it.skip_current_dir();
                continue;
            }

            // Only skip HIDDEN DIRECTORIES. Don't skip hidden files like .env
            if entry.file_type().is_dir() && depth > 0 && file_name.starts_with('.') && !TARGETS.contains(&file_name.as_ref()) {
                println!("[SKIP] Skipping hidden folder: {}", path.display());
                it.skip_current_dir();
                continue;
            }
        }
    });

    Ok(())
}
