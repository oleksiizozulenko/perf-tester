const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'perf-tester.sqlite');
const db = new sqlite3.Database(DB_PATH);

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      runIndex INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      loadTime REAL,
      ttfb REAL,
      performance REAL,
      fcp REAL,
      tti REAL,
      tbt REAL,
      speedIndex REAL,
      lcp REAL,
      cls REAL,
      rawJson TEXT
    );
  `);
});

function insertResult(result) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO results (
        label, url, runIndex, timestamp,
        loadTime, ttfb, performance, fcp, tti, tbt, speedIndex, lcp, cls, rawJson
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    stmt.run([
      result.label, result.url, result.runIndex, result.timestamp,
      result.loadTime, result.ttfb, result.performance, result.fcp, 
      result.tti, result.tbt, result.speedIndex, result.lcp, result.cls, result.rawJson
    ], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
    stmt.finalize();
  });
}

function getResultsByLabels(labels) {
  return new Promise((resolve, reject) => {
    const placeholders = labels.map(() => '?').join(',');
    const query = `SELECT * FROM results WHERE label IN (${placeholders}) ORDER BY url, label, runIndex`;
    db.all(query, labels, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getAggregateByLabels(labels) {
  return new Promise((resolve, reject) => {
    const placeholders = labels.map(() => '?').join(',');
    const query = `
      SELECT
        url, label,
        COUNT(*) as runs,
        AVG(loadTime) as avgLoadTime,
        AVG(ttfb) as avgTTFB,
        AVG(performance) as avgPerformance,
        AVG(fcp) as avgFCP,
        AVG(tti) as avgTTI,
        AVG(tbt) as avgTBT,
        AVG(speedIndex) as avgSpeedIndex,
        AVG(lcp) as avgLCP,
        AVG(cls) as avgCLS
      FROM results
      WHERE label IN (${placeholders})
      GROUP BY url, label
      ORDER BY avgPerformance ASC, avgLCP DESC
    `;
    db.all(query, labels, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

module.exports = {
  insertResult,
  getResultsByLabels,
  getAggregateByLabels,
  db
};
