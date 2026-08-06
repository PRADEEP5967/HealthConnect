// Cloud sync layer — now a no-op. All data lives in localStorage.
// Kept as an empty module so existing imports don't break.

export async function syncDirectory(): Promise<void> {}
