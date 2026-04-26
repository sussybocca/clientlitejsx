const express = require('express');
const path = require('path');
const http = require('http');
const localtunnel = require('localtunnel');
const { loadApiRoutes } = require('./apiRouter');
const { enforceMemoryLimit } = require('./config');
const { setupHMRServer } = require('./compiler');
const fs = require('fs');
const fetch = require('node-fetch');

function startServer(mode) {
  const yaml = require('js-yaml');
  let config = { serverSide: { memoryLimitMB: 256, publicTunnel: true, netlifyExport: true } };
  const configPath = path.join(process.cwd(), 'CLJ.Config');
  if (fs.existsSync(configPath)) {
    config = yaml.load(fs.readFileSync(configPath, 'utf8'));
  }
  if (config.serverSide && config.serverSide.memoryLimitMB) {
    enforceMemoryLimit(config.serverSide.memoryLimitMB);
  }

  const app = express();
  const server = http.createServer(app);
  
  // Setup HMR WebSocket server (this handles all WebSocket connections)
  const hmrServer = setupHMRServer(server);
  
  const distDir = path.join(process.cwd(), 'dist', mode);
  const apiDir = path.join(process.cwd(), 'api');

  app.use(express.static(distDir));
  app.use(express.json());

  const apiRouter = loadApiRoutes(apiDir);
  app.use('/api', apiRouter);

  // Serve index.html or index.jsx for root route
  app.get('/', (req, res) => {
    const indexPath = path.join(distDir, 'index.html');
    const indexJsxPath = path.join(distDir, 'index.jsx');
    const appJsPath = path.join(distDir, 'App.js');
    const mainJsPath = path.join(distDir, 'main.js');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else if (fs.existsSync(indexJsxPath)) {
      const jsxContent = fs.readFileSync(indexJsxPath, 'utf8');
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ClientLite App</title>
          <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${jsxContent}
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          </script>
        </body>
        </html>
      `);
    } else if (fs.existsSync(appJsPath)) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ClientLite App</title>
        </head>
        <body>
          <div id="root"></div>
          <script src="/App.js"></script>
        </body>
        </html>
      `);
    } else if (fs.existsSync(mainJsPath)) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ClientLite App</title>
        </head>
        <body>
          <div id="root"></div>
          <script src="/main.js"></script>
        </body>
        </html>
      `);
    } else {
      const files = fs.readdirSync(distDir);
      const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
      if (jsFiles.length > 0) {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ClientLite App</title>
          </head>
          <body>
            <div id="root"></div>
            <script src="/${jsFiles[0]}"></script>
          </body>
          </html>
        `);
      } else {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ClientLite App</title>
          </head>
          <body>
            <div id="root"></div>
            <h1>ClientLite Running</h1>
            <p>Create src/App.jsx and run 'npx clj run ${mode}'</p>
          </body>
          </html>
        `);
      }
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, async () => {
    console.log(`🚀 ClientLite ${mode} mode running on http://localhost:${PORT}`);
    if (mode === 'server-side' && config.serverSide.publicTunnel) {
      const tunnel = await localtunnel({ port: PORT });
      console.log(`🌍 Public tunnel URL: ${tunnel.url}`);
      if (config.serverSide.netlifyExport) {
        const netlifyToml = path.join(process.cwd(), 'netlify.toml');
        const netlifyFuncs = path.join(process.cwd(), 'netlify', 'functions');
        if (!fs.existsSync(netlifyFuncs)) fs.mkdirSync(netlifyFuncs, { recursive: true });
        const proxyFunc = path.join(netlifyFuncs, 'api.js');
        const proxyCode = `
const fetch = require('node-fetch');
exports.handler = async (event) => {
  const targetUrl = '${tunnel.url}/api' + event.path;
  const response = await fetch(targetUrl, {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body
  });
  const body = await response.text();
  return {
    statusCode: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
    body
  };
};
`;
        fs.writeFileSync(proxyFunc, proxyCode);
        if (!fs.existsSync(netlifyToml)) {
          fs.copyFileSync(path.join(__dirname, '..', 'templates', 'netlify.toml'), netlifyToml);
        }
        console.log(`📄 Netlify functions ready. Deploy with "netlify deploy --prod"`);
      }
    }
  });
}

module.exports = { startServer };