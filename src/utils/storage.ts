/**
 * Safe client-side storage wrapper designed to prevent SecurityError / access crashes
 * in sandboxed frames, restricted WebViews, or private browser frames.
 */

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return key in this.store ? this.store[key] : null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

function createSafeStorage(type: "localStorage" | "sessionStorage"): Storage {
  try {
    if (typeof window !== "undefined") {
      const storageObj = window[type];
      if (storageObj) {
        const testKey = `__monarch_storage_test_${type}__`;
        storageObj.setItem(testKey, testKey);
        const retrieved = storageObj.getItem(testKey);
        storageObj.removeItem(testKey);
        if (retrieved === testKey) {
          return storageObj;
        }
      }
    }
  } catch (e) {
    console.warn(`SafeStorage: Native ${type} is blocked or unavailable (iframe sandbox). Deploying in-memory backup.`, e);
  }
  return new MemoryStorage();
}

export const safeLocalStorage = createSafeStorage("localStorage");
export const safeSessionStorage = createSafeStorage("sessionStorage");
