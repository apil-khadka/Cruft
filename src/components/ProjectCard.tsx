import React from "react";
import { ProjectInfo, formatBytes } from "../lib/api";
import { Trash2, FolderOpen, Box, Hash, Terminal } from "lucide-react";

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

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50/10"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={isSelected}
            onChange={() => onToggleSelect(project.target_dir)}
          />
          <div className="p-2 bg-gray-50 rounded-lg">{getIcon()}</div>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-gray-900 truncate">
              {project.name}
            </h3>
            <p
              className="text-xs text-gray-500 truncate max-w-[200px]"
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
          <p className="text-xs text-gray-400 mt-1">
            {new Date(project.last_modified * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
          {project.project_type}
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Trash2 className="w-3 h-3" />{" "}
          {project.target_dir.split("/").pop() ||
            project.target_dir.split("\\").pop()}
        </span>
      </div>
    </div>
  );
};
