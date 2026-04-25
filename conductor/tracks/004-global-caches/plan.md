# Implementation Plan: Global Cache Analyzer

## Tasks
- [x] **Task 1: Ecosystem Definition**
    - Define a list of global cache paths for Windows, macOS, and Linux in the Rust backend.
- [x] **Task 2: Cache Scanner Command**
    - Implement `scan_global_caches` which calculates sizes for these massive folders in parallel.
- [x] **Task 3: Docker Integration**
    - (Optional/Advanced) Use `sysinfo` or spawn `docker system df` to get Docker usage metrics.
- [x] **Task 4: Cache UI View**
    - Create a new view or tab in the frontend for "System Caches".
    - Implement specialized "One-click Prune" buttons.
