import { ApiError } from "../../utils/ApiError.js";
import { csvParserService } from "../../services/csv-parser.service.js";
import { crmMappingService } from "../../services/crm-mapping.service.js";

class ImportService {
  async importCsv(file?: Express.Multer.File) {
    if (!file) {
      throw new ApiError(400, "CSV file is required.");
    }

    if (file.size === 0) {
      throw new ApiError(400, "Uploaded CSV file is empty.");
    }

    const parsedCsv = await csvParserService.parse(file);

    const response = await crmMappingService.map(parsedCsv);

    return {
      response,
    };
  }
}

export const importService = new ImportService();