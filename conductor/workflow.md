# Workflow

1.  **Select Directory:** User selects a root directory via a native OS dialog (`tauri-plugin-dialog`).
2.  **Scan:** Rust backend recursively scans using `jwalk`, identifying signature directories (e.g., `node_modules`, `target`).
3.  **Stream Results:** As target directories are found, their metadata is streamed back to the frontend via `tauri::ipc::Channel`.
4.  **Review:** User reviews the findings in a sortable, color-coded grid/list.
5.  **Execute:** User selects directories to delete and confirms. Rust safely removes the directories.