#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

// HTML report generation function
function generateHtmlReport(results, labels, reportType = 'detailed') {
  const now = new Date();
  const datetime = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  let tableHtml = '';
  let title = '';
  
  if (reportType === 'detailed') {
    title = `Detailed Performance Report - ${labels.join(', ')}`;
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>Label</th>
            <th>Run #</th>
            <th>Load Time (ms)</th>
            <th>TTFB (ms)</th>
            <th>Score</th>
            <th>FCP (ms)</th>
            <th>TTI (ms)</th>
            <th>TBT (ms)</th>
            <th>SpeedIdx (ms)</th>
            <th>LCP (ms)</th>
            <th>CLS</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(row => `
            <tr>
              <td>${row.url}</td>
              <td>${row.label}</td>
              <td>${row.runIndex}</td>
              <td>${row.loadTime?.toFixed(0) ?? ''}</td>
              <td>${row.ttfb?.toFixed(0) ?? ''}</td>
              <td>${row.performance?.toFixed(0) ?? ''}</td>
              <td>${row.fcp?.toFixed(0) ?? ''}</td>
              <td>${row.tti?.toFixed(0) ?? ''}</td>
              <td>${row.tbt?.toFixed(0) ?? ''}</td>
              <td>${row.speedIndex?.toFixed(0) ?? ''}</td>
              <td>${row.lcp?.toFixed(0) ?? ''}</td>
              <td>${row.cls?.toFixed(3) ?? ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (reportType === 'aggregate') {
    title = `Aggregate Performance Report - ${labels.join(', ')}`;
    tableHtml = `
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>Label</th>
            <th>Runs</th>
            <th>Avg Load Time (ms)</th>
            <th>Avg TTFB (ms)</th>
            <th>Avg Score</th>
            <th>Avg FCP (ms)</th>
            <th>Avg TTI (ms)</th>
            <th>Avg TBT (ms)</th>
            <th>Avg SpeedIdx (ms)</th>
            <th>Avg LCP (ms)</th>
            <th>Avg CLS</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(row => `
            <tr>
              <td>${row.url}</td>
              <td>${row.label}</td>
              <td>${row.runs}</td>
              <td>${row.avgLoadTime?.toFixed(0) ?? ''}</td>
              <td>${row.avgTTFB?.toFixed(0) ?? ''}</td>
              <td>${row.avgPerformance?.toFixed(0) ?? ''}</td>
              <td>${row.avgFCP?.toFixed(0) ?? ''}</td>
              <td>${row.avgTTI?.toFixed(0) ?? ''}</td>
              <td>${row.avgTBT?.toFixed(0) ?? ''}</td>
              <td>${row.avgSpeedIndex?.toFixed(0) ?? ''}</td>
              <td>${row.avgLCP?.toFixed(0) ?? ''}</td>
              <td>${row.avgCLS?.toFixed(3) ?? ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 20px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
        }
        th, td {
            padding: 12px 8px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
            position: sticky;
            top: 0;
        }
        tr:hover {
            background-color: #f8f9fa;
        }
        .score-good { color: #28a745; font-weight: bold; }
        .score-warning { color: #ffc107; font-weight: bold; }
        .score-poor { color: #dc3545; font-weight: bold; }
        .summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .summary h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .summary p {
            margin: 5px 0;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <p>Generated on ${now.toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="summary">
                <h3>Summary</h3>
                <p><strong>Labels:</strong> ${labels.join(', ')}</p>
                <p><strong>Total Results:</strong> ${results.length}</p>
                <p><strong>Report Type:</strong> ${reportType === 'detailed' ? 'Detailed' : 'Aggregate'}</p>
            </div>
            ${tableHtml}
        </div>
    </div>
</body>
</html>`;

  return { html, datetime };
}

program
  .name('perf-tester')
  .description('Node.js CLI utility for running Lighthouse on URLs and reporting results')
  .version('1.0.0');

program
  .command('run')
  .description('Run Lighthouse tests on URLs')
  .option('--label <label>', 'Label for this batch/run')
  .option('--urls <urls>', 'Comma-separated list of URLs')
  .option('--file <file>', 'File containing URLs (one per line)')
  .option('--repeat <number>', 'Number of times to run each URL', parseInt, 1)
  .option('--headful', 'Run Chrome in headful mode')
  .option('--config <config>', 'JSON file with input parameters')
  .action(async (opts) => {
    const fs = require('fs');
    const path = require('path');
    const { runLighthouse } = require('./runner');
    const { insertResult } = require('./db');

    // Load config file if provided
    let config = {};
    if (opts.config) {
      const configPath = path.resolve(process.cwd(), opts.config);
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (e) {
          console.error('Failed to parse config file:', e.message);
          process.exit(1);
        }
      } else {
        console.error('Config file not found:', configPath);
        process.exit(1);
      }
    }

    // Merge options: CLI > config
    const merged = { ...config, ...opts };

    // Check if label is provided (either via CLI or config)
    if (!merged.label) {
      console.error('Label is required. Provide --label or include "label" in config file.');
      process.exit(1);
    }

    // Parse URLs
    let urls = [];
    if (merged.urls) {
      if (Array.isArray(merged.urls)) {
        urls = merged.urls.map(u => u.trim()).filter(Boolean);
      } else if (typeof merged.urls === 'string') {
        urls = merged.urls.split(',').map(u => u.trim()).filter(Boolean);
      }
    }
    if (merged.file) {
      const filePath = path.resolve(process.cwd(), merged.file);
      if (fs.existsSync(filePath)) {
        const fileUrls = fs.readFileSync(filePath, 'utf-8')
          .split('\n')
          .map(u => u.trim())
          .filter(Boolean);
        urls = urls.concat(fileUrls);
      } else {
        console.error('File not found:', filePath);
        process.exit(1);
      }
    }
    urls = Array.from(new Set(urls)); // dedupe

    if (!urls.length) {
      console.error('No URLs provided. Use --urls, --file, or include "urls" in config file.');
      process.exit(1);
    }

    const repeat = merged.repeat || 1;
    const label = merged.label;
    const headful = !!merged.headful;

    for (const url of urls) {
      for (let runIndex = 1; runIndex <= repeat; runIndex++) {
        console.log(`[${label}] (${url}) Run #${runIndex}...`);
        try {
          const metrics = await runLighthouse(url, { headful });
          const result = {
            label,
            url,
            runIndex,
            timestamp: new Date().toISOString(),
            loadTime: metrics.loadTime,
            ttfb: metrics.ttfb,
            performance: metrics.performance,
            fcp: metrics.fcp,
            tti: metrics.tti,
            tbt: metrics.tbt,
            speedIndex: metrics.speedIndex,
            lcp: metrics.lcp,
            cls: metrics.cls,
            rawJson: metrics.rawJson
          };
          await insertResult(result);
          console.log(`  ✔ Success: Score=${metrics.performance}, LCP=${metrics.lcp}, CLS=${metrics.cls}`);
        } catch (err) {
          console.error(`  ✖ Error on ${url} run #${runIndex}:`, err.message);
        }
      }
    }
    console.log('All runs complete.');

    // Automatic report generation if "report": true in config
    if (merged.report === true) {
      console.log('\nAuto-generating report for label:', label);
      const { getResultsByLabels } = require('./db');
      const labels = [label];
      const results = await getResultsByLabels(labels);
      if (!results.length) {
        console.log('No results found for the given label.');
        return;
      }
      
      // Generate and save HTML report
      const { html, datetime } = generateHtmlReport(results, labels, 'detailed');
      const filename = `${label}-${datetime}.html`;
      const fs = require('fs');
      fs.writeFileSync(filename, html);
      console.log(`HTML report saved to: ${filename}`);
      
      // Also print table to console for convenience
      const header = [
        'URL', 'Label', 'Run #', 'Load Time', 'TTFB', 'Score', 'FCP', 'TTI', 'TBT', 'SpeedIdx', 'LCP', 'CLS'
      ];
      console.log(header.join(' | '));
      console.log(header.map(() => '---').join(' | '));
      // Print rows
      for (const row of results) {
        console.log([
          row.url,
          row.label,
          row.runIndex,
          row.loadTime?.toFixed(0) ?? '',
          row.ttfb?.toFixed(0) ?? '',
          row.performance?.toFixed(0) ?? '',
          row.fcp?.toFixed(0) ?? '',
          row.tti?.toFixed(0) ?? '',
          row.tbt?.toFixed(0) ?? '',
          row.speedIndex?.toFixed(0) ?? '',
          row.lcp?.toFixed(0) ?? '',
          row.cls?.toFixed(3) ?? ''
        ].join(' | '));
      }
    }
  });

program
  .command('report')
  .description('Generate tabular report for given labels')
  .requiredOption('--labels <labels>', 'Comma-separated list of labels')
  .option('--config <config>', 'JSON file with input parameters')
  .action(async (opts) => {
    const fs = require('fs');
    const path = require('path');
    const { getResultsByLabels } = require('./db');

    // Load config file if provided
    let config = {};
    if (opts.config) {
      const configPath = path.resolve(process.cwd(), opts.config);
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (e) {
          console.error('Failed to parse config file:', e.message);
          process.exit(1);
        }
      } else {
        console.error('Config file not found:', configPath);
        process.exit(1);
      }
    }

    // Merge options: CLI > config
    const merged = { ...config, ...opts };

    const labels = merged.labels
      ? merged.labels.split(',').map(l => l.trim()).filter(Boolean)
      : [];
    if (!labels.length) {
      console.error('No labels provided.');
      process.exit(1);
    }
    const results = await getResultsByLabels(labels);
    if (!results.length) {
      console.log('No results found for the given labels.');
      return;
    }
    
    // Generate and save HTML report
    const { html, datetime } = generateHtmlReport(results, labels, 'detailed');
    const filename = `${labels.join('-')}-${datetime}.html`;
    fs.writeFileSync(filename, html);
    console.log(`HTML report saved to: ${filename}`);
    
    // Also print table to console for convenience
    const header = [
      'URL', 'Label', 'Run #', 'Load Time', 'TTFB', 'Score', 'FCP', 'TTI', 'TBT', 'SpeedIdx', 'LCP', 'CLS'
    ];
    console.log(header.join(' | '));
    console.log(header.map(() => '---').join(' | '));
    // Print rows
    for (const row of results) {
      console.log([
        row.url,
        row.label,
        row.runIndex,
        row.loadTime?.toFixed(0) ?? '',
        row.ttfb?.toFixed(0) ?? '',
        row.performance?.toFixed(0) ?? '',
        row.fcp?.toFixed(0) ?? '',
        row.tti?.toFixed(0) ?? '',
        row.tbt?.toFixed(0) ?? '',
        row.speedIndex?.toFixed(0) ?? '',
        row.lcp?.toFixed(0) ?? '',
        row.cls?.toFixed(3) ?? ''
      ].join(' | '));
    }
  });

program
  .command('aggregate')
  .description('Generate aggregate stats report for given labels')
  .requiredOption('--labels <labels>', 'Comma-separated list of labels')
  .option('--config <config>', 'JSON file with input parameters')
  .action(async (opts) => {
    const fs = require('fs');
    const path = require('path');
    const { getAggregateByLabels } = require('./db');

    // Load config file if provided
    let config = {};
    if (opts.config) {
      const configPath = path.resolve(process.cwd(), opts.config);
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (e) {
          console.error('Failed to parse config file:', e.message);
          process.exit(1);
        }
      } else {
        console.error('Config file not found:', configPath);
        process.exit(1);
      }
    }

    // Merge options: CLI > config
    const merged = { ...config, ...opts };

    const labels = merged.labels
      ? merged.labels.split(',').map(l => l.trim()).filter(Boolean)
      : [];
    if (!labels.length) {
      console.error('No labels provided.');
      process.exit(1);
    }
    const results = await getAggregateByLabels(labels);
    if (!results.length) {
      console.log('No aggregate data found for the given labels.');
      return;
    }
    
    // Generate and save HTML report
    const { html, datetime } = generateHtmlReport(results, labels, 'aggregate');
    const filename = `${labels.join('-')}-aggregate-${datetime}.html`;
    fs.writeFileSync(filename, html);
    console.log(`HTML report saved to: ${filename}`);
    
    // Also print table to console for convenience
    const header = [
      'URL', 'Label', 'Runs', 'Avg Load Time', 'Avg TTFB', 'Avg Score', 'Avg FCP', 'Avg TTI', 'Avg TBT', 'Avg SpeedIdx', 'Avg LCP', 'Avg CLS'
    ];
    console.log(header.join(' | '));
    console.log(header.map(() => '---').join(' | '));
    // Print rows
    for (const row of results) {
      console.log([
        row.url,
        row.label,
        row.runs,
        row.avgLoadTime?.toFixed(0) ?? '',
        row.avgTTFB?.toFixed(0) ?? '',
        row.avgPerformance?.toFixed(0) ?? '',
        row.avgFCP?.toFixed(0) ?? '',
        row.avgTTI?.toFixed(0) ?? '',
        row.avgTBT?.toFixed(0) ?? '',
        row.avgSpeedIndex?.toFixed(0) ?? '',
        row.avgLCP?.toFixed(0) ?? '',
        row.avgCLS?.toFixed(3) ?? ''
      ].join(' | '));
    }
  });

program.parse(process.argv);
