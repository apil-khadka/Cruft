# Project Analyzer & Space Saver

## Vision
A "Deep Clean" utility for developers to identify and safely remove heavy, ephemeral dependency directories (e.g., `node_modules`, `vendor`, `target`, `.venv`, `dist`) across multiple projects to reclaim disk space.

## Core Features
- Recursive, parallelized directory traversal (via jwalk) to find recognized heavy dependency folders.
- System-wide Cache Analyzer: Identify and prune massive developer caches (Cargo, npm, Docker) that are not project-specific.
- Clean, modern desktop UI displaying projects with risk-level color coding.
- Git Intelligence: Detect stale projects, missing remotes, and unpushed changes to ensure safe cleanup.
- Safe, bulk deletion of target directories with system Trash/Recycle Bin integration.
- Real-time scanning progress and feedback using high-efficiency Tauri 2.0 Channels.
- Deep OS integration: "Reveal in Explorer" and "Open in VS Code" shortcuts.