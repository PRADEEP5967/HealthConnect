import { useEffect, useState } from "react";

// Reactive read of localStorage-backed data. Re-runs `fn` after mount and on
// hc-storage events. Returns `initial` on SSR / first render to avoid hydration
// mismatch, then swaps to the live value in an effect.
// Also exposes a `loading` flag that is true until the first real value is computed.
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

// Variant that also returns a loading flag, useful for showing skeletons.
export function useLiveLoading<T>(fn: () => T, initial: T): { data: T; loading: boolean } {
  const [val, setVal] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const run = () => {
      setVal(fn());
      setLoading(false);
    };
    run();
    const h = () => run();
    window.addEventListener("hc-storage", h);
    return () => window.removeEventListener("hc-storage", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data: val, loading };
}
