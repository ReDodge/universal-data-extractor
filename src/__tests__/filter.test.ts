import { extract } from '../extractor';
import * as path from 'path';

const fixturesPath = path.join(__dirname, 'fixtures');

describe('Column filtering and mapping', () => {
  describe('columns option', () => {
    it('should extract only specified columns', async () => {
      const data = await extract(path.join(fixturesPath, 'test.csv'), {
        columns: ['name', 'age']
      });
      
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveProperty('name', 'Alice');
      expect(data[0]).toHaveProperty('age', '30');
      expect(data[0]).not.toHaveProperty('city');
    });
  });

  describe('columnMapping option', () => {
    it('should rename columns', async () => {
      const data = await extract(path.join(fixturesPath, 'test.csv'), {
        columnMapping: {
          'name': 'fullName',
          'age': 'years',
          'city': 'location'
        }
      });
      
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveProperty('fullName', 'Alice');
      expect(data[0]).toHaveProperty('years', '30');
      expect(data[0]).toHaveProperty('location', 'Paris');
      expect(data[0]).not.toHaveProperty('name');
      expect(data[0]).not.toHaveProperty('age');
      expect(data[0]).not.toHaveProperty('city');
    });
  });

  describe('combined options', () => {
    it('should filter and rename columns', async () => {
      const data = await extract(path.join(fixturesPath, 'test.csv'), {
        columns: ['name', 'city'],
        columnMapping: {
          'name': 'person',
          'city': 'location'
        }
      });
      
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveProperty('person', 'Alice');
      expect(data[0]).toHaveProperty('location', 'Paris');
      expect(data[0]).not.toHaveProperty('name');
      expect(data[0]).not.toHaveProperty('city');
      expect(data[0]).not.toHaveProperty('age');
    });
  });
});