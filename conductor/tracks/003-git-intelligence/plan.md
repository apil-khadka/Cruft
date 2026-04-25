# Implementation Plan: Git Intelligence

## Tasks
- [x] **Task 1: Add Git Dependencies**
    - Add `git2 = "0.19"` and `chrono = "0.4"` to `src-tauri/Cargo.toml`.
- [x] **Task 2: Implement Git Utility**
    - Create a helper in `analyzer.rs` to extract the last commit timestamp from a directory.
- [x] **Task 3: Integrate with Scanner**
    - Update the `start_scan` loop to perform Git detection if a project is found.
- [x] **Task 4: Frontend UI update**
    - Update `ProjectCard` to display "Last Commit: [Date]".
    - Add a "Stale" badge to projects with no activity in 90+ days.
    - Add a filter/sort option for "Stale First".
