export interface ProjectInfo {
  name: string;
  path: string;
  target_dir: string;
  size: number;
  project_type: string;
  last_modified: number;
  last_commit: number | null;
  has_remote: boolean;
  has_unpushed_changes: boolean;
  is_stale: boolean;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
