const fs = require('fs');
const path = require('path');
const express = require('express');

function loadApiRoutes(apiDir) {
  const router = express.Router();
  if (!fs.existsSync(apiDir)) return router;

  const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const routePath = '/' + file.replace(/\.js$/, '');
    const fullPath = path.join(apiDir, file);
    // Clear require cache for hot reload in production? We'll not for stability.
    const handler = require(fullPath);
    if (typeof handler === 'function') {
      router.all(routePath, (req, res) => handler(req, res));
    } else if (typeof handler === 'object') {
      if (handler.get) router.get(routePath, handler.get);
      if (handler.post) router.post(routePath, handler.post);
      if (handler.put) router.put(routePath, handler.put);
      if (handler.delete) router.delete(routePath, handler.delete);
    }
  }
  return router;
}

module.exports = { loadApiRoutes };