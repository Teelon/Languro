const DB_NAME = 'LanguroAudioCache';
const DB_VERSION = 1;
const STORE_BLOBS = 'audio_blobs';
const STORE_URLS = 'signed_urls';

const BLOB_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const URL_CACHE_DURATION = 29 * 60 * 1000; // 29 minutes

type BlobEntry = {
  blob: Blob;
  expiry: number;
};

type UrlEntry = {
  url: string;
  expiry: number;
};

class PersistentAudioCache {
  private static instance: PersistentAudioCache;
  private dbPromise: Promise<IDBDatabase>;

  private constructor() {
    this.dbPromise = this.openDB();
  }

  public static getInstance(): PersistentAudioCache {
    if (!PersistentAudioCache.instance) {
      PersistentAudioCache.instance = new PersistentAudioCache();
    }
    return PersistentAudioCache.instance;
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return; // SSR check

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS);
        }
        if (!db.objectStoreNames.contains(STORE_URLS)) {
          db.createObjectStore(STORE_URLS);
        }
      };
    });
  }

  private async get<T>(storeName: string, key: string): Promise<T | null> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    } catch (e) {
      console.warn('IDB Get Error:', e);
      return null;
    }
  }

  private async set(storeName: string, key: string, value: any): Promise<void> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(value, key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (e) {
      console.warn('IDB Set Error:', e);
    }
  }

  async getAudioBlob(key: string): Promise<string | null> {
    const entry = await this.get<BlobEntry>(STORE_BLOBS, key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      // Lazy delete
      this.delete(STORE_BLOBS, key);
      return null;
    }

    // Create a new Object URL from the stored Blob
    return URL.createObjectURL(entry.blob);
  }

  async setAudioBlob(key: string, blob: Blob): Promise<string> {
    const expiry = Date.now() + BLOB_CACHE_DURATION;
    await this.set(STORE_BLOBS, key, { blob, expiry });
    return URL.createObjectURL(blob);
  }

  async getSignedUrl(key: string): Promise<string | null> {
    const entry = await this.get<UrlEntry>(STORE_URLS, key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.delete(STORE_URLS, key);
      return null;
    }

    return entry.url;
  }

  async setSignedUrl(key: string, url: string): Promise<void> {
    const expiry = Date.now() + URL_CACHE_DURATION;
    await this.set(STORE_URLS, key, { url, expiry });
  }

  private async delete(storeName: string, key: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
  }
}

export const audioCache = PersistentAudioCache.getInstance();
