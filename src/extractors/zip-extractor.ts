import AdmZip = require('adm-zip');
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { Readable, Transform } from 'stream';
import { Extractor, ExtractorOptions } from '../types';
import { UniversalDataExtractor } from '../extractor';

export class ZipExtractor implements Extractor {
  private tempDir = path.join(process.cwd(), 'temp');

  async extract(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<Record<string, any>[]> {
    const extractedFile = await this.extractZip(filePath, options.zipTarget);
    
    try {
      // Use the main extractor to process the extracted file
      const extractor = new UniversalDataExtractor();
      return await extractor.extract(extractedFile, options);
    } finally {
      // Cleanup
      if (existsSync(extractedFile)) {
        unlinkSync(extractedFile);
      }
    }
  }

  async readAsStream(
    filePath: string,
    options: ExtractorOptions = {}
  ): Promise<[Readable, ...Transform[]]> {
    const extractedFile = await this.extractZip(filePath, options.zipTarget);
    
    // Use the main extractor to create stream
    const extractor = new UniversalDataExtractor();
    const result = await extractor.extractAsStream(extractedFile, options);
    
    // Add cleanup on stream end
    result.readable.on('end', () => {
      if (existsSync(extractedFile)) {
        unlinkSync(extractedFile);
      }
    });
    
    return [result.readable, ...result.transforms];
  }

  private async extractZip(zipPath: string, target?: string | number): Promise<string> {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    // Ensure temp directory exists
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }

    let targetEntry: any = null;

    if (typeof target === 'number') {
      targetEntry = entries[target] || null;
    } else if (typeof target === 'string') {
      targetEntry = entries.find((entry: any) => entry.entryName.includes(target)) || null;
    } else {
      targetEntry = entries.find((entry: any) => !entry.isDirectory) || null;
    }

    if (!targetEntry) {
      throw new Error('No valid file found in ZIP archive');
    }

    // Extract to temp file
    const tempFileName = `extracted_${Date.now()}_${targetEntry.name}`;
    const tempFilePath = path.join(this.tempDir, tempFileName);
    
    writeFileSync(tempFilePath, targetEntry.getData());
    
    return tempFilePath;
  }
}