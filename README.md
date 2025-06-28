# Perf-Tester

A Node.js CLI utility for running Lighthouse performance tests on URLs and generating detailed HTML reports.

## Features

- 🚀 **Lighthouse Integration**: Uses Google Lighthouse for comprehensive performance testing
- 📊 **HTML Reports**: Generates beautiful, responsive HTML reports with detailed metrics
- 🗄️ **SQLite Database**: Stores all test results for historical analysis
- 🔄 **Batch Testing**: Test multiple URLs with configurable repeat runs
- 📁 **Configuration Files**: Support for JSON configuration files
- 📈 **Aggregate Reports**: Generate summary statistics across multiple test runs
- 🎨 **Modern UI**: Professional HTML reports with responsive design

## Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

### Dependencies

- `commander@9.4.1` - CLI argument parsing
- `sqlite3@5.1.6` - Database storage
- `lighthouse@9.6.8` - Performance testing
- `chrome-launcher@0.15.2` - Chrome browser automation

## Usage

### Basic Commands

```bash
# Run tests with a label
node perf-tester run --label "production-test" --urls "https://example.com"

# Run tests with configuration file
node perf-tester run --config config.json

# Generate detailed report
node perf-tester report --labels "production-test,staging-test"

# Generate aggregate report
node perf-tester aggregate --labels "production-test,staging-test"
```

### Command Options

#### `run` Command
- `--label <label>` - Label for this batch/run (required unless in config)
- `--urls <urls>` - Comma-separated list of URLs
- `--file <file>` - File containing URLs (one per line)
- `--repeat <number>` - Number of times to run each URL (default: 1)
- `--headful` - Run Chrome in headful mode (default: headless)
- `--config <config>` - JSON file with input parameters

#### `report` Command
- `--labels <labels>` - Comma-separated list of labels (required)
- `--config <config>` - JSON file with input parameters

#### `aggregate` Command
- `--labels <labels>` - Comma-separated list of labels (required)
- `--config <config>` - JSON file with input parameters

## Configuration Files

You can use JSON configuration files to simplify command execution:

```json
{
  "label": "production-test",
  "urls": [
    "https://example.com",
    "https://example.com/about",
    "https://example.com/contact"
  ],
  "repeat": 3,
  "headful": false,
  "report": true
}
```

### Configuration Options

- `label` - Label for the test batch
- `urls` - Array of URLs to test
- `repeat` - Number of times to run each URL
- `headful` - Run Chrome in headful mode
- `report` - Automatically generate HTML report after tests

## Performance Metrics

The tool captures the following Lighthouse metrics:

- **Load Time** - Total time to load the page
- **TTFB** - Time to First Byte
- **Performance Score** - Overall Lighthouse performance score (0-100)
- **FCP** - First Contentful Paint
- **TTI** - Time to Interactive
- **TBT** - Total Blocking Time
- **Speed Index** - How quickly content is visually displayed
- **LCP** - Largest Contentful Paint
- **CLS** - Cumulative Layout Shift

## HTML Reports

### Report Types

1. **Detailed Reports** - Show individual test runs with all metrics
2. **Aggregate Reports** - Show averaged metrics across multiple runs

### Report Features

- **Responsive Design** - Works on desktop and mobile devices
- **Professional Styling** - Modern UI with gradients and hover effects
- **Summary Section** - Overview of test parameters and results
- **Sortable Tables** - Well-formatted data presentation
- **Timestamp** - Generation date and time

### Report Naming

Reports are automatically saved with descriptive filenames:
- Detailed: `[label]-[datetime].html`
- Aggregate: `[labels]-aggregate-[datetime].html`

Examples:
- `production-test-2024-01-15T10-30-45.html`
- `prod-staging-aggregate-2024-01-15T10-30-45.html`

## Examples

### Example 1: Basic Testing

```bash
# Test a single URL
node perf-tester run --label "homepage" --urls "https://example.com"

# Test multiple URLs
node perf-tester run --label "main-pages" --urls "https://example.com,https://example.com/about,https://example.com/contact"
```

### Example 2: Using Configuration File

Create `test-config.json`:
```json
{
  "label": "production-sites",
  "urls": [
    "https://example.com",
    "https://example.com/products",
    "https://example.com/blog"
  ],
  "repeat": 5,
  "report": true
}
```

Run tests:
```bash
node perf-tester run --config test-config.json
```

### Example 3: File-based URL Input

Create `urls.txt`:
```
https://example.com
https://example.com/about
https://example.com/contact
```

Run tests:
```bash
node perf-tester run --label "file-test" --file urls.txt --repeat 3
```

### Example 4: Generating Reports

```bash
# Generate detailed report for specific labels
node perf-tester report --labels "production-test,staging-test"

# Generate aggregate report
node perf-tester aggregate --labels "production-test,staging-test"
```

### Example 5: Headful Mode (for debugging)

```bash
# Run tests with visible browser
node perf-tester run --label "debug-test" --urls "https://example.com" --headful
```

## Database

Test results are stored in a local SQLite database (`perf-tester.db`) for historical analysis and comparison.

### Database Schema

```sql
CREATE TABLE results (
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
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm install` to install dependencies

2. **Chrome/Chromium not found**
   - Ensure Chrome or Chromium is installed on your system
   - The tool uses `chrome-launcher` to automatically find and launch Chrome

3. **Permission errors**
   - Ensure you have write permissions in the current directory for database and report files

4. **Network timeouts**
   - Check your internet connection
   - Some URLs may be slow to respond - consider increasing timeouts

### Node.js Version Compatibility

- **Recommended**: Node.js 16.x or higher
- **Tested**: Node.js 16.20.2
- **Dependencies**: Compatible versions are automatically installed

## Development

### Project Structure

```
perf-tester/
├── perf-tester.js    # Main CLI application
├── runner.js         # Lighthouse test runner
├── db.js            # Database operations
├── package.json     # Dependencies and scripts
└── README.md        # This documentation
```

### Adding New Metrics

To add new performance metrics:

1. Update the `runLighthouse` function in `runner.js`
2. Modify the database schema in `db.js`
3. Update the HTML report generation in `perf-tester.js`

## License

ISC License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the examples
3. Open an issue with detailed error information 