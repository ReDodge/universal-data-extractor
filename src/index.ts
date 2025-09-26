// Main exports
export {
  UniversalDataExtractor,
  extract,
  extractWithDetails,
  extractAsStream,
} from './extractor';

// Type exports
export type {
  SupportedFormat,
  ExtractorOptions,
  ExtractResult,
  StreamResult,
  FileInfo,
  Extractor,
} from './types';

// Extractor exports (for advanced usage)
export { CsvExtractor } from './extractors/csv-extractor';
export { JsonExtractor } from './extractors/json-extractor';
export { XlsxExtractor } from './extractors/xlsx-extractor';
export { XlsExtractor } from './extractors/xls-extractor';
export { ZipExtractor } from './extractors/zip-extractor';

// Utility exports
export { FileUtils } from './utils';