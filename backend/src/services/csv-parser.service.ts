import { parse } from "csv-parse";
import type { CsvRow } from "../types/csv.types.js";

class CsvParserService {
  async parse(file: Express.Multer.File): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      parse(
        file.buffer,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (error, records: CsvRow[]) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(records);
        }
      );
    });
  }
}

export const csvParserService = new CsvParserService();