export const chromeStorage = {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get(key);
      return (result[key] as T) ?? null;
    }

    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async set(key: string, value: any) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
};
