import { ApiError } from "../../utils/ApiError.js";
import { csvParserService } from "../../services/csv-parser.service.js";
import { crmMappingService } from "../../services/crm-mapping.service.js";
import type {
  ImportResult,
  ImportStreamHandlers,
} from "../../types/crm.types.js";

class ImportService {
  private assertFile(file?: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new ApiError(400, "CSV file is required.");
    }
    if (file.size === 0) {
      throw new ApiError(400, "Uploaded CSV file is empty.");
    }
    return file;
  }

  async importCsv(file?: Express.Multer.File): Promise<ImportResult> {
    const valid = this.assertFile(file);
    const parsedCsv = await csvParserService.parse(valid);
    return crmMappingService.map(parsedCsv);
  }

  async importCsvStream(
    file: Express.Multer.File | undefined,
    handlers: ImportStreamHandlers,
  ): Promise<void> {
    const valid = this.assertFile(file);
    const parsedCsv = await csvParserService.parse(valid);
    await crmMappingService.mapBatches(parsedCsv, handlers);
  }
}

export const importService = new ImportService();
