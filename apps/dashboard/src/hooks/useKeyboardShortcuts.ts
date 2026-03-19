import { useEffect } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k" && shortcuts["mod+k"]) {
        e.preventDefault();
        shortcuts["mod+k"]();
      }
      if (mod && e.shiftKey && e.key === "D" && shortcuts["mod+shift+d"]) {
        e.preventDefault();
        shortcuts["mod+shift+d"]();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
