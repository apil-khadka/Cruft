import { useState, useMemo } from "react";
import { invoke, Channel } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { WindowControls } from "tauri-controls";
import { FolderSearch, Trash2, RefreshCcw, ShieldCheck } from "lucide-react";
import { ProjectInfo, formatBytes } from "./lib/api";
import { ProjectCard } from "./components/ProjectCard";
import "./App.css";

function App() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [scanPath, setScanPath] = useState<string | null>(null);

  const totalSize = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.size, 0);
  }, [projects]);

  const selectedSize = useMemo(() => {
    return projects
      .filter((p) => selectedPaths.has(p.target_dir))
      .reduce((acc, p) => acc + p.size, 0);
  }, [projects, selectedPaths]);

  const toggleSelect = (path: string) => {
    const newSelected = new Set(selectedPaths);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedPaths(newSelected);
  };

  const startScan = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select a folder to scan for project dependencies",
    });

    if (selected) {
      setScanPath(selected);
      setProjects([]);
      setSelectedPaths(new Set());
      setIsScanning(true);

      const onEvent = new Channel<ProjectInfo>();
      onEvent.onmessage = (project) => {
        setProjects((prev) => [...prev, project]);
      };

      try {
        await invoke("start_scan", { path: selected, onEvent });
      } catch (err) {
        console.error("Scan failed:", err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 select-none">
      {/* Native Titlebar Area */}
      <div className="h-10 flex items-center justify-between px-4 bg-white border-b border-gray-200" data-tauri-drag-region>
        <div className="flex items-center gap-2 pointer-events-none">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold">Project Analyzer</span>
        </div>
        <WindowControls />
      </div>

      {/* Header / Stats */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Project Analyzer</h1>
            <p className="text-sm text-gray-500 mt-1">
              Find and remove heavy dependencies to reclaim space.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Potential Savings</p>
              <p className="text-xl font-bold text-blue-600">{formatBytes(totalSize)}</p>
            </div>
            <button
              onClick={startScan}
              disabled={isScanning}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              {isScanning ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <FolderSearch className="w-4 h-4" />}
              {isScanning ? "Scanning..." : "Scan Directory"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {projects.length === 0 && !isScanning ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FolderSearch className="w-8 h-8 text-blue-200" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No projects scanned yet</h3>
              <p className="text-gray-500 max-w-xs mt-1">
                Select a root directory (like your Development folder) to start analyzing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <ProjectCard
                  key={p.target_dir}
                  project={p}
                  isSelected={selectedPaths.has(p.target_dir)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {selectedPaths.size > 0 && (
        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                {selectedPaths.size} projects selected
              </span>
              <div className="h-4 w-px bg-gray-200" />
              <span className="text-sm font-bold text-red-600">
                Reclaim {formatBytes(selectedSize)}
              </span>
            </div>
            <button 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-sm"
              onClick={() => alert("Deletion logic not yet implemented in frontend safety check.")}
            >
              <Trash2 className="w-4 h-4" />
              Clean Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
