import { NextResponse } from "next/server";

const FEDERAL_REGISTER_ENDPOINT = "https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=occupational-safety-and-health-administration&conditions%5Bagencies%5D%5B%5D=environmental-protection-agency&conditions%5Bagencies%5D%5B%5D=mine-safety-and-health-administration&conditions%5Bagencies%5D%5B%5D=pipeline-and-hazardous-materials-safety-administration&order=newest&per_page=30";

type FederalRegisterDocument = {
  abstract?: string | null;
  agencies?: Array<{ name?: string }>;
  cfr_references?: Array<{ title?: number; part?: number }>;
  comments_close_on?: string | null;
  document_number: string;
  docket_ids?: string[];
  effective_on?: string | null;
  html_url: string;
  publication_date: string;
  regulation_id_numbers?: string[];
  title: string;
  type?: string;
};

function classifyMarkets(text: string) {
  const normalized = text.toLowerCase();
  const groups = [
    { market: "Construction", terms: ["construction", "contractor", "excavation", "crane", "silica", "fall protection"] },
    { market: "Manufacturing", terms: ["manufactur", "chemical", "machine", "process safety", "hazard communication"] },
    { market: "Energy & Utilities", terms: ["energy", "electric", "utility", "oil", "gas", "pipeline", "mine", "mining"] },
    { market: "Waste & Water", terms: ["waste", "water", "wastewater", "discharge", "hazardous substance"] },
  ];
  const matches = groups.filter((group) => group.terms.some((term) => normalized.includes(term))).map((group) => group.market);
  return matches.length ? matches : ["Applicability review required"];
}

function classifyTopics(text: string) {
  const normalized = text.toLowerCase();
  const topics = [
    { topic: "Worker safety", terms: ["occupational safety", "workplace", "worker", "injury", "protective equipment"] },
    { topic: "Environmental compliance", terms: ["air", "water", "waste", "emission", "discharge", "environmental"] },
    { topic: "Chemical management", terms: ["chemical", "toxic", "hazard communication", "substance"] },
    { topic: "Reporting & recordkeeping", terms: ["reporting", "recordkeeping", "information collection", "paperwork"] },
    { topic: "Operational safety", terms: ["process safety", "pipeline", "mine", "electrical", "equipment"] },
  ];
  const matches = topics.filter((group) => group.terms.some((term) => normalized.includes(term))).map((group) => group.topic);
  return matches.length ? matches : ["Topic review required"];
}

function lifecycle(document: FederalRegisterDocument) {
  const type = document.type ?? "Unclassified document";
  if (type.toLowerCase().includes("proposed")) return { stage: "Proposed", milestone: document.comments_close_on ?? "Comment deadline not supplied" };
  if (type.toLowerCase().includes("rule")) return { stage: "Final / interim rule", milestone: document.effective_on ?? "Effective date not supplied" };
  if (type.toLowerCase().includes("notice")) return { stage: "Notice", milestone: document.comments_close_on ?? document.effective_on ?? "Review date not supplied" };
  return { stage: type, milestone: document.effective_on ?? document.comments_close_on ?? "Lifecycle date not supplied" };
}

export async function GET() {
  const retrievedAt = new Date().toISOString();

  try {
    const response = await fetch(FEDERAL_REGISTER_ENDPOINT, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error(`Federal Register responded with ${response.status}`);

    const payload = await response.json() as { results?: FederalRegisterDocument[] };
    const records = (payload.results ?? []).map((document) => {
      const text = `${document.title} ${document.abstract ?? ""}`;
      const documentLifecycle = lifecycle(document);
      return {
        documentNumber: document.document_number,
        title: document.title,
        abstract: document.abstract ?? "",
        publicationDate: document.publication_date,
        htmlUrl: document.html_url,
        agencies: (document.agencies ?? []).map((agency) => agency.name).filter((name): name is string => Boolean(name)),
        documentType: document.type ?? "Unclassified document",
        lifecycleStage: documentLifecycle.stage,
        lifecycleMilestone: documentLifecycle.milestone,
        effectiveOn: document.effective_on ?? null,
        commentsCloseOn: document.comments_close_on ?? null,
        docketIds: document.docket_ids ?? [],
        regulationIdNumbers: document.regulation_id_numbers ?? [],
        cfrReferences: (document.cfr_references ?? []).map((reference) => `${reference.title ?? "?"} CFR ${reference.part ?? "?"}`),
        markets: classifyMarkets(text),
        topics: classifyTopics(text),
        applicabilityStatus: "Machine-tagged; human review required",
      };
    });

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
