import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
const { virtualCDN } = require('./virtualCDN');  // ← ADD THIS LINE
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 6001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Database setup
const db = new sqlite3.Database('./clj_packages.db');

db.run(`
  CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    version TEXT,
    author TEXT,
    description TEXT,
    type TEXT,
    download_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT,
    endpoint TEXT,
    packages TEXT,
    status TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API Endpoints
app.get('/api/packages', (req, res) => {
  db.all('SELECT * FROM packages ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/packages/:name', (req, res) => {
  db.get('SELECT * FROM packages WHERE name = ?', [req.params.name], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Package not found' });
    res.json(row);
  });
});

app.post('/api/packages/register', (req, res) => {
  const { id, name, version, author, description, type, download_url } = req.body;
  db.run(
    'INSERT INTO packages (id, name, version, author, description, type, download_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, version, author, description, type, download_url],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.post('/api/servers/register', (req, res) => {
  const { id, name, endpoint, packages, status } = req.body;
  db.run(
    'INSERT INTO servers (id, name, endpoint, packages, status) VALUES (?, ?, ?, ?, ?)',
    [id, name, endpoint, JSON.stringify(packages), status],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.get('/api/servers', (req, res) => {
  db.all('SELECT * FROM servers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`🔧 CLJ Registry Server running on http://localhost:${PORT}`);
});