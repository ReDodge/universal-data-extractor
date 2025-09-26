import { extract, extractWithDetails, extractAsStream, UniversalDataExtractor } from '../extractor';
import * as path from 'path';

const fixturesPath = path.join(__dirname, 'fixtures');

describe('UniversalDataExtractor', () => {
  describe('extract', () => {
    it('should extract CSV data', async () => {
      const data = await extract(path.join(fixturesPath, 'test.csv'));
      
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveProperty('name', 'Alice');
      expect(data[0]).toHaveProperty('age', '30');
      expect(data[0]).toHaveProperty('city', 'Paris');
    });

    it('should extract JSON data', async () => {
      const data = await extract(path.join(fixturesPath, 'test.json'));
      
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveProperty('name', 'Alice');
      expect(data[0]).toHaveProperty('age', 30);
      expect(data[0]).toHaveProperty('city', 'Paris');
    });

    it('should limit extracted rows with quantity option', async () => {
      const data = await extract(path.join(fixturesPath, 'test.csv'), { quantity: 2 });
      
      expect(data).toHaveLength(2);
    });

    it('should throw error for unknown file format', async () => {
      await expect(extract('/path/to/file.unknown')).rejects.toThrow('Unknown file format');
    });
  });

  describe('extractWithDetails', () => {
    it('should provide detailed extraction results for CSV', async () => {
      const result = await extractWithDetails(path.join(fixturesPath, 'test.csv'));
      
      expect(result.data).toHaveLength(3);
      expect(result.format).toBe('csv');
      expect(result.rowCount).toBe(3);
      expect(result.delimiter).toBeDefined();
    });

    it('should provide detailed extraction results for JSON', async () => {
      const result = await extractWithDetails(path.join(fixturesPath, 'test.json'));
      
      expect(result.data).toHaveLength(3);
      expect(result.format).toBe('json');
      expect(result.rowCount).toBe(3);
    });
  });

  describe('extractAsStream', () => {
    it('should extract CSV data as stream', async () => {
      const result = await extractAsStream(path.join(fixturesPath, 'test.csv'));
      
      expect(result.readable).toBeDefined();
      expect(result.transforms).toBeDefined();
      expect(result.format).toBe('csv');
      expect(result.delimiter).toBeDefined();

      // Test stream data
      const data: any[] = [];
      result.readable.on('data', (chunk) => {
        data.push(chunk);
      });

      await new Promise<void>((resolve) => {
        result.readable.on('end', () => resolve());
      });

      expect(data.length).toBeGreaterThan(0);
    });

    it('should extract JSON data as stream', async () => {
      const result = await extractAsStream(path.join(fixturesPath, 'test.json'));
      
      expect(result.readable).toBeDefined();
      expect(result.format).toBe('json');

      // Test stream data
      const data: any[] = [];
      for await (const chunk of result.readable) {
        data.push(chunk);
      }

      expect(data).toHaveLength(3);
    });
  });

  describe('UniversalDataExtractor class', () => {
    it('should work with class instantiation', async () => {
      const extractor = new UniversalDataExtractor();
      const data = await extractor.extract(path.join(fixturesPath, 'test.csv'));
      
      expect(data).toHaveLength(3);
    });
  });

  describe('options', () => {
    it('should respect noHeaders option', async () => {
      const data = await extract(path.join(fixturesPath, 'test.csv'), { noHeaders: true });
      
      expect(data[0]).toHaveProperty('column_1');
      expect(data[0]).toHaveProperty('column_2');
      expect(data[0]).toHaveProperty('column_3');
    });

    it('should respect custom delimiter', async () => {
      const data = await extract(path.join(fixturesPath, 'test.csv'), { delimiter: ',' });
      
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveProperty('name');
    });
  });
});