// CLJ Package: my-package
export const frontend = {
  greet: (name) => `Hello ${name} from frontend`,
  setStorage: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  getStorage: (key) => JSON.parse(localStorage.getItem(key))
};
export const backend = {
  greet: (name) => `Hello ${name} from backend`,
  storage: new Map(),
  setStorage: (key, val) => { backend.storage.set(key, val); return true; },
  getStorage: (key) => backend.storage.get(key),
  createDatabase: async (dbName) => {
    const sqlite3 = await import('sqlite3');
    return new sqlite3.Database(dbName + '.db');
  }
};
export default { frontend, backend };