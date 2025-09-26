# universal-data-extractor

🚀 **Universal data extractor for CSV, Excel, JSON, and ZIP files** - with smart delimiter detection powered by [smart-csv-delimiter](https://www.npmjs.com/package/smart-csv-delimiter).

[![npm version](https://img.shields.io/npm/v/universal-data-extractor.svg)](https://www.npmjs.com/package/universal-data-extractor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 📊 **Multi-Format Support** - CSV, TXT, XLSX, XLS, JSON, ZIP
- 🎯 **Smart CSV Detection** - Automatic delimiter detection using `smart-csv-delimiter`
- 💧 **Stream Support** - Memory-efficient processing for large files
- 🔧 **Highly Configurable** - Row limits, headers, custom delimiters
- 📦 **ZIP Extraction** - Automatic extraction and processing of archived files
- 🔍 **Column Filtering** - Extract only specific columns
- 🔄 **Column Mapping** - Rename columns during extraction
- ⚡ **Performance Optimized** - Delimiter detection caching
- 💪 **TypeScript First** - Full type definitions included
- 🎨 **Unified API** - Same interface for all formats

## 📦 Installation

```bash
npm install universal-data-extractor
```

## 🚀 Quick Start

```typescript
import { extract } from 'universal-data-extractor';

// Extract any format - CSV, XLSX, XLS, JSON, ZIP
const data = await extract('./data.csv');
console.log(data); // Array of objects
```

## 📖 Usage

### Basic Extraction

```typescript
import { extract } from 'universal-data-extractor';

// CSV with auto delimiter detection
const csvData = await extract('./data.csv');

// Excel (XLSX)
const xlsxData = await extract('./data.xlsx');

// Excel (XLS)
const xlsData = await extract('./data.xls');

// JSON (must be array of objects)
const jsonData = await extract('./data.json');

// ZIP (extracts and processes first file)
const zipData = await extract('./archive.zip');
```

### Detailed Extraction

Get additional information about the extraction:

```typescript
import { extractWithDetails } from 'universal-data-extractor';

const result = await extractWithDetails('./data.csv');

console.log(result);
// {
//   data: [...],           // Extracted data
//   format: 'csv',         // Detected format
//   delimiter: ',',        // CSV delimiter (if CSV/TXT)
//   rowCount: 1000         // Number of rows extracted
// }
```

### Stream Processing

For large files, use streaming to avoid loading everything into memory:

```typescript
import { extractAsStream } from 'universal-data-extractor';

const result = await extractAsStream('./large-file.csv');

// Process data as it streams
for await (const row of result.readable) {
  console.log(row);
  // Process each row individually
}
```

### Configuration Options

```typescript
import { extract, ExtractorOptions } from 'universal-data-extractor';

const options: ExtractorOptions = {
  quantity: 100,           // Limit to first 100 rows
  noHeaders: false,        // Treat first row as data (not headers)
  delimiter: ',',          // Force specific CSV delimiter
  encoding: 'utf-8',       // File encoding
  zipTarget: 0,            // ZIP: Extract first file (by index or name pattern)
  sheetTarget: 0,          // XLSX/XLS: Extract specific sheet (by index or name)
  columns: ['name', 'age'], // Extract only specific columns
  columnMapping: {         // Rename columns
    'old_name': 'new_name'
  }
};

const data = await extract('./file.csv', options);
```

## 🎓 API Reference

### `extract(filePath, options?)`

Extract data from any supported file format.

**Parameters:**
- `filePath` (string): Path to the file
- `options` (ExtractorOptions, optional): Configuration options

**Returns:** `Promise<Record<string, any>[]>`

### `extractWithDetails(filePath, options?)`

Extract data with detailed information.

**Returns:** `Promise<ExtractResult>`

```typescript
interface ExtractResult {
  data: Record<string, any>[];
  format: SupportedFormat;
  delimiter?: string;
  rowCount: number;
}
```

### `extractAsStream(filePath, options?)`

Extract data as a stream for memory-efficient processing.

**Returns:** `Promise<StreamResult>`

```typescript
interface StreamResult {
  readable: Readable;
  transforms: Transform[];
  format: SupportedFormat;
  delimiter?: string;
}
```

### `UniversalDataExtractor`

Class-based API for reusable extraction with delimiter caching.

```typescript
import { UniversalDataExtractor } from 'universal-data-extractor';

const extractor = new UniversalDataExtractor();

const data = await extractor.extract('./file.csv');
const details = await extractor.extractWithDetails('./file.csv');
const stream = await extractor.extractAsStream('./file.csv');

// Clear delimiter cache when needed
extractor.clearCache();
```

## 📝 Supported Formats

| Format | Extensions | Features |
|--------|-----------|----------|
| **CSV** | `.csv`, `.txt` | ✅ Auto delimiter detection<br>✅ Custom delimiters<br>✅ Streaming support |
| **Excel (XLSX)** | `.xlsx` | ✅ First sheet extraction<br>✅ Streaming support<br>✅ Number formatting |
| **Excel (XLS)** | `.xls` | ✅ Legacy format support<br>✅ Full data extraction |
| **JSON** | `.json` | ✅ Array of objects<br>✅ Streaming support |
| **ZIP** | `.zip` | ✅ Automatic extraction<br>✅ Target file selection<br>✅ Format detection |

## 💡 Examples

### Extract CSV with Unknown Delimiter

```typescript
import { extractWithDetails } from 'universal-data-extractor';

// Automatically detects comma, semicolon, pipe, or tab
const result = await extractWithDetails('./mystery.csv');
console.log(`Detected delimiter: ${result.delimiter}`);
console.log(`Rows: ${result.rowCount}`);
```

### Process Large Excel File

```typescript
import { extractAsStream } from 'universal-data-extractor';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

const result = await extractAsStream('./large-data.xlsx');

// Process 10,000 rows at a time
const processor = new Transform({
  objectMode: true,
  transform(row, encoding, callback) {
    // Your processing logic here
    console.log(row);
    callback(null, row);
  }
});

await pipeline(result.readable, processor);
```

### Extract Specific File from ZIP

```typescript
import { extract } from 'universal-data-extractor';

// By index
const data1 = await extract('./archive.zip', { zipTarget: 0 });

// By name pattern
const data2 = await extract('./archive.zip', { zipTarget: 'sales' });
```

### Limit Rows for Preview

```typescript
import { extract } from 'universal-data-extractor';

// Extract only first 10 rows for preview
const preview = await extract('./huge-file.csv', { quantity: 10 });
console.log(`Preview (${preview.length} rows):`, preview);
```

### Filter and Rename Columns

```typescript
import { extract } from 'universal-data-extractor';

// Extract only specific columns
const data = await extract('./file.csv', {
  columns: ['name', 'email', 'age']
});

// Rename columns during extraction
const renamed = await extract('./file.csv', {
  columnMapping: {
    'first_name': 'firstName',
    'last_name': 'lastName',
    'email_address': 'email'
  }
});

// Combine: filter and rename
const filtered = await extract('./file.csv', {
  columns: ['first_name', 'email_address'],
  columnMapping: {
    'first_name': 'name',
    'email_address': 'email'
  }
});
```

## 🔗 Related Packages

This package uses and complements:
- **[smart-csv-delimiter](https://www.npmjs.com/package/smart-csv-delimiter)** - Automatic CSV delimiter detection
- **[universal-file-client](https://www.npmjs.com/package/universal-file-client)** - Download files from FTP/SFTP/HTTP

Perfect for ETL pipelines:
```typescript
import { UniversalFileClient } from 'universal-file-client';
import { extract } from 'universal-data-extractor';

// 1. Download file
const client = new UniversalFileClient();
await client.connect({ host: 'ftp://server.com', ... });
const buffer = await client.download('/data.csv');

// 2. Extract data
const data = await extract('./data.csv');

// 3. Process data
console.log(`Extracted ${data.length} rows`);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [ReDodge](https://github.com/ReDodge)

## 🔗 Links

- [GitHub Repository](https://github.com/ReDodge/universal-data-extractor)
- [NPM Package](https://www.npmjs.com/package/universal-data-extractor)
- [Report Issues](https://github.com/ReDodge/universal-data-extractor/issues)

## ⭐ Show Your Support

If this package helped you, please give it a ⭐ on [GitHub](https://github.com/ReDodge/universal-data-extractor)!