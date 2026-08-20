import type { MarketSegment } from "./market-data";

export type EconomicCoverageRecord = {
  segmentId: string;
  naics: string;
  period: string;
  status: "live" | "unavailable";
  geography: string;
  ownership: string;
  coverageLevel: "Exact NAICS" | "NAICS proxy";
  denominatorUnit: string;
};

export type ComparisonCheck = {
  factor: string;
  numerator: string;
  denominator: string;
  source: string;
  period: string;
  geography: string;
  status: "Eligible" | "Partial" | "Blocked";
  reason: string;
};

function economicCheck(
  left: MarketSegment,
  right: MarketSegment,
  geography: string,
  records: EconomicCoverageRecord[],
): ComparisonCheck {
  const leftRecord = records.find((record) => record.segmentId === left.id);
  const rightRecord = records.find((record) => record.segmentId === right.id);
  const bothLive = leftRecord?.status === "live" && rightRecord?.status === "live";
  const matchedPeriod = bothLive && leftRecord?.period === rightRecord?.period;
  const matchedScope = geography === "United States"
    && leftRecord?.geography === "United States"
    && rightRecord?.geography === "United States"
    && leftRecord?.ownership === rightRecord?.ownership;
  const exactCoverage = leftRecord?.coverageLevel === "Exact NAICS" && rightRecord?.coverageLevel === "Exact NAICS";

  return {
    factor: "Economic scale & growth",
    numerator: "Employment, establishments, wages, and year-over-year change",
    denominator: "QCEW covered employment and establishments",
    source: "BLS QCEW",
    period: matchedPeriod ? leftRecord?.period ?? "Matched quarter required" : "Matched quarter required",
    geography,
    status: bothLive && matchedPeriod && matchedScope && exactCoverage ? "Eligible" : bothLive && matchedPeriod && matchedScope ? "Partial" : "Blocked",
    reason: !bothLive
      ? "One or both segment slices are unavailable."
      : !matchedPeriod
        ? "The two QCEW slices do not share a reporting period."
        : !matchedScope
          ? "The selected geography does not match the national private-sector feed."
          : !exactCoverage
            ? "At least one segment uses a broader NAICS proxy; directional context only."
            : "Matched national private-sector slices are available.",
  };
}

export function buildComparisonChecks(
  left: MarketSegment,
  right: MarketSegment,
  geography: string,
  economicRecords: EconomicCoverageRecord[],
): ComparisonCheck[] {
  return [
    economicCheck(left, right, geography, economicRecords),
    {
      factor: "Enforcement rate",
      numerator: "Inspections, citations, penalties, and repeat actions",
      denominator: "Establishments or covered employment",
      source: "OSHA / State Plans + BLS QCEW",
      period: "Matched annual or rolling 12-month window",
      geography,
      status: "Blocked",
      reason: "Inspection coverage and State Plan completeness are not yet matched across both segments.",
    },
    {
      factor: "Injury density",
      numerator: "Recordable, severe, and fatal injury cases",
      denominator: "Hours worked, FTEs, or covered employment",
      source: "OSHA ITA / Severe Injury + BLS SOII or QCEW",
      period: "Matched calendar year",
      geography,
      status: "Blocked",
      reason: "Case records are not yet joined to a common workforce or hours-worked denominator.",
    },
    {
      factor: "Regulatory density",
      numerator: "Applicable active requirements and material rule changes",
      denominator: "Establishments, facilities, or regulated operations",
      source: "eCFR / Federal Register / state agencies",
      period: "Effective-date snapshot",
      geography,
      status: "Blocked",
      reason: "Applicability review and state-level requirement coverage are incomplete.",
    },
  ];
}
