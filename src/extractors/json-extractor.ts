import { createReadStream } from 'fs';
import { Readable, Transform } from 'stream';
import { Extractor, ExtractorOptions } from '../types';

export class JsonExtractor implements Extractor {
  async extract(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<Record<string, any>[]> {
    const fileContent = await this.readJsonFile(filePath);
    const limitedData = options?.quantity
      ? fileContent.slice(0, options.quantity)
      : fileContent;

    return limitedData.map((entry) =>
      options?.noHeaders ? this.arrayifyObject(entry) : entry,
    );
  }

  async readAsStream(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<[Readable, ...Transform[]]> {
    const fileContent = await this.readJsonFile(filePath);

    const limitedData = options?.quantity
      ? fileContent.slice(0, options.quantity)
      : fileContent;

    const readable = Readable.from(limitedData);

    const transform = new Transform({
      objectMode: true,
      transform: (chunk, _encoding, callback) => {
        try {
          const result = options?.noHeaders
            ? this.arrayifyObject(chunk)
            : this.cleanObject(chunk);
          callback(null, result);
        } catch (err: any) {
          console.error(`Error processing JSON chunk: ${err.message}`);
          callback();
        }
      },
    });

    return [readable, transform];
  }

  private async readJsonFile(filePath: string): Promise<any[]> {
    const jsonStream = createReadStream(filePath, { encoding: 'utf-8' });

    const chunks: string[] = [];

    for await (const chunk of jsonStream) {
      chunks.push(chunk);
    }

    const fullContent = chunks.join('');
    const json = JSON.parse(fullContent);

    if (!Array.isArray(json)) {
      throw new Error('JSON file must contain a top-level array');
    }

    return json;
  }

  private arrayifyObject(obj: Record<string, any>): any {
    return Object.values(obj).map((value) => String(value));
  }

  private cleanObject(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      const cleanedKey = key.replaceAll('"', '');
      const value = obj[key];
      result[cleanedKey] =
        typeof value === 'string' ? value.replaceAll('"', '') : value;
    }
    return result;
  }
}