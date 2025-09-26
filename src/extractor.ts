import { detectDelimiter } from 'smart-csv-delimiter';
import { Transform } from 'stream';
import { CsvExtractor } from './extractors/csv-extractor';
import { JsonExtractor } from './extractors/json-extractor';
import { XlsxExtractor } from './extractors/xlsx-extractor';
import { XlsExtractor } from './extractors/xls-extractor';
import { ZipExtractor } from './extractors/zip-extractor';
import { FileUtils } from './utils';
import { ExtractorOptions, ExtractResult, StreamResult } from './types';

export class UniversalDataExtractor {
  private csvExtractor = new CsvExtractor();
  private jsonExtractor = new JsonExtractor();
  private xlsxExtractor = new XlsxExtractor();
  private xlsExtractor = new XlsExtractor();
  private zipExtractor = new ZipExtractor();
  private delimiterCache = new Map<string, string>();

  async extract(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<Record<string, any>[]> {
    const fileInfo = FileUtils.getFileInfo(filePath);

    if (!fileInfo) {
      throw new Error('Unknown file format or bad extension');
    }

    let data: Record<string, any>[];

    switch (fileInfo.type) {
      case 'csv':
      case 'txt':
        data = await this.csvExtractor.extract(filePath, options);
        break;
      case 'xlsx':
        data = await this.xlsxExtractor.extract(filePath, options);
        break;
      case 'xls':
        data = await this.xlsExtractor.extract(filePath, options);
        break;
      case 'json':
        data = await this.jsonExtractor.extract(filePath, options);
        break;
      case 'zip':
        data = await this.zipExtractor.extract(filePath, options);
        break;
      default:
        throw new Error('Unknown file format or bad extension');
    }

    return this.applyFilters(data, options);
  }

  async extractWithDetails(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<ExtractResult> {
    const fileInfo = FileUtils.getFileInfo(filePath);

    if (!fileInfo) {
      throw new Error('Unknown file format or bad extension');
    }

    const data = await this.extract(filePath, options);
    
    const result: ExtractResult = {
      data,
      format: fileInfo.type,
      rowCount: data.length,
    };

    if (fileInfo.type === 'csv' || fileInfo.type === 'txt') {
      result.delimiter = options.delimiter || await this.getDelimiter(filePath) || undefined;
    }

    return result;
  }

  async extractAsStream(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<StreamResult> {
    const fileInfo = FileUtils.getFileInfo(filePath);

    if (!fileInfo) {
      throw new Error('Unknown file format or bad extension');
    }

    let streams: any[];

    switch (fileInfo.type) {
      case 'csv':
      case 'txt':
        streams = await this.csvExtractor.readAsStream(filePath, options);
        break;
      case 'xlsx':
        streams = await this.xlsxExtractor.readAsStream(filePath, options);
        break;
      case 'xls':
        streams = await this.xlsExtractor.readAsStream(filePath, options);
        break;
      case 'json':
        streams = await this.jsonExtractor.readAsStream(filePath, options);
        break;
      case 'zip':
        streams = await this.zipExtractor.readAsStream(filePath, options);
        break;
      default:
        throw new Error('Unknown file format or bad extension');
    }

    const result: StreamResult = {
      readable: streams[0],
      transforms: streams.slice(1),
      format: fileInfo.type,
    };

    if (fileInfo.type === 'csv' || fileInfo.type === 'txt') {
      result.delimiter = options.delimiter || await this.getDelimiter(filePath) || undefined;
    }

    if (options.columns || options.columnMapping) {
      result.transforms.push(this.createFilterTransform(options));
    }

    return result;
  }

  private async getDelimiter(filePath: string): Promise<string | null> {
    if (this.delimiterCache.has(filePath)) {
      return this.delimiterCache.get(filePath) || null;
    }
    
    const delimiter = await detectDelimiter(filePath);
    if (delimiter) {
      this.delimiterCache.set(filePath, delimiter);
    }
    
    return delimiter;
  }

  clearCache(): void {
    this.delimiterCache.clear();
  }

  private applyFilters(
    data: Record<string, any>[],
    options: ExtractorOptions
  ): Record<string, any>[] {
    if (!options.columns && !options.columnMapping) {
      return data;
    }

    return data.map(row => {
      let filtered: Record<string, any> = {};

      if (options.columns) {
        for (const col of options.columns) {
          if (col in row) {
            filtered[col] = row[col];
          }
        }
      } else {
        filtered = { ...row };
      }

      if (options.columnMapping) {
        const mapped: Record<string, any> = {};
        for (const key in filtered) {
          const newKey = options.columnMapping[key] || key;
          mapped[newKey] = filtered[key];
        }
        return mapped;
      }

      return filtered;
    });
  }

  private createFilterTransform(options: ExtractorOptions): Transform {
    return new Transform({
      objectMode: true,
      transform: (chunk: any, _encoding: any, callback: any) => {
        try {
          let filtered: Record<string, any> = {};

          if (options.columns) {
            for (const col of options.columns) {
              if (col in chunk) {
                filtered[col] = chunk[col];
              }
            }
          } else {
            filtered = { ...chunk };
          }

          if (options.columnMapping) {
            const mapped: Record<string, any> = {};
            for (const key in filtered) {
              const newKey = options.columnMapping[key] || key;
              mapped[newKey] = filtered[key];
            }
            callback(null, mapped);
          } else {
            callback(null, filtered);
          }
        } catch (err) {
          callback(err);
        }
      },
    });
  }
}

// Convenience functions
export async function extract(
  filePath: string,
  options?: ExtractorOptions
): Promise<Record<string, any>[]> {
  const extractor = new UniversalDataExtractor();
  return extractor.extract(filePath, options);
}

export async function extractWithDetails(
  filePath: string,
  options?: ExtractorOptions
): Promise<ExtractResult> {
  const extractor = new UniversalDataExtractor();
  return extractor.extractWithDetails(filePath, options);
}

export async function extractAsStream(
  filePath: string,
  options?: ExtractorOptions
): Promise<StreamResult> {
  const extractor = new UniversalDataExtractor();
  return extractor.extractAsStream(filePath, options);
}