import { NextResponse } from "next/server";

export const revalidate = 21600;

type EconomicIndicator = {
  id: string;
  label: string;
  naics: string;
  employment: number | null;
  establishments: number | null;
  employmentGrowth: number | null;
  establishmentGrowth: number | null;
  averageWeeklyWage: number | null;
  period: string;
  status: "live" | "unavailable";
};

const qcewSegments = [
  { id: "construction", label: "Construction", naics: "23", fileCode: "23" },
  { id: "manufacturing", label: "Manufacturing", naics: "31-33", fileCode: "31_33" },
  { id: "oil-gas", label: "Oil & gas extraction", naics: "211", fileCode: "211" },
  { id: "electric-power", label: "Electric power", naics: "2211", fileCode: "2211" },
  { id: "water", label: "Water, sewage & other systems", naics: "2213", fileCode: "2213" },
  { id: "waste", label: "Waste management & remediation", naics: "562", fileCode: "562" },
];

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
    label: segment.label,
    naics: segment.naics,
    employment: numeric(nationalPrivate.month3_emplvl),
    establishments: numeric(nationalPrivate.qtrly_estabs),
    employmentGrowth: numeric(nationalPrivate.oty_month3_emplvl_pct_chg),
    establishmentGrowth: numeric(nationalPrivate.oty_qtrly_estabs_pct_chg),
    averageWeeklyWage: numeric(nationalPrivate.avg_wkly_wage),
    period: `${year} Q${quarter}`,
    status: "live",
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
    label: qcewSegments[index].label,
    naics: qcewSegments[index].naics,
    employment: null,
    establishments: null,
    employmentGrowth: null,
    establishmentGrowth: null,
    averageWeeklyWage: null,
    period: "2025 Q1",
    status: "unavailable" as const,
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
