# Changelog

All notable changes to Cruft are documented here.
This project follows [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).

## [0.1.0] - 2025-01-01

### Added

- Recursive, parallelised directory scanner using `jwalk` to find `node_modules`, `target`, `vendor`, `.venv`, `dist`, `.next`, `.nuxt`
- Real-time streaming of scan results via Tauri 2.0 IPC channels
- Git intelligence: stale-project detection, missing-remote badge, unpushed-commit detection
- Safe deletion via system Trash with permanent-delete fallback
- System Cache Analyser: scans Cargo, npm, pnpm, Yarn, pip, Homebrew, Gradle, Maven, and Docker caches
- "Reveal in Finder/Explorer" and "Open in VS Code" shortcuts
- Sortable project grid (by size, last activity, staleness)
- Bulk multi-select and one-click clean
- Custom macOS-style window controls (close / minimise / maximise) using Tauri 2.0 `@tauri-apps/api/window`
- Toast notification system for surfacing errors
- Dynamic progress bars in the System Caches tab
