use jwalk::WalkDirGeneric;
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

/// Recursively calculates the size of a directory.
/// Note: For high performance in scanning, we might defer this or run it in parallel.
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
    let root = PathBuf::from(path);

    if !root.exists() {
        return Err("Path does not exist".to_string());
    }

    // Spawn a standard thread for the heavy parallel walk
    std::thread::spawn(move || {
        WalkDirGeneric::<((), bool)>::new(&root)
            .parallelism(jwalk::Parallelism::RayonDefaultPool { 
                busy_timeout: std::time::Duration::from_millis(10) 
            })
            .process_read_dir(|_, _, _, children| {
                // Skip hidden directories but keep recognized targets
                children.retain(|dir_entry_result| {
                    dir_entry_result
                        .as_ref()
                        .map(|e| {
                            let name = e.file_name.to_string_lossy();
                            !name.starts_with('.') || TARGETS.contains(&name.as_ref())
                        })
                        .unwrap_or(false)
                });
            })
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type.is_dir())
            .for_each(|entry| {
                let name = entry.file_name.to_string_lossy();
                if TARGETS.contains(&name.as_ref()) {
                    let target_path = entry.path();
                    let parent = target_path.parent().unwrap_or(&target_path);

                    let info = ProjectInfo {
                        name: parent
                            .file_name()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .to_string(),
                        path: parent.to_string_lossy().to_string(),
                        target_dir: target_path.to_string_lossy().to_string(),
                        size: calculate_dir_size(&target_path),
                        project_type: get_project_type(&name),
                        last_modified: get_last_modified(&target_path),
                    };

                    let _ = on_event.send(info);
                }
            });
    });

    Ok(())
}

