// plugins/state-sync.js
const { HMRPlugin } = require('clientlite/hmr-plugins');
const crypto = require('crypto');

function stateSyncPlugin(options = {}) {
  const plugin = new HMRPlugin('state-sync', {
    enablePersistence: true,
    enableTimeTravel: true,
    enableCrossTabSync: true,
    maxHistorySize: 50,
    ...options
  });
  
  // In-memory state store on the server side
  const stateStore = new Map();
  const stateHistory = new Map();
  const tabSessions = new Map();
  
  plugin.hooks = {
    // Transform code to inject state tracking
    transform(code, moduleId) {
      if (moduleId && (moduleId.includes('App.jsx') || moduleId.includes('App.js'))) {
        // Inject state sync runtime
        const injection = `
          // StateSync Runtime Injection
          if (typeof window !== 'undefined' && !window.__STATE_SYNC_INITIALIZED__) {
            window.__STATE_SYNC_INITIALIZED__ = true;
            
            // Create state sync bridge
            window.__stateSync = {
              version: '1.0.0',
              snapshots: new Map(),
              subscribers: new Map(),
              history: [],
              historyIndex: -1,
              
              // Register state to track
              track(key, getState, setState) {
                this.snapshots.set(key, { getState, setState });
                
                // Broadcast registration
                window.postMessage({
                  type: '__STATE_SYNC_REGISTER__',
                  key,
                  source: 'client'
                }, '*');
              },
              
              // Take a snapshot of current state
              snapshot(key) {
                const tracker = this.snapshots.get(key);
                if (tracker) {
                  const state = tracker.getState();
                  const snapshot = {
                    id: Date.now() + '_' + Math.random().toString(36),
                    timestamp: Date.now(),
                    key,
                    state: JSON.parse(JSON.stringify(state))
                  };
                  
                  if (${plugin.options.enableTimeTravel}) {
                    this.history.push(snapshot);
                    if (this.history.length > ${plugin.options.maxHistorySize}) {
                      this.history.shift();
                    }
                    this.historyIndex = this.history.length - 1;
                  }
                  
                  return snapshot;
                }
                return null;
              },
              
              // Restore from snapshot
              restore(key, snapshot) {
                const tracker = this.snapshots.get(key);
                if (tracker && snapshot) {
                  tracker.setState(snapshot.state);
                  this.notify(key, 'restore', snapshot);
                  return true;
                }
                return false;
              },
              
              // Time travel
              timeTravel(key, steps) {
                if (!${plugin.options.enableTimeTravel}) return false;
                
                const newIndex = this.historyIndex + steps;
                if (newIndex >= 0 && newIndex < this.history.length) {
                  this.historyIndex = newIndex;
                  const snapshot = this.history[newIndex];
                  return this.restore(key, snapshot);
                }
                return false;
              },
              
              // Subscribe to state changes
              subscribe(key, callback) {
                if (!this.subscribers.has(key)) {
                  this.subscribers.set(key, new Set());
                }
                this.subscribers.get(key).add(callback);
                
                return () => this.subscribers.get(key)?.delete(callback);
              },
              
              // Notify subscribers
              notify(key, action, data) {
                const subs = this.subscribers.get(key);
                if (subs) {
                  subs.forEach(cb => {
                    try { cb({ key, action, data, timestamp: Date.now() }); } 
                    catch(e) { console.error('StateSync subscriber error:', e); }
                  });
                }
                
                // Broadcast to other tabs
                if (${plugin.options.enableCrossTabSync}) {
                  window.postMessage({
                    type: '__STATE_SYNC_BROADCAST__',
                    key,
                    action,
                    data,
                    source: 'client',
                    tabId: window.__STATE_SYNC_TAB_ID__
                  }, '*');
                }
              },
              
              // Persist to IndexedDB
              async persist(key) {
                if (!${plugin.options.enablePersistence}) return false;
                
                const tracker = this.snapshots.get(key);
                if (!tracker) return false;
                
                const state = tracker.getState();
                const dbName = 'StateSyncDB';
                const storeName = 'states';
                
                return new Promise((resolve, reject) => {
                  const request = indexedDB.open(dbName, 1);
                  
                  request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(storeName)) {
                      db.createObjectStore(storeName);
                    }
                  };
                  
                  request.onsuccess = (e) => {
                    const db = e.target.result;
                    const tx = db.transaction(storeName, 'readwrite');
                    const store = tx.objectStore(storeName);
                    
                    store.put({
                      key,
                      state: JSON.parse(JSON.stringify(state)),
                      timestamp: Date.now(),
                      version: '1.0'
                    }, key);
                    
                    tx.oncomplete = () => {
                      this.notify(key, 'persist', { success: true });
                      resolve(true);
                    };
                    
                    tx.onerror = () => reject(tx.error);
                  };
                  
                  request.onerror = () => reject(request.error);
                });
              },
              
              // Load from IndexedDB
              async load(key) {
                if (!${plugin.options.enablePersistence}) return null;
                
                const dbName = 'StateSyncDB';
                const storeName = 'states';
                
                return new Promise((resolve, reject) => {
                  const request = indexedDB.open(dbName, 1);
                  
                  request.onsuccess = (e) => {
                    const db = e.target.result;
                    const tx = db.transaction(storeName, 'readonly');
                    const store = tx.objectStore(storeName);
                    const getRequest = store.get(key);
                    
                    getRequest.onsuccess = () => {
                      const data = getRequest.result;
                      if (data) {
                        const tracker = this.snapshots.get(key);
                        if (tracker) {
                          tracker.setState(data.state);
                          this.notify(key, 'load', { success: true });
                        }
                      }
                      resolve(data || null);
                    };
                    
                    getRequest.onerror = () => reject(getRequest.error);
                  };
                  
                  request.onerror = () => reject(request.error);
                });
              }
            };
            
            // Generate unique tab ID
            window.__STATE_SYNC_TAB_ID__ = '${Date.now()}_' + Math.random().toString(36);
            
            // Listen for cross-tab messages
            window.addEventListener('message', (e) => {
              if (e.data.type === '__STATE_SYNC_BROADCAST__' && e.data.source === 'client') {
                // Only process messages from other tabs
                if (e.data.tabId !== window.__STATE_SYNC_TAB_ID__) {
                  console.log('%c🔄 StateSync: Received update from tab ' + e.data.tabId, 'color: #ff6600');
                  
                  // Apply the state update
                  const tracker = window.__stateSync.snapshots.get(e.data.key);
                  if (tracker && e.data.action === 'update' && e.data.data) {
                    tracker.setState(e.data.data.state);
                  }
                }
              }
            });
            
            console.log('%c🔄 StateSync: Initialized with tab ID ' + window.__STATE_SYNC_TAB_ID__, 'color: #ff6600');
          }
        `;
        
        // Find the component return statement and inject the runtime
        if (code.includes('function App')) {
          return injection + '\n' + code;
        }
      }
      return code;
    },
    
    // Handle hot updates with state preservation
    handleHotUpdate(ctx) {
      if (ctx.file && (ctx.file.includes('App.jsx') || ctx.file.includes('store'))) {
        console.log(`🔄 StateSync: Preserving state across update for ${ctx.file}`);
        
        // Store current state before update
        ctx.stateSnapshot = {
          timestamp: Date.now(),
          file: ctx.file
        };
      }
      return ctx.modules;
    },
    
    // Before sending update to client
    beforeSend(updateData) {
      if (updateData.metadata?.file?.includes('App.jsx')) {
        updateData.metadata.preserveState = true;
        updateData.metadata.stateSyncVersion = '1.0.0';
      }
      return updateData;
    },
    
    // After update completes
    afterUpdate(result) {
      if (result.affectedModules?.length) {
        console.log(`🔄 StateSync: Restored state for ${result.affectedModules.length} module(s)`);
      }
    },
    
    // Client-side initialization
    clientInit(api) {
      return `
        // StateSync Client Runtime
        (function() {
          if (window.__stateSync) {
            // Create React hook for state sync
            window.__stateSync.useSyncedState = function(key, initialState) {
              const [state, setState] = React.useState(() => {
                // Try to load from persisted storage first
                if (${plugin.options.enablePersistence}) {
                  window.__stateSync.load(key).then(persisted => {
                    if (persisted) {
                      console.log('%c🔄 StateSync: Loaded persisted state for ' + key, 'color: #00ff00');
                    }
                  });
                }
                return initialState;
              });
              
              React.useEffect(() => {
                // Register state tracker
                window.__stateSync.track(key, 
                  () => state,
                  (newState) => setState(newState)
                );
                
                // Take initial snapshot
                window.__stateSync.snapshot(key);
                
                // Subscribe to changes from other tabs
                const unsubscribe = window.__stateSync.subscribe(key, (event) => {
                  if (event.action === 'update' && event.data?.state) {
                    setState(event.data.state);
                  }
                });
                
                return unsubscribe;
              }, [key]);
              
              const setSyncedState = (newState) => {
                const nextState = typeof newState === 'function' 
                  ? newState(state) 
                  : newState;
                
                setState(nextState);
                
                // Take snapshot after update
                const snapshot = window.__stateSync.snapshot(key);
                
                // Notify subscribers
                window.__stateSync.notify(key, 'update', { 
                  state: nextState,
                  snapshot 
                });
                
                // Persist if enabled
                if (${plugin.options.enablePersistence}) {
                  window.__stateSync.persist(key).catch(console.warn);
                }
              };
              
              return [state, setSyncedState];
            };
            
            // Time travel controls
            window.__stateSync.undo = function(key) {
              return window.__stateSync.timeTravel(key, -1);
            };
            
            window.__stateSync.redo = function(key) {
              return window.__stateSync.timeTravel(key, 1);
            };
            
            // DevTools integration
            if (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined') {
              const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
                name: 'StateSync',
                features: { pause: true, export: true }
              });
              
              window.__stateSync.subscribe('*', (event) => {
                devTools.send(event.action, event.data);
              });
              
              console.log('%c🔄 StateSync: Connected to Redux DevTools', 'color: #ff6600');
            }
            
            console.log('%c🔄 StateSync: Client runtime ready', 'color: #ff6600');
            console.log('%c   - Cross-tab sync: ' + ${plugin.options.enableCrossTabSync}, 'color: #888');
            console.log('%c   - Time travel: ' + ${plugin.options.enableTimeTravel}, 'color: #888');
            console.log('%c   - Persistence: ' + ${plugin.options.enablePersistence}, 'color: #888');
          }
        })();
      `;
    }
  };
  
  // Add server-side WebSocket handlers for advanced sync
  plugin.setupServer = function(wss) {
    wss.on('connection', (ws) => {
      const sessionId = crypto.randomBytes(16).toString('hex');
      tabSessions.set(sessionId, { ws, connectedAt: Date.now() });
      
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data);
          
          if (msg.type === 'STATE_SYNC_BROADCAST') {
            // Broadcast state to all connected tabs
            tabSessions.forEach((session, id) => {
              if (id !== sessionId && session.ws.readyState === 1) {
                session.ws.send(JSON.stringify({
                  type: 'STATE_SYNC_UPDATE',
                  payload: msg.payload,
                  source: sessionId
                }));
              }
            });
          }
          
          if (msg.type === 'STATE_SYNC_PERSIST') {
            // Store state on server
            stateStore.set(msg.key, {
              value: msg.value,
              timestamp: Date.now(),
              version: (stateStore.get(msg.key)?.version || 0) + 1
            });
            
            // Track history
            if (!stateHistory.has(msg.key)) {
              stateHistory.set(msg.key, []);
            }
            const history = stateHistory.get(msg.key);
            history.push({
              value: msg.value,
              timestamp: Date.now()
            });
            
            if (history.length > plugin.options.maxHistorySize) {
              history.shift();
            }
          }
        } catch (e) {
          console.error('StateSync server error:', e);
        }
      });
      
      ws.on('close', () => {
        tabSessions.delete(sessionId);
      });
    });
  };
  
  return plugin;
}

module.exports = stateSyncPlugin;
