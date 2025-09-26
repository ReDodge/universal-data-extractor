import { Readable, Transform, PassThrough } from 'stream';
import { transform as streamTransform, HandlerCallback } from 'stream-transform';
import { getXlsxStream, getWorksheets } from 'xlstream';
import { Extractor, ExtractorOptions } from '../types';

export class XlsxExtractor implements Extractor {
  async extract(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<Record<string, any>[]> {
    const data: Record<string, any>[] = [];
    let rowCount = 0;

    return new Promise<Record<string, any>[]>(async (resolve, reject) => {
      const sheetList: any[] = await getWorksheets({ filePath });
      
      // Process only first sheet to avoid memory issues
      for (let i = 0; i < Math.min(1, sheetList.length); i++) {
        const stream = await getXlsxStream({
          filePath,
          sheet: i,
          withHeader: !options.noHeaders,
          ignoreEmpty: true,
          numberFormat: 'standard',
        });

        stream.on('error', reject);
        stream.on('close', () => resolve(data));
        stream.on('data', ({ formatted: { obj: row, arr: values } }: any) => {
          if (options?.noHeaders) {
            data.push(this.arrayToObject(values));
          } else {
            data.push(
              Object.keys(row).reduce((acc: any, key) => {
                acc[key] = row[key];
                return acc;
              }, {}),
            );
          }
          rowCount++;
          if (options.quantity && rowCount >= options.quantity) {
            stream.destroy();
          }
        });
      }
    });
  }

  async readAsStream(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<[Readable, ...Transform[]]> {
    const sheetList: any[] = await getWorksheets({ filePath });
    
    const stream = await getXlsxStream({
      filePath,
      sheet: 0, // First sheet
      withHeader: !options?.noHeaders,
      ignoreEmpty: true,
      numberFormat: 'standard',
    });

    const passThrough = new PassThrough({ objectMode: true });
    
    let rowCount = 0;
    stream.on('data', ({ formatted: { obj: row, arr: values } }: any) => {
      if (options?.quantity && rowCount >= options.quantity) {
        stream.destroy();
        passThrough.end();
        return;
      }

      if (options?.noHeaders) {
        passThrough.write(this.arrayToObject(values));
      } else {
        passThrough.write(
          Object.keys(row).reduce((acc: any, key) => {
            acc[key] = row[key];
            return acc;
          }, {})
        );
      }
      rowCount++;
    });

    stream.on('close', () => passThrough.end());
    stream.on('error', (err: any) => passThrough.destroy(err));

    return [passThrough];
  }

  private arrayToObject(values: any[]): any {
    return values.reduce((acc: any, value, index) => {
      acc[`column_${index + 1}`] = value;
      return acc;
    }, {});
  }
}