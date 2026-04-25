import React from "react";
import { ProjectInfo, formatBytes } from "../lib/api";
import { 
  Trash2, FolderOpen, Box, Hash, Terminal, 
  ExternalLink, Code, Clock, CloudOff, AlertCircle 
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface ProjectCardProps {
  project: ProjectInfo;
  isSelected: boolean;
  onToggleSelect: (path: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  onToggleSelect,
}) => {
  const isHighRisk = project.size > 1024 * 1024 * 1024;
  const isMediumRisk = project.size > 500 * 1024 * 1024 && !isHighRisk;

  let sizeColor = "text-green-500";
  if (isHighRisk) sizeColor = "text-red-500";
  else if (isMediumRisk) sizeColor = "text-yellow-500";

  const getIcon = () => {
    switch (project.project_type) {
      case "Node.js":
        return <Box className="w-5 h-5 text-green-600" />;
      case "Rust":
        return <Hash className="w-5 h-5 text-orange-600" />;
      case "PHP/Laravel":
        return <Terminal className="w-5 h-5 text-indigo-500" />;
      default:
        return <FolderOpen className="w-5 h-5 text-blue-500" />;
    }
  };

  const reveal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("reveal_in_explorer", { path: project.target_dir });
    } catch (err) {
      console.error("Failed to reveal:", err);
    }
  };

  const openInVSCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("open_in_vscode", { path: project.path });
    } catch (err) {
      console.error("Failed to open in VS Code:", err);
    }
  };

  return (
    <div
      onClick={() => onToggleSelect(project.target_dir)}
      className={`p-4 rounded-xl border transition-all cursor-pointer select-none group flex flex-col gap-3 ${
        isSelected
          ? "border-blue-500 bg-blue-50/20 shadow-sm"
          : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={isSelected}
            readOnly
          />
          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
            {getIcon()}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-gray-900 truncate">
              {project.name}
              {project.is_stale && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black bg-amber-100 text-amber-700 rounded uppercase tracking-wider">
                  Stale
                </span>
              )}
            </h3>
            <p
              className="text-xs text-gray-500 truncate max-w-[180px]"
              title={project.path}
            >
              {project.path}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-lg font-bold ${sizeColor}`}>
            {formatBytes(project.size)}
          </span>
          {project.last_commit ? (
            <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3" />
              {new Date(project.last_commit * 1000).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-[10px] text-gray-400 mt-1">
              {new Date(project.last_modified * 1000).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Git Status Bar */}
      {(project.has_unpushed_changes || !project.has_remote) && (
        <div className="flex flex-wrap gap-2">
          {!project.has_remote && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              <CloudOff className="w-3 h-3" />
              NO REMOTE
            </div>
          )}
          {project.has_unpushed_changes && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              UNPUSHED CHANGES
            </div>
          )}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
          {project.project_type}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={openInVSCode}
            className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
            title="Open project in VS Code"
          >
            <Code className="w-3 h-3" />
            VS Code
          </button>
          <button
            onClick={reveal}
            className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
            title="Reveal in Explorer"
          >
            <ExternalLink className="w-3 h-3" />
            Reveal
          </button>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Trash2 className="w-3 h-3" />{" "}
            {project.target_dir.split("/").pop() ||
              project.target_dir.split("\\").pop()}
          </span>
        </div>
      </div>
    </div>
  );
};
