import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  CsvData,
  CsvHeader,
  FileLoggerConfig,
  LogData,
  defaultConfig,
} from './logger.config';

@Injectable()
export class FileLoggerService {
  private readonly logDir = path.join(process.cwd(), 'logs');
  private config: FileLoggerConfig;

  constructor(config?: Partial<FileLoggerConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  async saveCSV(
    csvData: CsvData<typeof this.config.csvHeader>,
    csvFilePath: string,
    rawFilePath?: string,
  ) {
    const fullCsvPath = path.join(this.logDir, this.config.name, csvFilePath);
    const csvDir = path.dirname(fullCsvPath);

    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }

    if (!fs.existsSync(fullCsvPath)) {
      fs.writeFileSync(
        fullCsvPath,
        [...this.config.csvHeader, 'filePath'].join(',') + os.EOL
      );
    }

    const csv = {
      path: fullCsvPath,
      header: this.config.csvHeader,
    };

    const fullIndexData = {
      ...csvData,
      filePath: rawFilePath,
    };

    const values = [...csv.header, 'filePath'].map(key =>
      fullIndexData[key] !== undefined ? JSON.stringify(fullIndexData[key]) : ''
    );

    fs.appendFileSync(csv.path, values.join(',') + os.EOL, 'utf-8');
    return csv.path;
  }

  async saveRawData(data: any, filePath?: string) {
    const rawFileName = filePath || `log_${Date.now()}`;

    const fullRawFilePath = path.join(this.logDir, this.config.name, rawFileName);

    const hasExtension = path.extname(fullRawFilePath) !== '';
    const finalPath = hasExtension ? fullRawFilePath : `${fullRawFilePath}.json`;

    const rawFileDir = path.dirname(finalPath);

    if (!fs.existsSync(rawFileDir)) {
      fs.mkdirSync(rawFileDir, { recursive: true });
    }

    fs.writeFileSync(finalPath, JSON.stringify(data, null, 2), 'utf-8');
    return finalPath;
  }

  async save<TCsvHeader extends CsvHeader>(data: LogData<TCsvHeader>) {
    let _rawFilePath: string | undefined = undefined;
    if (data.type === 'csvAndRaw') {
      _rawFilePath = await this.saveRawData(data.data, data.rawFilePath);
    }
    const _csvFilePath = await this.saveCSV(data.csvData, data.csvFilePath, _rawFilePath);
    return {
      csvFilePath: _csvFilePath,
      rawFilePath: _rawFilePath,
    };
  }
}
