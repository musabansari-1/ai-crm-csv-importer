import type {
  CRMRecord,
  CRMStatus,
  DataSource,
  SkippedRecord,
} from "../types/crm.types.js";

const CRM_STATUSES = new Set<CRMStatus>([
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
]);

const DATA_SOURCES = new Set<DataSource>([
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
  "",
]);

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function asStatus(value: unknown): CRMStatus | "" {
  if (value == null || value === "") return "";
  const s = String(value);
  return CRM_STATUSES.has(s as CRMStatus) ? (s as CRMStatus) : "";
}

function asDataSource(value: unknown): DataSource {
  if (value == null || value === "") return "";
  const s = String(value);
  return DATA_SOURCES.has(s as DataSource) ? (s as DataSource) : "";
}

/** Map one LLM record object → frontend CRMRecord (strings only, no nulls). */
export function normalizeCRMRecord(raw: unknown): CRMRecord {
  const r =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    created_at: asString(r.created_at),
    name: asString(r.name),
    email: asString(r.email),
    country_code: asString(r.country_code),
    mobile_without_country_code: asString(r.mobile_without_country_code),
    company: asString(r.company),
    city: asString(r.city),
    state: asString(r.state),
    country: asString(r.country),
    lead_owner: asString(r.lead_owner),
    crm_status: asStatus(r.crm_status),
    crm_note: asString(r.crm_note),
    data_source: asDataSource(r.data_source),
    possession_time: asString(r.possession_time),
    description: asString(r.description),
  };
}

/**
 * Map LLM skipped entry → frontend SkippedRecord.
 * `rowOffset` = number of data rows before this batch (0-based).
 * LLM `_row_index` is 1-based within the batch.
 */
export function normalizeSkippedRecord(
  raw: unknown,
  headers: string[],
  rowOffset: number,
  fallbackIndex: number,
): SkippedRecord {
  const s =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const relative =
    typeof s._row_index === "number" && Number.isFinite(s._row_index)
      ? s._row_index
      : fallbackIndex + 1;

  // 1-based data-row number in the full CSV (row 1 = first data row)
  const row = rowOffset + relative;

  let rawMap: Record<string, string> = {};

  if (s.raw && typeof s.raw === "object" && !Array.isArray(s.raw)) {
    for (const [k, v] of Object.entries(s.raw as Record<string, unknown>)) {
      rawMap[k] = asString(v);
    }
  } else if (Array.isArray(s.raw_values)) {
    const values = s.raw_values as unknown[];
    rawMap = Object.fromEntries(
      headers.map((h, i) => [h, asString(values[i])]),
    );
  }

  return {
    row,
    reason: asString(s.reason) || "Skipped",
    raw: rawMap,
  };
}

export function parseLlmBatchJson(response: string): {
  records: unknown[];
  skipped: unknown[];
} {
  const trimmed = response.trim();
  // Strip accidental markdown fences
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(unfenced) as {
    records?: unknown;
    skipped?: unknown;
  };

  return {
    records: Array.isArray(parsed.records) ? parsed.records : [],
    skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
  };
}
