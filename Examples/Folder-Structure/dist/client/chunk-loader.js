// Auto-generated per-module chunk loader
window.__CLJ_MANIFEST__ = {"version":1777125321062,"chunks":[{"file":"App.js","size":2735345,"sizeKB":"2671.24","isEntry":true,"isNodeModule":false,"moduleName":null,"imports":[],"hash":"ftx57g"}],"preloadOrder":["App.js"]};
window.__CLJ_MODULE_CHUNKS__ = {};

// Load each npm module as a separate chunk in parallel
window.__CLJ_LOAD_MODULES__ = async () => {
  const promises = [];
  const loadedModules = {};
  
  for (const [moduleName, chunkFile] of Object.entries(window.__CLJ_MODULE_CHUNKS__)) {
    if (moduleName !== 'app') {
      promises.push(
        import('./' + chunkFile)
          .then(mod => { loadedModules[moduleName] = mod; })
          .catch(e => console.warn('Failed to load module:', moduleName, e))
      );
    }
  }
  
  await Promise.all(promises);
  
  // Load main app chunk
  const appChunk = manifest.chunks.find(c => c.isEntry);
  if (appChunk) {
    const app = await import('./' + appChunk.file);
    return { app, loadedModules };
  }
  
  return { loadedModules };
};

// Auto-start loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.__CLJ_LOAD_MODULES__());
} else {
  window.__CLJ_LOAD_MODULES__();
}
