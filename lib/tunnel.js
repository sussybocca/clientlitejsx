const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

async function createTunnel(port) {
  const tunnel = await localtunnel({ port });
  return tunnel;
}

function exportToNetlify(tunnelUrl) {
  const netlifyFuncsDir = path.join(process.cwd(), 'netlify', 'functions');
  if (!fs.existsSync(netlifyFuncsDir)) fs.mkdirSync(netlifyFuncsDir, { recursive: true });
  const funcCode = `
const fetch = require('node-fetch');
exports.handler = async (event) => {
  const targetUrl = '${tunnelUrl}/api' + event.path;
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
  fs.writeFileSync(path.join(netlifyFuncsDir, 'api.js'), funcCode);
  console.log(`✅ Netlify function written to netlify/functions/api.js`);
}

module.exports = { createTunnel, exportToNetlify };