# Project Analyzer & Space Saver

## Vision
A "Deep Clean" utility for developers to identify and safely remove heavy, ephemeral dependency directories (e.g., `node_modules`, `vendor`, `target`, `.venv`, `dist`) across multiple projects to reclaim disk space.

## Core Features
- Recursive, parallelized directory traversal (via jwalk) to find recognized heavy dependency folders.
- Clean, modern desktop UI displaying projects with risk-level color coding.
- Safe, bulk deletion of target directories.
- Real-time scanning progress and feedback using high-efficiency Tauri 2.0 Channels.