import { useState, useMemo } from "react";
import { invoke, Channel } from "@tauri-apps/api/core";
import { open, ask } from "@tauri-apps/plugin-dialog";
import { WindowControls } from "tauri-controls";
import { FolderSearch, Trash2, RefreshCcw, ShieldCheck, CheckSquare, Square } from "lucide-react";
import { ProjectInfo, formatBytes } from "./lib/api";
import { ProjectCard } from "./components/ProjectCard";
import "./App.css";

type SortMode = "size" | "activity" | "stale";

function App() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isCleaning, setIsCleaning] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("size");

  const sortedProjects = useMemo(() => {
    const list = [...projects];
    switch (sortMode) {
      case "size":
        return list.sort((a, b) => b.size - a.size);
      case "activity":
        return list.sort((a, b) => (b.last_commit || 0) - (a.last_commit || 0));
      case "stale":
        return list.sort((a, b) => {
          if (a.is_stale === b.is_stale) return b.size - a.size;
          return a.is_stale ? -1 : 1;
        });
      default:
        return list;
    }
  }, [projects, sortMode]);

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

  const toggleSelectAll = () => {
    if (selectedPaths.size === projects.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(projects.map(p => p.target_dir)));
    }
  };

  const startScan = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select a folder to scan for project dependencies",
    });

    if (selected) {
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

  const cleanSelected = async () => {
    const count = selectedPaths.size;
    const size = formatBytes(selectedSize);
    
    const confirmed = await ask(
      `Are you sure you want to move dependency folders from ${count} projects to the Trash? This will free up ${size}.`,
      { 
        title: "Move to Trash",
        kind: "warning",
        okLabel: "Move to Trash",
        cancelLabel: "Cancel"
      }
    );

    if (confirmed) {
      setIsCleaning(true);
      const pathsToDelete = Array.from(selectedPaths);
      
      for (const path of pathsToDelete) {
        try {
          await invoke("delete_target", { path });
          setProjects(prev => prev.filter(p => p.target_dir !== path));
          setSelectedPaths(prev => {
            const next = new Set(prev);
            next.delete(path);
            return next;
          });
        } catch (err) {
          console.error(`Failed to delete ${path}:`, err);
        }
      }
      setIsCleaning(false);
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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Space Saver</h1>
            <p className="text-sm text-gray-500 mt-1">
              Identify and remove heavy `node_modules`, `target`, and `vendor` folders.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Potential Savings</p>
              <p className="text-2xl font-black text-blue-600 tracking-tight">{formatBytes(totalSize)}</p>
            </div>
            <button
              onClick={startScan}
              disabled={isScanning || isCleaning}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 shadow-blue-100"
            >
              {isScanning ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <FolderSearch className="w-4 h-4" />}
              {isScanning ? "Scanning..." : "Scan Directory"}
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {projects.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
              >
                {selectedPaths.size === projects.length ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                {selectedPaths.size === projects.length ? "Deselect All" : "Select All"}
              </button>
              
              <div className="h-4 w-px bg-gray-300" />

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort by:</span>
                <select 
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="bg-transparent text-sm font-bold text-gray-600 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <option value="size">Largest First</option>
                  <option value="activity">Recent Activity</option>
                  <option value="stale">Stale Projects First</option>
                </select>
              </div>
            </div>
            
            <span className="text-xs text-gray-400 font-bold italic">
              Found {projects.length} targets
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          {projects.length === 0 && !isScanning ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <div className="w-20 h-20 bg-white border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center mb-6">
                <FolderSearch className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Ready to analyze</h3>
              <p className="text-gray-500 max-w-xs mt-2 leading-relaxed">
                Select your development folder to find space-hogging dependency directories.
              </p>
              <button 
                onClick={startScan}
                className="mt-8 text-blue-600 font-bold hover:underline underline-offset-4"
              >
                Choose a folder to scan →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
              {sortedProjects.map((p) => (
                <ProjectCard
                  key={p.target_dir}
                  project={p}
                  isSelected={selectedPaths.has(p.target_dir)}
                  onToggleSelect={toggleSelect}
                />
              ))}
              {isScanning && (
                <div className="p-4 rounded-xl border border-dashed border-gray-300 flex items-center justify-center bg-white/50 animate-pulse h-[100px]">
                  <RefreshCcw className="w-5 h-5 text-gray-400 animate-spin mr-3" />
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Searching...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {selectedPaths.size > 0 && (
        <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected</span>
                <span className="text-sm font-black text-gray-700">{selectedPaths.size} Projects</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Recovery Total</span>
                <span className="text-2xl font-black text-red-600 tracking-tighter">{formatBytes(selectedSize)}</span>
              </div>
            </div>
            <button 
              disabled={isCleaning}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 shadow-red-100"
              onClick={cleanSelected}
            >
              {isCleaning ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              {isCleaning ? "TRASHING..." : "MOVE TO TRASH"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
