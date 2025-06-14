const express = require("express");
const router = express.Router();
const db = require("../db/database");
const dayjs = require("dayjs");
const { generateRecurringDates } = require("../utils/recurrence");
const { Parser } = require("json2csv");

router.get("/", (req, res) => {
  const { month, year } = req.query;
  if (!month || !year)
    return res.status(400).json({ error: "month and year are required" });

  db.all("SELECT * FROM accounts", (err, accounts) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT * FROM entries", (err2, entries) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const result = [];

      accounts.forEach((account) => {
        const balanceByDay = {};
        const alerts = [];
        const firstDay = dayjs(`${year}-${month}-01`);
        const lastDay = firstDay.endOf("month");

        let runningBalance = account.initialBalance;
        for (
          let d = firstDay;
          d.isBefore(lastDay) || d.isSame(lastDay);
          d = d.add(1, "day")
        ) {
          balanceByDay[d.format("YYYY-MM-DD")] = runningBalance;
        }

        const relevantEntries = entries.filter(
          (e) => e.accountId === account.id
        );
        relevantEntries.forEach((entry) => {
          if (entry.isRecurring) {
            const dates = generateRecurringDates(entry, month, year);
            dates.forEach((date) => {
              runningBalance +=
                entry.type === "expense" || entry.type === "fee"
                  ? -entry.amount
                  : entry.amount;
              balanceByDay[date] = runningBalance;
              if (balanceByDay[date] < 0)
                alerts.push({ date, balance: balanceByDay[date] });
            });
          } else {
            const date = entry.startDate;
            const matchMonth = dayjs(date).month() + 1 === parseInt(month);
            const matchYear = dayjs(date).year() === parseInt(year);
            if (matchMonth && matchYear) {
              runningBalance +=
                entry.type === "expense" || entry.type === "fee"
                  ? -entry.amount
                  : entry.amount;
              balanceByDay[date] = runningBalance;
              if (balanceByDay[date] < 0)
                alerts.push({ date, balance: balanceByDay[date] });
            }
          }
        });

        result.push({
          account: account.name,
          dailyBalances: balanceByDay,
          endOfMonthBalance: balanceByDay[lastDay.format("YYYY-MM-DD")],
          alerts,
        });
      });

      res.json(result);
    });
  });
});

router.get("/export", (req, res) => {
  const { month, year } = req.query;
  if (!month || !year)
    return res.status(400).json({ error: "month and year required" });

  db.all("SELECT * FROM accounts", (err, accounts) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT * FROM entries", (err2, entries) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const rows = [];

      accounts.forEach((account) => {
        const balanceByDay = {};
        let runningBalance = account.initialBalance;
        const firstDay = dayjs(`${year}-${month}-01`);
        const lastDay = firstDay.endOf("month");

        for (
          let d = firstDay;
          d.isBefore(lastDay) || d.isSame(lastDay);
          d = d.add(1, "day")
        ) {
          balanceByDay[d.format("YYYY-MM-DD")] = runningBalance;
        }

        const relevantEntries = entries.filter(
          (e) => e.accountId === account.id
        );
        relevantEntries.forEach((entry) => {
          if (entry.isRecurring) {
            const dates = generateRecurringDates(entry, month, year);
            dates.forEach((date) => {
              runningBalance +=
                entry.type === "expense" || entry.type === "fee"
                  ? -entry.amount
                  : entry.amount;
              balanceByDay[date] = runningBalance;
            });
          } else {
            const date = entry.startDate;
            const matchMonth = dayjs(date).month() + 1 === parseInt(month);
            const matchYear = dayjs(date).year() === parseInt(year);
            if (matchMonth && matchYear) {
              runningBalance +=
                entry.type === "expense" || entry.type === "fee"
                  ? -entry.amount
                  : entry.amount;
              balanceByDay[date] = runningBalance;
            }
          }
        });

        Object.keys(balanceByDay).forEach((date) => {
          rows.push({
            account: account.name,
            date,
            balance: balanceByDay[date],
          });
        });
      });

      const parser = new Parser({ fields: ["account", "date", "balance"] });
      const csv = parser.parse(rows);

      res.header("Content-Type", "text/csv");
      res.attachment(`projection-${month}-${year}.csv`);
      res.send(csv);
    });
  });
});

module.exports = router;
