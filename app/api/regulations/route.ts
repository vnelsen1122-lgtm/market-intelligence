import { NextResponse } from "next/server";

const FEDERAL_REGISTER_ENDPOINT = "https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=occupational-safety-and-health-administration&order=newest&per_page=8";

type FederalRegisterDocument = {
  abstract?: string | null;
  agencies?: Array<{ name?: string }>;
  document_number: string;
  html_url: string;
  publication_date: string;
  title: string;
};

export async function GET() {
  const retrievedAt = new Date().toISOString();

  try {
    const response = await fetch(FEDERAL_REGISTER_ENDPOINT, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error(`Federal Register responded with ${response.status}`);

    const payload = await response.json() as { results?: FederalRegisterDocument[] };
    const records = (payload.results ?? []).map((document) => ({
      documentNumber: document.document_number,
      title: document.title,
      abstract: document.abstract ?? "",
      publicationDate: document.publication_date,
      htmlUrl: document.html_url,
      agencies: (document.agencies ?? []).map((agency) => agency.name).filter((name): name is string => Boolean(name)),
    }));

    return NextResponse.json({
      status: "live",
      source: "Federal Register API",
      sourceUrl: FEDERAL_REGISTER_ENDPOINT,
      retrievedAt,
      records,
    });
  } catch {
    return NextResponse.json({
      status: "degraded",
      source: "Federal Register API",
      sourceUrl: FEDERAL_REGISTER_ENDPOINT,
      retrievedAt,
      records: [],
    });
  }
}
