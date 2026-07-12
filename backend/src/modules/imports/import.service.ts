import { ApiError } from "../../utils/ApiError.js";
import { csvParserService } from "../../services/csv-parser.service.js";

class ImportService {
  async importCsv(file?: Express.Multer.File) {
    if (!file) {
      throw new ApiError(400, "CSV file is required.");
    }

    if (file.size === 0) {
      throw new ApiError(400, "Uploaded CSV file is empty.");
    }

    const parsedCsv = await csvParserService.parse(file);

    return {
      totalRecords: parsedCsv.rows.length,
      headers: parsedCsv.headers,
      rows: parsedCsv.rows,
    };
  }
}

export const importService = new ImportService();