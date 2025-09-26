import { Readable, Transform } from 'stream';
import * as XLSX from 'xlsx';
import { Extractor, ExtractorOptions } from '../types';

export class XlsExtractor implements Extractor {
  async extract(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<Record<string, any>[]> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data: any[] = XLSX.utils.sheet_to_json(worksheet, {
      header: options.noHeaders ? 1 : undefined,
      defval: '',
    });

    const limitedData = options.quantity
      ? data.slice(0, options.quantity)
      : data;

    if (options.noHeaders) {
      return limitedData.map(row => this.arrayToObject(Object.values(row)));
    }

    return limitedData;
  }

  async readAsStream(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<[Readable, ...Transform[]]> {
    const data = await this.extract(filePath, options);
    const readable = Readable.from(data);

    return [readable];
  }

  private arrayToObject(values: any[]): any {
    return values.reduce((acc: any, value, index) => {
      acc[`column_${index + 1}`] = value;
      return acc;
    }, {});
  }
}