export type CsvHeader = readonly string[];
export type CsvData<T extends CsvHeader> = Record<T[number], any>;

export interface FileLoggerConfig {
  name: string;
  csvHeader: CsvHeader;
}
export type LogCsv<T extends CsvHeader> = {
  type: 'csv';
  csvData: CsvData<T>;
  csvFilePath: string;
};
export type LogCsvAndRaw<T extends CsvHeader> = {
  type: 'csvAndRaw';
  csvData: CsvData<T>;
  csvFilePath: string;
  data: any;
  rawFilePath?: string;
};
export type LogData<T extends CsvHeader> = LogCsv<T> | LogCsvAndRaw<T>;

export const defaultConfig: FileLoggerConfig = {
  name: 'logger',
  csvHeader: ['timestamp'] as const,
};
