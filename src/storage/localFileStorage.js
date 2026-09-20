/**
 * Local File System Storage Layer
 * 
 * Provides transparent read/write of JSON records using the browser's File System Access API
 * (window.showDirectoryPicker). Directory handles are cached in IndexedDB so permissions persist
 * across browser refreshes.
 * 
 * If unsupported (e.g. Firefox/Safari) or if folder access is not granted, reads and writes
 * transparently fall back to localStorage under matching keys.
 */

const DB_NAME = 'Apna_file_storage_db';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'root_data_folder_handle';

// Module-level singleton state (Single source of truth)
let activeRootHandle = null;
let activeDataDirHandle = null;
let isConnected = false;
const connectionListeners = new Set();

/**
 * Detect File System Access API support
 */
export const isSupported = typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';

/**
 * Subscribe to storage connection changes (Single Source of Truth)
 */
export function subscribeStorageConnection(listener) {
  connectionListeners.add(listener);
  // Immediate callback with current state
  listener(isConnected, activeRootHandle);
  return () => connectionListeners.delete(listener);
}

function notifyConnectionChange() {
  connectionListeners.forEach(listener => {
    try {
      listener(isConnected, activeRootHandle);
    } catch (e) {
      console.error('[LocalFileStorage] Connection listener error:', e);
    }
  });
}

/**
 * Returns current connection state
 */
export function getStorageStatus() {
  return {
    isSupported,
    isConnected,
    folderName: activeRootHandle?.name || null
  };
}

// -----------------------------------------------------------------------------
// IndexedDB Directory Handle Persistence
// -----------------------------------------------------------------------------

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHandleToDB(handle) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[LocalFileStorage] Could not cache directory handle in IndexedDB:', err);
  }
}

async function loadHandleFromDB() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function clearHandleFromDB() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[LocalFileStorage] Error clearing handle from IndexedDB:', err);
  }
}

// -----------------------------------------------------------------------------
// Directory & Subfolder Setup
// -----------------------------------------------------------------------------

async function setupDataSubfolder(rootHandle) {
  if (!rootHandle) return null;
  // If user selected a folder already named 'local-data', use it directly
  if (rootHandle.name.toLowerCase() === 'local-data') {
    return rootHandle;
  }
  // Otherwise, create/use the 'local-data' subdirectory inside the picked folder
  return await rootHandle.getDirectoryHandle('local-data', { create: true });
}

// -----------------------------------------------------------------------------
// Public Storage API
// -----------------------------------------------------------------------------

/**
 * Prompts user via window.showDirectoryPicker(), persists handle to IndexedDB,
 * and initializes local-data directory.
 */
export async function requestFolderAccess() {
  if (!isSupported) {
    console.warn('[LocalFileStorage] File System Access API is not supported in this browser. Falling back to localStorage.');
    return { success: false, reason: 'unsupported' };
  }

  try {
    const handle = await window.showDirectoryPicker({
      id: 'Apna_local_data_picker',
      mode: 'readwrite',
      startIn: 'documents'
    });

    // Ensure readwrite permission
    const permission = await handle.requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      return { success: false, reason: 'denied' };
    }

    activeRootHandle = handle;
    activeDataDirHandle = await setupDataSubfolder(handle);
    isConnected = true;

    await saveHandleToDB(handle);
    notifyConnectionChange();

    console.log(`[LocalFileStorage] Connected to folder: "${handle.name}". Storage ready in local-data/`);
    return { success: true, folderName: handle.name };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, reason: 'cancelled' };
    }
    console.error('[LocalFileStorage] Folder picker error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves previously stored handle from IndexedDB and checks if permission is already granted.
 * Does not show a picker prompt.
 */
export async function getStoredFolderHandle() {
  if (!isSupported) return null;

  // Return cached in-memory handle if already initialized
  if (activeRootHandle && isConnected) {
    return activeRootHandle;
  }

  const stored = await loadHandleFromDB();
  if (!stored) return null;

  try {
    const permission = await stored.queryPermission({ mode: 'readwrite' });
    if (permission === 'granted') {
      activeRootHandle = stored;
      activeDataDirHandle = await setupDataSubfolder(stored);
      isConnected = true;
      notifyConnectionChange();
      console.log(`[LocalFileStorage] Restored stored directory handle for: "${stored.name}"`);
      return stored;
    }
  } catch (err) {
    console.warn('[LocalFileStorage] Stored handle permission check failed:', err);
  }

  return null;
}

/**
 * Re-requests permission on an existing stored handle (needs user gesture)
 */
export async function requestStoredFolderPermission() {
  const stored = activeRootHandle || await loadHandleFromDB();
  if (!stored) return false;

  try {
    const permission = await stored.requestPermission({ mode: 'readwrite' });
    if (permission === 'granted') {
      activeRootHandle = stored;
      activeDataDirHandle = await setupDataSubfolder(stored);
      isConnected = true;
      notifyConnectionChange();
      return true;
    }
  } catch (err) {
    console.warn('[LocalFileStorage] Request permission error:', err);
  }
  return false;
}

/**
 * Disconnects folder handle and resets to localStorage
 */
export async function disconnectFolder() {
  await clearHandleFromDB();
  activeRootHandle = null;
  activeDataDirHandle = null;
  isConnected = false;
  notifyConnectionChange();
}

/**
 * Reads JSON file from local-data/<filename>.
 * Falls back to localStorage under key 'Apna_file_<filename>' if file or folder is absent.
 */
export async function readJSON(filename, fallbackValue) {
  if (activeDataDirHandle && isConnected) {
    try {
      const fileHandle = await activeDataDirHandle.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const text = await file.text();
      if (!text || !text.trim()) return fallbackValue;
      return JSON.parse(text);
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        console.warn(`[LocalFileStorage] Read error for ${filename}:`, err);
      }
    }
  }

  // Fallback to browser localStorage
  try {
    const cached = localStorage.getItem('Apna_file_' + filename);
    if (cached !== null) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn(`[LocalFileStorage] localStorage fallback read error for ${filename}:`, err);
  }

  return fallbackValue;
}

/**
 * Writes data as formatted JSON to local-data/<filename>.
 * Also mirrors to localStorage as cache/fallback.
 */
export async function writeJSON(filename, data) {
  const jsonStr = JSON.stringify(data, null, 2);

  // Always mirror to localStorage as an instant local cache
  try {
    localStorage.setItem('Apna_file_' + filename, jsonStr);
  } catch (err) {
    console.warn(`[LocalFileStorage] localStorage cache write error for ${filename}:`, err);
  }

  if (activeDataDirHandle && isConnected) {
    try {
      const fileHandle = await activeDataDirHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(jsonStr);
      await writable.close();
      return true;
    } catch (err) {
      console.warn(`[LocalFileStorage] File write error for ${filename}, saved to localStorage only:`, err);
      return false;
    }
  }

  return false;
}

/**
 * Gathers all clinic JSON datasets into a unified backup bundle.
 */
export async function exportAllClinicData() {
  const [users, doctors, appointments, announcements] = await Promise.all([
    readJSON('users.json', []),
    readJSON('doctors.json', []),
    readJSON('appointments.json', []),
    readJSON('announcements.json', [])
  ]);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    clinicName: 'Apna Community Health Clinic',
    data: {
      users,
      doctors,
      appointments,
      announcements
    }
  };
}

/**
 * Restores a full clinic backup bundle back into JSON storage and localStorage.
 */
export async function importAllClinicData(backupBundle) {
  if (!backupBundle || !backupBundle.data) {
    throw new Error('Invalid backup file format.');
  }

  const { users, doctors, appointments, announcements } = backupBundle.data;

  if (Array.isArray(users)) await writeJSON('users.json', users);
  if (Array.isArray(doctors)) await writeJSON('doctors.json', doctors);
  if (Array.isArray(appointments)) await writeJSON('appointments.json', appointments);
  if (Array.isArray(announcements)) await writeJSON('announcements.json', announcements);

  return true;
}

