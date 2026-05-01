// ============================================
// CLIENTLITE BETA MODE - Package Manager & Publisher
// ============================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const crypto = require('crypto');
require('dotenv').config();

class ClientLiteBetaManager {
  constructor() {
    this.betaDir = path.join(process.cwd(), 'clientlite_beta');
    this.packagesDir = path.join(this.betaDir, 'packages');
    this.nodeModulesDir = path.join(this.betaDir, 'node_modules');
    this.registryFile = path.join(this.betaDir, 'registry.json');
    this.configFile = path.join(this.betaDir, 'beta.config.json');
    this.envFile = path.join(process.cwd(), '.env');
    
    this.officialRegistry = 'https://registry.npmjs.org';
    this.packageName = 'clientlitejsx';
  }
  
  // Generate unique version
  generateVersion(featureName, baseVersion = '1.0.0') {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[-:]/g, '').replace('T', '-').split('.')[0];
    const hash = crypto.createHash('md5').update(featureName + timestamp).digest('hex').substring(0, 6);
    return `${baseVersion}-beta.${featureName}.${timestamp}.${hash}`;
  }
  
  // Initialize beta mode
  async init(options = {}) {
    console.log(chalk.cyan('\n🚀 Initializing ClientLite Beta Mode...'));
    
    if (!fs.existsSync(this.betaDir)) {
      fs.mkdirSync(this.betaDir, { recursive: true });
      console.log(chalk.green(`✅ Created clientlite_beta directory`));
    }
    
    if (!fs.existsSync(this.packagesDir)) {
      fs.mkdirSync(this.packagesDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.nodeModulesDir)) {
      fs.mkdirSync(this.nodeModulesDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.registryFile)) {
      fs.writeFileSync(this.registryFile, JSON.stringify({
        packages: [],
        lastSync: null,
        version: '1.0.0'
      }, null, 2));
    }
    
    if (!fs.existsSync(this.configFile)) {
      fs.writeFileSync(this.configFile, JSON.stringify({
        name: options.name || 'my-beta-project',
        version: options.version || '1.0.0-beta.0',
        author: options.author || 'Unknown',
        description: options.description || 'ClientLite Beta Mode Project',
        license: 'MIT',
        clientlite: {
          beta: true,
          autoInstall: true,
          autoPush: false
        }
      }, null, 2));
    }
    
    if (!fs.existsSync(this.envFile)) {
      fs.writeFileSync(this.envFile, `# ClientLite Beta Mode - Secret Tokens
# NEVER commit this file to git!
CLIENTLITE_NPM_TOKEN=your_npm_token_here
`);
      console.log(chalk.yellow(`\n⚠️ Created .env template. Add your npm token there!`));
      console.log(chalk.white(`   File: ${this.envFile}`));
    }
    
    console.log(chalk.green(`\n✅ ClientLite Beta Mode ready`));
    console.log(chalk.cyan(`   Directory: ${this.betaDir}`));
    console.log(chalk.cyan(`   Package: ${this.packageName}`));
    
    return this;
  }
  
  // Get npm token from environment
  getNpmToken() {
    const token = process.env.CLIENTLITE_NPM_TOKEN;
    if (!token) {
      console.log(chalk.red(`\n❌ NPM token not found in .env file`));
      console.log(chalk.yellow(`   Add to ${this.envFile}:`));
      console.log(chalk.white(`   CLIENTLITE_NPM_TOKEN=your_token_here`));
      return null;
    }
    return token;
  }
  
  // Create a new beta package file
  async createBetaFile(filename, code, options = {}) {
    const jsPath = path.join(this.packagesDir, filename);
    
    const template = `// ClientLite Beta Feature: ${filename}
// Auto-generated at: ${new Date().toISOString()}
// Author: ${options.author || 'Unknown'}
// Version: ${options.version || '1.0.0-beta.0'}

${code}

// Export for npm package
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    ...(typeof exports !== 'undefined' ? exports : {})
  };
}
`;
    
    fs.writeFileSync(jsPath, template);
    console.log(chalk.green(`✅ Created beta feature: ${filename}`));
    console.log(chalk.cyan(`   Location: ${jsPath}`));
    
    if (options.dependencies && options.dependencies.length > 0) {
      await this.installDependencies(options.dependencies);
    }
    
    await this.registerLocalPackage(filename, options);
    
    return jsPath;
  }
  
  // Install npm dependencies into the beta feature
  async installDependencies(dependencies) {
    console.log(chalk.cyan(`\n📦 Installing ${dependencies.length} package(s) for beta feature...`));
    
    for (const dep of dependencies) {
      try {
        const depName = typeof dep === 'string' ? dep : dep.name;
        const depVersion = typeof dep === 'string' ? 'latest' : dep.version;
        
        console.log(chalk.white(`   Installing: ${depName}@${depVersion}`));
        
        execSync(`npm install ${depName}@${depVersion} --prefix ${this.betaDir}`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        console.log(chalk.green(`   ✅ Installed: ${depName}`));
      } catch(e) {
        console.log(chalk.red(`   ❌ Failed: ${dep}`));
      }
    }
    
    this.updatePackageJson(dependencies);
  }
  
  // Update package.json with dependencies
  updatePackageJson(dependencies) {
    const packageJsonPath = path.join(this.betaDir, 'package.json');
    let packageJson = {};
    
    if (fs.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } else {
      packageJson = {
        name: 'clientlite-beta-project',
        version: '1.0.0-beta.0',
        private: true,
        dependencies: {},
        devDependencies: {}
      };
    }
    
    for (const dep of dependencies) {
      const depName = typeof dep === 'string' ? dep : dep.name;
      const depVersion = typeof dep === 'string' ? 'latest' : dep.version;
      packageJson.dependencies[depName] = depVersion;
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  // Register local package
  async registerLocalPackage(filename, options) {
    const registry = JSON.parse(fs.readFileSync(this.registryFile, 'utf8'));
    const existingIndex = registry.packages.findIndex(p => p.filename === filename);
    
    const packageInfo = {
      filename: filename,
      name: options.name || filename.replace(/\.js$/, ''),
      version: options.version || '1.0.0-beta.0',
      author: options.author || 'Unknown',
      description: options.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dependencies: options.dependencies || [],
      exports: options.exports || []
    };
    
    if (existingIndex !== -1) {
      registry.packages[existingIndex] = packageInfo;
    } else {
      registry.packages.push(packageInfo);
    }
    
    registry.lastSync = new Date().toISOString();
    fs.writeFileSync(this.registryFile, JSON.stringify(registry, null, 2));
    
    console.log(chalk.green(`✅ Registered: ${packageInfo.name}`));
  }
  
  // Push beta feature to official clientlitejsx package
  async pushToOfficialRegistry(featureName, userVersion, options = {}) {
    // Generate unique version if not provided
    const version = userVersion || this.generateVersion(featureName);
    
    console.log(chalk.cyan(`\n📤 Publishing beta version of ${this.packageName}...`));
    console.log(chalk.white(`   Version: ${version}`));
    console.log(chalk.white(`   Feature: ${featureName}`));
    
    const token = this.getNpmToken();
    if (!token) return false;
    
    // Create temp directory for publishing
    const tempDir = path.join(process.cwd(), '.beta-publish-temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Get original package.json
    const originalPackageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    
    // Copy the beta feature file (this IS the package code)
    const sourceFile = path.join(this.packagesDir, `${featureName}.js`);
    
    if (!fs.existsSync(sourceFile)) {
      console.log(chalk.red(`❌ Beta feature file not found: ${featureName}.js`));
      console.log(chalk.yellow(`   Create it first with: clj beta create ${featureName}`));
      return false;
    }
    
    // The beta feature code becomes the main export for this beta version
    const featureCode = fs.readFileSync(sourceFile, 'utf8');
    
    // Create the main index.js for this beta version
    const mainJsContent = `// ClientLite Beta: ${featureName}
// Version: ${version}
// This is a beta preview of the ${featureName} feature

${featureCode}

// Also expose the main ClientLite API if available
try {
  const clientlite = require('./lib/index.js');
  module.exports = { ...module.exports, ...clientlite };
} catch(e) {
  // Main ClientLite not available in beta build
}

// Beta metadata
module.exports.__beta = {
  feature: '${featureName}',
  version: '${version}',
  publishedAt: '${new Date().toISOString()}'
};
`;
    
    fs.writeFileSync(path.join(tempDir, 'index.js'), mainJsContent);
    
    // Create package.json for beta version
    const betaPackageJson = {
      name: this.packageName,
      version: version,
      description: `${originalPackageJson.description} - Beta preview of '${featureName}' feature`,
      main: 'index.js',
      bin: originalPackageJson.bin,
      files: ['index.js', 'lib/**/*', 'bin/**/*', 'scripts/**/*', 'clientlite_beta/**/*'],
      keywords: [...(originalPackageJson.keywords || []), 'beta', featureName, 'preview'],
      author: originalPackageJson.author,
      license: originalPackageJson.license,
      dependencies: {},
      peerDependencies: originalPackageJson.peerDependencies || {},
      publishConfig: {
        access: 'public',
        registry: this.officialRegistry,
        tag: 'beta'
      }
    };
    
    // Add the beta feature's dependencies
    const betaPackageJsonPath = path.join(this.betaDir, 'package.json');
    if (fs.existsSync(betaPackageJsonPath)) {
      const betaDeps = JSON.parse(fs.readFileSync(betaPackageJsonPath, 'utf8'));
      betaPackageJson.dependencies = { ...betaPackageJson.dependencies, ...betaDeps.dependencies };
    }
    
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(betaPackageJson, null, 2));
    
    // Create README for beta version
    const readmeContent = `# ${this.packageName} - Beta Preview

## ${featureName} Feature (v${version})

This is a beta preview of the \`${featureName}\` feature for ${this.packageName}.

### Installation

\`\`\`bash
npm install ${this.packageName}@beta
\`\`\`

### Usage

\`\`\`javascript
const clientlite = require('${this.packageName}');

// Beta feature: ${featureName}
// Usage documentation will be available in the stable release
\`\`\`

### What's in this beta?

- Feature: **${featureName}**
- Version: ${version}
- Published: ${new Date().toISOString()}

### Feedback

Please report issues at: https://github.com/your-repo/issues

---

*This is an automated beta release - not for production use*
`;
    
    fs.writeFileSync(path.join(tempDir, 'README.md'), readmeContent);
    
    // Create .npmrc with token
    const npmrcPath = path.join(tempDir, '.npmrc');
    fs.writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${token}`);
    
    // Copy lib folder if exists (for compatibility with main package)
    const libSrc = path.join(process.cwd(), 'lib');
    const libDest = path.join(tempDir, 'lib');
    if (fs.existsSync(libSrc)) {
      fs.cpSync(libSrc, libDest, { recursive: true });
    }
    
    // Copy bin folder if exists
    const binSrc = path.join(process.cwd(), 'bin');
    const binDest = path.join(tempDir, 'bin');
    if (fs.existsSync(binSrc)) {
      fs.cpSync(binSrc, binDest, { recursive: true });
    }
    
    // Copy clientlite_beta folder
    const betaSrc = this.betaDir;
    const betaDest = path.join(tempDir, 'clientlite_beta');
    if (fs.existsSync(betaSrc)) {
      fs.cpSync(betaSrc, betaDest, { recursive: true });
    }
    
    // Publish
    try {
      execSync(`cd ${tempDir} && npm publish --tag beta --access public`, {
        stdio: 'inherit',
        encoding: 'utf8'
      });
      
      console.log(chalk.green(`\n✅ Published ${this.packageName}@${version}`));
      console.log(chalk.cyan(`   Install: npm install ${this.packageName}@beta`));
      console.log(chalk.cyan(`   Feature: ${featureName}`));
      console.log(chalk.cyan(`   Version: ${version}`));
      
      // Update registry with published version
      const registry = JSON.parse(fs.readFileSync(this.registryFile, 'utf8'));
      const existingIndex = registry.packages.findIndex(p => p.name === featureName);
      
      const featureInfo = {
        name: featureName,
        filename: `${featureName}.js`,
        version: version,
        author: options.author || 'Unknown',
        description: options.description || '',
        publishedAt: new Date().toISOString(),
        npmVersion: version,
        dependencies: Object.keys(betaPackageJson.dependencies || {})
      };
      
      if (existingIndex !== -1) {
        registry.packages[existingIndex] = featureInfo;
      } else {
        registry.packages.push(featureInfo);
      }
      
      registry.lastSync = new Date().toISOString();
      fs.writeFileSync(this.registryFile, JSON.stringify(registry, null, 2));
      
      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });
      return true;
      
    } catch(e) {
      console.log(chalk.red(`\n❌ Publish failed: ${e.message}`));
      fs.rmSync(tempDir, { recursive: true, force: true });
      return false;
    }
  }
  
  // List all beta features
  listPackages() {
    const registry = JSON.parse(fs.readFileSync(this.registryFile, 'utf8'));
    
    console.log(chalk.cyan(`\n📦 ClientLite Beta Features:\n`));
    
    if (registry.packages.length === 0) {
      console.log(chalk.yellow(`   No beta features found. Create one with:`));
      console.log(chalk.white(`   clj beta create my-feature`));
    } else {
      registry.packages.forEach(pkg => {
        console.log(chalk.green(`   ✓ ${pkg.name}`));
        console.log(chalk.white(`     Version: ${pkg.version || pkg.npmVersion || 'unknown'}`));
        console.log(chalk.white(`     File: ${pkg.filename}`));
        if (pkg.dependencies && pkg.dependencies.length > 0) {
          console.log(chalk.gray(`     Dependencies: ${pkg.dependencies.join(', ')}`));
        }
        if (pkg.publishedAt) {
          console.log(chalk.gray(`     Published: ${pkg.publishedAt}`));
        }
        console.log(``);
      });
    }
  }
}

module.exports = { ClientLiteBetaManager };