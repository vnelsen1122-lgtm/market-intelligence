import { NextRequest, NextResponse } from "next/server";
import { qcewSegments } from "../intelligence/route";

export const revalidate = 21600;

function parseCsvRow(row: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"' && row[index + 1] === '"' && quoted) { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { values.push(value.trim()); value = ""; }
    else value += character;
  }
  values.push(value.trim());
  return values;
}

function numeric(value: string | undefined) {
  if (!value || value === "N") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchQcewDetail(fileCode: string) {
  const year = 2025;
  const quarter = 1;
  const url = `https://data.bls.gov/cew/data/api/${year}/${quarter}/industry/${fileCode}.csv`;
  const response = await fetch(url, { next: { revalidate } });
  if (!response.ok) throw new Error(`QCEW ${response.status}`);
  const rows = (await response.text()).split(/\r?\n/).filter(Boolean);
  const headers = parseCsvRow(rows[0]).map((header) => header.replace(/^"|"$/g, ""));
  const records = rows.slice(1).map((row) => {
    const values = parseCsvRow(row);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
  const states = records
    .filter((record) => record.own_code === "5" && /^\d{2}000$/.test(record.area_fips) && numeric(record.month3_emplvl))
    .map((record) => ({
      fips: record.area_fips.slice(0, 2),
      state: record.area_title.replace(/ -- Statewide$/, ""),
      employment: numeric(record.month3_emplvl) ?? 0,
      establishments: numeric(record.qtrly_estabs) ?? 0,
      employmentGrowth: numeric(record.oty_month3_emplvl_pct_chg),
      averageWeeklyWage: numeric(record.avg_wkly_wage),
      locationQuotient: numeric(record.lq_month3_emplvl),
    }))
    .sort((left, right) => right.employment - left.employment);
  return { sourceUrl: url, period: `${year} Q${quarter}`, states };
}

async function fetchBusinessSizes(naics: string) {
  if (!/^\d{2,6}$/.test(naics)) return { status: "unavailable" as const, rows: [] };
  const url = `https://api.census.gov/data/2023/cbp?get=NAME,EMP,ESTAB,EMPSZES,EMPSZES_LABEL&for=us:*&NAICS2017=${naics}&LFO=001`;
  const response = await fetch(url, { next: { revalidate } });
  if (!response.ok) throw new Error(`CBP ${response.status}`);
  const payload = await response.json() as string[][];
  const [headers, ...values] = payload;
  const rows = values.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])))
    .filter((row) => !/All establishments/i.test(row.EMPSZES_LABEL ?? ""))
    .map((row) => ({ label: row.EMPSZES_LABEL, establishments: numeric(row.ESTAB) ?? 0, employment: numeric(row.EMP) }))
    .filter((row) => row.establishments > 0);
  return { status: "live" as const, sourceUrl: url, period: "2023", rows };
}

export async function GET(request: NextRequest) {
  const segmentId = request.nextUrl.searchParams.get("segment") ?? qcewSegments[0].segmentId;
  const segment = qcewSegments.find((item) => item.segmentId === segmentId) ?? qcewSegments[0];
  const [geography, sizes] = await Promise.all([
    fetchQcewDetail(segment.fileCode).catch(() => ({ sourceUrl: "https://www.bls.gov/cew/", period: "Unavailable", states: [] })),
    fetchBusinessSizes(segment.naics).catch(() => ({ status: "unavailable" as const, rows: [] })),
  ]);
  return NextResponse.json({
    retrievedAt: new Date().toISOString(),
    segment: { id: segment.segmentId, label: segment.label, naics: segment.naics, coverageLevel: segment.coverageLevel },
    geography,
    sizes,
    sources: [
      { name: "BLS QCEW", use: "Quarterly employment, establishments, wages, growth and location quotient", url: "https://www.bls.gov/cew/" },
      { name: "Census County Business Patterns", use: "Employer counts, payroll, establishment size and detailed geography", url: "https://www.census.gov/programs-surveys/cbp.html" },
      { name: "Census QWI / BDS", use: "Hiring, separations, job creation, business births and deaths", url: "https://www.census.gov/topics/business-economy/dynamics/data/api.html" },
      { name: "BLS OEWS", use: "EHS occupation employment and wage intensity by industry and geography", url: "https://www.bls.gov/oes/" },
      { name: "BEA GDP by Industry", use: "Output, value added and industry growth", url: "https://www.bea.gov/data/gdp/gdp-industry" },
    ],
  });
}
