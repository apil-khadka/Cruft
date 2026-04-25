# Workflow

## Product Workflow
1.  **Select Directory:** User selects a root directory via a native OS dialog (`tauri-plugin-dialog`).
2.  **Scan:** Rust backend recursively scans using `jwalk`, identifying signature directories (e.g., `node_modules`, `target`).
3.  **Stream Results:** As target directories are found, their metadata is streamed back to the frontend via `tauri::ipc::Channel`.
4.  **Review:** User reviews the findings in a sortable, color-coded grid/list.
5.  **Execute:** User selects directories to delete and confirms. Rust safely removes the directories.

## Task Workflow
1.  **Plan:** Analyze the task and determine the implementation strategy.
2.  **Code:** Implement the changes following project conventions.
3.  **Test:** Write and run tests to verify the implementation.
4.  **Review:** Perform a final check of the changes.
5.  **Commit:** Commit the changes with a clear, concise message.