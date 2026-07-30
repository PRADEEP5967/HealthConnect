import { useEffect } from "react";

export type ShortcutHandler = {
  key: string;
  description: string;
  handler: () => void;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      for (const sc of shortcuts) {
        const ctrlMatch = sc.ctrl ? e.metaKey || e.ctrlKey : true;
        const shiftMatch = sc.shift ? e.shiftKey : !sc.shift ? true : e.shiftKey;
        const altMatch = sc.alt ? e.altKey : !sc.alt ? true : e.altKey;

        if (e.key.toLowerCase() === sc.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          sc.handler();
          return;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}
