# Tech Stack

## Frontend
- **Framework:** React + TypeScript via Vite
- **UI Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI primitives), lucide-react for icons
- **Window Controls:** `tauri-controls` for native-looking titlebars

## Backend (Tauri 2.0 / Rust)
- **Framework:** Tauri 2.0
- **File Traversal:** `jwalk` for parallelized, high-performance file system scanning.
- **Communication:** Tauri 2.0 `tauri::ipc::Channel` for streaming scan results.
- Native Integration: tauri-plugin-dialog for native file pickers and the trash crate for safe deletion.