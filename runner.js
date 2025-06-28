const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url, { headful = false } = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [headful ? '' : '--headless', '--no-sandbox', '--disable-gpu']
  });
  const opts = {
    port: chrome.port,
    output: 'json',
    logLevel: 'error'
  };
  let result, lhr, rawJson;
  try {
    result = await lighthouse(url, opts);
    lhr = result.lhr;
    rawJson = JSON.stringify(result.lhr);
  } catch (err) {
    await chrome.kill();
    throw err;
  }
  await chrome.kill();

  // Extract metrics
  const audits = lhr.audits;
  const metrics = {
    loadTime: audits['interactive']?.numericValue || null,
    ttfb: audits['server-response-time']?.numericValue || null,
    performance: lhr.categories.performance?.score !== undefined ? lhr.categories.performance.score * 100 : null,
    fcp: audits['first-contentful-paint']?.numericValue || null,
    tti: audits['interactive']?.numericValue || null,
    tbt: audits['total-blocking-time']?.numericValue || null,
    speedIndex: audits['speed-index']?.numericValue || null,
    lcp: audits['largest-contentful-paint']?.numericValue || null,
    cls: audits['cumulative-layout-shift']?.numericValue || null,
    rawJson
  };
  return metrics;
}

module.exports = {
  runLighthouse
};
