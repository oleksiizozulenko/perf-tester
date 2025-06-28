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
      ORDER BY url ASC, label ASC
    `;
    db.all(query, labels, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getAggregateWithDiffByLabels(labels) {
  return new Promise((resolve, reject) => {
    const placeholders = labels.map(() => '?').join(',');
    const query = `
      WITH base_data AS (
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
      ),
      baseline AS (
        SELECT 
          url,
          label as baseline_label,
          avgLoadTime as baseline_loadTime,
          avgTTFB as baseline_ttfb,
          avgPerformance as baseline_performance,
          avgFCP as baseline_fcp,
          avgTTI as baseline_tti,
          avgTBT as baseline_tbt,
          avgSpeedIndex as baseline_speedIndex,
          avgLCP as baseline_lcp,
          avgCLS as baseline_cls
        FROM base_data
        WHERE label = ?
      )
      SELECT 
        bd.url,
        bd.label,
        bd.runs,
        bd.avgLoadTime,
        bd.avgTTFB,
        bd.avgPerformance,
        bd.avgFCP,
        bd.avgTTI,
        bd.avgTBT,
        bd.avgSpeedIndex,
        bd.avgLCP,
        bd.avgCLS,
        bl.baseline_label,
        CASE 
          WHEN bl.baseline_loadTime > 0 THEN 
            ROUND(((bd.avgLoadTime - bl.baseline_loadTime) / bl.baseline_loadTime) * 100, 1)
          ELSE NULL 
        END as loadTime_diff_pct,
        CASE 
          WHEN bl.baseline_ttfb > 0 THEN 
            ROUND(((bd.avgTTFB - bl.baseline_ttfb) / bl.baseline_ttfb) * 100, 1)
          ELSE NULL 
        END as ttfb_diff_pct,
        CASE 
          WHEN bl.baseline_performance > 0 THEN 
            ROUND(((bd.avgPerformance - bl.baseline_performance) / bl.baseline_performance) * 100, 1)
          ELSE NULL 
        END as performance_diff_pct,
        CASE 
          WHEN bl.baseline_fcp > 0 THEN 
            ROUND(((bd.avgFCP - bl.baseline_fcp) / bl.baseline_fcp) * 100, 1)
          ELSE NULL 
        END as fcp_diff_pct,
        CASE 
          WHEN bl.baseline_tti > 0 THEN 
            ROUND(((bd.avgTTI - bl.baseline_tti) / bl.baseline_tti) * 100, 1)
          ELSE NULL 
        END as tti_diff_pct,
        CASE 
          WHEN bl.baseline_tbt > 0 THEN 
            ROUND(((bd.avgTBT - bl.baseline_tbt) / bl.baseline_tbt) * 100, 1)
          ELSE NULL 
        END as tbt_diff_pct,
        CASE 
          WHEN bl.baseline_speedIndex > 0 THEN 
            ROUND(((bd.avgSpeedIndex - bl.baseline_speedIndex) / bl.baseline_speedIndex) * 100, 1)
          ELSE NULL 
        END as speedIndex_diff_pct,
        CASE 
          WHEN bl.baseline_lcp > 0 THEN 
            ROUND(((bd.avgLCP - bl.baseline_lcp) / bl.baseline_lcp) * 100, 1)
          ELSE NULL 
        END as lcp_diff_pct,
        CASE 
          WHEN bl.baseline_cls > 0 THEN 
            ROUND(((bd.avgCLS - bl.baseline_cls) / bl.baseline_cls) * 100, 1)
          ELSE NULL 
        END as cls_diff_pct
      FROM base_data bd
      LEFT JOIN baseline bl ON bd.url = bl.url
      ORDER BY bd.url ASC, bd.label ASC
    `;
    
    // Use the first label as baseline
    const baselineLabel = labels[0];
    const queryParams = [...labels, baselineLabel];
    
    db.all(query, queryParams, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

module.exports = {
  insertResult,
  getResultsByLabels,
  getAggregateByLabels,
  getAggregateWithDiffByLabels,
  db
};
