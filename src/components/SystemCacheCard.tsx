import { Trash2, HardDrive } from "lucide-react";
import { GlobalCacheInfo, formatBytes } from "../lib/api";

interface SystemCacheCardProps {
  cache: GlobalCacheInfo;
  onPrune: (path: string) => void;
  isPruning: boolean;
  /** The size of the largest cache in the current list — used to scale the progress bar. */
  maxSize: number;
}

export function SystemCacheCard({
  cache,
  onPrune,
  isPruning,
  maxSize,
}: SystemCacheCardProps) {
  const barWidth =
    maxSize > 0 ? Math.min((cache.size / maxSize) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{cache.name}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {cache.ecosystem}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gray-900 tracking-tight">
            {formatBytes(cache.size)}
          </p>
          <p
            className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]"
            title={cache.path}
          >
            {cache.path}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <button
          onClick={() => onPrune(cache.path)}
          disabled={isPruning}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          PRUNE CACHE
        </button>
      </div>
    </div>
  );
}
