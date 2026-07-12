import type { ParsedCsv } from "../types/csv.types.js";

class CrmMappingService {
  async map(parsedCsv: ParsedCsv) {
    console.log(parsedCsv);

    // TODO
    // 1. Build prompt
    // 2. Call LLM
    // 3. Parse response
    // 4. Validate
    // 5. Return CRM records

    return [];
  }
}

export const crmMappingService = new CrmMappingService();