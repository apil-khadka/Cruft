# Specification: Rust Streaming Backend

## Goal
Implement a high-performance, parallel file system scanner in Rust that streams results back to the Tauri frontend using Channels.

## Requirements
- Use `jwalk` for parallel directory traversal.
- Detect signature folders: `node_modules`, `target`, `vendor`, `.venv`, `venv`, `dist`, `.next`, `.nuxt`.
- Stream `ProjectInfo` structs (name, path, target_dir, size, project_type) via `tauri::ipc::Channel`.
- Implement basic safety logic to ensure we only target the specified dependency folders.
- Handle Windows-specific metadata for file sizes and modification times.

## Data Structures
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectInfo {
    pub name: String,
    pub path: String,
    pub target_dir: String,
    pub size: u64,
    pub project_type: String,
    pub last_modified: u64,
}
```