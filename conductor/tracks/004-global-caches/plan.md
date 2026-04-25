# Implementation Plan: Global Cache Analyzer

## Tasks
- [ ] **Task 1: Ecosystem Definition**
    - Define a list of global cache paths for Windows, macOS, and Linux in the Rust backend.
- [ ] **Task 2: Cache Scanner Command**
    - Implement `scan_global_caches` which calculates sizes for these massive folders in parallel.
- [ ] **Task 3: Docker Integration**
    - (Optional/Advanced) Use `sysinfo` or spawn `docker system df` to get Docker usage metrics.
- [ ] **Task 4: Cache UI View**
    - Create a new view or tab in the frontend for "System Caches".
    - Implement specialized "One-click Prune" buttons.
