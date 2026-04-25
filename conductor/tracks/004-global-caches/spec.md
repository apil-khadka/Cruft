# Specification: Global Cache Analyzer

## Goal
Identify and prune massive system-wide developer caches that are not tied to a specific project folder.

## Requirements
- **System Scan:** Implement a separate scan mode for global directories:
    - Rust: `~/.cargo/registry`, `~/.cargo/git`
    - Node: `%AppData%\npm-cache` (Win), `~/.npm` (Unix)
    - Docker: Volumes and Image layers.
- **Size Aggregation:** Show the total size consumed by each ecosystem's cache.
- **Selective Pruning:** Provide specialized "Prune" commands for each (e.g., `npm cache clean`, `cargo-cache`).

## Data Structures
- **GlobalCacheInfo:**
```rust
pub struct GlobalCacheInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub ecosystem: String,
}
```
