import { SavedDocument } from '../types';

/**
 * My Documents, stored on the phone.
 *
 * The screen this serves was a mockup: two example letters written into the
 * source, and an "add" button that pushed a row into React state, invented a
 * filename from the title, and lost everything on reload. No file was ever
 * kept. What people took for their own saved letter was the sample.
 *
 * This is the real thing, and it is deliberately IndexedDB rather than a
 * server. The app's privacy notice promises that nothing reaches the Home
 * Office, a caseworker or a landlord. That promise is strongest when there is
 * nowhere for anything to go, so a person's letters stay in their own browser,
 * on their own device, and Mehr Health never holds them.
 *
 * localStorage would not do: it stores strings, caps out around 5MB, and a
 * photograph of a letter is a megabyte before it starts. IndexedDB stores the
 * Blob itself.
 *
 * Two stores rather than one, so the list can be read without pulling every
 * file into memory: metadata in `documents`, the bytes in `files`, same id.
 */

const DB_NAME = 'hamyar-documents';
const DB_VERSION = 1;
const META_STORE = 'documents';
const FILE_STORE = 'files';

export interface StoredDocument extends SavedDocument {
  /** Persian note, beside the English one. */
  notesFa?: string;
  mimeType: string;
  sizeBytes: number;
}

/** Thrown when the browser has no IndexedDB at all (old, or private mode). */
export class DocumentStoreUnavailable extends Error {}

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new DocumentStoreUnavailable('This browser cannot store documents.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new DocumentStoreUnavailable('Could not open the document store.'));
  });

  return dbPromise;
};

/** Wraps one transaction so callers get a promise rather than three handlers. */
const run = <T>(
  stores: string[],
  mode: IDBTransactionMode,
  work: (tx: IDBTransaction) => IDBRequest<T>
): Promise<T> =>
  openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(stores, mode);
        const request = work(tx);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.onabort = () => reject(tx.error);
      })
  );

/** Newest first, which is the order a person looks for a letter in. */
export const listDocuments = async (): Promise<StoredDocument[]> => {
  const all = await run<StoredDocument[]>([META_STORE], 'readonly', (tx) =>
    tx.objectStore(META_STORE).getAll() as IDBRequest<StoredDocument[]>
  );
  return all.sort((a, b) => b.dateUploaded - a.dateUploaded);
};

export const saveDocument = async (
  meta: Omit<StoredDocument, 'id' | 'dateUploaded' | 'mimeType' | 'sizeBytes'>,
  file: File
): Promise<StoredDocument> => {
  const record: StoredDocument = {
    ...meta,
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    dateUploaded: Date.now(),
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([META_STORE, FILE_STORE], 'readwrite');
    tx.objectStore(META_STORE).put(record);
    tx.objectStore(FILE_STORE).put({ id: record.id, blob: file });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

  return record;
};

/** The bytes, for opening or saving a copy. */
export const getFile = async (id: string): Promise<Blob | null> => {
  const row = await run<{ id: string; blob: Blob } | undefined>([FILE_STORE], 'readonly', (tx) =>
    tx.objectStore(FILE_STORE).get(id)
  );
  return row ? row.blob : null;
};

export const deleteDocument = async (id: string): Promise<void> => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([META_STORE, FILE_STORE], 'readwrite');
    tx.objectStore(META_STORE).delete(id);
    tx.objectStore(FILE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

/** Everything, for a borrowed phone or a person who wants to start again. */
export const clearAllDocuments = async (): Promise<void> => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([META_STORE, FILE_STORE], 'readwrite');
    tx.objectStore(META_STORE).clear();
    tx.objectStore(FILE_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

/** Human-sized, for the row under each document. */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
