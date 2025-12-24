/**
 * 本地缓存服务 - 使用 IndexedDB
 * 实现离线访问和数据持久化
 */

const DB_NAME = 'MyPaperManagerCache';
const DB_VERSION = 1;

// 数据库存储
const STORES = {
  DOCUMENTS: 'documents',
  METADATA: 'metadata',
  COLLECTIONS: 'collections',
  SETTINGS: 'settings'
};

let dbInstance = null;

/**
 * 初始化数据库
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB 初始化失败:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 文献缓存存储
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const docStore = db.createObjectStore(STORES.DOCUMENTS, { keyPath: '_id' });
        docStore.createIndex('owner', 'owner', { unique: false });
        docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        docStore.createIndex('collectionId', 'collectionId', { unique: false });
      }

      // 元数据存储（如最后同步时间等）
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      }

      // 目录缓存
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        const colStore = db.createObjectStore(STORES.COLLECTIONS, { keyPath: '_id' });
        colStore.createIndex('owner', 'owner', { unique: false });
      }

      // 设置存储
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
  });
};

/**
 * 缓存服务
 */
export const CacheService = {
  /**
   * 初始化缓存服务
   */
  async init() {
    try {
      await initDB();
      console.log('缓存服务初始化成功');
      return true;
    } catch (error) {
      console.error('缓存服务初始化失败:', error);
      return false;
    }
  },

  /**
   * 缓存文献列表
   */
  async cacheDocuments(docs) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORES.DOCUMENTS);

      for (const doc of docs) {
        store.put({ ...doc, cachedAt: new Date().toISOString() });
      }

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      // 更新同步时间
      await this.setMetadata('lastDocSync', new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('缓存文献失败:', error);
      return false;
    }
  },

  /**
   * 获取缓存的文献
   */
  async getCachedDocuments() {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readonly');
      const store = tx.objectStore(STORES.DOCUMENTS);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('获取缓存文献失败:', error);
      return [];
    }
  },

  /**
   * 获取单个缓存的文献
   */
  async getCachedDocument(id) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readonly');
      const store = tx.objectStore(STORES.DOCUMENTS);

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('获取缓存文献失败:', error);
      return null;
    }
  },

  /**
   * 删除缓存的文献
   */
  async removeCachedDocument(id) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORES.DOCUMENTS);

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('删除缓存文献失败:', error);
      return false;
    }
  },

  /**
   * 缓存目录列表
   */
  async cacheCollections(collections) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.COLLECTIONS, 'readwrite');
      const store = tx.objectStore(STORES.COLLECTIONS);

      // 扁平化目录树
      const flattenCollections = (items, result = []) => {
        for (const item of items) {
          result.push({ ...item, children: undefined, cachedAt: new Date().toISOString() });
          if (item.children?.length > 0) {
            flattenCollections(item.children, result);
          }
        }
        return result;
      };

      const flatList = flattenCollections(collections);
      for (const col of flatList) {
        store.put(col);
      }

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      return true;
    } catch (error) {
      console.error('缓存目录失败:', error);
      return false;
    }
  },

  /**
   * 获取缓存的目录
   */
  async getCachedCollections() {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.COLLECTIONS, 'readonly');
      const store = tx.objectStore(STORES.COLLECTIONS);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('获取缓存目录失败:', error);
      return [];
    }
  },

  /**
   * 设置元数据
   */
  async setMetadata(key, value) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.METADATA, 'readwrite');
      const store = tx.objectStore(STORES.METADATA);

      return new Promise((resolve, reject) => {
        const request = store.put({ key, value, updatedAt: new Date().toISOString() });
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('设置元数据失败:', error);
      return false;
    }
  },

  /**
   * 获取元数据
   */
  async getMetadata(key) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.METADATA, 'readonly');
      const store = tx.objectStore(STORES.METADATA);

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('获取元数据失败:', error);
      return null;
    }
  },

  /**
   * 保存设置
   */
  async saveSetting(key, value) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = tx.objectStore(STORES.SETTINGS);

      return new Promise((resolve, reject) => {
        const request = store.put({ key, value });
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  },

  /**
   * 获取设置
   */
  async getSetting(key, defaultValue = null) {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value ?? defaultValue);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('获取设置失败:', error);
      return defaultValue;
    }
  },

  /**
   * 清除所有缓存
   */
  async clearAll() {
    try {
      const db = await initDB();
      const stores = [STORES.DOCUMENTS, STORES.COLLECTIONS, STORES.METADATA];

      for (const storeName of stores) {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        await new Promise((resolve) => { tx.oncomplete = resolve; });
      }

      return true;
    } catch (error) {
      console.error('清除缓存失败:', error);
      return false;
    }
  },

  /**
   * 获取缓存统计
   */
  async getStats() {
    try {
      const db = await initDB();
      
      const getCount = (storeName) => {
        return new Promise((resolve) => {
          const tx = db.transaction(storeName, 'readonly');
          const request = tx.objectStore(storeName).count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(0);
        });
      };

      const [docCount, colCount] = await Promise.all([
        getCount(STORES.DOCUMENTS),
        getCount(STORES.COLLECTIONS)
      ]);

      const lastSync = await this.getMetadata('lastDocSync');

      return {
        documentCount: docCount,
        collectionCount: colCount,
        lastSync
      };
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return { documentCount: 0, collectionCount: 0, lastSync: null };
    }
  },

  /**
   * 检查是否在线
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * 监听网络状态变化
   */
  onNetworkChange(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }
};

export default CacheService;

