use git2::Repository;
use jwalk::WalkDirGeneric;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

use crate::utils;

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

/// Events streamed back to the frontend via the IPC channel.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "kind", content = "data", rename_all = "lowercase")]
pub enum ScanEvent {
    /// A new project/target dir was found.
    Project(ProjectInfo),
    /// Scan is finished.
    Done,
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

/// Checks whether the local HEAD has any commits that haven't been pushed to the tracked remote.
fn check_unpushed_commits(repo: &Repository) -> bool {
    let local_oid = match repo.head().and_then(|h| h.peel_to_commit()) {
        Ok(c) => c.id(),
        Err(_) => return false,
    };

    // Try common remote-tracking refs in order of likelihood.
    let remote_oid = [
        "refs/remotes/origin/HEAD",
        "refs/remotes/origin/main",
        "refs/remotes/origin/master",
        "refs/remotes/origin/develop",
    ]
    .iter()
    .find_map(|refname| {
        repo.find_reference(refname)
            .and_then(|r| r.peel_to_commit())
            .map(|c| c.id())
            .ok()
    });

    match remote_oid {
        Some(rid) => repo
            .graph_ahead_behind(local_oid, rid)
            .map(|(ahead, _)| ahead > 0)
            .unwrap_or(false),
        None => false,
    }
}

pub fn get_git_info(path: &Path) -> Option<GitInfo> {
    let repo = Repository::open(path).ok()?;

    let last_commit = repo
        .head()
        .and_then(|h| h.peel_to_commit())
        .map(|c| c.time().seconds() as u64)
        .ok();

    let has_remote = repo.find_remote("origin").is_ok();

    let has_unpushed_changes = if has_remote {
        check_unpushed_commits(&repo)
    } else {
        false
    };

    Some(GitInfo {
        last_commit,
        has_remote,
        has_unpushed_changes,
    })
}

#[tauri::command]
pub async fn start_scan(
    path: String,
    on_event: tauri::ipc::Channel<ScanEvent>,
) -> Result<(), String> {
    let root = PathBuf::from(&path);
    if !root.exists() {
        return Err("Path does not exist".to_string());
    }

    std::thread::spawn(move || {
        // Use jwalk's parallelised walker.
        // process_read_dir lets us:
        //   • skip hidden directories that are NOT dependency targets (don't yield or recurse)
        //   • prevent recursing INTO target directories (yield, but no recursion)
        let walker = WalkDirGeneric::<((), ())>::new(&root)
            .follow_links(true)
            .process_read_dir(|_depth, _path, _state, children| {
                // Step 1 – Remove hidden non-target dirs entirely (no yield, no recurse).
                children.retain(|dir_entry_result| {
                    dir_entry_result
                        .as_ref()
                        .map(|e| {
                            if e.file_type.is_dir() {
                                let name = e.file_name.to_string_lossy();
                                if name.starts_with('.') && !TARGETS.contains(&name.as_ref()) {
                                    return false;
                                }
                            }
                            true
                        })
                        .unwrap_or(true)
                });

                // Step 2 – Mark target dirs to not recurse into (they ARE yielded).
                children.iter_mut().for_each(|dir_entry_result| {
                    if let Ok(e) = dir_entry_result {
                        let name = e.file_name.to_string_lossy();
                        if e.file_type.is_dir() && TARGETS.contains(&name.as_ref()) {
                            e.read_children_path = None;
                        }
                    }
                });
            });

        for entry_result in walker {
            match entry_result {
                Ok(entry) => {
                    // Skip the root entry itself.
                    if entry.depth() == 0 {
                        continue;
                    }

                    if entry.file_type.is_dir() {
                        let name = entry.file_name.to_string_lossy();
                        if TARGETS.contains(&name.as_ref()) {
                            let path = entry.path();
                            let parent = path.parent().unwrap_or(&path);

                            let git_info = get_git_info(parent);
                            let (last_commit, has_remote, has_unpushed_changes) = match git_info {
                                Some(info) => {
                                    (info.last_commit, info.has_remote, info.has_unpushed_changes)
                                }
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
                                size: utils::calculate_dir_size(&path),
                                project_type: get_project_type(&name),
                                last_modified: get_last_modified(&path),
                                last_commit,
                                has_remote,
                                has_unpushed_changes,
                                is_stale,
                            };

                            if on_event.send(ScanEvent::Project(info)).is_err() {
                                // Frontend disconnected — stop scanning.
                                return;
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Scan error: {}", e);
                }
            }
        }

        // Signal the frontend that the scan is fully complete.
        let _ = on_event.send(ScanEvent::Done);
    });

    Ok(())
}

#[tauri::command]
pub async fn delete_target(path: String) -> Result<(), String> {
    let path_buf = PathBuf::from(&path);

    let folder_name = path_buf
        .file_name()
        .ok_or("Invalid path")?
        .to_string_lossy();

    if !TARGETS.contains(&folder_name.as_ref()) {
        return Err(format!(
            "Safety block: Cannot delete non-target folder '{}'",
            folder_name
        ));
    }

    if path_buf.exists() && path_buf.is_dir() {
        match trash::delete(&path_buf) {
            Ok(_) => Ok(()),
            Err(e) => {
                eprintln!("Trash failed: {}. Falling back to permanent delete.", e);
                fs::remove_dir_all(&path_buf).map_err(|e| e.to_string())
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
    std::process::Command::new("explorer")
        .arg("/select,")
        .arg(&path_buf)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg("-R")
        .arg(&path_buf)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    {
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
    let path_buf = PathBuf::from(&path);
    if !path_buf.exists() {
        return Err("Path does not exist".to_string());
    }

    let path_str = path_buf.to_string_lossy().to_string();

    #[cfg(target_os = "windows")]
    std::process::Command::new("cmd")
        .args(["/C", "code", &path_str])
        .spawn()
        .map_err(|e| {
            format!(
                "Failed to open VS Code: {}. Make sure 'code' is in your PATH.",
                e
            )
        })?;

    #[cfg(not(target_os = "windows"))]
    std::process::Command::new("code")
        .arg(&path_str)
        .spawn()
        .map_err(|e| {
            format!(
                "Failed to open VS Code: {}. Make sure 'code' is in your PATH.",
                e
            )
        })?;

    Ok(())
}
