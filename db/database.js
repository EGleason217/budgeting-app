const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./budget.db");

db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    accountId INTEGER,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    startDate TEXT NOT NULL,
    endDate TEXT,
    recurrence TEXT,
    isRecurring INTEGER DEFAULT 1,
    FOREIGN KEY(accountId) REFERENCES accounts(id)
  )
`);
  db.run(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    initialBalance REAL NOT NULL
  )
`);
});

module.exports = db;
