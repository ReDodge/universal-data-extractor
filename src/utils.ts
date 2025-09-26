import * as path from 'path';
import { SupportedFormat, FileInfo } from './types';

export class FileUtils {
  static getFileInfo(filePath: string): FileInfo | null {
    const ext = path.extname(filePath).toLowerCase().substring(1);
    
    const formatMap: Record<string, SupportedFormat> = {
      'csv': 'csv',
      'txt': 'txt',
      'xlsx': 'xlsx',
      'xls': 'xls',
      'json': 'json',
      'zip': 'zip',
    };

    const type = formatMap[ext];
    if (!type) {
      return null;
    }

    return {
      extension: ext,
      type,
      isArchive: ext === 'zip',
    };
  }

  static getExtension(filename: string): string {
    return path.extname(filename).toLowerCase().substring(1);
  }
}