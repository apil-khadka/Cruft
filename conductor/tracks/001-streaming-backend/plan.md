# Implementation Plan: Rust Streaming Backend

## Tasks
- [x] **Task 1: Setup Dependencies**
    - Add `jwalk`, `rayon`, and `anyhow` to `src-tauri/Cargo.toml`.
- [x] **Task 2: Implement Analyzer Module**
    - Create `src-tauri/src/analyzer.rs` with the `ProjectInfo` struct and the `jwalk` logic.
- [x] **Task 3: Implement Scan Command**
    - Create the `start_scan` command that initializes the `Channel` and spawns the background scanning thread.
- [x] **Task 4: Register Commands & Plugins**
    - Register `start_scan` and `tauri-plugin-dialog` in `src-tauri/src/lib.rs`.
- [x] **Task 5: Validation**
    - Create a small test or temporary log to verify that the scanner correctly identifies local projects.