use jwalk::WalkDirGeneric;
use std::path::Path;

/// Recursively calculates the total size of a directory using jwalk for parallelized performance.
pub fn calculate_dir_size(path: &Path) -> u64 {
    if !path.exists() {
        return 0;
    }
    WalkDirGeneric::<((), ())>::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type.is_file())
        .map(|e| e.metadata().map(|m| m.len()).unwrap_or(0))
        .sum()
}
