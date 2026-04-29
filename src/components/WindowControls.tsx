import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let isMounted = true;

    appWindow.isMaximized().then((val) => {
      if (isMounted) setIsMaximized(val);
    });

    let unlisten: (() => void) | undefined;
    appWindow
      .onResized(async () => {
        if (isMounted) {
          const maximized = await appWindow.isMaximized();
          setIsMaximized(maximized);
        }
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      isMounted = false;
      unlisten?.();
    };
  }, []);

  const appWindow = getCurrentWindow();

  return (
    <div
      className="flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Close — red */}
      <button
        onClick={() => appWindow.close()}
        className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/40 flex items-center justify-center transition-all hover:brightness-90 focus:outline-none"
        title="Close"
      >
        <span
          className={`text-[#4d0000] text-[7px] font-bold leading-none transition-opacity select-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          ✕
        </span>
      </button>

      {/* Minimize — yellow */}
      <button
        onClick={() => appWindow.minimize()}
        className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#d6a01d]/40 flex items-center justify-center transition-all hover:brightness-90 focus:outline-none"
        title="Minimize"
      >
        <span
          className={`text-[#4d3400] text-[9px] font-bold leading-none transition-opacity select-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          −
        </span>
      </button>

      {/* Maximize / Restore — green */}
      <button
        onClick={() => appWindow.toggleMaximize()}
        className="w-3 h-3 rounded-full bg-[#28c940] border border-[#1aab29]/40 flex items-center justify-center transition-all hover:brightness-90 focus:outline-none"
        title={isMaximized ? "Restore" : "Maximize"}
      >
        <span
          className={`text-[#003d00] text-[7px] font-bold leading-none transition-opacity select-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {isMaximized ? "⊡" : "+"}
        </span>
      </button>
    </div>
  );
}
