# Specification: Safe Deletion & OS Integration

## Goal
Provide a safer user experience by using the system trash instead of permanent deletion, and improve developer productivity with deep OS integration.

## Requirements
- **Cross-Platform Trash:** Integrate the `trash` crate to move folders to the Recycle Bin (Windows), Trash (macOS), or Trash Can (Linux).
- **Open in VS Code:** Implement a command to open project directories directly in VS Code.
- **Cross-Platform Reveal:** Ensure the "Reveal in Explorer" feature works correctly on Windows, macOS (Finder), and Linux (xdg-open).
- **Fallbacks:** Provide a fallback to permanent deletion if trash integration fails on specific Linux environments.

## Data Structures
- No new frontend structures; update `delete_target` command.
- New command: `open_in_vscode(path: String)`.
