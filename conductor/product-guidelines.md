# Product Guidelines

-   **Native Feel:** The app must feel like a native desktop app, avoiding web-like behaviors (no text selection on UI elements, custom native-like titlebar, OS-specific aesthetics).
-   **Performance:** Directory scanning must be parallelized (`jwalk`) and streamed to the UI to avoid freezes or IPC bottlenecks.
-   **Safety:** Deletion must be strictly guarded against deleting anything other than recognized dependency folders (`node_modules`, `target`, `vendor`, `.venv`, etc.).
-   **Progressive Loading:** UI should update smoothly as scan results come in, rather than waiting for a massive single payload.