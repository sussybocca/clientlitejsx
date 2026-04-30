#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Add this after the existing compiler override check and before the main function

// ============================================
// LOCAL LIB OVERRIDE SYSTEM WITH FALLBACK
// ============================================

const LIB_FILES = [
  'apiRouter.js',
  'clj-language.js',
  'compiler.js',
  'config.js',
  'customSyntax.js',
  'EMN.js',
  'emulator.js',
  'go-bridge.js',
  'index.js',
  'power.js',
  'server.js',
  'tunnel.js'
];

// Get npm lib path - centralized
const npmLibPath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'lib');

// Special handling for .power.js override
function getPowerOverridePath() {
  const cwd = process.cwd();
  
  const localPowerPath = path.join(cwd, '.power.js');
  if (fs.existsSync(localPowerPath)) {
    return localPowerPath;
  }
  
  if (fs.existsSync(cwd)) {
    const dirs = fs.readdirSync(cwd, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    for (const dir of dirs) {
      const powerPath = path.join(cwd, dir.name, '.power.js');
      if (fs.existsSync(powerPath)) {
        return powerPath;
      }
    }
  }
  
  // FALLBACK: return npm path
  return path.join(npmLibPath, 'power.js');
}

// Generic lib file override function WITH FALLBACK
function getLocalOverride(libFileName) {
  const cwd = process.cwd();
  const npmPath = path.join(npmLibPath, libFileName);
  const localPath = path.join(cwd, libFileName);
  
  // Try local first
  if (fs.existsSync(localPath)) {
    try {
      // Verify the file is readable
      fs.accessSync(localPath, fs.constants.R_OK);
      return localPath;
    } catch (err) {
      console.log(chalk.yellow(`⚠️ Local ${libFileName} exists but not readable, using npm fallback`));
    }
  }
  
  // Check subdirectories
  if (fs.existsSync(cwd)) {
    try {
      const dirs = fs.readdirSync(cwd, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());
      
      for (const dir of dirs) {
        const filePath = path.join(cwd, dir.name, libFileName);
        if (fs.existsSync(filePath)) {
          try {
            fs.accessSync(filePath, fs.constants.R_OK);
            return filePath;
          } catch (err) {
            continue;
          }
        }
      }
    } catch (err) {
      // FALLBACK: use npm
    }
  }
  
  // FALLBACK: always return npm path as last resort
  if (fs.existsSync(npmPath)) {
    return npmPath;
  }
  
  return null;
}

// Initialize override system
function initLibOverrides() {
  const overrides = {};
  
  console.log(chalk.cyan('\n🔍 Scanning for local lib overrides...'));
  
  // Check all lib files
  for (const libFile of LIB_FILES) {
    const filePath = getLocalOverride(libFile);
    
    if (filePath) {
      const isLocal = !filePath.includes('node_modules');
      overrides[libFile] = filePath;
      
      if (isLocal) {
        console.log(chalk.green(`📁 Found ${libFile} override: ${path.relative(process.cwd(), filePath)}`));
      } else {
        console.log(chalk.gray(`📦 Using npm fallback: ${libFile}`));
      }
    } else {
      console.log(chalk.red(`❌ ${libFile} not found in local or npm`));
    }
  }
  
  return overrides;
}

// File change detector with hash comparison
function createFileWatcher(overrides, callback) {
  const fileHashes = new Map();
  
  for (const [libFile, filePath] of Object.entries(overrides)) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const hash = crypto.createHash('md5').update(content).digest('hex');
        fileHashes.set(filePath, hash);
      }
    } catch (err) {
      // Skip unreadable files - npm fallback handles it
    }
  }
  
  function checkForChanges() {
    const changed = [];
    
    for (const [libFile, filePath] of Object.entries(overrides)) {
      try {
        if (!fs.existsSync(filePath)) {
          // File disappeared, fallback to npm
          const npmPath = path.join(npmLibPath, libFile);
          if (fs.existsSync(npmPath)) {
            overrides[libFile] = npmPath;
            console.log(chalk.yellow(`⚠️ ${libFile} disappeared, falling back to npm`));
          }
          continue;
        }
        
        const content = fs.readFileSync(filePath);
        const newHash = crypto.createHash('md5').update(content).digest('hex');
        const oldHash = fileHashes.get(filePath);
        
        if (oldHash && newHash !== oldHash) {
          changed.push({ libFile, localPath: filePath, oldHash, newHash });
          fileHashes.set(filePath, newHash);
          console.log(chalk.yellow(`🔄 Detected change in: ${filePath}`));
        }
      } catch (err) {
        // Error reading, fallback to npm
        const npmPath = path.join(npmLibPath, libFile);
        if (fs.existsSync(npmPath)) {
          overrides[libFile] = npmPath;
          console.log(chalk.yellow(`⚠️ Error reading ${libFile}, falling back to npm`));
        }
      }
    }
    
    if (changed.length > 0 && callback) {
      callback(changed);
    }
    
    return changed;
  }
  
  return { checkForChanges, fileHashes };
}

// Function to import module with automatic fallback
async function importWithFallback(moduleName, importPath) {
  const localOverride = libOverrides[moduleName];
  
  if (localOverride && fs.existsSync(localOverride)) {
    try {
      console.log(chalk.gray(`📁 Loading ${moduleName} from: ${path.relative(process.cwd(), localOverride)}`));
      return await import('file:///' + localOverride.replace(/\\/g, '/'));
    } catch (err) {
      console.log(chalk.yellow(`⚠️ Failed to load local ${moduleName}, falling back to npm`));
    }
  }
  
  // FALLBACK: load from npm
  console.log(chalk.gray(`📦 Loading ${moduleName} from npm`));
  return await import(importPath);
}

// Initialize and start the lib override system
const libOverrides = initLibOverrides();

// Start watching if any local overrides exist
const hasLocalOverrides = Object.entries(libOverrides).some(([_, path]) => !path.includes('node_modules'));

if (hasLocalOverrides) {
  const watcher = createFileWatcher(libOverrides, (changedFiles) => {
    console.log(chalk.yellow('\n🔄 Local lib files changed...'));
    // Updates happen automatically through the override paths
  });
  
  const watcherInterval = setInterval(() => {
    watcher.checkForChanges();
  }, 2000);
  
  process.on('SIGINT', () => {
    clearInterval(watcherInterval);
    process.exit(0);
  });
  
  process.on('exit', () => {
    clearInterval(watcherInterval);
  });
  
  console.log(chalk.cyan('👀 Watching for local file changes...\n'));
}

// ============================================
// END LOCAL LIB OVERRIDE SYSTEM WITH FALLBACK
// ============================================

// Compiler import with local override fallback
let compilerModule;
const localCompiler = libOverrides['compiler.js'];
if (localCompiler && !localCompiler.includes('node_modules')) {
  compilerModule = await import('file:///' + localCompiler.replace(/\\/g, '/'));
} else {
  compilerModule = await import('../lib/compiler.js');
}

const { compileProject, startHotReload } = compilerModule;  // ← ADD THIS LINE
import { startServer } from '../lib/server.js';
import { generateId, initConfig, addLanguageBlock } from '../lib/config.js';
import { extendParser } from '../lib/customSyntax.js';
import yaml from 'js-yaml';
import chalk from 'chalk';
import esbuild from 'esbuild';
import crypto from 'crypto';
import express from 'express';
import { createRequire } from 'module';
import { execSync } from 'child_process';


const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { compilerManager } = require('../lib/compiler.js');


const args = process.argv.slice(2);
const command = args[0];


// Ensure clientlite package is set up
function ensureClientLitePackage() {
  const clientliteDir = path.join(__dirname, '..', 'node_modules', 'clientlite');
  const setupScript = path.join(__dirname, '..', 'scripts', 'setup-clientlite.js');
  
  if (!fs.existsSync(clientliteDir) || !fs.existsSync(path.join(clientliteDir, 'hmr-plugins.js'))) {
    if (fs.existsSync(setupScript)) {
      console.log('📦 Setting up ClientLite HMR plugins...');
      import(setupScript);
    }
  }
}

// Call this before anything else
ensureClientLitePackage();

async function main() {
  switch (command) {
    case 'init':
      await initConfig();
      console.log(chalk.green('✅ CLJ.Config created.'));
      break;

    case 'gen':
      if (args[1] === 'New' && args[2] === 'L') {
        const name = args[3];
        if (!name) {
          console.error(chalk.red('❌ Usage: clj gen New L <blockName>'));
          process.exit(1);
        }
        const id = generateId();
        await addLanguageBlock(name, id);
        console.log(chalk.green(`✅ New language block: ${name} (ID: ${id})`));
      } else if (args[1] === 'New' && args[2] === 'API') {
        const apiName = args[3];
        if (!apiName) {
          console.error(chalk.red('❌ Usage: clj gen New API <apiName>'));
          process.exit(1);
        }
        const apiDir = path.join(process.cwd(), 'api');
        if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
        const apiPath = path.join(apiDir, `${apiName}.js`);
        const apiTemplate = `// API Endpoint: /api/${apiName}
// Auto-generated by ClientLite

module.exports.get = (req, res) => {
  res.json({ message: 'GET /api/${apiName}', query: req.query });
};
module.exports.post = (req, res) => {
  res.json({ message: 'POST /api/${apiName}', body: req.body });
};
module.exports.put = (req, res) => {
  res.json({ message: 'PUT /api/${apiName}', body: req.body });
};
module.exports.delete = (req, res) => {
  res.json({ message: 'DELETE /api/${apiName}', id: req.params.id });
};
`;
        fs.writeFileSync(apiPath, apiTemplate);
        console.log(chalk.green(`✅ New API endpoint created: api/${apiName}.js`));
      } else {
        console.error(chalk.red('❌ Unknown gen. Use: clj gen New L <name> or clj gen New API <name>'));
      }
      break;


case 'power':
  const powerTarget = args[1] || 'client';
  const powerIsProd = args.includes('--prod') || args.includes('--production');
  const powerHotReload = args.includes('--hot') || args.includes('-h');
  
  console.log(chalk.magenta('\n⚡ CLJ POWER MODE - UI Transform Engine'));
  console.log(chalk.gray('   Using: lib/power.js'));
  console.log(chalk.gray('   No React required - Native CLJ Runtime\n'));
  
  // Import power.js directly
  const powerPath = path.join(__dirname, '..', 'lib', 'power.js');
  const powerCompiler = await import('file:///' + powerPath.replace(/\\/g, '/'));
  const { compileProject: powerCompile } = powerCompiler;
  
  const powerSuccess = await powerCompile(powerTarget, powerIsProd);
  
  if (powerSuccess) {
    console.log(chalk.green('\n✅ Power build complete!'));
    console.log(chalk.gray(`   Output: dist/${powerTarget}/\n`));
    
    if (powerHotReload) {
      const { startServer } = await import('../lib/server.js');
      startServer(powerTarget);
    }
  } else {
    console.log(chalk.red('\n❌ Power build failed'));
    process.exit(1);
  }
  break;


     case 'clone':
  await compilerManager.init();
  const targetPath = args[1] ? path.resolve(args[1]) : null;
  await compilerManager.cloneCompiler(targetPath);
  console.log(chalk.cyan('\n📝 To use the cloned compiler:'));
  console.log(chalk.white('   1. Edit the compiler.js file'));
  console.log(chalk.white('   2. Run your app normally - it auto-detects local compiler'));
  console.log(chalk.white('   3. To update from npm again, delete compiler.js'));
  break;

case 'update-compiler':
  const channel = args[1] || 'stable';
  await compilerManager.updateCompiler(channel);
  break;

case 'compiler-info':
  console.log(chalk.cyan('\n📊 Compiler Information:'));
  console.log(chalk.white(`   Source: ${compilerManager.compilerSource?.path}`));
  console.log(chalk.white(`   Version: ${compilerManager.compilerSource?.version}`));
  console.log(chalk.white(`   Functions: ${compilerManager.compilerSource?.exportedFunctions?.length}`));
  console.log(chalk.white(`   Size: ${((compilerManager.compilerSource?.size || 0) / 1024).toFixed(1)} KB`));
  console.log(chalk.white(`   GPU: ${compilerManager.gpuAccelerated ? 'Yes' : 'No'}`));
  console.log(chalk.white(`   WASM: ${compilerManager.wasmModules.size} modules`));
  console.log(chalk.white(`   Shared Memory: ${compilerManager.sharedArrayBuffers.size > 0 ? '64MB' : 'No'}`));
  const report = compilerManager.generatePerfReport();
  console.log(chalk.gray(`\n   Metrics: ${JSON.stringify(report.metrics, null, 2)}`));
  break;

    case 'build':
      const buildTarget = args[1];
      if (!buildTarget) {
        console.error(chalk.red('❌ Usage: clj build <mode>'));
        process.exit(1);
      }
      if (['client', 'server', 'server-side'].includes(buildTarget)) {
        console.log(chalk.cyan(`🔨 Building for ${buildTarget} mode...`));
        const success = await compileProject(buildTarget);
        if (success) {
          console.log(chalk.green(`✅ Build complete! Output in dist/${buildTarget}/`));
        } else {
          console.log(chalk.red(`❌ Build failed for ${buildTarget} mode`));
          process.exit(1);
        }
      } else {
        console.error(chalk.red('❌ Invalid build mode. Use: client, server, or server-side'));
      }
      break;

   case 'run':
  const target = args[1];
  const hotReload = args[2] === '--hot' || args[2] === '-h';
  const isProd = args.includes('--prod') || args.includes('--production');
  
  if (!target) {
    console.error(chalk.red('❌ Usage: clj run <mode|clj.config> [--hot] [--prod]'));
    process.exit(1);
  }
  
  if (['client', 'server', 'server-side'].includes(target)) {
    console.log(chalk.cyan(`🚀 Starting ClientLite in ${target} mode...`));
    const success = await compileProject(target, isProd);
    if (!success) process.exit(1);
    if (hotReload) startHotReload(target, isProd);
    startServer(target);
  } else if (target.toLowerCase() === 'clj.config') {
    const configPath = path.join(process.cwd(), 'CLJ.Config');
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('❌ CLJ.Config not found. Run "clj init".'));
      process.exit(1);
    }
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
    if (config.languageBlocks?.length) {
      extendParser(config.languageBlocks);
      console.log(chalk.green('✅ Custom syntax blocks activated.'));
    } else {
      console.log(chalk.yellow('ℹ️ No language blocks found.'));
    }
  } else {
    console.error(chalk.red('❌ Invalid mode.'));
  }
  break;

    case 'watch':
      const watchTarget = args[1];
      if (!watchTarget) {
        console.error(chalk.red('❌ Usage: clj watch <mode>'));
        process.exit(1);
      }
      if (['client', 'server', 'server-side'].includes(watchTarget)) {
        console.log(chalk.cyan(`👀 Watching for changes in ${watchTarget} mode...`));
        await compileProject(watchTarget);
        startHotReload(watchTarget);
        startServer(watchTarget);
      } else {
        console.error(chalk.red('❌ Invalid watch mode.'));
      }
      break;

    case 'dev':
      const devTarget = args[1] || 'client';
      if (['client', 'server', 'server-side'].includes(devTarget)) {
        console.log(chalk.cyan(`💻 Development mode: ${devTarget} with hot reload`));
        await compileProject(devTarget);
        startHotReload(devTarget);
        startServer(devTarget);
      } else {
        console.error(chalk.red('❌ Invalid mode.'));
      }
      break;

    case 'new':
      const projectName = args[1];
      if (!projectName) {
        console.error(chalk.red('❌ Usage: clj new <project-name>'));
        process.exit(1);
      }
      const projectPath = path.join(process.cwd(), projectName);
      if (fs.existsSync(projectPath)) {
        console.error(chalk.red(`❌ Directory ${projectName} already exists.`));
        process.exit(1);
      }
      fs.mkdirSync(projectPath, { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'api'), { recursive: true });
      
      const appJsx = `import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to ClientLite!</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}
const root = createRoot(document.getElementById('root'));
root.render(<App />);`;
      fs.writeFileSync(path.join(projectPath, 'src', 'App.jsx'), appJsx);
      
      const indexHtml = `<!DOCTYPE html>
<html>
<head><title>${projectName}</title><meta charset="UTF-8"></head>
<body><div id="root"></div><script src="/bundle.js"></script></body>
</html>`;
      fs.writeFileSync(path.join(projectPath, 'src', 'index.html'), indexHtml);
      
      const packageJson = {
        name: projectName,
        version: "1.0.0",
        type: "module",
        scripts: { dev: "clj dev", build: "clj build client", start: "clj run client" }
      };
      fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
      
      console.log(chalk.green(`✅ Created new ClientLite project: ${projectName}`));
      console.log(chalk.cyan(`  cd ${projectName} && npm install clientlitejsx && npx clj dev`));
      break;

    case 'package':
      const packageAction = args[1];
      
      if (packageAction === 'init') {
        const packageName = args[2];
        if (!packageName) {
          console.error(chalk.red('❌ Usage: clj package init <package-name>'));
          process.exit(1);
        }
        const packageDir = path.join(process.cwd(), 'clj-packages', packageName);
        if (fs.existsSync(packageDir)) {
          console.error(chalk.red(`❌ Package ${packageName} already exists`));
          process.exit(1);
        }
        fs.mkdirSync(packageDir, { recursive: true });
        fs.mkdirSync(path.join(packageDir, 'src'), { recursive: true });
        fs.mkdirSync(path.join(packageDir, 'dist'), { recursive: true });
        
        const cljJson = {
          name: packageName,
          version: "1.0.0",
          type: "hybrid",
          author: "Unknown",
          description: "A CLJ package",
          main: "src/index.js"
        };
        fs.writeFileSync(path.join(packageDir, 'clj.json'), JSON.stringify(cljJson, null, 2));
        
        const indexJs = `// CLJ Package: ${packageName}
export const frontend = {
  greet: (name) => \`Hello \${name} from frontend\`,
  setStorage: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  getStorage: (key) => JSON.parse(localStorage.getItem(key))
};
export const backend = {
  greet: (name) => \`Hello \${name} from backend\`,
  storage: new Map(),
  setStorage: (key, val) => { backend.storage.set(key, val); return true; },
  getStorage: (key) => backend.storage.get(key),
  processData: (data) => ({ processed: true, result: data, timestamp: new Date().toISOString() })
};
export default { frontend, backend };`;
        fs.writeFileSync(path.join(packageDir, 'src', 'index.js'), indexJs);
        
        const packageJsonPkg = {
          name: `@clj/${packageName}`,
          version: "1.0.0",
          type: "module",
          main: "src/index.js"
        };
        fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify(packageJsonPkg, null, 2));
        
        console.log(chalk.green(`✅ Created CLJ package: ${packageName}`));
        console.log(chalk.cyan(`  cd ${packageDir} && clj package build`));
      } 
      else if (packageAction === 'build') {
        const packageDir = process.cwd();
        const cljJsonPath = path.join(packageDir, 'clj.json');
        if (!fs.existsSync(cljJsonPath)) {
          console.error(chalk.red('❌ No clj.json found. Run "clj package init" first.'));
          process.exit(1);
        }
        const cljJson = JSON.parse(fs.readFileSync(cljJsonPath, 'utf8'));
        console.log(chalk.cyan(`🔨 Building package: ${cljJson.name}`));
        const entryFile = path.join(packageDir, 'src', 'index.js');
        const outDir = path.join(packageDir, 'dist');
        if (!fs.existsSync(entryFile)) {
          console.error(chalk.red(`❌ Entry file not found: ${entryFile}`));
          process.exit(1);
        }
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        
        await esbuild.build({
          entryPoints: [entryFile],
          bundle: true,
          outfile: path.join(outDir, 'frontend.js'),
          platform: 'browser',
          format: 'iife',
          globalName: `CLJPkg_${cljJson.name.replace(/-/g, '_')}`,
          minify: true,
          sourcemap: true
        });
        
        await esbuild.build({
          entryPoints: [entryFile],
          bundle: true,
          outfile: path.join(outDir, 'backend.cjs'),
          platform: 'node',
          format: 'cjs',
          target: 'node16',
          minify: true,
          sourcemap: true
        });
        
        console.log(chalk.green(`✅ Built package: ${cljJson.name}`));
        console.log(chalk.white(`   Frontend: ${outDir}/frontend.js`));
        console.log(chalk.white(`   Backend:  ${outDir}/backend.cjs`));
      }
      else if (packageAction === 'publish') {
        const packageDir = process.cwd();
        const cljJsonPath = path.join(packageDir, 'clj.json');
        if (!fs.existsSync(cljJsonPath)) {
          console.error(chalk.red('❌ No clj.json found.'));
          process.exit(1);
        }
        const cljJson = JSON.parse(fs.readFileSync(cljJsonPath, 'utf8'));
        const frontendPath = path.join(packageDir, 'dist', 'frontend.js');
        const backendPath = path.join(packageDir, 'dist', 'backend.cjs');
        if (!fs.existsSync(frontendPath) || !fs.existsSync(backendPath)) {
          console.error(chalk.red('❌ Run "clj package build" first.'));
          process.exit(1);
        }
        
        const isGlobal = args.includes('--global') || args.includes('-g');
        
        const registryDir = path.join(process.cwd(), '.clj-registry');
        if (!fs.existsSync(registryDir)) fs.mkdirSync(registryDir, { recursive: true });
        const pkgDir = path.join(registryDir, cljJson.name);
        if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true });
        fs.copyFileSync(frontendPath, path.join(pkgDir, 'frontend.js'));
        fs.copyFileSync(backendPath, path.join(pkgDir, 'backend.cjs'));
        fs.copyFileSync(cljJsonPath, path.join(pkgDir, 'clj.json'));
        
        console.log(chalk.green(`✅ Published package: ${cljJson.name} to local registry`));
        console.log(chalk.cyan(`   Location: ${pkgDir}`));
        
        if (isGlobal) {
          console.log(chalk.cyan(`📦 Publishing to npm registry...`));
          try {
            const tempDir = path.join(process.cwd(), '.tmp-npm-publish');
            if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
            fs.mkdirSync(tempDir, { recursive: true });
            
            fs.copyFileSync(frontendPath, path.join(tempDir, 'frontend.js'));
            fs.copyFileSync(backendPath, path.join(tempDir, 'backend.cjs'));
            
            const npmPackageJson = {
              name: `${cljJson.name}`,
              version: cljJson.version,
              description: cljJson.description || "A CLJ package",
              main: "frontend.js",
              exports: {
                ".": {
                  "import": "./frontend.js",
                  "require": "./backend.cjs"
                }
              },
              files: ["frontend.js", "backend.cjs"],
              clj: {
                type: cljJson.type || "hybrid",
                backend: "backend.cjs",
                frontend: "frontend.js"
              },
              author: cljJson.author,
              license: "MIT",
              publishConfig: { access: "public" },
              keywords: ["clj", "clientlite", cljJson.name]
            };
            
            fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(npmPackageJson, null, 2));
            fs.copyFileSync(cljJsonPath, path.join(tempDir, 'clj.json'));
            
            console.log(chalk.white(`   Publishing ${cljJson.name}@${cljJson.version} to npm...`));
            execSync('npm publish --access public', { cwd: tempDir, stdio: 'inherit', encoding: 'utf8' });
            
            fs.rmSync(tempDir, { recursive: true, force: true });
            
            console.log(chalk.green(`✅ Published to npm: ${cljJson.name}@${cljJson.version}`));
            console.log(chalk.cyan(`   Install with: npm install -g ${cljJson.name}`));
          } catch (err) {
            console.error(chalk.red(`❌ Failed to publish to npm: ${err.message}`));
            console.log(chalk.yellow(`   Make sure you're logged into npm: npm login`));
          }
        } else {
          console.log(chalk.yellow(`💡 Tip: Use "clj package publish --global" to publish to npm registry`));
        }
      }
      else if (packageAction === 'install') {
        const packageName = args[2];
        const isGlobal = args.includes('--global') || args.includes('-g');

        if (!packageName) {
          console.error(chalk.red('❌ Usage: clj package install <package-name> [--global]'));
          process.exit(1);
        }

        const registryDir = path.join(process.cwd(), '.clj-registry');
        const pkgDir = path.join(registryDir, packageName);
        if (!fs.existsSync(pkgDir)) {
          console.error(chalk.red(`❌ Package ${packageName} not found in local registry`));
          process.exit(1);
        }

        let targetDir;
        if (isGlobal) {
          const npmPrefix = execSync('npm prefix -g', { encoding: 'utf8' }).trim();
          targetDir = path.join(npmPrefix, 'node_modules');
          console.log(chalk.cyan(`🌍 Installing globally to: ${targetDir}`));
        } else {
          targetDir = path.join(process.cwd(), 'node_modules');
          console.log(chalk.cyan(`📁 Installing locally to: ${targetDir}`));
        }
        
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        
        const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'clj.json'), 'utf8'));
        const installDir = path.join(targetDir, packageName);
        if (!fs.existsSync(installDir)) fs.mkdirSync(installDir, { recursive: true });
        
        fs.copyFileSync(path.join(pkgDir, 'frontend.js'), path.join(installDir, 'frontend.js'));
        fs.copyFileSync(path.join(pkgDir, 'backend.cjs'), path.join(installDir, 'backend.cjs'));
        fs.writeFileSync(path.join(installDir, 'package.json'), JSON.stringify({ 
          name: `${packageName}`, 
          version: pkgJson.version,
          type: "module",
          main: "frontend.js",
          clj: { backend: "backend.cjs", frontend: "frontend.js" }
        }, null, 2));
        
        console.log(chalk.green(`✅ Installed package: ${packageName}@${pkgJson.version}`));
      }
      else if (packageAction === 'uninstall') {
        const packageName = args[2];
        const isGlobal = args.includes('--global') || args.includes('-g');
        
        if (!packageName) {
          console.error(chalk.red('❌ Usage: clj package uninstall <package-name> [--global]'));
          process.exit(1);
        }
        
        let targetDir;
        if (isGlobal) {
          const npmPrefix = execSync('npm prefix -g', { encoding: 'utf8' }).trim();
          targetDir = path.join(npmPrefix, 'node_modules', packageName);
        } else {
          targetDir = path.join(process.cwd(), 'node_modules', packageName);
        }
        
        if (!fs.existsSync(targetDir)) {
          console.error(chalk.red(`❌ Package ${packageName} not installed`));
          process.exit(1);
        }
        
        fs.rmSync(targetDir, { recursive: true, force: true });
        console.log(chalk.green(`✅ Uninstalled package: ${packageName}`));
      }
      else if (packageAction === 'list') {
        const isGlobal = args.includes('--global') || args.includes('-g');
        
        let targetDir;
        if (isGlobal) {
          const npmPrefix = execSync('npm prefix -g', { encoding: 'utf8' }).trim();
          targetDir = path.join(npmPrefix, 'node_modules');
          console.log(chalk.cyan(`🌍 Global packages:`));
        } else {
          targetDir = path.join(process.cwd(), 'node_modules');
          console.log(chalk.cyan(`📁 Local packages:`));
        }
        
        if (!fs.existsSync(targetDir)) {
          console.log(chalk.yellow('No CLJ packages installed'));
          return;
        }
        
        const packages = fs.readdirSync(targetDir);
        const cljPackages = packages.filter(p => {
          const pkgJsonPath = path.join(targetDir, p, 'package.json');
          if (fs.existsSync(pkgJsonPath)) {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            return pkgJson.clj;
          }
          return false;
        });
        
        if (cljPackages.length === 0) {
          console.log(chalk.yellow('No CLJ packages installed'));
        } else {
          for (const pkg of cljPackages) {
            const pkgJsonPath = path.join(targetDir, pkg, 'package.json');
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            console.log(chalk.white(`   ${chalk.green('✓')} ${pkg}@${pkgJson.version}`));
          }
        }
      }
      else {
        console.error(chalk.red('❌ Unknown package action. Use: init, build, publish, install, uninstall, list'));
      }
      break;

    case 'server':
      const serverAction = args[1];
      
      if (serverAction === 'register') {
        const serverName = args[2];
        const endpoint = args[3];
        if (!serverName || !endpoint) {
          console.error(chalk.red('❌ Usage: clj server register <name> <endpoint>'));
          process.exit(1);
        }
        const regData = {
          id: crypto.randomUUID(),
          name: serverName,
          endpoint: endpoint,
          packages: [],
          status: 'active',
          registered_at: new Date().toISOString()
        };
        const regPath = path.join(process.cwd(), '.clj-servers.json');
        let servers = [];
        if (fs.existsSync(regPath)) servers = JSON.parse(fs.readFileSync(regPath, 'utf8'));
        servers.push(regData);
        fs.writeFileSync(regPath, JSON.stringify(servers, null, 2));
        console.log(chalk.green(`✅ Registered server: ${serverName} at ${endpoint}`));
      }
      else if (serverAction === 'start') {
  // Parse host and port arguments
  const host = args.find(a => a.startsWith('--host='))?.split('=')[1] || 'localhost';
  const port = parseInt(args.find(a => a.startsWith('--port='))?.split('=')[1] || '6002');
  const useTunnel = args.includes('--tunnel') || args.includes('-t');
  
  console.log(chalk.cyan(`🚀 Starting CLJ backend server on ${host}:${port}...`));
  const app = express();
  app.use(express.json());
  
  // Enable CORS for public access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  const loadedPackages = [];
  
  // 1. Load from local clj-packages (development)
  const localPackagesDir = path.join(process.cwd(), 'clj-packages');
  if (fs.existsSync(localPackagesDir)) {
    const packages = fs.readdirSync(localPackagesDir);
    for (const pkg of packages) {
      const backendPath = path.join(localPackagesDir, pkg, 'dist', 'backend.cjs');
      if (fs.existsSync(backendPath)) {
        const mod = require(backendPath);
        const handler = mod.default?.backend || mod.backend || mod;
        const routePath = `/api/${pkg}`;
        app.post(`${routePath}/*`, async (req, res) => {
          try {
            const result = typeof handler === 'function' ? await handler(req.body) : handler;
            res.json({ success: true, data: result, package: pkg });
          } catch (err) {
            res.status(500).json({ success: false, error: err.message });
          }
        });
        app.get(routePath, (req, res) => {
          res.json({ 
            name: pkg, 
            version: mod.version || '1.0.0',
            status: 'running',
            endpoints: [`POST ${routePath}/*`]
          });
        });
        loadedPackages.push({ name: pkg, source: 'local', route: routePath });
        console.log(chalk.green(`📦 Loaded local package: ${pkg} → ${routePath}`));
      }
    }
  }
  
  // 2. Load from globally installed npm packages
  try {
    const npmPrefix = execSync('npm prefix -g', { encoding: 'utf8' }).trim();
    const globalPackagesDir = path.join(npmPrefix, 'node_modules');
    if (fs.existsSync(globalPackagesDir)) {
      const packages = fs.readdirSync(globalPackagesDir);
      for (const pkg of packages) {
        const pkgJsonPath = path.join(globalPackagesDir, pkg, 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
          const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
          if (pkgJson.clj) {
            const backendPath = path.join(globalPackagesDir, pkg, 'backend.cjs');
            if (fs.existsSync(backendPath)) {
              const mod = require(backendPath);
              const handler = mod.default?.backend || mod.backend || mod;
              const routePath = `/api/${pkg}`;
              app.post(`${routePath}/*`, async (req, res) => {
                try {
                  const result = typeof handler === 'function' ? await handler(req.body) : handler;
                  res.json({ success: true, data: result, package: pkg });
                } catch (err) {
                  res.status(500).json({ success: false, error: err.message });
                }
              });
              app.get(routePath, (req, res) => {
                res.json({ 
                  name: pkg, 
                  version: pkgJson.version,
                  status: 'running',
                  endpoints: [`POST ${routePath}/*`]
                });
              });
              loadedPackages.push({ name: pkg, source: 'global', route: routePath });
              console.log(chalk.green(`📦 Loaded global package: ${pkg} → ${routePath}`));
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(chalk.yellow(`⚠️ Could not load global packages: ${err.message}`));
  }
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'CLJ Backend Server',
      version: '1.0.0',
      status: 'running',
      host: host,
      port: port,
      packages: loadedPackages.map(p => ({
        name: p.name,
        source: p.source,
        endpoint: p.route,
        methods: ['POST']
      }))
    });
  });
  
  // Start server
  const server = app.listen(port, host, () => {
    console.log(chalk.green(`✅ CLJ backend server running on ${host}:${port}`));
    console.log(chalk.cyan(`   Root: http://${host}:${port}/`));
    console.log(chalk.white(`   API endpoint: http://${host}:${port}/api/<package-name>`));
    console.log(chalk.yellow(`\n📦 Loaded ${loadedPackages.length} package(s):`));
    loadedPackages.forEach(p => {
      console.log(chalk.white(`   → ${p.name} (${p.source})`));
    });
    
    // Start localtunnel if requested
    if (useTunnel) {
      console.log(chalk.cyan(`\n🔗 Creating public tunnel with localtunnel...`));
      try {
        const localtunnel = require('localtunnel');
        (async () => {
          const tunnel = await localtunnel({ port: port, subdomain: `clj-${Date.now()}` });
          console.log(chalk.green(`✅ Public tunnel created!`));
          console.log(chalk.magenta(`   🌍 Public URL: ${tunnel.url}`));
          console.log(chalk.white(`   Share this URL with anyone to access your API`));
          console.log(chalk.yellow(`   POST ${tunnel.url}/api/<package-name>`));
          
          tunnel.on('close', () => {
            console.log(chalk.yellow(`🔌 Tunnel closed`));
          });
        })().catch(err => {
          console.error(chalk.red(`❌ Failed to create tunnel: ${err.message}`));
          console.log(chalk.yellow(`   Try installing localtunnel: npm install -g localtunnel`));
        });
      } catch (err) {
        console.error(chalk.red(`❌ localtunnel not available. Install it: npm install -g localtunnel`));
      }
    }
  });
}

case 'EMN':
  const emnAction = args[1];
  
  if (emnAction === 'export') {
    const exportType = args[2] || '--default';
    
    if (exportType === '--default') {
      console.log(chalk.magenta('\n🌐 CLJ NETLIFY EXPORT ENGINE'));
      console.log(chalk.gray('   Loading: lib/EMN.js\n'));
      
      try {
        const emnPath = path.join(__dirname, '..', 'lib', 'EMN.js');
        await import('file:///' + emnPath.replace(/\\/g, '/'));
      } catch (err) {
        console.error(chalk.red(`❌ Failed to run EMN export: ${err.message}`));
        process.exit(1);
      }
    } else {
      console.error(chalk.red('❌ Usage: clj EMN export --default'));
    }
  } else {
    console.error(chalk.red('❌ Usage: clj EMN export --default'));
  }
  break;

case 'emulate':
  const emulateFile = args[1];
  
  if (!emulateFile) {
    console.error(chalk.red('❌ Usage: clj emulate <file>'));
    console.log(chalk.yellow('   Example: clj emulate windows8.img'));
    process.exit(1);
  }
  
  console.log(chalk.magenta('\n🖥️ CLJ EMULATION ENGINE'));
  console.log(chalk.gray(`   Loading: lib/emulator.js with ${emulateFile}\n`));
  
  try {
    const emulatorPath = path.join(__dirname, '..', 'lib', 'emulator.js');
    process.env.CLJ_EMULATE_FILE = emulateFile;
    await import('file:///' + emulatorPath.replace(/\\/g, '/'));
  } catch (err) {
    console.error(chalk.red(`❌ Failed to start emulator: ${err.message}`));
    process.exit(1);
  }
  break;


      break;

    case 'version':
    case '-v':
    case '--version':
      const pkgJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      console.log(chalk.green(`ClientLite CLI version: ${pkgJson.version}`));
      break;

    case 'help':
    case '-h':
    case '--help':
      console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                    CLIENTLITE FRAMEWORK                      ║
║                    Production Ready CLI                      ║
╚══════════════════════════════════════════════════════════════╝

${chalk.yellow('COMMANDS:')}
  init                          Create CLJ.Config file
  new <name>                    Create a new ClientLite project
  build <mode>                  Build for production (client/server/server-side)
  run <mode> [--hot]            Compile and run server
  watch <mode>                  Watch for changes and auto-recompile
  dev [mode]                    Development mode with hot reload
  gen New L <name>              Generate custom language block
  gen New API <name>            Generate new API endpoint
  package init <name>           Create a new CLJ package
  package build                 Build a CLJ package (frontend+backend)
  package publish               Publish CLJ package to local registry
  package install <name>        Install CLJ package locally
  package install <name> --global Install CLJ package globally
  package uninstall <name>      Uninstall CLJ package
  package list                  List installed CLJ packages
  server register <name> <url>  Register a backend server
  server start                  Start CLJ backend server (public with --host=0.0.0.0)
  version, -v                   Show CLI version
  help, -h                      Show this help


${chalk.yellow('EXAMPLES:')}
  clj new my-app
  clj dev
  clj run client --hot
  clj build client
  clj gen New API users
  clj package init my-package
  cd clj-packages/my-package && clj package build
  clj package publish --global
  clj package install my-package --global
  clj package list
  clj server start --host=0.0.0.0 --port=80
  clj server register my-server http://192.168.1.100:6002

${chalk.yellow('EMULATION:')}
  EMN export --default          Export Multi-OS Netlify config (uses lib/EMN.js)
  emulate <file>                Start emulation with specified image (uses lib/emulator.js)

${chalk.yellow('EMULATION EXAMPLES:')}
  clj EMN export --default
  clj emulate windows8.img
  clj emulate kolibri.img


`));


      break;

    default:
      console.log(chalk.red(`\n❌ Unknown command: ${command}\nRun 'clj help' for available commands.`));
      process.exit(1);
  }
}

main().catch(err => {
  console.error(chalk.red(`❌ Fatal error: ${err.message}`));
  console.error(chalk.red(err.stack));
  process.exit(1);
});
