const dayjs = require('dayjs');

function generateRecurringDates(entry, month, year) {
  const start = dayjs(entry.startDate);
  const end = entry.endDate ? dayjs(entry.endDate) : dayjs(`${year}-${month}-31`);
  const results = [];

  let current = start;

  while (current.isBefore(end) || current.isSame(end)) {
    if (current.month() + 1 === parseInt(month) && current.year() === parseInt(year)) {
      results.push(current.format('YYYY-MM-DD'));
    }

    if (entry.recurrence === 'monthly') {
      current = current.add(1, 'month');
    } else if (entry.recurrence === 'weekly') {
      current = current.add(1, 'week');
    } else if (entry.recurrence === 'daily') {
      current = current.add(1, 'day');
    } else {
      break; // Unsupported recurrence
    }
  }

  return results;
}

module.exports = { generateRecurringDates };
 
