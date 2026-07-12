export type CsvHeader = string;

export type CsvRow = string[];

export interface ParsedCsv {
  headers: CsvHeader[];
  rows: CsvRow[];
}