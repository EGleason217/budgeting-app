const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all accounts
router.get('/', (req, res) => {
  db.all('SELECT * FROM accounts', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST create account
router.post('/', (req, res) => {
  const { name, initialBalance } = req.body;
  if (!name || initialBalance == null) {
    return res.status(400).json({ error: 'Name and balance required' });
  }

  const stmt = db.prepare('INSERT INTO accounts (name, initialBalance) VALUES (?, ?)');
  stmt.run(name, initialBalance, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, initialBalance });
  });
});

module.exports = router; 
