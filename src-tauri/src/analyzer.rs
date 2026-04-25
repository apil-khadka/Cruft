use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use walkdir::WalkDir;
use git2::{Repository, StatusOptions};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectInfo {
    pub name: String,
    pub path: String,
    pub target_dir: String,
    pub size: u64,
    pub project_type: String,
    pub last_modified: u64,
    pub last_commit: Option<u64>,
    pub has_remote: bool,
    pub has_unpushed_changes: bool,
    pub is_stale: bool,
}

pub struct GitInfo {
    pub last_commit: Option<u64>,
    pub has_remote: bool,
    pub has_unpushed_changes: bool,
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

pub fn get_git_info(path: &Path) -> Option<GitInfo> {
    let repo = Repository::open(path).ok()?;
    
    // Get last commit time
    let last_commit = repo.head()
        .and_then(|h| h.peel_to_commit())
        .map(|c| c.time().seconds() as u64)
        .ok();

    // Check for remote origin
    let has_remote = repo.find_remote("origin").is_ok();

    // Check for unpushed changes / local changes
    let mut status_options = StatusOptions::new();
    status_options.include_untracked(true);
    let has_unpushed_changes = repo.statuses(Some(&mut status_options))
        .map(|s| !s.is_empty())
        .unwrap_or(false);

    Some(GitInfo {
        last_commit,
        has_remote,
        has_unpushed_changes,
    })
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

                let git_info = get_git_info(parent);
                let (last_commit, has_remote, has_unpushed_changes) = match git_info {
                    Some(info) => (info.last_commit, info.has_remote, info.has_unpushed_changes),
                    None => (None, false, false),
                };

                let now = SystemTime::now()
                    .duration_since(SystemTime::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();
                
                let is_stale = match last_commit {
                    Some(t) => (now - t) > (90 * 24 * 60 * 60),
                    None => false,
                };

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
                    last_commit,
                    has_remote,
                    has_unpushed_changes,
                    is_stale,
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

#[tauri::command]
pub async fn delete_target(path: String) -> Result<(), String> {
    let path_buf = PathBuf::from(&path);
    
    // Safety check: ensure the folder name is in our TARGETS list
    let folder_name = path_buf.file_name()
        .ok_or("Invalid path")?
        .to_string_lossy();
        
    if !TARGETS.contains(&folder_name.as_ref()) {
        return Err(format!("Safety block: Cannot delete non-target folder '{}'", folder_name));
    }

    if path_buf.exists() && path_buf.is_dir() {
        // Try to move to trash first
        match trash::delete(&path_buf) {
            Ok(_) => {
                println!("[TRASH] Successfully moved to trash: {}", path);
                Ok(())
            }
            Err(e) => {
                println!("[TRASH ERROR] Failed to move to trash: {}. Falling back to permanent delete.", e);
                // Fallback to permanent deletion if trash fails (common on some Linux setups)
                fs::remove_dir_all(&path_buf).map_err(|e| e.to_string())?;
                println!("[DELETE] Successfully removed permanently: {}", path);
                Ok(())
            }
        }
    } else {
        Err("Path does not exist or is not a directory".to_string())
    }
}

#[tauri::command]
pub async fn reveal_in_explorer(path: String) -> Result<(), String> {
    let path_buf = PathBuf::from(path);
    if !path_buf.exists() {
        return Err("Path does not exist".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg("/select,")
            .arg(path_buf)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(path_buf)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        // On Linux, xdg-open doesn't have a direct "select" equivalent in standard,
        // so we just open the parent directory.
        let parent = path_buf.parent().unwrap_or(&path_buf);
        std::process::Command::new("xdg-open")
            .arg(parent)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn open_in_vscode(path: String) -> Result<(), String> {
    let path_buf = PathBuf::from(path);
    if !path_buf.exists() {
        return Err("Path does not exist".to_string());
    }

    let path_str = path_buf.to_string_lossy().to_string();
    let (cmd, args): (&str, Vec<String>) = if cfg!(target_os = "windows") {
        ("cmd", vec!["/C".to_string(), "code".to_string(), path_str])
    } else {
        ("code", vec![path_str])
    };

    std::process::Command::new(cmd)
        .args(args)
        .spawn()
        .map_err(|e| format!("Failed to open VS Code: {}. Make sure 'code' is in your PATH.", e))?;

    Ok(())
}
