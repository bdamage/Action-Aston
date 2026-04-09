const VERSION_KEY = "actionAston_version";

const CLEARABLE_KEYS = ["actionAston_garage", "actionAston_totalCoins"];

/**
 * Called once at startup. If the stored app version doesn't match the current
 * build version, all game progression data is wiped so stale values (e.g. old
 * prices) don't carry over.
 */
export function checkStorageVersion(): void {
  try {
    const stored = localStorage.getItem(VERSION_KEY);
    if (stored !== __APP_VERSION__) {
      for (const key of CLEARABLE_KEYS) {
        localStorage.removeItem(key);
      }
      localStorage.setItem(VERSION_KEY, __APP_VERSION__);
    }
  } catch {
    /* ignore – storage may be unavailable */
  }
}
