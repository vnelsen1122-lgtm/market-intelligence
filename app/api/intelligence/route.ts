import { NextResponse } from "next/server";

export const revalidate = 21600;

type EconomicIndicator = {
  id: string;
  segmentId: string;
  label: string;
  naics: string;
  employment: number | null;
  establishments: number | null;
  employmentGrowth: number | null;
  establishmentGrowth: number | null;
  averageWeeklyWage: number | null;
  period: string;
  status: "live" | "unavailable";
  geography: "United States";
  ownership: "Private sector";
  coverageLevel: "Exact NAICS" | "NAICS proxy";
  denominatorUnit: "Covered employment and establishments";
};

const qcewSegments = [
  { id: "construction-commercial", segmentId: "construction-commercial", label: "Commercial & institutional construction", naics: "236220", fileCode: "236220", coverageLevel: "Exact NAICS" },
  { id: "construction-infrastructure", segmentId: "construction-infrastructure", label: "Heavy civil & infrastructure", naics: "237", fileCode: "237", coverageLevel: "NAICS proxy" },
  { id: "construction-data-centers", segmentId: "construction-data-centers", label: "Data center construction", naics: "236220", fileCode: "236220", coverageLevel: "NAICS proxy" },
  { id: "construction-industrial", segmentId: "construction-industrial", label: "Industrial building construction", naics: "236210", fileCode: "236210", coverageLevel: "Exact NAICS" },
  { id: "construction-concrete", segmentId: "construction-concrete", label: "Poured concrete structure contractors", naics: "238110", fileCode: "238110", coverageLevel: "Exact NAICS" },
  { id: "construction-electrical", segmentId: "construction-electrical", label: "Electrical contractors", naics: "238210", fileCode: "238210", coverageLevel: "Exact NAICS" },
  { id: "construction-roofing", segmentId: "construction-roofing", label: "Roofing contractors", naics: "238160", fileCode: "238160", coverageLevel: "Exact NAICS" },
  { id: "manufacturing-durable", segmentId: "manufacturing-durable", label: "Durable goods manufacturing", naics: "31-33", fileCode: "31_33", coverageLevel: "NAICS proxy" },
  { id: "manufacturing-chemicals", segmentId: "manufacturing-chemicals", label: "Chemical manufacturing", naics: "325", fileCode: "325", coverageLevel: "Exact NAICS" },
  { id: "manufacturing-food", segmentId: "manufacturing-food", label: "Food manufacturing", naics: "311", fileCode: "311", coverageLevel: "Exact NAICS" },
  { id: "manufacturing-primary-metals", segmentId: "manufacturing-primary-metals", label: "Primary metal manufacturing", naics: "331", fileCode: "331", coverageLevel: "Exact NAICS" },
  { id: "manufacturing-semiconductors", segmentId: "manufacturing-semiconductors", label: "Semiconductor manufacturing", naics: "334413", fileCode: "334413", coverageLevel: "Exact NAICS" },
  { id: "manufacturing-refining", segmentId: "manufacturing-refining", label: "Petroleum refineries", naics: "324110", fileCode: "324110", coverageLevel: "Exact NAICS" },
  { id: "energy-oil-gas", segmentId: "energy-oil-gas", label: "Oil & gas operations", naics: "211", fileCode: "211", coverageLevel: "NAICS proxy" },
  { id: "energy-oil-extraction", segmentId: "energy-oil-extraction", label: "Crude petroleum extraction", naics: "211120", fileCode: "211120", coverageLevel: "Exact NAICS" },
  { id: "energy-well-drilling", segmentId: "energy-well-drilling", label: "Drilling oil and gas wells", naics: "213111", fileCode: "213111", coverageLevel: "Exact NAICS" },
  { id: "energy-oil-support", segmentId: "energy-oil-support", label: "Support activities for oil & gas", naics: "213112", fileCode: "213112", coverageLevel: "Exact NAICS" },
  { id: "energy-renewables", segmentId: "energy-renewables", label: "Renewable power construction & operations", naics: "221114", fileCode: "221114", coverageLevel: "NAICS proxy" },
  { id: "utilities-generation", segmentId: "utilities-generation", label: "Electric power generation", naics: "22111", fileCode: "22111", coverageLevel: "NAICS proxy" },
  { id: "utilities-electric", segmentId: "utilities-electric", label: "Electric power transmission & distribution", naics: "22112", fileCode: "22112", coverageLevel: "Exact NAICS" },
  { id: "waste-solid", segmentId: "waste-solid", label: "Solid waste collection & disposal", naics: "5621", fileCode: "5621", coverageLevel: "NAICS proxy" },
  { id: "waste-hazardous", segmentId: "waste-hazardous", label: "Waste treatment & disposal", naics: "5622", fileCode: "5622", coverageLevel: "NAICS proxy" },
  { id: "waste-remediation", segmentId: "waste-remediation", label: "Remediation services", naics: "562910", fileCode: "562910", coverageLevel: "Exact NAICS" },
  { id: "waste-material-recovery", segmentId: "waste-material-recovery", label: "Materials recovery facilities", naics: "562920", fileCode: "562920", coverageLevel: "Exact NAICS" },
  { id: "water-utilities", segmentId: "water-utilities", label: "Water, sewage & other systems", naics: "2213", fileCode: "2213", coverageLevel: "Exact NAICS" },
] as const;

function parseCsvRow(row: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"' && row[index + 1] === '"' && quoted) {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

function numeric(value: string | undefined) {
  if (!value || value === "N") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchQcew(segment: typeof qcewSegments[number]): Promise<EconomicIndicator> {
  const year = 2025;
  const quarter = 1;
  const url = `https://data.bls.gov/cew/data/api/${year}/${quarter}/industry/${segment.fileCode}.csv`;
  const response = await fetch(url, { next: { revalidate } });
  if (!response.ok) throw new Error(`QCEW ${response.status}`);
  const rows = (await response.text()).split(/\r?\n/).filter(Boolean);
  const headers = parseCsvRow(rows[0]).map((header) => header.replace(/^"|"$/g, ""));
  const records = rows.slice(1).map((row) => {
    const values = parseCsvRow(row);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
  const nationalPrivate = records.find((record) => record.area_fips === "US000" && record.own_code === "5") ?? records.find((record) => record.area_fips === "US000");
  if (!nationalPrivate) throw new Error("National QCEW row unavailable");
  return {
    id: segment.id,
    segmentId: segment.segmentId,
    label: segment.label,
    naics: segment.naics,
    employment: numeric(nationalPrivate.month3_emplvl),
    establishments: numeric(nationalPrivate.qtrly_estabs),
    employmentGrowth: numeric(nationalPrivate.oty_month3_emplvl_pct_chg),
    establishmentGrowth: numeric(nationalPrivate.oty_qtrly_estabs_pct_chg),
    averageWeeklyWage: numeric(nationalPrivate.avg_wkly_wage),
    period: `${year} Q${quarter}`,
    status: "live",
    geography: "United States",
    ownership: "Private sector",
    coverageLevel: segment.coverageLevel,
    denominatorUnit: "Covered employment and establishments",
  };
}

function classifyVerticals(text: string) {
  const normalized = text.toLowerCase();
  const matches = [
    { vertical: "Construction", terms: ["construction", "contractor", "jobsite", "excavation", "crane"] },
    { vertical: "Manufacturing", terms: ["manufactur", "chemical", "machine", "plant", "process safety"] },
    { vertical: "Energy & Utilities", terms: ["energy", "utility", "electric", "oil", "gas", "pipeline", "renewable"] },
    { vertical: "Waste & Water", terms: ["waste", "water", "wastewater", "discharge", "hazardous material"] },
  ].filter((group) => group.terms.some((term) => normalized.includes(term))).map((group) => group.vertical);
  return matches.length ? matches : ["Applicability review required"];
}

async function fetchRegulatorySignals() {
  const after = "2025-08-19";
  const url = `https://www.federalregister.gov/api/v1/documents.json?per_page=40&order=newest&conditions%5Bpublication_date%5D%5Bgte%5D=${after}&conditions%5Bagencies%5D%5B%5D=occupational-safety-and-health-administration&conditions%5Bagencies%5D%5B%5D=environmental-protection-agency&conditions%5Bagencies%5D%5B%5D=mine-safety-and-health-administration`;
  const response = await fetch(url, { next: { revalidate } });
  if (!response.ok) throw new Error(`Federal Register ${response.status}`);
  const payload = await response.json();
  return (payload.results ?? []).map((record: { document_number: string; title: string; abstract?: string; publication_date: string; html_url: string; type: string; agencies?: Array<{ name: string }> }) => ({
    id: record.document_number,
    title: record.title,
    summary: record.abstract ?? "Applicability review required from the primary document.",
    published: record.publication_date,
    url: record.html_url,
    documentType: record.type,
    agencies: (record.agencies ?? []).map((agency) => agency.name),
    verticals: classifyVerticals(`${record.title} ${record.abstract ?? ""}`),
    reliability: "Verified Fact",
    applicabilityStatus: "Machine-tagged; human review required",
  }));
}

export async function GET() {
  const retrievedAt = new Date().toISOString();
  const [economicResults, regulatoryResult] = await Promise.all([
    Promise.allSettled(qcewSegments.map(fetchQcew)),
    fetchRegulatorySignals().then((records) => ({ status: "live" as const, records })).catch(() => ({ status: "degraded" as const, records: [] })),
  ]);
  const economic = economicResults.map((result, index) => result.status === "fulfilled" ? result.value : ({
    id: qcewSegments[index].id,
    segmentId: qcewSegments[index].segmentId,
    label: qcewSegments[index].label,
    naics: qcewSegments[index].naics,
    employment: null,
    establishments: null,
    employmentGrowth: null,
    establishmentGrowth: null,
    averageWeeklyWage: null,
    period: "2025 Q1",
    status: "unavailable" as const,
    geography: "United States" as const,
    ownership: "Private sector" as const,
    coverageLevel: qcewSegments[index].coverageLevel,
    denominatorUnit: "Covered employment and establishments" as const,
  }));
  return NextResponse.json({
    retrievedAt,
    economic: { status: economic.some((item) => item.status === "live") ? "live" : "degraded", source: "BLS QCEW", records: economic },
    regulatory: { ...regulatoryResult, source: "Federal Register" },
    injury: {
      status: "bulk-refresh",
      sources: [
        { name: "OSHA ITA Summary", history: "2016-present", linkage: "establishment_id", url: "https://www.osha.gov/itadata" },
        { name: "OSHA ITA Case Detail", history: "2023-present", linkage: "establishment_id", url: "https://www.osha.gov/itadata" },
        { name: "OSHA Severe Injury Reports", history: "2015-present", linkage: "NAICS + establishment + date", url: "https://www.osha.gov/severeinjury" },
      ],
      publicationRule: "Bulk records remain quarantined until schema, deduplication, geography, denominator, and source checks pass.",
    },
  });
}
