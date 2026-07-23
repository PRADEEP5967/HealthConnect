import { useEffect, useState } from "react";

// Reactive read of localStorage-backed data. Re-runs `fn` after mount and on
// hc-storage events. Returns `initial` on SSR / first render to avoid hydration
// mismatch, then swaps to the live value in an effect.
export function useLive<T>(fn: () => T, initial: T): T {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    const run = () => setVal(fn());
    run();
    const h = () => run();
    window.addEventListener("hc-storage", h);
    return () => window.removeEventListener("hc-storage", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return val;
}
