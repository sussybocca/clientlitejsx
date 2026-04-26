const fs = require('fs');
const path = require('path');

// ==================== ADVANCED CLJ MODULE ====================

// State management
let moduleState = {
  initialized: false,
  cache: new Map(),
  rateLimitMap: new Map(),
  eventListeners: new Map(),
  scheduledTasks: new Map(),
  config: null,
  stats: {
    requests: 0,
    errors: 0,
    cacheHits: 0,
    cacheMisses: 0,
    startTime: Date.now()
  }
};

// ==================== INITIALIZATION ====================

function initialize(config = {}) {
  if (moduleState.initialized) return moduleState;
  
  // Load config from CLM.json if available
  try {
    const clmPath = path.join(__dirname, 'CLM.json');
    if (fs.existsSync(clmPath)) {
      const clmConfig = JSON.parse(fs.readFileSync(clmPath, 'utf8'));
      moduleState.config = { ...clmConfig.config, ...config };
    }
  } catch (e) {
    moduleState.config = config;
  }
  
  moduleState.initialized = true;
  console.log(`[advancedModule] Initialized with config:`, moduleState.config);
  return moduleState;
}

// ==================== CORE FUNCTIONS ====================

function greet(name, options = {}) {
  initialize();
  moduleState.stats.requests++;
  
  const { 
    language = 'en', 
    style = 'formal',
    includeTimestamp = false,
    repeat = 1 
  } = options;
  
  const greetings = {
    en: { formal: 'Greetings', casual: 'Hey', excited: 'WELCOME' },
    es: { formal: 'Saludos', casual: 'Hola', excited: '¡BIENVENIDO' },
    fr: { formal: 'Salutations', casual: 'Salut', excited: 'BIENVENUE' },
    de: { formal: 'Grüße', casual: 'Hallo', excited: 'WILLKOMMEN' },
    jp: { formal: 'ご挨拶', casual: 'やあ', excited: 'ようこそ' }
  };
  
  const greetWord = greetings[language]?.[style] || greetings.en.formal;
  let result = `${greetWord}, ${name}!`;
  
  if (includeTimestamp) {
    result += ` [${new Date().toISOString()}]`;
  }
  
  if (repeat > 1) {
    return Array(repeat).fill(result).join(' ');
  }
  
  return result;
}

function calculate(a, b, op, options = {}) {
  initialize();
  moduleState.stats.requests++;
  
  const { 
    precision = 2, 
    returnType = 'number',
    validateInput = true 
  } = options;
  
  if (validateInput) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('calculate: Arguments must be numbers');
    }
  }
  
  let result;
  
  switch(op) {
    case 'add': result = a + b; break;
    case 'subtract': result = a - b; break;
    case 'multiply': result = a * b; break;
    case 'divide': 
      if (b === 0) throw new Error('calculate: Division by zero');
      result = a / b; 
      break;
    case 'power': result = Math.pow(a, b); break;
    case 'modulo': result = a % b; break;
    case 'sqrt': result = Math.sqrt(a); break;
    case 'log': result = Math.log(a) / Math.log(b); break;
    case 'min': result = Math.min(a, b); break;
    case 'max': result = Math.max(a, b); break;
    case 'average': result = (a + b) / 2; break;
    case 'percentage': result = (a / b) * 100; break;
    default: throw new Error(`calculate: Unknown operation "${op}"`);
  }
  
  if (returnType === 'string') {
    return result.toFixed(precision);
  }
  
  return Number(result.toFixed(precision));
}

// ==================== DATA PROCESSING ====================

function processData(input, options = {}) {
  initialize();
  moduleState.stats.requests++;
  
  const {
    sort = false,
    filter = null,
    transform = null,
    limit = Infinity,
    page = 1,
    pageSize = 50,
    deduplicate = false,
    flatten = false,
    groupBy = null
  } = options;
  
  if (!Array.isArray(input) && typeof input !== 'object') {
    throw new Error('processData: Input must be array or object');
  }
  
  let data = Array.isArray(input) ? [...input] : { ...input };
  
  // Flatten if needed
  if (flatten && Array.isArray(data)) {
    data = data.flat(Infinity);
  }
  
  // Deduplicate
  if (deduplicate && Array.isArray(data)) {
    data = [...new Set(data.map(JSON.stringify))].map(JSON.parse);
  }
  
  // Filter
  if (filter && typeof filter === 'function' && Array.isArray(data)) {
    data = data.filter(filter);
  }
  
  // Sort
  if (sort && Array.isArray(data)) {
    const sortFn = typeof sort === 'function' ? sort : (a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    };
    data.sort(sortFn);
  }
  
  // Transform
  if (transform && typeof transform === 'function' && Array.isArray(data)) {
    data = data.map(transform);
  }
  
  // Group by
  if (groupBy && Array.isArray(data)) {
    const groups = {};
    for (const item of data) {
      const key = typeof groupBy === 'function' ? groupBy(item) : item[groupBy];
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    data = groups;
  }
  
  // Paginate
  if (Array.isArray(data) && data.length > limit) {
    const start = (page - 1) * pageSize;
    data = data.slice(start, start + pageSize);
  }
  
  return {
    data,
    metadata: {
      totalItems: Array.isArray(input) ? input.length : Object.keys(input).length,
      processedItems: Array.isArray(data) ? data.length : Object.keys(data).length,
      page,
      pageSize,
      timestamp: new Date().toISOString(),
      operations: {
        sorted: !!sort,
        filtered: !!filter,
        transformed: !!transform,
        deduplicated: deduplicate,
        flattened: flatten,
        grouped: !!groupBy
      }
    }
  };
}

// ==================== DATABASE OPERATIONS ====================

function createDatabase(options = {}) {
  initialize();
  
  const {
    name = 'default',
    storagePath = moduleState.config?.database?.path || './data',
    inMemory = false
  } = options;
  
  const dbPath = path.join(storagePath, `${name}.json`);
  let data = {};
  
  // Load existing data
  if (!inMemory && fs.existsSync(dbPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      data = {};
    }
  }
  
  return {
    get(key) {
      return data[key] || null;
    },
    
    set(key, value) {
      data[key] = value;
      if (!inMemory) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
      return true;
    },
    
    delete(key) {
      delete data[key];
      if (!inMemory) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
      return true;
    },
    
    has(key) {
      return key in data;
    },
    
    keys() {
      return Object.keys(data);
    },
    
    values() {
      return Object.values(data);
    },
    
    entries() {
      return Object.entries(data);
    },
    
    query(filterFn) {
      return Object.entries(data)
        .filter(([key, value]) => filterFn(value, key))
        .map(([key, value]) => ({ key, value }));
    },
    
    clear() {
      data = {};
      if (!inMemory && fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }
      return true;
    },
    
    size() {
      return Object.keys(data).length;
    },
    
    export() {
      return JSON.stringify(data, null, 2);
    },
    
    import(jsonData) {
      try {
        data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        if (!inMemory) {
          fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  };
}

// ==================== REQUEST HANDLER ====================

function handleRequest(request, options = {}) {
  initialize();
  moduleState.stats.requests++;
  
  const {
    validateSchema = null,
    rateLimit = moduleState.config?.rateLimitPerMinute || 60,
    timeout = 30000,
    retryAttempts = 3,
    cacheEnabled = true,
    logRequest = true
  } = options;
  
  const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  // Rate limiting
  if (rateLimit > 0) {
    const clientKey = request.clientId || request.ip || 'anonymous';
    const now = Date.now();
    const windowStart = now - 60000;
    
    if (!moduleState.rateLimitMap.has(clientKey)) {
      moduleState.rateLimitMap.set(clientKey, []);
    }
    
    const requests = moduleState.rateLimitMap.get(clientKey)
      .filter(t => t > windowStart);
    
    if (requests.length >= rateLimit) {
      throw new Error(`Rate limit exceeded. Max ${rateLimit} requests per minute.`);
    }
    
    requests.push(now);
    moduleState.rateLimitMap.set(clientKey, requests);
  }
  
  // Cache check
  if (cacheEnabled) {
    const cacheKey = JSON.stringify({ request, options });
    if (moduleState.cache.has(cacheKey)) {
      moduleState.stats.cacheHits++;
      return {
        ...moduleState.cache.get(cacheKey),
        cached: true,
        requestId
      };
    }
    moduleState.stats.cacheMisses++;
  }
  
  // Schema validation
  if (validateSchema) {
    const errors = validateAgainstSchema(request, validateSchema);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }
  
  // Process request
  const response = {
    success: true,
    requestId,
    data: request,
    metadata: {
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      retryAttempts: 0
    }
  };
  
  // Cache response
  if (cacheEnabled) {
    const cacheKey = JSON.stringify({ request, options });
    moduleState.cache.set(cacheKey, response);
    
    // Cache eviction
    if (moduleState.cache.size > (moduleState.config?.maxCacheSize || 1000)) {
      const firstKey = moduleState.cache.keys().next().value;
      moduleState.cache.delete(firstKey);
    }
  }
  
  if (logRequest) {
    console.log(`[${requestId}] ${JSON.stringify(request).substr(0, 100)}`);
  }
  
  return response;
}

// ==================== REPORT GENERATOR ====================

function generateReport(data, options = {}) {
  initialize();
  moduleState.stats.requests++;
  
  const {
    format = 'json',
    includeMetadata = true,
    includeStats = true,
    template = null,
    title = 'Report',
    dateFormat = 'YYYY-MM-DD HH:mm:ss'
  } = options;
  
  const report = {
    title,
    generatedAt: new Date().toISOString(),
    data
  };
  
  if (includeStats) {
    report.stats = {
      uptime: Date.now() - moduleState.stats.startTime,
      totalRequests: moduleState.stats.requests,
      totalErrors: moduleState.stats.errors,
      cacheHitRate: moduleState.stats.cacheHits / (moduleState.stats.cacheHits + moduleState.stats.cacheMisses || 1),
      moduleVersion: '2.0.0',
      nodeVersion: process.version
    };
  }
  
  if (includeMetadata) {
    report.metadata = {
      dataType: typeof data,
      isArray: Array.isArray(data),
      size: JSON.stringify(data).length,
      keys: typeof data === 'object' && data !== null ? Object.keys(data) : []
    };
  }
  
  if (format === 'csv' && Array.isArray(data)) {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }
  
  if (format === 'html') {
    return `
<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
  <h1>${title}</h1>
  <p>Generated: ${report.generatedAt}</p>
  <pre>${JSON.stringify(data, null, 2)}</pre>
  ${includeStats ? `<hr><h2>Stats</h2><pre>${JSON.stringify(report.stats, null, 2)}</pre>` : ''}
</body>
</html>`;
  }
  
  return JSON.stringify(report, null, 2);
}

// ==================== ENCRYPTION ====================

function encryptData(data, options = {}) {
  initialize();
  
  const {
    algorithm = 'aes-256-cbc',
    key = moduleState.config?.encryptionKey || 'default-key-change-me',
    encoding = 'hex'
  } = options;
  
  const crypto = require('crypto');
  
  const keyBuffer = crypto.createHash('sha256').update(String(key)).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  
  const input = typeof data === 'string' ? data : JSON.stringify(data);
  let encrypted = cipher.update(input, 'utf8', encoding);
  encrypted += cipher.final(encoding);
  
  const result = {
    encrypted,
    iv: iv.toString('hex'),
    algorithm,
    timestamp: Date.now()
  };
  
  return result;
}

// ==================== FILE ANALYZER ====================

function analyzeFile(filePath, options = {}) {
  initialize();
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const analysis = {
    path: filePath,
    name: path.basename(filePath),
    extension: path.extname(filePath),
    directory: path.dirname(filePath),
    size: {
      bytes: stats.size,
      kilobytes: (stats.size / 1024).toFixed(2),
      megabytes: (stats.size / (1024 * 1024)).toFixed(2)
    },
    created: stats.birthtime,
    modified: stats.mtime,
    accessed: stats.atime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
    permissions: stats.mode.toString(8).slice(-3),
    
    content: {
      lines: content.split('\n').length,
      words: content.split(/\s+/).length,
      characters: content.length,
      blankLines: content.split('\n').filter(l => l.trim() === '').length,
      codeLines: content.split('\n').filter(l => l.trim() !== '').length
    }
  };
  
  // Language detection
  const extMap = {
    '.js': 'JavaScript',
    '.jsx': 'React JSX',
    '.ts': 'TypeScript',
    '.tsx': 'React TSX',
    '.vue': 'Vue.js',
    '.svelte': 'Svelte',
    '.json': 'JSON',
    '.css': 'CSS',
    '.html': 'HTML',
    '.md': 'Markdown',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.cpp': 'C++',
    '.c': 'C',
    '.clj': 'ClientLite JSX'
  };
  
  analysis.language = extMap[analysis.extension] || 'Unknown';
  
  // Function/variable detection for JS files
  if (['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(analysis.extension)) {
    analysis.code = {
      functions: (content.match(/(?:function|const|let|var)\s+\w+\s*[=(]/g) || []).length,
      imports: (content.match(/import\s+/g) || []).length,
      exports: (content.match(/export\s+/g) || []).length,
      classes: (content.match(/class\s+\w+/g) || []).length,
      comments: (content.match(/\/\/|\/\*|\*\//g) || []).length
    };
  }
  
  return analysis;
}

// ==================== STREAM PROCESSOR ====================

function streamProcess(inputPath, options = {}) {
  initialize();
  
  const {
    outputPath = null,
    transformFn = null,
    chunkSize = 64 * 1024,
    encoding = 'utf8'
  } = options;
  
  if (!fs.existsSync(inputPath)) {
    throw new Error(`File not found: ${inputPath}`);
  }
  
  let processed = '';
  let position = 0;
  const fileSize = fs.statSync(inputPath).size;
  
  return {
    read() {
      const fd = fs.openSync(inputPath, 'r');
      const buffer = Buffer.alloc(Math.min(chunkSize, fileSize - position));
      fs.readSync(fd, buffer, 0, buffer.length, position);
      fs.closeSync(fd);
      
      let chunk = buffer.toString(encoding);
      if (transformFn) chunk = transformFn(chunk);
      processed += chunk;
      position += buffer.length;
      
      return {
        chunk,
        processed: position,
        total: fileSize,
        progress: ((position / fileSize) * 100).toFixed(2) + '%',
        done: position >= fileSize
      };
    },
    
    write(data) {
      if (outputPath) {
        fs.appendFileSync(outputPath, data);
        return true;
      }
      processed += data;
      return true;
    },
    
    getProcessed() {
      return processed;
    },
    
    reset() {
      processed = '';
      position = 0;
      if (outputPath && fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }
  };
}

// ==================== CACHE MANAGER ====================

function cacheManager(options = {}) {
  initialize();
  
  const {
    maxSize = moduleState.config?.maxCacheSize || 1000,
    defaultTTL = 3600000,
    persistPath = null
  } = options;
  
  // Load persisted cache
  if (persistPath && fs.existsSync(persistPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(persistPath, 'utf8'));
      for (const [key, entry] of Object.entries(saved)) {
        if (entry.expires > Date.now()) {
          moduleState.cache.set(key, entry.value);
        }
      }
    } catch (e) {}
  }
  
  return {
    set(key, value, ttl = defaultTTL) {
      moduleState.cache.set(key, value);
      
      if (moduleState.cache.size > maxSize) {
        const firstKey = moduleState.cache.keys().next().value;
        moduleState.cache.delete(firstKey);
      }
      
      if (ttl > 0) {
        setTimeout(() => moduleState.cache.delete(key), ttl);
      }
      
      return true;
    },
    
    get(key) {
      return moduleState.cache.get(key) || null;
    },
    
    has(key) {
      return moduleState.cache.has(key);
    },
    
    delete(key) {
      return moduleState.cache.delete(key);
    },
    
    clear() {
      moduleState.cache.clear();
      if (persistPath && fs.existsSync(persistPath)) {
        fs.unlinkSync(persistPath);
      }
    },
    
    size() {
      return moduleState.cache.size;
    },
    
    keys() {
      return Array.from(moduleState.cache.keys());
    },
    
    persist() {
      if (persistPath) {
        const data = {};
        for (const [key, value] of moduleState.cache) {
          data[key] = { value, expires: Date.now() + defaultTTL };
        }
        fs.writeFileSync(persistPath, JSON.stringify(data));
        return true;
      }
      return false;
    }
  };
}

// ==================== RATE LIMITER ====================

function rateLimiter(options = {}) {
  initialize();
  
  const {
    maxRequests = moduleState.config?.rateLimitPerMinute || 60,
    windowMs = 60000,
    blockDuration = 300000
  } = options;
  
  const clients = new Map();
  
  return {
    check(clientId = 'default') {
      const now = Date.now();
      
      if (!clients.has(clientId)) {
        clients.set(clientId, { requests: [], blocked: false, blockedUntil: 0 });
      }
      
      const client = clients.get(clientId);
      
      // Check if blocked
      if (client.blocked && now < client.blockedUntil) {
        return { 
          allowed: false, 
          reason: 'blocked', 
          retryAfter: Math.ceil((client.blockedUntil - now) / 1000) 
        };
      }
      
      // Unblock if time passed
      if (client.blocked && now >= client.blockedUntil) {
        client.blocked = false;
        client.requests = [];
      }
      
      // Remove old requests
      client.requests = client.requests.filter(t => t > now - windowMs);
      
      // Check limit
      if (client.requests.length >= maxRequests) {
        client.blocked = true;
        client.blockedUntil = now + blockDuration;
        return { 
          allowed: false, 
          reason: 'rate_limit_exceeded',
          retryAfter: Math.ceil(blockDuration / 1000)
        };
      }
      
      client.requests.push(now);
      return { 
        allowed: true, 
        remaining: maxRequests - client.requests.length,
        reset: now + windowMs
      };
    },
    
    reset(clientId = 'default') {
      if (clients.has(clientId)) {
        const client = clients.get(clientId);
        client.requests = [];
        client.blocked = false;
        client.blockedUntil = 0;
      }
    },
    
    getStats(clientId = 'default') {
      const client = clients.get(clientId);
      if (!client) return null;
      
      return {
        totalRequests: client.requests.length,
        maxRequests,
        blocked: client.blocked,
        blockedUntil: client.blockedUntil,
        windowMs
      };
    }
  };
}

// ==================== VALIDATION PIPELINE ====================

function validationPipeline(options = {}) {
  initialize();
  
  const validators = [];
  const transformers = [];
  
  const pipeline = {
    addValidator(fn, message = 'Validation failed') {
      validators.push({ fn, message });
      return pipeline;
    },
    
    addTransformer(fn) {
      transformers.push(fn);
      return pipeline;
    },
    
    validate(data) {
      const errors = [];
      
      for (const { fn, message } of validators) {
        try {
          const result = fn(data);
          if (result === false || result === null) {
            errors.push(message);
          } else if (typeof result === 'string') {
            errors.push(result);
          }
        } catch (e) {
          errors.push(e.message || message);
        }
      }
      
      return {
        valid: errors.length === 0,
        errors,
        data: errors.length === 0 ? data : null
      };
    },
    
    transform(data) {
      let result = data;
      for (const fn of transformers) {
        result = fn(result);
      }
      return result;
    },
    
    process(data) {
      const validation = pipeline.validate(data);
      if (!validation.valid) return validation;
      
      const transformed = pipeline.transform(data);
      return {
        valid: true,
        errors: [],
        data: transformed
      };
    }
  };
  
  return pipeline;
}

// ==================== DATA TRANSFORMER ====================

function dataTransformer(options = {}) {
  initialize();
  
  return {
    toCamelCase(obj) {
      if (Array.isArray(obj)) return obj.map(v => this.toCamelCase(v));
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        result[camelKey] = typeof value === 'object' ? this.toCamelCase(value) : value;
      }
      return result;
    },
    
    toSnakeCase(obj) {
      if (Array.isArray(obj)) return obj.map(v => this.toSnakeCase(v));
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
        result[snakeKey] = typeof value === 'object' ? this.toSnakeCase(value) : value;
      }
      return result;
    },
    
    pick(obj, keys) {
      const result = {};
      for (const key of keys) {
        if (key in obj) result[key] = obj[key];
      }
      return result;
    },
    
    omit(obj, keys) {
      const result = { ...obj };
      for (const key of keys) {
        delete result[key];
      }
      return result;
    },
    
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    
    merge(target, ...sources) {
      return Object.assign({}, target, ...sources);
    },
    
    deepMerge(target, ...sources) {
      for (const source of sources) {
        for (const [key, value] of Object.entries(source)) {
          if (typeof value === 'object' && typeof target[key] === 'object') {
            target[key] = this.deepMerge(target[key], value);
          } else {
            target[key] = value;
          }
        }
      }
      return target;
    }
  };
}

// ==================== EVENT BUS ====================

function eventBus(options = {}) {
  initialize();
  
  const listeners = new Map();
  const history = [];
  const maxHistory = options.maxHistory || 100;
  
  return {
    on(event, handler, once = false) {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push({ handler, once });
      
      // Return unsubscribe function
      return () => {
        const handlers = listeners.get(event);
        if (handlers) {
          const idx = handlers.findIndex(h => h.handler === handler);
          if (idx !== -1) handlers.splice(idx, 1);
        }
      };
    },
    
    once(event, handler) {
      return this.on(event, handler, true);
    },
    
    emit(event, data) {
      // Add to history
      history.push({ event, data, timestamp: Date.now() });
      if (history.length > maxHistory) history.shift();
      
      // Notify listeners
      const handlers = listeners.get(event) || [];
      const toRemove = [];
      
      for (const { handler, once } of handlers) {
        try {
          handler(data);
        } catch (e) {
          moduleState.stats.errors++;
        }
        if (once) toRemove.push(handler);
      }
      
      // Remove once handlers
      if (toRemove.length > 0) {
        listeners.set(event, handlers.filter(h => !toRemove.includes(h.handler)));
      }
      
      return this;
    },
    
    getHistory(event = null) {
      if (event) return history.filter(h => h.event === event);
      return [...history];
    },
    
    clearHistory() {
      history.length = 0;
    },
    
    listenerCount(event) {
      return (listeners.get(event) || []).length;
    },
    
    removeAllListeners(event = null) {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    }
  };
}

// ==================== SCHEDULER ====================

function scheduler(options = {}) {
  initialize();
  
  const tasks = new Map();
  let taskCounter = 0;
  
  return {
    schedule(name, fn, intervalMs, options = {}) {
      const { runImmediately = false, maxRuns = Infinity } = options;
      let runs = 0;
      
      if (runImmediately) {
        fn();
        runs++;
      }
      
      const intervalId = setInterval(() => {
        if (runs >= maxRuns) {
          clearInterval(intervalId);
          tasks.delete(name);
          return;
        }
        try {
          fn();
          runs++;
        } catch (e) {
          moduleState.stats.errors++;
        }
      }, intervalMs);
      
      tasks.set(name, { 
        id: ++taskCounter, 
        intervalId, 
        intervalMs, 
        runs, 
        maxRuns,
        startedAt: Date.now()
      });
      
      return name;
    },
    
    scheduleOnce(name, fn, delayMs) {
      const timeoutId = setTimeout(() => {
        try {
          fn();
        } catch (e) {
          moduleState.stats.errors++;
        }
        tasks.delete(name);
      }, delayMs);
      
      tasks.set(name, { 
        id: ++taskCounter, 
        timeoutId, 
        delayMs,
        startedAt: Date.now(),
        once: true
      });
      
      return name;
    },
    
    cancel(name) {
      const task = tasks.get(name);
      if (!task) return false;
      
      if (task.intervalId) clearInterval(task.intervalId);
      if (task.timeoutId) clearTimeout(task.timeoutId);
      tasks.delete(name);
      return true;
    },
    
    cancelAll() {
      for (const [name, task] of tasks) {
        if (task.intervalId) clearInterval(task.intervalId);
        if (task.timeoutId) clearTimeout(task.timeoutId);
      }
      tasks.clear();
    },
    
    getTasks() {
      const result = [];
      for (const [name, task] of tasks) {
        result.push({
          name,
          id: task.id,
          runs: task.runs,
          maxRuns: task.maxRuns,
          intervalMs: task.intervalMs,
          delayMs: task.delayMs,
          once: task.once || false,
          runningFor: Date.now() - task.startedAt
        });
      }
      return result;
    },
    
    taskCount() {
      return tasks.size;
    }
  };
}

// ==================== VALIDATION HELPER ====================

function validateAgainstSchema(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value === undefined) continue;
    
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
    }
    
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }
    
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`);
    }
    
    if (rules.minLength && String(value).length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }
    
    if (rules.maxLength && String(value).length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters`);
    }
    
    if (rules.pattern && !rules.pattern.test(String(value))) {
      errors.push(`${field} does not match required pattern`);
    }
    
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
  }
  
  return errors;
}

// ==================== MODULE EXPORTS ====================

module.exports = {
  greet,
  calculate,
  processData,
  createDatabase,
  handleRequest,
  generateReport,
  encryptData,
  analyzeFile,
  streamProcess,
  cacheManager,
  rateLimiter,
  validationPipeline,
  dataTransformer,
  eventBus,
  scheduler,
  
  // State access
  getStats() {
    return { ...moduleState.stats };
  },
  
  getConfig() {
    return { ...moduleState.config };
  },
  
  resetStats() {
    moduleState.stats = {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      startTime: Date.now()
    };
  }
};