const express = require("express");
const router = express.Router();
const db = require("../db/database");

// POST new entry (recurring or one-time)
router.post("/", (req, res) => {
  const {
    accountId,
    type,
    amount,
    description,
    startDate,
    endDate,
    recurrence,
    isRecurring = true,
  } = req.body;

  if (!accountId || !type || !amount || !startDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const stmt = db.prepare(`
    INSERT INTO entries (accountId, type, amount, description, startDate, endDate, recurrence, isRecurring)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    accountId,
    type,
    amount,
    description,
    startDate,
    endDate,
    recurrence,
    isRecurring ? 1 : 0,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        id: this.lastID,
        accountId,
        type,
        amount,
        description,
        startDate,
        endDate,
        recurrence,
        isRecurring,
      });
    }
  );
});

// GET all entries
router.get("/", (req, res) => {
  db.all("SELECT * FROM entries", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
