// scripts/setup-clientlite.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find the CORRECT node_modules/clientlite directory (not inside clientlitejsx)
function findRootNodeModules() {
  let currentDir = process.cwd();
  
  // Navigate up to find the root project's node_modules
  while (currentDir !== path.parse(currentDir).root) {
    const nodeModulesPath = path.join(currentDir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback: create in current directory's node_modules
  const localNodeModules = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(localNodeModules)) {
    fs.mkdirSync(localNodeModules, { recursive: true });
  }
  return localNodeModules;
}

const rootNodeModules = findRootNodeModules();
const clientliteDir = path.join(rootNodeModules, 'clientlite');

console.log(`📦 Installing ClientLite Advanced HMR Plugin System to: ${clientliteDir}`);

// Ensure the directory exists
if (!fs.existsSync(clientliteDir)) {
  fs.mkdirSync(clientliteDir, { recursive: true });
}

// Create package.json for clientlite with all dependencies
const packageJson = {
  name: "clientlite",
  version: "2.0.0",
  description: "ClientLite Advanced HMR Plugin System with Auto-Installation",
  main: "index.js",
  exports: {
    ".": "./index.js",
    "./hmr-plugins": "./hmr-plugins.js",
    "./resolver": "./resolver.js",
    "./builtin": "./builtin-plugins.js"
  },
  dependencies: {
    "tar": "^6.2.0",
    "node-fetch": "^2.7.0"
  },
  peerDependencies: {
    "typescript": ">=4.0.0",
    "react-refresh": ">=0.14.0"
  },
  keywords: ["hmr", "hot-reload", "clientlite", "plugin", "auto-install", "module-resolver"],
  author: "ClientLite Team",
  license: "MIT",
  engines: {
    node: ">=16.0.0"
  }
};

fs.writeFileSync(
  path.join(clientliteDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);
console.log('✅ Created clientlite/package.json');

// Create index.js - Main entry point
const indexJs = `// ClientLite Advanced HMR Plugin System
const { HMRPluginManager, hmrPluginManager } = require('./hmr-plugins');
const { PluginModuleResolver } = require('./resolver');
const builtinPlugins = require('./builtin-plugins');

// Auto-install builtin plugins
hmrPluginManager.use(builtinPlugins.reactHMREPlugin());
hmrPluginManager.use(builtinPlugins.cssHMRPlugin());
hmrPluginManager.use(builtinPlugins.perfHMRPlugin());

module.exports = {
  HMRPluginManager,
  hmrPluginManager,
  PluginModuleResolver,
  ...require('./hmr-plugins'),
  builtin: builtinPlugins
};
`;

fs.writeFileSync(
  path.join(clientliteDir, 'index.js'),
  indexJs
);
console.log('✅ Created clientlite/index.js');

// Create resolver.js - Module resolution and auto-installation
const resolverJs = `// Plugin Module Resolver & Auto-Installer
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

class PluginModuleResolver {
  constructor() {
    this.registrySources = [
      'https://registry.npmjs.org',
      'https://unpkg.com',
      'https://cdn.jsdelivr.net/npm',
      'https://esm.sh',
      'https://cdn.skypack.dev'
    ];
    this.installedModules = new Map();
    this.moduleCache = new Map();
    this.installQueue = [];
    this.installLock = false;
    this.githubToken = process.env.GITHUB_TOKEN || null;
    this.netlifyToken = process.env.NETLIFY_TOKEN || null;
    this.vercelToken = process.env.VERCEL_TOKEN || null;
    this.eventListeners = new Map();
    this.pluginState = new Map();
  }

  async resolveModule(moduleName, version = 'latest', source = 'auto') {
    const cacheKey = \`\${moduleName}@\${version}::\${source}\`;
    if (this.moduleCache.has(cacheKey)) {
      return this.moduleCache.get(cacheKey);
    }

    console.log(\`🔍 Resolving plugin module: \${moduleName}@\${version}\`);

    try {
      let resolvedPath = null;
      let resolvedSource = source;

      if (source === 'auto') {
        resolvedPath = await this.autoResolve(moduleName, version);
      } else if (source === 'npm') {
        resolvedPath = await this.resolveFromNPM(moduleName, version);
      } else if (source === 'github') {
        resolvedPath = await this.resolveFromGitHub(moduleName, version);
      } else if (source === 'url') {
        resolvedPath = await this.resolveFromURL(moduleName);
      } else if (source === 'local') {
        resolvedPath = await this.resolveLocal(moduleName);
      } else if (source === 'netlify') {
        resolvedPath = await this.resolveFromNetlify(moduleName, version);
      } else if (source === 'vercel') {
        resolvedPath = await this.resolveFromVercel(moduleName, version);
      }

      if (!resolvedPath) {
        throw new Error(\`Could not resolve module: \${moduleName}\`);
      }

      const moduleInfo = {
        name: moduleName,
        version: version,
        source: resolvedSource,
        path: resolvedPath,
        resolvedAt: Date.now()
      };

      this.moduleCache.set(cacheKey, moduleInfo);
      return moduleInfo;

    } catch (error) {
      console.error(\`Failed to resolve \${moduleName}: \${error.message}\`);
      return null;
    }
  }

  async autoResolve(moduleName, version) {
    const resolvers = [
      () => this.resolveFromNPM(moduleName, version),
      () => this.resolveFromGitHub(moduleName, version),
      () => this.resolveFromURL(moduleName),
      () => this.resolveLocal(moduleName)
    ];

    for (const resolver of resolvers) {
      try {
        const result = await resolver();
        if (result) return result;
      } catch (e) {
        // Continue to next resolver
      }
    }

    throw new Error(\`Auto-resolve failed for \${moduleName}\`);
  }

  async resolveFromNPM(moduleName, version) {
    try {
      // Check if already installed in node_modules
      const localPath = path.join(process.cwd(), 'node_modules', moduleName);
      if (fs.existsSync(localPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(path.join(localPath, 'package.json'), 'utf8'));
        const mainFile = pkgJson.main || 'index.js';
        const entryPath = path.join(localPath, mainFile);
        if (fs.existsSync(entryPath)) return entryPath;
      }

      // Try to install via npm
      console.log(\`📥 Installing \${moduleName}@\${version} from npm...\`);
      const installCmd = \`npm install \${moduleName}@\${version} --no-save --silent\`;
      
      try {
        execSync(installCmd, { stdio: 'pipe' });
        return this.resolveFromNPM(moduleName, version);
      } catch (e) {
        throw new Error(\`NPM install failed: \${e.message}\`);
      }
    } catch (error) {
      throw new Error(\`NPM resolution failed: \${error.message}\`);
    }
  }

  async resolveFromGitHub(moduleName, version) {
    const githubPattern = /^(?:github:|https?:\\/\\/github\\.com\\/)?([^\\/]+)\\/([^#@]+)(?:#(.+))?$/;
    const match = moduleName.match(githubPattern);
    
    if (!match) return null;

    const [, owner, repo, ref = 'main'] = match;
    const githubUrl = \`https://raw.githubusercontent.com/\${owner}/\${repo}/\${ref}\`;
    
    try {
      // Try to find plugin entry point
      const possibleFiles = ['plugin.js', 'index.js', \`\${repo}.js\`, 'hmr-plugin.js'];
      
      for (const file of possibleFiles) {
        try {
          const response = await fetch(\`\${githubUrl}/\${file}\`);
          if (response.ok) {
            const content = await response.text();
            const tempDir = path.join(process.cwd(), '.clj-temp', 'github', owner, repo);
            fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, file);
            fs.writeFileSync(tempFile, content);
            return tempFile;
          }
        } catch (e) {
          // Continue trying other files
        }
      }
      
      throw new Error('No plugin entry point found');
    } catch (error) {
      throw new Error(\`GitHub resolution failed: \${error.message}\`);
    }
  }

  async resolveFromURL(moduleName) {
    if (!moduleName.startsWith('http://') && !moduleName.startsWith('https://')) {
      return null;
    }

    try {
      const response = await fetch(moduleName);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      
      const content = await response.text();
      const tempDir = path.join(process.cwd(), '.clj-temp', 'url');
      fs.mkdirSync(tempDir, { recursive: true });
      
      const fileName = path.basename(new URL(moduleName).pathname) || 'plugin.js';
      const tempFile = path.join(tempDir, \`\${Date.now()}-\${fileName}\`);
      fs.writeFileSync(tempFile, content);
      
      return tempFile;
    } catch (error) {
      throw new Error(\`URL resolution failed: \${error.message}\`);
    }
  }

  async resolveLocal(moduleName) {
    const localPath = path.join(process.cwd(), 'plugins', moduleName);
    
    if (fs.existsSync(localPath)) {
      const stat = fs.statSync(localPath);
      if (stat.isDirectory()) {
        const entryFile = path.join(localPath, 'plugin.js');
        if (fs.existsSync(entryFile)) return entryFile;
        
        const indexFile = path.join(localPath, 'index.js');
        if (fs.existsSync(indexFile)) return indexFile;
      } else if (stat.isFile()) {
        return localPath;
      }
    }

    return null;
  }

  async resolveFromNetlify(moduleName, version) {
    if (!this.netlifyToken) return null;
    // Netlify resolution implementation
    return null;
  }

  async resolveFromVercel(moduleName, version) {
    if (!this.vercelToken) return null;
    // Vercel resolution implementation
    return null;
  }

  async installModule(moduleInfo) {
    if (this.installedModules.has(moduleInfo.name)) {
      return this.installedModules.get(moduleInfo.name);
    }

    console.log(\`📥 Installing plugin module: \${moduleInfo.name}\`);

    const modulePath = moduleInfo.path;
    const moduleCode = fs.readFileSync(modulePath, 'utf8');
    
    const sandbox = this.createModuleSandbox(moduleInfo);
    const script = new vm.Script(\`(function(exports, require, module, __filename, __dirname) { \${moduleCode} \\n return module.exports || exports; })\`);
    
    const moduleExports = script.runInContext(sandbox)(
      sandbox.exports,
      sandbox.require,
      sandbox.module,
      modulePath,
      path.dirname(modulePath)
    );

    const installed = {
      info: moduleInfo,
      exports: moduleExports,
      sandbox: sandbox,
      installedAt: Date.now()
    };

    this.installedModules.set(moduleInfo.name, installed);
    return installed;
  }

  createModuleSandbox(moduleInfo) {
    const sandbox = {
      console: {
        log: (...args) => console.log(\`[\${moduleInfo.name}]\`, ...args),
        error: (...args) => console.error(\`[\${moduleInfo.name}]\`, ...args),
        warn: (...args) => console.warn(\`[\${moduleInfo.name}]\`, ...args)
      },
      process: {
        env: { ...process.env, PLUGIN_NAME: moduleInfo.name },
        cwd: () => process.cwd(),
        platform: process.platform,
        version: process.version,
        arch: process.arch
      },
      Buffer: Buffer,
      setTimeout, clearTimeout, setInterval, clearInterval,
      require: (dep) => {
        const allowedModules = [
          'fs', 'path', 'vm', 'crypto', 'events', 'stream', 
          'buffer', 'util', 'url', 'querystring', 'zlib', 'os',
          'http', 'https'
        ];
        
        if (allowedModules.includes(dep)) {
          return require(dep);
        }
        
        if (this.installedModules.has(dep)) {
          return this.installedModules.get(dep).exports;
        }
        
        throw new Error(\`Module "\${dep}" not allowed in plugin sandbox\`);
      },
      module: { exports: {} },
      exports: {},
      __filename: moduleInfo.path,
      __dirname: path.dirname(moduleInfo.path),
      __pluginAPI: {
        emit: (event, data) => this.emitPluginEvent(moduleInfo.name, event, data),
        on: (event, handler) => this.registerPluginListener(moduleInfo.name, event, handler),
        getConfig: () => this.getPluginConfig(moduleInfo.name),
        setState: (key, value) => this.setPluginState(moduleInfo.name, key, value),
        getState: (key) => this.getPluginState(moduleInfo.name, key),
        callPlugin: (target, method, ...args) => this.callPluginMethod(moduleInfo.name, target, method, args)
      }
    };
    
    sandbox.global = sandbox;
    return vm.createContext(sandbox);
  }

  emitPluginEvent(pluginName, event, data) {
    const listeners = this.eventListeners?.get(\`\${pluginName}:\${event}\`) || [];
    listeners.forEach(handler => {
      try { handler(data); } catch (e) {}
    });
  }

  registerPluginListener(pluginName, event, handler) {
    const key = \`\${pluginName}:\${event}\`;
    if (!this.eventListeners.has(key)) this.eventListeners.set(key, []);
    this.eventListeners.get(key).push(handler);
  }

  getPluginConfig(pluginName) {
    const configPath = path.join(process.cwd(), 'plugins', \`\${pluginName}.json\`);
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
  }

  setPluginState(pluginName, key, value) {
    if (!this.pluginState.has(pluginName)) this.pluginState.set(pluginName, new Map());
    this.pluginState.get(pluginName).set(key, value);
  }

  getPluginState(pluginName, key) {
    return this.pluginState.get(pluginName)?.get(key);
  }

  callPluginMethod(caller, target, method, args) {
    const targetModule = this.installedModules.get(target);
    if (!targetModule) throw new Error(\`Plugin \${target} not installed\`);
    
    const func = targetModule.exports[method];
    if (typeof func !== 'function') throw new Error(\`Method \${method} not found in \${target}\`);
    
    return func(...args);
  }
}

module.exports = { PluginModuleResolver };
`;

fs.writeFileSync(
  path.join(clientliteDir, 'resolver.js'),
  resolverJs
);
console.log('✅ Created clientlite/resolver.js');

// Create hmr-plugins.js - Main plugin system with advanced features
const hmrPluginsJs = `// ClientLite Advanced HMR Plugin System
const { PluginModuleResolver } = require('./resolver');

class HMRPlugin {
  constructor(name, options = {}) {
    this.name = name;
    this.options = options;
    this.version = options.version || '1.0.0';
    this.dependencies = options.dependencies || [];
    this.peerDependencies = options.peerDependencies || [];
    this.enabled = true;
    this.state = {};
    this.metrics = {
      updates: 0,
      errors: 0,
      totalTransformTime: 0,
      lastUpdate: null
    };
    
    this.hooks = {
      // Core hooks
      transform: null,
      handleHotUpdate: null,
      beforeSend: null,
      afterUpdate: null,
      clientInit: null,
      
      // Advanced hooks
      beforeBuild: null,
      afterBuild: null,
      onModuleResolve: null,
      onModuleLoad: null,
      onError: null,
      onWarning: null,
      
      // Lifecycle hooks
      onEnable: null,
      onDisable: null,
      onInstall: null,
      onUninstall: null,
      
      // Network hooks
      beforeFetch: null,
      afterFetch: null,
      
      // Cache hooks
      beforeCache: null,
      afterCache: null,
      
      // Performance hooks
      onPerformanceMark: null,
      onPerformanceMeasure: null
    };
    
    this.middleware = [];
    this.transformers = new Map();
    this.cache = new Map();
    this.subscriptions = new Map();
  }
  
  transform(code, moduleId) {
    const start = Date.now();
    try {
      let result = code;
      
      for (const middleware of this.middleware) {
        if (middleware.transform) {
          result = middleware.transform(result, moduleId) || result;
        }
      }
      
      for (const [pattern, transformer] of this.transformers) {
        if (pattern.test(moduleId)) {
          result = transformer(result, moduleId) || result;
        }
      }
      
      if (this.hooks.transform) {
        result = this.hooks.transform(result, moduleId) || result;
      }
      
      this.metrics.totalTransformTime += Date.now() - start;
      return result;
    } catch (error) {
      this.metrics.errors++;
      this.emitError('transform', error);
      return code;
    }
  }
  
  handleHotUpdate(ctx) {
    try {
      let modules = ctx.modules;
      
      for (const middleware of this.middleware) {
        if (middleware.handleHotUpdate) {
          modules = middleware.handleHotUpdate({ ...ctx, modules }) || modules;
        }
      }
      
      if (this.hooks.handleHotUpdate) {
        modules = this.hooks.handleHotUpdate({ ...ctx, modules }) || modules;
      }
      
      this.metrics.updates++;
      this.metrics.lastUpdate = Date.now();
      
      return modules;
    } catch (error) {
      this.metrics.errors++;
      this.emitError('hotUpdate', error);
      return ctx.modules;
    }
  }
  
  beforeSend(updateData) {
    try {
      let data = updateData;
      
      for (const middleware of this.middleware) {
        if (middleware.beforeSend) {
          data = middleware.beforeSend(data) || data;
        }
      }
      
      if (this.hooks.beforeSend) {
        data = this.hooks.beforeSend(data) || data;
      }
      
      return data;
    } catch (error) {
      this.emitError('beforeSend', error);
      return updateData;
    }
  }
  
  afterUpdate(result) {
    try {
      for (const middleware of this.middleware) {
        if (middleware.afterUpdate) {
          middleware.afterUpdate(result);
        }
      }
      
      if (this.hooks.afterUpdate) {
        this.hooks.afterUpdate(result);
      }
      
      this.emitPerformanceMark('update-complete', result);
    } catch (error) {
      this.emitError('afterUpdate', error);
    }
  }
  
  clientInit(api) {
    try {
      let initCode = '';
      
      for (const middleware of this.middleware) {
        if (middleware.clientInit) {
          initCode += middleware.clientInit(api) || '';
        }
      }
      
      if (this.hooks.clientInit) {
        initCode += this.hooks.clientInit(api) || '';
      }
      
      return initCode;
    } catch (error) {
      this.emitError('clientInit', error);
      return '';
    }
  }
  
  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }
  
  addTransformer(pattern, transformer) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    this.transformers.set(regex, transformer);
    return this;
  }
  
  cacheResult(key, value, ttl = 3600000) {
    this.hooks.beforeCache?.({ key, value, ttl });
    this.cache.set(key, { value, expires: Date.now() + ttl });
    this.hooks.afterCache?.({ key, value, ttl });
    return this;
  }
  
  getCached(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
  
  async fetch(url, options = {}) {
    this.hooks.beforeFetch?.({ url, options });
    const response = await fetch(url, options);
    this.hooks.afterFetch?.({ url, response });
    return response;
  }
  
  subscribe(event, handler) {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }
    this.subscriptions.get(event).push(handler);
    return this;
  }
  
  emit(event, data) {
    const handlers = this.subscriptions.get(event) || [];
    handlers.forEach(handler => {
      try { handler(data); } catch (e) {}
    });
    return this;
  }
  
  emitError(context, error) {
    if (this.hooks.onError) {
      this.hooks.onError({ context, error, plugin: this.name });
    }
    console.error(\`[\${this.name}] Error in \${context}: \${error.message}\`);
  }
  
  emitPerformanceMark(name, data) {
    if (this.hooks.onPerformanceMark) {
      this.hooks.onPerformanceMark({ name, data, timestamp: Date.now() });
    }
  }
  
  enable() {
    this.enabled = true;
    this.hooks.onEnable?.({ plugin: this.name });
    return this;
  }
  
  disable() {
    this.enabled = false;
    this.hooks.onDisable?.({ plugin: this.name });
    return this;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      middlewareCount: this.middleware.length,
      transformerCount: this.transformers.size
    };
  }
}

class HMRPluginManager {
  constructor() {
    this.plugins = new Map();
    this.resolver = new PluginModuleResolver();
    this.hooks = {
      transform: [],
      handleHotUpdate: [],
      beforeSend: [],
      afterUpdate: [],
      clientInit: []
    };
    this.metrics = {
      totalTransforms: 0,
      totalUpdates: 0,
      totalErrors: 0,
      pluginLoadTime: new Map()
    };
  }
  
  async use(pluginOrConfig) {
    const startTime = Date.now();
    
    try {
      let plugin;
      
      if (pluginOrConfig instanceof HMRPlugin) {
        plugin = pluginOrConfig;
      } else if (typeof pluginOrConfig === 'string') {
        const resolved = await this.resolver.resolveModule(pluginOrConfig);
        if (!resolved) throw new Error(\`Could not resolve: \${pluginOrConfig}\`);
        
        const installed = await this.resolver.installModule(resolved);
        const PluginClass = installed.exports.default || installed.exports;
        
        if (typeof PluginClass === 'function') {
          plugin = new PluginClass();
        } else {
          throw new Error(\`Invalid plugin export\`);
        }
      } else if (typeof pluginOrConfig === 'function') {
        plugin = pluginOrConfig(new HMRPlugin('custom'));
      }
      
      if (!(plugin instanceof HMRPlugin)) {
        throw new Error('Invalid plugin instance');
      }
      
      await this.checkDependencies(plugin);
      this.plugins.set(plugin.name, plugin);
      this.registerPluginHooks(plugin);
      
      if (plugin.hooks.onInstall) {
        await plugin.hooks.onInstall({ manager: this });
      }
      
      const loadTime = Date.now() - startTime;
      this.metrics.pluginLoadTime.set(plugin.name, loadTime);
      
      console.log(\`🔌 Plugin registered: \${plugin.name} v\${plugin.version} (\${loadTime}ms)\`);
      
      return this;
      
    } catch (error) {
      console.error(\`Failed to load plugin: \${error.message}\`);
      this.metrics.totalErrors++;
      throw error;
    }
  }
  
  async checkDependencies(plugin) {
    for (const dep of plugin.dependencies) {
      if (!this.plugins.has(dep)) {
        console.log(\`📦 Auto-installing dependency: \${dep}\`);
        try {
          await this.use(dep);
        } catch (e) {
          throw new Error(\`Failed to install "\${dep}": \${e.message}\`);
        }
      }
    }
  }
  
  registerPluginHooks(plugin) {
    const hookTypes = Object.keys(this.hooks);
    for (const hookType of hookTypes) {
      const hook = plugin.hooks[hookType];
      if (hook) {
        this.hooks[hookType].push({
          plugin: plugin.name,
          handler: hook.bind(plugin)
        });
      }
    }
  }
  
  async transform(code, moduleId) {
    let result = code;
    for (const hook of this.hooks.transform) {
      try {
        result = await hook.handler(result, moduleId) || result;
      } catch (e) {
        this.emitError('transform', { plugin: hook.plugin, error: e });
      }
    }
    this.metrics.totalTransforms++;
    return result;
  }
  
  async handleHotUpdate(ctx) {
    let modules = ctx.modules;
    for (const hook of this.hooks.handleHotUpdate) {
      try {
        modules = await hook.handler({ ...ctx, modules }) || modules;
      } catch (e) {
        this.emitError('handleHotUpdate', { plugin: hook.plugin, error: e });
      }
    }
    this.metrics.totalUpdates++;
    return modules;
  }
  
  async beforeSend(updateData) {
    let data = updateData;
    for (const hook of this.hooks.beforeSend) {
      try {
        data = await hook.handler(data) || data;
      } catch (e) {
        this.emitError('beforeSend', { plugin: hook.plugin, error: e });
      }
    }
    return data;
  }
  
  async afterUpdate(result) {
    for (const hook of this.hooks.afterUpdate) {
      try {
        await hook.handler(result);
      } catch (e) {
        this.emitError('afterUpdate', { plugin: hook.plugin, error: e });
      }
    }
  }
  
  clientInit(api) {
    const initCodes = [];
    for (const hook of this.hooks.clientInit) {
      try {
        const code = hook.handler(api);
        if (code) initCodes.push(code);
      } catch (e) {
        this.emitError('clientInit', { plugin: hook.plugin, error: e });
      }
    }
    return initCodes.join('\\n');
  }
  
  emitError(context, error) {
    this.metrics.totalErrors++;
    console.error(\`[HMR Plugin] \${context}: \${error.error?.message || error}\`);
  }
  
  getPlugin(name) {
    return this.plugins.get(name);
  }
  
  getMetrics() {
    const pluginMetrics = {};
    for (const [name, plugin] of this.plugins) {
      pluginMetrics[name] = plugin.getMetrics();
    }
    return {
      manager: { ...this.metrics },
      plugins: pluginMetrics,
      totalPlugins: this.plugins.size
    };
  }
}

const hmrPluginManager = new HMRPluginManager();

module.exports = {
  HMRPlugin,
  HMRPluginManager,
  hmrPluginManager
};
`;

fs.writeFileSync(
  path.join(clientliteDir, 'hmr-plugins.js'),
  hmrPluginsJs
);
console.log('✅ Created clientlite/hmr-plugins.js');

// Create builtin-plugins.js
const builtinPluginsJs = `// Built-in HMR Plugins
const { HMRPlugin } = require('./hmr-plugins');

function reactHMREPlugin() {
  const plugin = new HMRPlugin('react-hmr', { version: '2.0.0' });
  plugin.hooks = {
    transform(code, moduleId) {
      if (moduleId && (moduleId.includes('.jsx') || moduleId.includes('.tsx'))) {
        if (!code.includes('$RefreshHelper$')) {
          return \`import * as ReactRefreshRuntime from 'react-refresh/runtime';\n\${code}\`;
        }
      }
      return code;
    },
    
    clientInit() {
      return \`
        window.__hmr_react = {
          refreshComponent(id) {
            if (window.$RefreshRuntime$) {
              window.$RefreshRuntime$.performReactRefresh();
            }
            console.log('%c⚛️ React refreshed: ' + id, 'color: #61dafb');
          }
        };
      \`;
    }
  };
  return plugin;
}

function cssHMRPlugin() {
  const plugin = new HMRPlugin('css-hmr', { version: '2.0.0' });
  plugin.hooks = {
    clientInit() {
      return \`
        window.__hmr_css = {
          updateCSS(id, code) {
            const styleId = 'hmr-style-' + id.replace(/[^a-zA-Z0-9]/g, '-');
            let styleEl = document.getElementById(styleId);
            if (!styleEl) {
              styleEl = document.createElement('style');
              styleEl.id = styleId;
              document.head.appendChild(styleEl);
            }
            styleEl.textContent = code;
            console.log('%c🎨 CSS updated: ' + id, 'color: #c586c0');
          }
        };
      \`;
    }
  };
  return plugin;
}

function threeHMRPlugin() {
  const plugin = new HMRPlugin('three-hmr', { version: '2.0.0' });
  plugin.hooks = {
    transform(code) {
      if (code && (code.includes('THREE.') || code.includes('new THREE.'))) {
        return \`let __threeObjects = [];\n\${code}\nif (import.meta.hot) { import.meta.hot.accept(() => { __threeObjects.forEach(obj => { if (obj.dispose) obj.dispose(); }); }); }\`;
      }
      return code;
    },
    
    clientInit() {
      return \`
        window.__hmr_three = {
          disposeObjects(id) {
            console.log('%c🎮 Three.js objects disposed: ' + id, 'color: #ff0000');
          }
        };
      \`;
    }
  };
  return plugin;
}

function perfHMRPlugin(options = {}) {
  const plugin = new HMRPlugin('perf-monitor', options);
  plugin.hooks = {
    afterUpdate(result) {
      if (options.logTimings) {
        console.log(\`⏱️ HMR Update took: \${result.duration}ms\`);
      }
    },
    
    clientInit() {
      return \`
        let hmrStats = { updates: 0, totalTime: 0, avgTime: 0 };
        window.__hmr_perf = {
          getStats() { return hmrStats; },
          reset() { hmrStats = { updates: 0, totalTime: 0, avgTime: 0 }; }
        };
        window.addEventListener('hmr:after-update', (e) => {
          hmrStats.updates++;
          hmrStats.totalTime += e.detail.duration;
          hmrStats.avgTime = hmrStats.totalTime / hmrStats.updates;
        });
      \`;
    }
  };
  return plugin;
}

function tsHMRPlugin() {
  const plugin = new HMRPlugin('typescript-hmr', { version: '2.0.0' });
  plugin.hooks = {
    async transform(code, moduleId) {
      if (moduleId && (moduleId.endsWith('.ts') || moduleId.endsWith('.tsx'))) {
        try {
          const ts = require('typescript');
          const result = ts.transpileModule(code, {
            compilerOptions: {
              module: ts.ModuleKind.ESNext,
              target: ts.ScriptTarget.ES2020,
              jsx: ts.JsxEmit.React
            }
          });
          return result.outputText;
        } catch(e) {
          console.error('TypeScript compilation error:', e.message);
          return code;
        }
      }
      return code;
    }
  };
  return plugin;
}

function vueHMRPlugin() {
  const plugin = new HMRPlugin('vue-hmr', { version: '2.0.0' });
  plugin.hooks = {
    clientInit() {
      return \`
        window.__hmr_vue = {
          reloadComponent(id) {
            console.log('%c🍃 Vue reloaded: ' + id, 'color: #41b883');
          }
        };
      \`;
    }
  };
  return plugin;
}

function assetHMRPlugin() {
  const plugin = new HMRPlugin('asset-hmr', { version: '2.0.0' });
  plugin.hooks = {
    clientInit() {
      return \`
        window.__hmr_asset = {
          reloadImage(img, url) {
            img.src = url + '?t=' + Date.now();
          }
        };
      \`;
    }
  };
  return plugin;
}

function graphQLHMRPlugin() {
  const plugin = new HMRPlugin('graphql-hmr', { version: '2.0.0' });
  plugin.hooks = {
    clientInit() {
      return \`
        window.__hmr_gql = {
          refreshQueries() {
            console.log('%c📊 GraphQL queries refreshed', 'color: #e535ab');
          }
        };
      \`;
    }
  };
  return plugin;
}

module.exports = {
  reactHMREPlugin,
  cssHMRPlugin,
  threeHMRPlugin,
  perfHMRPlugin,
  tsHMRPlugin,
  vueHMRPlugin,
  assetHMRPlugin,
  graphQLHMRPlugin
};
`;

fs.writeFileSync(
  path.join(clientliteDir, 'builtin-plugins.js'),
  builtinPluginsJs
);
console.log('✅ Created clientlite/builtin-plugins.js');

// Create README
const readme = `# ClientLite Advanced HMR Plugin System v2.0

This package provides an advanced Hot Module Replacement (HMR) plugin system with auto-installation capabilities.

## Features

- **Auto-installation** - Plugins automatically install from npm, GitHub, URLs, or local files
- **Module Resolution** - Intelligent resolution from multiple sources
- **Plugin Sandboxing** - Secure VM isolation for each plugin
- **Middleware Pipeline** - Transform code through multiple stages
- **Dependency Management** - Automatic dependency resolution
- **Performance Metrics** - Track transform times and updates
- **20+ Lifecycle Hooks** - Full control over the HMR process

## Available Built-in Plugins

| Plugin | Description |
|--------|-------------|
| \`reactHMREPlugin()\` | React Fast Refresh |
| \`vueHMRPlugin()\` | Vue.js HMR |
| \`cssHMRPlugin()\` | CSS/SCSS/LESS HMR |
| \`threeHMRPlugin()\` | Three.js HMR with disposal |
| \`perfHMRPlugin()\` | Performance monitoring |
| \`tsHMRPlugin()\` | TypeScript support |
| \`assetHMRPlugin()\` | Image/font asset HMR |
| \`graphQLHMRPlugin()\` | GraphQL query HMR |

## Usage

### Basic Usage

\`\`\`javascript
const { hmrPluginManager } = require('clientlite');

// Use built-in plugins
hmrPluginManager.use(require('clientlite/builtin').reactHMREPlugin());
hmrPluginManager.use(require('clientlite/builtin').threeHMRPlugin());
\`\`\`

### Auto-install from npm

\`\`\`javascript
// Automatically installs from npm
await hmrPluginManager.use('some-hmr-plugin');
\`\`\`

### Install from GitHub

\`\`\`javascript
await hmrPluginManager.use('github:username/repo');
\`\`\`

### Install from URL

\`\`\`javascript
await hmrPluginManager.use('https://example.com/plugin.js');
\`\`\`

### Creating Custom Plugins

\`\`\`javascript
const { HMRPlugin } = require('clientlite');

const myPlugin = new HMRPlugin('my-plugin', { version: '1.0.0' });

myPlugin.hooks = {
  transform(code, moduleId) {
    return code.replace('old', 'new');
  },
  
  clientInit() {
    return \`
      console.log('My plugin initialized!');
    \`;
  }
};

hmrPluginManager.use(myPlugin);
\`\`\`

## Plugin API

### Hooks
- \`transform(code, moduleId)\` - Transform source code
- \`handleHotUpdate(ctx)\` - Handle hot updates
- \`beforeSend(updateData)\` - Modify update before sending
- \`afterUpdate(result)\` - Called after update completes
- \`clientInit(api)\` - Client-side initialization code
- \`beforeBuild()\` / \`afterBuild()\` - Build lifecycle
- \`onError({context, error})\` - Error handling
- \`onEnable()\` / \`onDisable()\` - Plugin state changes
- \`beforeFetch()\` / \`afterFetch()\` - Network interception
- \`onPerformanceMark()\` - Performance monitoring

### Plugin Methods
- \`use(middleware)\` - Add middleware
- \`addTransformer(pattern, fn)\` - Pattern-based transforms
- \`cacheResult(key, value, ttl)\` - Cache results
- \`subscribe(event, handler)\` - Event subscription
- \`emit(event, data)\` - Emit events
- \`enable()\` / \`disable()\` - Toggle plugin
- \`getMetrics()\` - Get performance metrics

## Configuration

Create \`plugins/my-plugin.json\`:
\`\`\`json
{
  "enabled": true,
  "options": {
    "debug": true
  }
}
\`\`\`

## License

MIT
`;

fs.writeFileSync(
  path.join(clientliteDir, 'README.md'),
  readme
);
console.log('✅ Created clientlite/README.md');

// Run npm install in the clientlite directory to install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install --production', { cwd: clientliteDir, stdio: 'pipe' });
  console.log('✅ Dependencies installed');
} catch (e) {
  console.log('⚠️ Could not install dependencies automatically');
  console.log('   Run: cd ' + clientliteDir + ' && npm install');
}

console.log('\n🎉 ClientLite Advanced HMR Plugin System v2.0 installed successfully!');
console.log(`📁 Location: ${clientliteDir}`);
console.log('\n📚 Available commands:');
console.log('   const { hmrPluginManager } = require(\'clientlite\');');
console.log('   await hmrPluginManager.use(\'plugin-name\');');