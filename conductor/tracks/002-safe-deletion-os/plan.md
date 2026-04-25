# Implementation Plan: Safe Deletion & OS Integration

## Tasks
- [x] **Task 1: Add OS Integration Dependencies**
    - Add `trash = "5.2"` to `src-tauri/Cargo.toml`.
- [x] **Task 2: Implement Trash Deletion**
    - Replace `fs::remove_dir_all` with `trash::delete` in `src-tauri/src/analyzer.rs`.
    - Implement error handling for cases where trash is not available.
- [x] **Task 3: Implement Cross-Platform "Open in VS Code"**
    - Create a command that spawns `code` or `code.cmd` based on the platform.
- [x] **Task 4: Refine Reveal Command**
    - Update `reveal_in_explorer` to handle Linux distributions via `xdg-open`.
- [x] **Task 5: Frontend Update**
    - Add "Open in VS Code" button to `ProjectCard`.
    - Update the deletion confirmation dialog to mention "Move to Trash" instead of "Delete Forever".

## Phase: Review Fixes
- [x] Task: Apply review suggestions a0200b6
