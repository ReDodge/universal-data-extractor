import { createReadStream } from 'fs';
import { Readable, Transform } from 'stream';
import { parse } from 'csv-parse';
import { detectDelimiter } from 'smart-csv-delimiter';
import { Extractor, ExtractorOptions } from '../types';

export class CsvExtractor implements Extractor {
  async extract(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<Record<string, any>[]> {
    const data: Record<string, any>[] = [];
    
    const delimiter = options.delimiter || await detectDelimiter(filePath) || ',';

    return new Promise<Record<string, any>[]>((resolve, reject) => {
      const fileStream = createReadStream(filePath);
      const stream = parse({
        bom: true,
        columns: !options.noHeaders,
        delimiter: delimiter,
        from: 1,
        relaxColumnCount: true,
        skipEmptyLines: true,
        skipRecordsWithEmptyValues: false,
        to: options.quantity,
        skipRecordsWithError: true,
        quote: '"',
        cast: false,
      });

      stream.on('skip', (err: any) => console.warn('Skipped row:', err));
      stream.on('error', (err: any) => reject(err));
      stream.on('end', () => resolve(data));
      stream.on('data', (row: any) => {
        if (options?.noHeaders) {
          data.push(this.arrayToObject(row));
        } else {
          data.push(row);
        }
      });

      fileStream.pipe(stream);
    });
  }

  async readAsStream(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<[Readable, ...Transform[]]> {
    const delimiter = options.delimiter || await detectDelimiter(filePath) || ',';

    const streams: [Readable, ...Transform[]] = [
      createReadStream(filePath),
      parse({
        bom: true,
        columns: !options?.noHeaders,
        delimiter: delimiter,
        from: 1,
        relaxQuotes: true,
        relaxColumnCount: true,
        skipEmptyLines: true,
        skipRecordsWithEmptyValues: true,
        skipRecordsWithError: true,
        trim: true,
        quote: null,
        cast: false,
      }),
    ];

    if (options?.noHeaders) {
      streams.push(
        new Transform({
          objectMode: true,
          transform: (chunk, _encoding, callback) => {
            try {
              callback(null, this.arrayToObject(chunk));
            } catch (err: any) {
              console.error(`Error processing line: ${err.message}`);
              callback();
            }
          },
        }),
      );
    } else {
      streams.push(
        new Transform({
          objectMode: true,
          transform: (chunk, _encoding, callback) => {
            try {
              const modifiedObject: any = {};

              for (const name in chunk) {
                const newName = name.replaceAll('"', '');
                const newValue = chunk[name].replaceAll('"', '');
                modifiedObject[newName] = newValue;
              }

              callback(null, modifiedObject);
            } catch (err: any) {
              console.error(`Error processing line: ${err.message}`);
              callback();
            }
          },
        }),
      );
    }

    return streams;
  }

  private arrayToObject(row: string[]): any {
    return row.reduce((acc: any, cur: string, i: number) => {
      acc[`column_${i + 1}`] = cur.replaceAll('"', '');
      return acc;
    }, {});
  }
}