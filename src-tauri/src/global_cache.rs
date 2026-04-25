use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use rayon::prelude::*;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GlobalCacheInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub ecosystem: String,
}

#[tauri::command]
pub async fn scan_global_caches() -> Result<Vec<GlobalCacheInfo>, String> {
    let paths = get_cache_paths();
    
    let mut results: Vec<GlobalCacheInfo> = paths.into_par_iter()
        .filter(|(_, _, path)| path.exists())
        .map(|(name, ecosystem, path)| {
            let size = calculate_dir_size(&path);
            GlobalCacheInfo {
                name,
                path: path.to_string_lossy().to_string(),
                size,
                ecosystem,
            }
        })
        .collect();

    // Add Docker usage
    results.extend(get_docker_usage());

    Ok(results)
}

#[tauri::command]
pub async fn prune_global_cache(path: String) -> Result<(), String> {
    if path == "docker://system" {
        let status = std::process::Command::new("docker")
            .args(["system", "prune", "-af"])
            .status()
            .map_err(|e| e.to_string())?;
        
        if status.success() {
            return Ok(());
        } else {
            return Err("Docker prune failed".to_string());
        }
    }

    let path_buf = PathBuf::from(&path);
    
    // Safety check: ensure the path is one of our known cache paths
    let known_paths = get_cache_paths();
    let is_known = known_paths.iter().any(|(_, _, p)| p == &path_buf);
    
    if !is_known {
        return Err("Safety block: Cannot prune unknown cache path".to_string());
    }

    if path_buf.exists() && path_buf.is_dir() {
        // Moving to trash is safer than permanent deletion.
        match trash::delete(&path_buf) {
            Ok(_) => Ok(()),
            Err(_) => {
                // Fallback to permanent deletion if trash fails
                std::fs::remove_dir_all(&path_buf).map_err(|e| e.to_string())
            }
        }
    } else {
        Ok(()) // Already gone
    }
}

pub fn get_cache_paths() -> Vec<(String, String, PathBuf)> {
    let mut paths = Vec::new();
    let home = dirs::home_dir();

    if let Some(home) = home {
        // Rust
        paths.push(("Cargo Registry".to_string(), "Rust".to_string(), home.join(".cargo/registry")));
        paths.push(("Cargo Git".to_string(), "Rust".to_string(), home.join(".cargo/git")));

        // Node
        #[cfg(not(target_os = "windows"))]
        paths.push(("npm Cache".to_string(), "Node.js".to_string(), home.join(".npm")));
        
        #[cfg(target_os = "windows")]
        if let Some(appdata) = dirs::data_dir() {
             paths.push(("npm Cache".to_string(), "Node.js".to_string(), appdata.join("npm-cache")));
        }
    }

    paths
}

pub fn calculate_dir_size(path: &Path) -> u64 {
    if !path.exists() {
        return 0;
    }
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .map(|e| e.metadata().map(|m| m.len()).unwrap_or(0))
        .sum()
}

pub fn get_docker_usage() -> Vec<GlobalCacheInfo> {
    let mut results = Vec::new();
    
    let output = std::process::Command::new("docker")
        .args(["system", "df", "--format", "{{json .}}"])
        .output();

    if let Ok(output) = output {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if let Ok(val) = serde_json::from_str::<serde_json::Value>(line) {
                    let type_str = val["Type"].as_str().unwrap_or("Unknown");
                    let size_str = val["Size"].as_str().unwrap_or("0B");
                    
                    let size = parse_docker_size(size_str);
                    if size > 0 {
                        results.push(GlobalCacheInfo {
                            name: format!("Docker {}", type_str),
                            path: "docker://system".to_string(),
                            size,
                            ecosystem: "Docker".to_string(),
                        });
                    }
                }
            }
        }
    }
    
    results
}

fn parse_docker_size(s: &str) -> u64 {
    let s = s.trim().to_uppercase();
    if s == "0B" || s.is_empty() { return 0; }
    
    // Find where the number ends and unit begins
    let unit_start = s.find(|c: char| c.is_alphabetic()).unwrap_or(s.len());
    let (num_part, unit_part) = s.split_at(unit_start);
    
    let num = num_part.parse::<f64>().unwrap_or(0.0);
    
    let multiplier = match unit_part {
        "GB" | "G" => 1024 * 1024 * 1024,
        "MB" | "M" => 1024 * 1024,
        "KB" | "K" => 1024,
        _ => 1,
    };

    (num * multiplier as f64) as u64
}
