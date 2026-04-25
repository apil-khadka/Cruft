# Specification: Git Intelligence

## Goal
Help users identify "stale" projects by extracting Git metadata to show the last active date of a project.

## Requirements
- **Git Detection:** Check for a `.git` folder in the project root.
- **Commit Metadata:** Use `git2` to extract the timestamp of the latest commit on the current branch.
- **Stale Marking:** Flag projects as "Stale" if the last commit was more than 90 days ago.
- **Performance:** Ensure Git metadata extraction doesn't slow down the main file scan (run it in the parallel worker thread).

## Data Structures
- **ProjectInfo (Updated):**
```rust
pub struct ProjectInfo {
    // ... previous fields
    pub last_commit: Option<u64>,
    pub is_stale: bool,
}
```
