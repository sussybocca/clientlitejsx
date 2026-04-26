// plugins/multi-framework.js
const { HMRPlugin } = require('clientlite/hmr-plugins');
const fs = require('fs');
const path = require('path');

/**
 * MultiFrameworkPlugin - Enables seamless use of multiple UI frameworks in a single CLJ app
 * 
 * Features:
 * - Import Vue components AS VueComponent
 * - Import Svelte components AS SvelteComponent  
 * - Import Lit elements AS LitElement
 * - Import Solid components AS SolidComponent
 * - Import Preact components AS PreactComponent
 * - Automatic framework detection and transpilation
 * - Framework-specific HMR preservation
 * - Shared state across framework boundaries
 */
function multiFrameworkPlugin(options = {}) {
  const plugin = new HMRPlugin('multi-framework', {
    enableVue: true,
    enableSvelte: true,
    enableLit: true,
    enableSolid: true,
    enablePreact: true,
    sharedState: true,
    ...options
  });
  
  // Framework registry for AS keyword resolution
  const frameworkRegistry = new Map();
  const componentCache = new Map();
  
  plugin.hooks = {
    // Transform imports using AS keyword
    transform(code, moduleId) {
      if (!moduleId) return code;
      
      // Pattern: import Component AS VueComponent FROM './Component.vue'
      const asImportRegex = /import\s+(?:{([^}]+)}|(\w+))\s+AS\s+(\w+)\s+FROM\s+['"]([^'"]+)['"]/g;
      
      let transformed = code;
      let match;
      
      while ((match = asImportRegex.exec(code)) !== null) {
        const namedImports = match[1];
        const defaultImport = match[2];
        const alias = match[3];
        const importPath = match[4];
        
        // Determine framework from file extension
        let framework = null;
        if (importPath.endsWith('.vue')) framework = 'vue';
        else if (importPath.endsWith('.svelte')) framework = 'svelte';
        else if (importPath.endsWith('.lit.js') || importPath.endsWith('.lit.jsx')) framework = 'lit';
        else if (importPath.endsWith('.solid.jsx') || importPath.endsWith('.solid.js')) framework = 'solid';
        else if (importPath.endsWith('.preact.jsx') || importPath.endsWith('.preact.js')) framework = 'preact';
        
        if (framework) {
          // Register the component with the framework registry
          const componentId = `${framework}:${alias}`;
          frameworkRegistry.set(componentId, {
            framework,
            path: importPath,
            alias,
            namedImports: namedImports ? namedImports.split(',').map(s => s.trim()) : [],
            defaultImport: !!defaultImport
          });
          
          // Replace with framework adapter import
          const adapterImport = `import { create${framework.charAt(0).toUpperCase() + framework.slice(1)}Adapter } from 'clj/framework-adapters';\n`;
          const componentImport = `import ${defaultImport || `{ ${namedImports} }`} from '${importPath}';\n`;
          const adapterSetup = `const ${alias} = create${framework.charAt(0).toUpperCase() + framework.slice(1)}Adapter(${defaultImport || namedImports.split(',')[0].trim()});\n`;
          
          transformed = transformed.replace(match[0], adapterImport + componentImport + adapterSetup);
        }
      }
      
      return transformed;
    },
    
    // Handle hot updates for cross-framework components
    handleHotUpdate(ctx) {
      const frameworkExts = ['.vue', '.svelte', '.lit.js', '.lit.jsx', '.solid.jsx', '.solid.js', '.preact.jsx', '.preact.js'];
      
      if (ctx.file && frameworkExts.some(ext => ctx.file.endsWith(ext))) {
        // Determine framework
        let framework = 'unknown';
        if (ctx.file.endsWith('.vue')) framework = 'vue';
        else if (ctx.file.endsWith('.svelte')) framework = 'svelte';
        else if (ctx.file.includes('.lit')) framework = 'lit';
        else if (ctx.file.includes('.solid')) framework = 'solid';
        else if (ctx.file.includes('.preact')) framework = 'preact';
        
        console.log(`🔄 [MultiFramework] ${framework.toUpperCase()} component updated: ${ctx.file}`);
        
        // Preserve framework-specific state
        ctx.metadata = {
          ...ctx.metadata,
          framework,
          preserveState: true
        };
      }
      
      return ctx.modules;
    },
    
    // Inject framework adapters and runtime
    clientInit(api) {
      return `
        // MultiFramework Plugin Runtime
        (function() {
          if (window.__clj_multi_framework) return;
          
          // Framework Adapter Factory
          const adapters = {};
          
          // Vue Adapter
          adapters.createVueAdapter = function(VueComponent) {
            return {
              __framework: 'vue',
              __component: VueComponent,
              render: (props) => {
                if (typeof window.Vue === 'undefined') {
                  console.error('Vue not loaded. Add Vue via CDN or npm.');
                  return null;
                }
                return window.Vue.h(VueComponent, props);
              }
            };
          };
          
          // Svelte Adapter
          adapters.createSvelteAdapter = function(SvelteComponent) {
            return {
              __framework: 'svelte',
              __component: SvelteComponent,
              render: (props, target) => {
                if (!target) return null;
                return new SvelteComponent({
                  target,
                  props
                });
              }
            };
          };
          
          // Lit Adapter
          adapters.createLitAdapter = function(LitElement) {
            return {
              __framework: 'lit',
              __component: LitElement,
              render: (props) => {
                if (!customElements.get(LitElement.tagName)) {
                  customElements.define(LitElement.tagName, LitElement);
                }
                const el = document.createElement(LitElement.tagName);
                Object.assign(el, props);
                return el;
              }
            };
          };
          
          // Solid Adapter
          adapters.createSolidAdapter = function(SolidComponent) {
            return {
              __framework: 'solid',
              __component: SolidComponent,
              render: (props) => {
                if (typeof window.Solid === 'undefined') {
                  console.error('Solid not loaded. Add Solid via CDN or npm.');
                  return null;
                }
                return window.Solid.createComponent(SolidComponent, props);
              }
            };
          };
          
          // Preact Adapter
          adapters.createPreactAdapter = function(PreactComponent) {
            return {
              __framework: 'preact',
              __component: PreactComponent,
              render: (props) => {
                if (typeof window.preact === 'undefined') {
                  console.error('Preact not loaded. Add Preact via CDN or npm.');
                  return null;
                }
                return window.preact.h(PreactComponent, props);
              }
            };
          };
          
          // Shared State Bridge
          const sharedState = new Map();
          const stateSubscribers = new Map();
          
          window.__clj_multi_framework = {
            // Adapters
            ...adapters,
            
            // Shared State API
            setSharedState(key, value) {
              const oldValue = sharedState.get(key);
              sharedState.set(key, value);
              
              // Notify subscribers
              const subs = stateSubscribers.get(key) || [];
              subs.forEach(cb => cb(value, oldValue));
              
              // Cross-framework event
              window.dispatchEvent(new CustomEvent('clj:state-change', {
                detail: { key, value, oldValue }
              }));
            },
            
            getSharedState(key) {
              return sharedState.get(key);
            },
            
            subscribeState(key, callback) {
              if (!stateSubscribers.has(key)) {
                stateSubscribers.set(key, []);
              }
              stateSubscribers.get(key).push(callback);
              
              return () => {
                const subs = stateSubscribers.get(key) || [];
                const index = subs.indexOf(callback);
                if (index > -1) subs.splice(index, 1);
              };
            },
            
            // Component Registry
            registerComponent(name, component, framework) {
              componentCache.set(name, { component, framework });
              window.dispatchEvent(new CustomEvent('clj:component-registered', {
                detail: { name, framework }
              }));
            },
            
            getComponent(name) {
              return componentCache.get(name);
            },
            
            // Framework detection
            getFramework(component) {
              if (component.__framework) return component.__framework;
              if (component._isVue) return 'vue';
              if (component.$$) return 'svelte';
              if (component.prototype instanceof HTMLElement) return 'lit';
              return 'unknown';
            },
            
            // Render cross-framework component
            renderComponent(adapter, props, container) {
              if (typeof adapter === 'string') {
                const cached = componentCache.get(adapter);
                if (cached) {
                  adapter = cached.component;
                }
              }
              
              if (adapter.__framework) {
                const framework = adapter.__framework;
                switch (framework) {
                  case 'svelte':
                    return adapter.render(props, container);
                  default:
                    const element = adapter.render(props);
                    if (container && element) {
                      if (typeof element === 'object' && !(element instanceof Node)) {
                        // Virtual DOM - needs framework-specific mounting
                        console.warn('Virtual DOM mounting not implemented for', framework);
                      } else if (element instanceof Node) {
                        container.appendChild(element);
                      }
                    }
                    return element;
                }
              }
              
              return null;
            }
          };
          
          // Register with CLJ
          if (window.__clj) {
            window.__clj.multiFramework = window.__clj_multi_framework;
          }
          
          console.log('🔌 MultiFramework Plugin: Ready');
          console.log('   - Vue:', ${plugin.options.enableVue});
          console.log('   - Svelte:', ${plugin.options.enableSvelte});
          console.log('   - Lit:', ${plugin.options.enableLit});
          console.log('   - Solid:', ${plugin.options.enableSolid});
          console.log('   - Preact:', ${plugin.options.enablePreact});
          console.log('   - Shared State:', ${plugin.options.sharedState});
        })();
      `;
    }
  };
  
  // Add framework CDN loader
  plugin.loadFramework = function(framework) {
    const cdnUrls = {
      vue: 'https://unpkg.com/vue@3/dist/vue.global.js',
      svelte: 'https://unpkg.com/svelte@4/dist/svelte.js',
      lit: 'https://unpkg.com/lit@3/lit.js',
      solid: 'https://unpkg.com/solid-js@1/dist/solid.js',
      preact: 'https://unpkg.com/preact@10/dist/preact.min.js'
    };
    
    const url = cdnUrls[framework];
    if (!url) return Promise.reject(`Unknown framework: ${framework}`);
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        console.log(`✅ Framework loaded: ${framework}`);
        resolve(window[framework]);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };
  
  return plugin;
}

// Export additional utilities
multiFrameworkPlugin.createCrossFrameworkStore = function(initialState = {}) {
  return {
    state: initialState,
    listeners: new Set(),
    
    set(key, value) {
      const oldValue = this.state[key];
      this.state[key] = value;
      this.listeners.forEach(fn => fn(key, value, oldValue));
    },
    
    get(key) {
      return this.state[key];
    },
    
    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }
  };
};

multiFrameworkPlugin.defineCrossFrameworkComponent = function(config) {
  const { name, framework, template, styles, props, methods } = config;
  
  return {
    name,
    framework,
    template,
    styles,
    props,
    methods,
    __isCrossFramework: true
  };
};

module.exports = multiFrameworkPlugin;
