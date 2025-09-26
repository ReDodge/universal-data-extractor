import { Readable, Transform } from 'stream';

export type SupportedFormat = 'csv' | 'txt' | 'xlsx' | 'xls' | 'json' | 'zip';

export interface ExtractorOptions {
  /**
   * Number of rows to extract (limit)
   */
  quantity?: number;

  /**
   * If true, treat first row as data instead of headers
   * @default false
   */
  noHeaders?: boolean;

  /**
   * Specific CSV delimiter to use (auto-detected if not provided)
   */
  delimiter?: string;

  /**
   * File encoding
   * @default 'utf-8'
   */
  encoding?: BufferEncoding;

  /**
   * For ZIP files: which file to extract (by index or name pattern)
   */
  zipTarget?: string | number;

  /**
   * For XLSX/XLS files: which sheet to extract (by index or name)
   * @default 0 (first sheet)
   */
  sheetTarget?: string | number;

  /**
   * Column names to extract (if not provided, extracts all columns)
   */
  columns?: string[];

  /**
   * Column mapping: rename columns { oldName: newName }
   */
  columnMapping?: Record<string, string>;
}

export interface ExtractResult {
  /**
   * Extracted data as array of objects
   */
  data: Record<string, any>[];

  /**
   * Detected file format
   */
  format: SupportedFormat;

  /**
   * For CSV: detected delimiter
   */
  delimiter?: string;

  /**
   * Number of rows extracted
   */
  rowCount: number;
}

export interface StreamResult {
  /**
   * Readable stream
   */
  readable: Readable;

  /**
   * Transform streams
   */
  transforms: Transform[];

  /**
   * Detected file format
   */
  format: SupportedFormat;

  /**
   * For CSV: detected delimiter
   */
  delimiter?: string;
}

export interface FileInfo {
  extension: string;
  type: SupportedFormat;
  isArchive: boolean;
}

export interface Extractor {
  /**
   * Extract data from file
   */
  extract(filePath: string, options?: ExtractorOptions): Promise<Record<string, any>[]>;

  /**
   * Extract data from Buffer
   */
  extractFromBuffer?(buffer: Buffer, options?: ExtractorOptions): Promise<Record<string, any>[]>;

  /**
   * Read file as stream
   */
  readAsStream(filePath: string, options?: ExtractorOptions): Promise<[Readable, ...Transform[]]>;
}