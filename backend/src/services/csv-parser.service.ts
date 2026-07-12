import { parse } from "csv-parse";
import type { ParsedCsv } from "../types/csv.types.js";

class CsvParserService {
  async parse(file: Express.Multer.File): Promise<ParsedCsv> {
    return new Promise((resolve, reject) => {
      parse(
        file.buffer,
        {
          columns: false,
          skip_empty_lines: true,
          trim: true,
        },
        (error, parsedRows: string[][]) => {
          if (error) {
            reject(error);
            return;
          }

          if (parsedRows.length === 0) {
            resolve({
              headers: [],
              rows: [],
            });
            return;
          }

          const [headers, ...rows] =
            parsedRows as [string[], ...string[][]];

          resolve({
            headers,
            rows,
          });
        }
      );
    });
  }
}

export const csvParserService = new CsvParserService();