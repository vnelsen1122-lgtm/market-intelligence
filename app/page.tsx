"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  Calculator,
  Check,
  ChevronRight,
  CircleDot,
  Database,
  Download,
  ExternalLink,
  Factory,
  FileCheck2,
  FileSearch,
  Filter,
  Globe2,
  HardHat,
  Info,
  Leaf,
  Network,
  PanelsTopLeft,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { buildComparisonChecks } from "./comparison-contracts";
import { competitors } from "./competitor-data";
import { changeContract, corporateSourceHierarchy, messagingTaxonomy, monitoringJobs } from "./corporate-data";
import { jurisdictionCounts, jurisdictions } from "./jurisdiction-data";
import { marketSegments, verticals, type MarketSegment } from "./market-data";
import { importContract, sourceRegistry } from "./source-registry";

const CompetitorWorkspace = dynamic(
  () => import("./competitor-workspace").then((module) => module.CompetitorWorkspace),
  {
    ssr: false,
    loading: () => <section className="panel loading-state">Loading the competitor intelligence suite…</section>,
  },
);

type Reliability = "Verified Fact" | "Company Statement" | "Analyst Inference" | "Source Structure";

type IntelligenceRecord = {
  id: string;
  domain: string;
  title: string;
  summary: string;
  industries: string[];
  geographies: string[];
  agencies: string[];
  entities: string[];
  reliability: Reliability;
  published: string;
  retrieved: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  evidence: string;
  methodology: string;
  related: string[];
};

type FeedResponse = {
  status: "live" | "degraded";
  retrievedAt: string;
  records: Array<{
    documentNumber: string;
    title: string;
    abstract: string;
    publicationDate: string;
    htmlUrl: string;
    agencies: string[];
    documentType: string;
    lifecycleStage: string;
    lifecycleMilestone: string;
    effectiveOn: string | null;
    commentsCloseOn: string | null;
    docketIds: string[];
    regulationIdNumbers: string[];
    cfrReferences: string[];
    markets: string[];
    topics: string[];
    applicabilityStatus: string;
  }>;
};

type FocusMode = "market" | "competitor";

type IntelligenceFeed = {
  retrievedAt: string;
  economic: {
    status: "live" | "degraded";
    source: string;
    records: Array<{ id: string; segmentId: string; label: string; naics: string; employment: number | null; establishments: number | null; employmentGrowth: number | null; establishmentGrowth: number | null; averageWeeklyWage: number | null; period: string; status: "live" | "unavailable"; geography: string; ownership: string; coverageLevel: "Exact NAICS" | "NAICS proxy"; denominatorUnit: string }>;
  };
  regulatory: {
    status: "live" | "degraded";
    source: string;
    records: Array<{ id: string; title: string; published: string; verticals: string[]; agencies: string[]; url: string; applicabilityStatus: string }>;
  };
  injury: {
    status: "bulk-refresh";
    sources: Array<{ name: string; history: string; linkage: string; url: string }>;
    publicationRule: string;
  };
};

const navigation = [
  { label: "Data Catalog", icon: Database },
  { label: "Markets", icon: Factory },
  { label: "Competitors", icon: Building2 },
  { label: "Regulations", icon: BookOpenCheck },
  { label: "Enforcement", icon: ShieldCheck },
  { label: "Injuries", icon: HardHat },
  { label: "Sustainability", icon: Leaf },
  { label: "Contractor Management", icon: Network },
  { label: "Corporate Activity", icon: Network },
  { label: "Signals", icon: Sparkles },
  { label: "Data Operations", icon: UploadCloud },
  { label: "Sources", icon: Database },
];

const domainCatalog = [
  { domain: "Markets", grain: "NAICS × geography × period", keys: "naics · area_fips · period", sources: "BLS QCEW · Census CBP/BDS · BEA", cadence: "Quarterly / annual", coverage: "Economic scale, growth, concentration" },
  { domain: "Competitors", grain: "Company × claim × source snapshot", keys: "company_id · canonical_url · retrieved_at", sources: "Official product, newsroom, help and release pages", cadence: "Daily / weekly", coverage: "Modules, messaging, industries, evidence changes" },
  { domain: "Regulations", grain: "Requirement × jurisdiction × effective period", keys: "document_number · CFR citation · jurisdiction", sources: "Federal Register · eCFR · state agencies", cadence: "Daily", coverage: "Lifecycle, applicability, obligation, affected market" },
  { domain: "Enforcement", grain: "Inspection or case × establishment", keys: "inspection_number · facility_id · agency", sources: "OSHA · MSHA · EPA ECHO · State Plans", cadence: "Daily / periodic", coverage: "Citations, standards, penalties, repeat activity" },
  { domain: "Injuries", grain: "Case × worker event × establishment", keys: "source_record_id · establishment_id · event_date", sources: "OSHA ITA · Severe Injury · Fatality · BLS SOII", cadence: "Annual / periodic", coverage: "Event, equipment, outcome, narrative, denominator" },
  { domain: "Sustainability", grain: "Facility or company × obligation × period", keys: "registry_id · program_id · company_id", sources: "EPA ECHO · reporting frameworks · official evidence", cadence: "Source dependent", coverage: "Environmental programs, reporting, vendor capability" },
  { domain: "Contractor Management", grain: "Buyer workflow × contractor population", keys: "company_id · site_id · contractor_id · workflow", sources: "Official evidence · regulation · controlled internal data", cadence: "Source dependent", coverage: "Prequalification, insurance, access, training, risk" },
  { domain: "Corporate Activity", grain: "Company event × announcement or filing", keys: "company_id · event_date · accession_or_url", sources: "SEC EDGAR · official releases · approved trade press", cadence: "Near real time / daily", coverage: "M&A, ownership, leadership, product and strategy" },
];

const sharedDimensions = [
  { name: "Industry", hierarchy: "NAICS 2 → 3 → 4 → 5 → 6", use: "Markets, enforcement, injuries, regulation, hiring" },
  { name: "Organization", hierarchy: "Parent → company → establishment → site", use: "Competitors, enforcement, injuries, facilities, customers" },
  { name: "Geography", hierarchy: "Country → state → county → metro → site", use: "Jurisdiction, economy, enforcement, injury density" },
  { name: "Time", hierarchy: "Event → effective → reporting → retrieved", use: "Point-in-time comparison and reproducibility" },
  { name: "Authority", hierarchy: "Federal → state → local → program", use: "Regulation, inspection, enforcement and coverage" },
  { name: "Product", hierarchy: "Domain → module → workflow → capability", use: "Competitor comparison and market relevance" },
];

const productDomains = {
  Sustainability: {
    questions: ["Which reporting and environmental obligations apply?", "Where is buyer demand increasing?", "Which vendors lead by industry?", "What claims and modules have changed?"],
    competitors: ["Sphera", "Cority", "Enablon", "Intelex", "EcoOnline", "VelocityEHS"],
    evidence: ["Federal and state regulation", "EPA compliance data", "Company product evidence", "Reporting frameworks", "Market and hiring signals"],
  },
  "Contractor Management": {
    questions: ["Which markets have the highest contractor dependence?", "How are contractors prequalified and monitored?", "Which vendors own each workflow?", "Where do safety and supply-chain risk converge?"],
    competitors: ["ISNetworld", "Avetta", "Highwire", "HammerTech", "SALUS", "EcoOnline"],
    evidence: ["Contractor risk and safety", "Prequalification workflows", "Insurance and financial risk", "Site access and training", "Industry-specific regulation"],
  },
};

const records: IntelligenceRecord[] = [
  {
    id: "reg-heat-001",
    domain: "Regulations",
    title: "Heat Injury and Illness Prevention rulemaking",
    summary: "A source-traceable regulatory record designed to connect rulemaking activity to affected industries, operating conditions, and relevant product workflows.",
    industries: ["Construction", "Manufacturing", "Energy & Utilities"],
    geographies: ["United States"],
    agencies: ["OSHA", "Department of Labor"],
    entities: ["Outdoor workforces", "High-heat facilities"],
    reliability: "Verified Fact",
    published: "2024-08-30",
    retrieved: "2026-08-19",
    sourceName: "Federal Register",
    sourceUrl: "https://www.federalregister.gov/documents/2024/08/30/2024-14824/heat-injury-and-illness-prevention-in-outdoor-and-indoor-work-settings",
    sourceType: "Primary government source",
    evidence: "The Federal Register document is the controlling public record for the proposed rule and includes the agency, docket, dates, and complete text.",
    methodology: "Store the document as the primary record; separate effective dates, deadlines, requirements, and analyst implications into individually sourced fields.",
    related: ["OSHA enforcement activity", "State heat standards", "Incident management", "Training"],
  },
  {
    id: "enf-osha-001",
    domain: "Enforcement & Injuries",
    title: "OSHA inspection and citation record structure",
    summary: "A normalized inspection record linking establishment, inspection, citation, penalty, NAICS, geography, and source-level identifiers without importing legacy Ocean data.",
    industries: ["All priority industries"],
    geographies: ["United States", "State Plan jurisdictions"],
    agencies: ["OSHA", "State OSHA Plans"],
    entities: ["Establishments", "Inspections", "Citations"],
    reliability: "Source Structure",
    published: "Continuously updated",
    retrieved: "2026-08-19",
    sourceName: "OSHA Data",
    sourceUrl: "https://www.osha.gov/data",
    sourceType: "Primary government data portal",
    evidence: "OSHA publishes inspection, citation, severe injury, fatality, and injury and illness datasets through its official data portal.",
    methodology: "Preserve OSHA identifiers and original fields, then add separate normalized organization, location, NAICS, event, and confidence entities.",
    related: ["Severe injuries", "Fatalities", "Repeat inspections", "NAICS intensity"],
  },
  {
    id: "market-qcew-001",
    domain: "Industries",
    title: "Employment and establishment growth by NAICS and geography",
    summary: "A market record structure for comparing employment, wages, establishment counts, and location quotients across priority EHS segments.",
    industries: ["Construction", "Manufacturing", "Mining", "Utilities", "Waste & Water"],
    geographies: ["United States", "State", "County", "Metro"],
    agencies: ["Bureau of Labor Statistics"],
    entities: ["NAICS", "Labor markets", "Establishments"],
    reliability: "Source Structure",
    published: "Quarterly",
    retrieved: "2026-08-19",
    sourceName: "BLS QCEW Open Data",
    sourceUrl: "https://www.bls.gov/cew/additional-resources/open-data/home.htm",
    sourceType: "Primary government dataset",
    evidence: "QCEW provides employment, wages, establishment counts, and location quotients by industry and geography.",
    methodology: "Retain period, ownership, area, and NAICS dimensions. Never compare periods or geographies without recording denominator and revision status.",
    related: ["Census business counts", "BEA industry output", "Hiring demand", "Compliance intensity"],
  },
  {
    id: "env-echo-001",
    domain: "Sustainability",
    title: "Facility environmental compliance and enforcement profile",
    summary: "A facility-level environmental record connecting regulated programs, compliance status, enforcement history, and corporate relationships.",
    industries: ["Manufacturing", "Energy", "Waste Management", "Water Management"],
    geographies: ["United States", "State", "Watershed"],
    agencies: ["EPA", "State environmental agencies"],
    entities: ["Facilities", "Parent companies", "Regulated programs"],
    reliability: "Verified Fact",
    published: "Source dependent",
    retrieved: "2026-08-19",
    sourceName: "EPA ECHO",
    sourceUrl: "https://echo.epa.gov/tools/web-services",
    sourceType: "Primary government web service",
    evidence: "ECHO exposes facility, Clean Air Act, Clean Water Act, RCRA, enforcement case, and corporate compliance services.",
    methodology: "Use program-specific identifiers and preserve reporting period. Treat current compliance status separately from historical enforcement events.",
    related: ["Hazardous waste", "Air emissions", "Water discharge", "Ensogo sustainability intelligence"],
  },
  {
    id: "corp-ensogo-001",
    domain: "Corporate Activity",
    title: "Novara acquisition of Ensogo",
    summary: "A company-statement record capturing a strategic transaction, stated rationale, capability implications, and the source language that supports each claim.",
    industries: ["EHS software", "Sustainability software"],
    geographies: ["North America", "International"],
    agencies: [],
    entities: ["Novara", "Ensogo"],
    reliability: "Company Statement",
    published: "2026-06-09",
    retrieved: "2026-08-19",
    sourceName: "Novara Press Release",
    sourceUrl: "https://novara.com/blog/novara-acquires-ensogo-to-accelerate-ai-powered-operational-risk-management-and-sustainability-strategy/",
    sourceType: "Official company statement",
    evidence: "Novara announced its acquisition of Ensogo and described the intended combination of operational risk, AI, and sustainability capabilities.",
    methodology: "Attribute strategic rationale to the company. Track subsequent product evidence separately before treating stated integration plans as delivered capability.",
    related: ["Sustainability modules", "Operational risk", "AI capabilities", "Product integration"],
  },
  {
    id: "comp-model-001",
    domain: "Competitors",
    title: "Competitor module and capability evidence model",
    summary: "A structured competitor profile that distinguishes marketed capability, documented functionality, customer evidence, analyst interpretation, and unknowns.",
    industries: ["EHS software", "Contractor management", "Sustainability"],
    geographies: ["North America"],
    agencies: [],
    entities: ["Competitors", "Modules", "Features", "Messaging"],
    reliability: "Source Structure",
    published: "Continuously updated",
    retrieved: "2026-08-19",
    sourceName: "Approved official-source scan",
    sourceUrl: "https://novara.com/ehs-software/",
    sourceType: "Reference structure",
    evidence: "Each feature assertion will require a direct official product, release-note, press-release, filing, or approved analyst source before publication.",
    methodology: "Store feature claims atomically. Separate availability, packaging, integration depth, audience, release date, and source confidence.",
    related: ["Battlecards", "Feature matrix", "Messaging shifts", "M&A"],
  },
];

const sources = [
  { name: "OSHA Data", owner: "U.S. Department of Labor", method: "Download + search", cadence: "Daily / periodic", coverage: "Federal + State Plans", status: "Mapped", type: "Enforcement" },
  { name: "EPA ECHO", owner: "U.S. EPA", method: "Public web services", cadence: "Source dependent", coverage: "National + state programs", status: "Ready", type: "Environmental" },
  { name: "Federal Register", owner: "GPO / NARA", method: "Public API", cadence: "Daily", coverage: "Federal rulemaking", status: "Ready", type: "Regulatory" },
  { name: "eCFR", owner: "GPO / OFR", method: "Public API", cadence: "Daily", coverage: "Current federal regulations", status: "Ready", type: "Regulatory" },
  { name: "BLS QCEW", owner: "Bureau of Labor Statistics", method: "Open data", cadence: "Quarterly", coverage: "NAICS + geography", status: "Ready", type: "Market" },
  { name: "Census Business Data", owner: "U.S. Census Bureau", method: "Public API", cadence: "Annual / periodic", coverage: "Business + industry", status: "Mapped", type: "Market" },
  { name: "State Agency Matrix", owner: "Multiple jurisdictions", method: "API / feed / scan", cadence: "Varies", coverage: "50 states + territories", status: "In progress", type: "Regulatory" },
];

const reliabilityClass: Record<Reliability, string> = {
  "Verified Fact": "verified",
  "Company Statement": "statement",
  "Analyst Inference": "inference",
  "Source Structure": "structure",
};

function ProductMark() {
  return <div className="product-mark" aria-label="Market Intelligence"><span className="system-monogram">MI</span><span className="mark-copy"><strong>MARKET INTELLIGENCE</strong><small>EHS STRATEGY SYSTEM</small></span></div>;
}

function ReliabilityBadge({ value }: { value: Reliability }) {
  return <span className={`reliability ${reliabilityClass[value]}`}><ShieldCheck size={12} />{value}</span>;
}

function calculateStructuralIntensity(segment: MarketSegment | undefined) {
  if (!segment) return null;
  const environmentTerms = ["environment", "air", "water", "waste", "permit", "emissions", "discharge"];
  const contractorTerms = ["contractor", "subcontractor", "temporary", "service"];
  const regulatoryValue = Math.min(100, segment.agencies.length * 14 + segment.obligations.length * 10);
  const environmentalMatches = segment.obligations.filter((item) => environmentTerms.some((term) => item.toLowerCase().includes(term))).length;
  const environmentalValue = Math.min(100, environmentalMatches * 28 + (segment.agencies.some((agency) => agency.includes("EPA") || agency.toLowerCase().includes("environment")) ? 24 : 0));
  const contractorMatches = segment.workforce.filter((item) => contractorTerms.some((term) => item.toLowerCase().includes(term))).length;
  const contractorValue = Math.min(100, contractorMatches * 35 + (segment.operationalExposure.some((item) => item.toLowerCase().includes("contractor")) ? 30 : 0));
  const operationalValue = Math.min(100, segment.operationalExposure.length * 20);
  const measuredWeight = 60;
  const measuredPoints = regulatoryValue * .25 + environmentalValue * .15 + contractorValue * .10 + operationalValue * .10;
  return {
    structuralSignal: Math.round(measuredPoints / measuredWeight * 100),
    evidenceCoverage: measuredWeight,
    factors: [
      { label: "Regulatory breadth", weight: 25, value: regulatoryValue, status: "Mapped structure", evidence: `${segment.agencies.length} agency families and ${segment.obligations.length} obligation groups mapped` },
      { label: "Enforcement pressure", weight: 20, value: null, status: "Data required", evidence: "Requires normalized inspection, citation, penalty, repeat-visit, and establishment denominators" },
      { label: "Injury exposure", weight: 20, value: null, status: "Data required", evidence: "Requires injury, severe-injury, fatality, hours-worked, and occupation denominators" },
      { label: "Environmental obligations", weight: 15, value: environmentalValue, status: "Mapped structure", evidence: `${environmentalMatches} environmental obligation signals plus agency coverage` },
      { label: "Contractor complexity", weight: 10, value: contractorValue, status: "Mapped structure", evidence: `${contractorMatches} contractor-dependent workforce groups identified` },
      { label: "Operational complexity", weight: 10, value: operationalValue, status: "Mapped structure", evidence: `${segment.operationalExposure.length} operating exposure groups identified` },
    ],
  };
}

export default function Home() {
  const [active, setActive] = useState("Data Catalog");
  const [selectedId, setSelectedId] = useState(records[0].id);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [reliability, setReliability] = useState("All reliability");
  const [liveRecords, setLiveRecords] = useState<IntelligenceRecord[]>([]);
  const [feedStatus, setFeedStatus] = useState<"loading" | "live" | "degraded">("loading");
  const [selectedVertical, setSelectedVertical] = useState("All markets");
  const [selectedSegment, setSelectedSegment] = useState("All segments");
  const [comparisonSegmentId, setComparisonSegmentId] = useState("construction-concrete");
  const [selectedGeography, setSelectedGeography] = useState("North America");
  const [selectedJurisdictionCode, setSelectedJurisdictionCode] = useState("CA");
  const [focusMode, setFocusMode] = useState<FocusMode>("market");
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(competitors[0].id);
  const [intelligenceFeed, setIntelligenceFeed] = useState<IntelligenceFeed | null>(null);
  const [dataFeedStatus, setDataFeedStatus] = useState<"loading" | "live" | "degraded">("loading");
  const [importCandidate, setImportCandidate] = useState<{ name: string; size: number; type: string; header: string[] } | null>(null);
  const [regulatoryDocuments, setRegulatoryDocuments] = useState<FeedResponse["records"]>([]);
  const [selectedRegulationNumber, setSelectedRegulationNumber] = useState("");
  const [regulationStage, setRegulationStage] = useState("All stages");

  useEffect(() => {
    let activeRequest = true;
    fetch("/api/regulations")
      .then((response) => response.json())
      .then((payload: FeedResponse) => {
        if (!activeRequest) return;
        setFeedStatus(payload.status);
        setRegulatoryDocuments(payload.records);
        setSelectedRegulationNumber((current) => current || payload.records[0]?.documentNumber || "");
        setLiveRecords(payload.records.map((item) => ({
          id: `fr-${item.documentNumber}`,
          domain: "Regulations",
          title: item.title,
          summary: item.abstract || "Federal Register document available for structured review.",
          industries: ["Requires applicability review"],
          geographies: ["United States"],
          agencies: item.agencies,
          entities: ["Federal rulemaking"],
          reliability: "Verified Fact",
          published: item.publicationDate,
          retrieved: payload.retrievedAt.slice(0, 10),
          sourceName: "Federal Register API",
          sourceUrl: item.htmlUrl,
          sourceType: "Live primary government feed",
          evidence: "This record was retrieved directly from the Federal Register public API. Applicability and business implications require separate review.",
          methodology: "Preserve the Federal Register document number and publication date. Do not infer obligations, effective dates, or affected industries from the title alone.",
          related: ["Agency docket", "eCFR comparison", "Applicability review", "Industry mapping"],
        })));
      })
      .catch(() => {
        if (activeRequest) setFeedStatus("degraded");
      });
    return () => { activeRequest = false; };
  }, []);

  useEffect(() => {
    let activeRequest = true;
    fetch("/api/intelligence")
      .then((response) => response.json())
      .then((payload: IntelligenceFeed) => {
        if (!activeRequest) return;
        setIntelligenceFeed(payload);
        setDataFeedStatus(payload.economic.status === "live" || payload.regulatory.status === "live" ? "live" : "degraded");
      })
      .catch(() => {
        if (activeRequest) setDataFeedStatus("degraded");
      });
    return () => { activeRequest = false; };
  }, []);

  const allRecords = useMemo(() => [...liveRecords, ...records], [liveRecords]);
  const selectedCompetitor = useMemo(() => competitors.find((competitor) => competitor.id === selectedCompetitorId) ?? competitors[0], [selectedCompetitorId]);
  const selectedJurisdiction = useMemo(() => jurisdictions.find((jurisdiction) => jurisdiction.code === selectedJurisdictionCode) ?? jurisdictions[0], [selectedJurisdictionCode]);
  const activeProductDomain = productDomains[active as keyof typeof productDomains];
  const focusedSegments = useMemo(() => marketSegments.filter((segment) => {
    const verticalMatch = selectedVertical === "All markets" || segment.vertical === selectedVertical;
    const segmentMatch = selectedSegment === "All segments" || segment.id === selectedSegment;
    return verticalMatch && segmentMatch;
  }), [selectedSegment, selectedVertical]);
  const activeSegment = useMemo(() => marketSegments.find((segment) => segment.id === selectedSegment), [selectedSegment]);
  const comparisonSegment = useMemo(() => marketSegments.find((segment) => segment.id === comparisonSegmentId), [comparisonSegmentId]);
  const intensity = useMemo(() => calculateStructuralIntensity(activeSegment), [activeSegment]);
  const comparisonIntensity = useMemo(() => calculateStructuralIntensity(comparisonSegment), [comparisonSegment]);
  const comparisonChecks = useMemo(() => activeSegment && comparisonSegment
    ? buildComparisonChecks(activeSegment, comparisonSegment, selectedGeography, intelligenceFeed?.economic.records ?? [])
    : [], [activeSegment, comparisonSegment, intelligenceFeed, selectedGeography]);
  const regulationStages = useMemo(() => ["All stages", ...new Set(regulatoryDocuments.map((document) => document.lifecycleStage))], [regulatoryDocuments]);
  const visibleRegulations = useMemo(() => regulatoryDocuments.filter((document) => {
    const stageMatch = regulationStage === "All stages" || document.lifecycleStage === regulationStage;
    const marketMatch = selectedVertical === "All markets" || document.markets.includes(selectedVertical) || document.markets.includes("Applicability review required");
    const text = query.toLowerCase().trim();
    const haystack = [document.title, document.abstract, document.documentType, ...document.agencies, ...document.markets, ...document.topics, ...document.cfrReferences].join(" ").toLowerCase();
    return stageMatch && marketMatch && (!text || haystack.includes(text));
  }), [query, regulationStage, regulatoryDocuments, selectedVertical]);
  const selectedRegulation = useMemo(() => visibleRegulations.find((document) => document.documentNumber === selectedRegulationNumber) ?? visibleRegulations[0], [selectedRegulationNumber, visibleRegulations]);

  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim();
    return allRecords.filter((record) => {
      const domainMatch = ["Data Catalog", "Sources", "Signals"].includes(active)
        || (active === "Markets" && record.domain === "Industries")
        || (active === "Enforcement" && record.domain === "Enforcement & Injuries")
        || record.domain === active;
      const competitorMarkets = focusMode === "competitor" ? selectedCompetitor.marketRelevance : verticals;
      const focusVertical = selectedVertical === "All markets" ? competitorMarkets : [selectedVertical];
      const crossSectionMarket = focusVertical.some((vertical) => record.industries.includes(vertical)) || record.industries.includes("All priority industries") || record.industries.includes("Requires applicability review") || record.domain === "Competitors";
      const industryMatch = (industry === "All industries" || record.industries.includes(industry)) && crossSectionMarket;
      const reliabilityMatch = reliability === "All reliability" || record.reliability === reliability;
      const haystack = [record.title, record.summary, record.domain, ...record.industries, ...record.geographies, ...record.agencies, ...record.entities].join(" ").toLowerCase();
      return domainMatch && industryMatch && reliabilityMatch && (!text || haystack.includes(text));
    });
  }, [active, allRecords, focusMode, industry, query, reliability, selectedCompetitor, selectedVertical]);

  const selected = filtered.find((record) => record.id === selectedId) ?? filtered[0] ?? allRecords[0];

  const selectNavigation = (label: string) => {
    setActive(label);
    if (label === "Competitors") setFocusMode("competitor");
    if (label === "Markets") setFocusMode("market");
    if (label !== "Sources") {
      const first = allRecords.find((record) => label === "Data Catalog" || record.domain === label || (label === "Markets" && record.domain === "Industries") || (label === "Enforcement" && record.domain === "Enforcement & Injuries"));
      if (first) setSelectedId(first.id);
    }
  };

  const openMarket = (vertical: string, segmentId?: string) => {
    setFocusMode("market");
    setSelectedVertical(vertical);
    setSelectedSegment(segmentId ?? "All segments");
    setActive("Markets");
    const relatedRecord = allRecords.find((record) => record.domain === "Industries" || record.industries.includes(vertical));
    if (relatedRecord) setSelectedId(relatedRecord.id);
  };

  const openCompetitor = (competitorId: string) => {
    const competitor = competitors.find((item) => item.id === competitorId) ?? competitors[0];
    setFocusMode("competitor");
    setSelectedCompetitorId(competitorId);
    if (selectedVertical !== "All markets" && !competitor.marketRelevance.includes(selectedVertical)) {
      setSelectedVertical("All markets");
      setSelectedSegment("All segments");
    }
    setActive("Competitors");
    const competitorRecord = allRecords.find((record) => record.domain === "Competitors");
    if (competitorRecord) setSelectedId(competitorRecord.id);
  };

  const exportRecord = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), record: selected }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selected.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const inspectImport = async (file: File | undefined) => {
    if (!file) return;
    const headerText = await file.slice(0, 65536).text();
    const firstLine = headerText.split(/\r?\n/)[0] ?? "";
    const delimiter = firstLine.includes("\t") ? "\t" : ",";
    setImportCandidate({ name: file.name, size: file.size, type: file.type || "Unknown", header: firstLine.split(delimiter).map((value) => value.replace(/^"|"$/g, "").trim()).filter(Boolean) });
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="app-header">
          <div className="header-main"><ProductMark /><nav className="primary-nav" aria-label="Primary">{navigation.map(({ label, icon: Icon }) => <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => selectNavigation(label)}><Icon size={14} strokeWidth={1.8} /><span>{label}</span></button>)}</nav><div className="header-user"><span>VN</span><small>Strategy</small></div></div>
          <div className="topbar"><div className="search-wrap"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search companies, NAICS, regulations, agencies, facilities, or evidence" /><kbd>⌘ K</kbd></div><div className="source-status"><span className={`system-pill ${feedStatus}`}><i /> Federal Register {feedStatus}</span><span className={`system-pill ${dataFeedStatus}`}><i /> Economic feeds {dataFeedStatus}</span><button onClick={() => selectNavigation("Sources")}>Source health <ArrowUpRight size={13} /></button></div><button className="export-button" onClick={exportRecord}><Download size={15} /> Export</button></div>
        </header>

        <div className={`content intelligence-content${active === "Competitors" ? " competitor-content" : ""}`}>
          <div className="demo-banner"><CircleDot size={13} /><b>Coverage notice</b> Live, mapped, licensed, and awaiting-access sources are labeled separately. No private records are included until explicitly approved.</div>
          {active !== "Sources" && <section className={`focus-context${active === "Competitors" ? " competitor" : ""}`}>
            <span className="context-label"><PanelsTopLeft size={13} /> CONTEXT</span>
            <label>Lens<select value={focusMode} onChange={(event) => event.target.value === "competitor" ? openCompetitor(selectedCompetitorId) : setFocusMode("market")}><option value="market">Market</option><option value="competitor">Competitor</option></select></label>
            {focusMode === "competitor" && <label>Competitor<select value={selectedCompetitorId} onChange={(event) => openCompetitor(event.target.value)}>{competitors.map((competitor) => <option value={competitor.id} key={competitor.id}>{competitor.name}</option>)}</select></label>}
            <label>Market<select value={selectedVertical} onChange={(event) => { setSelectedVertical(event.target.value); setSelectedSegment("All segments"); }}><option>All markets</option>{(focusMode === "competitor" ? verticals.filter((vertical) => selectedCompetitor.marketRelevance.includes(vertical)) : verticals).map((vertical) => <option key={vertical}>{vertical}</option>)}</select></label>
            <label>Segment<select value={selectedSegment} onChange={(event) => setSelectedSegment(event.target.value)}><option value="All segments">All segments</option>{marketSegments.filter((segment) => selectedVertical === "All markets" || segment.vertical === selectedVertical).map((segment) => <option value={segment.id} key={segment.id}>{segment.segment}</option>)}</select></label>
            <label>Geography<select value={selectedGeography} onChange={(event) => setSelectedGeography(event.target.value)}><option>North America</option><option>United States</option><option>State</option><option>Metro</option><option>Facility / project</option></select></label>
            <div className="focus-path"><small>Active cross-section</small><b>{focusMode === "competitor" ? `${selectedCompetitor.name} / ` : ""}{selectedVertical}{selectedSegment !== "All segments" ? ` / ${marketSegments.find((segment) => segment.id === selectedSegment)?.segment}` : ""}</b><span>{selectedGeography} · retained across workspaces</span></div>
          </section>}
          <section className="workspace-heading">
            <div><span className="eyebrow"><FileSearch size={14} /> EVIDENCE-BACKED INTELLIGENCE</span><h1>{active}</h1><p>{active === "Sources" ? "Inspect coverage, ownership, update method, and source health before trusting an output." : active === "Competitors" ? "Compare positioning, modules, market strength, AI direction, customer proof, corporate activity, and monitored source changes across the EHS competitive set." : active === "Data Operations" ? "Control bulk imports, live connectors, schema contracts, freshness, and publication gates from one place." : active === "Injuries" ? "Explore injury evidence by source, market, geography, event, establishment, equipment, and contributing factor." : active === "Enforcement" ? "Track inspections, citations, penalties, repeat visits, establishments, and agency activity separately from injury records." : active === "Corporate Activity" ? "Track transactions, ownership, leadership, product moves, and messaging changes without mixing facts with interpretation." : active === "Contractor Management" ? "Analyze the contractor-risk market, buyer workflows, specialist competitors, regulatory exposure, and product signals." : active === "Sustainability" ? "Analyze sustainability regulation, reporting obligations, market demand, product coverage, and specialist competitors." : active === "Signals" ? "Review material changes across markets, hiring, regulations, competitors, enforcement, injuries, and corporate activity." : "Navigate connected evidence across markets, companies, regulations, enforcement, injuries, and economic signals."}</p></div>
            <div className="workspace-meta">{active === "Competitors" ? <><span><b>{competitors.length}</b> researched companies</span><button><RefreshCw size={14} /> Official sources monitored</button></> : <><span><b>{active === "Sources" ? sources.length : active === "Data Operations" ? sourceRegistry.length : filtered.length}</b> {active === "Data Operations" ? "registered sources" : "records in view"}</span><button><RefreshCw size={14} /> Last structured today</button></>}</div>
          </section>

          {active === "Data Operations" ? (
            <section className="data-operations">
              <div className="operations-hero panel">
                <div><span className="panel-kicker">Ingestion control plane</span><h2>Data-rich, evidence-safe by design</h2><p>Live APIs, CSV slices, bulk archives, controlled files, and monitored websites enter through different pipelines—but publish through one provenance contract.</p></div>
                <div className="operations-metrics"><span><b>{sourceRegistry.length}</b> sources mapped</span><span><b>{sourceRegistry.filter((source) => source.status === "Live" || source.status === "Ready").length}</b> connector-ready</span><span><b>5</b> evidence classes</span></div>
              </div>

              <div className="operation-grid">
                <div className="import-zone panel">
                  <div className="operation-heading"><span><i><UploadCloud size={18} /></i><span><b>All Injuries import lane</b><small>Designed for the 100,000+ row source file</small></span></span><mark>Quarantine first</mark></div>
                  <label className="drop-zone"><input type="file" accept=".csv,.tsv,.zip" onChange={(event) => inspectImport(event.target.files?.[0])} /><UploadCloud size={25} /><b>Select CSV, TSV, or ZIP</b><span>Files are inspected locally in this preview and are not transmitted or published.</span></label>
                  {importCandidate ? <div className="import-inspection"><div><span>Candidate</span><b>{importCandidate.name}</b></div><div><span>Size</span><b>{(importCandidate.size / 1024 / 1024).toFixed(1)} MB</b></div><div><span>Detected columns</span><b>{importCandidate.header.length}</b></div><p>{importCandidate.header.slice(0, 8).join(" · ") || "Header inspection unavailable for compressed files"}</p></div> : <div className="import-empty">Awaiting an approved injury dataset. No private file has been imported.</div>}
                  <div className="pipeline-steps"><span className="ready"><b>1</b> Inspect</span><i /><span><b>2</b> Quarantine</span><i /><span><b>3</b> Normalize</span><i /><span><b>4</b> Deduplicate</span><i /><span><b>5</b> Publish</span></div>
                </div>

                <div className="live-pipeline panel">
                  <div className="operation-heading"><span><i><BarChart3 size={18} /></i><span><b>Economic activity feed</b><small>BLS QCEW · national private ownership</small></span></span><mark className={dataFeedStatus}>{dataFeedStatus}</mark></div>
                  <div className="economic-list">{intelligenceFeed?.economic.records.map((record) => <article key={record.id}><div><b>{record.label}</b><small>NAICS {record.naics} · {record.period}</small></div><strong className={(record.employmentGrowth ?? 0) >= 0 ? "positive" : "negative"}>{record.employmentGrowth === null ? "Pending" : `${record.employmentGrowth > 0 ? "+" : ""}${record.employmentGrowth.toFixed(1)}%`}</strong><span>employment YoY</span><footer>{record.employment === null ? "Source unavailable" : `${record.employment.toLocaleString()} jobs · ${record.establishments?.toLocaleString()} establishments`}</footer></article>) ?? <div className="loading-state">Checking official QCEW slices…</div>}</div>
                  <div className="pipeline-note"><ShieldCheck size={15} /><span>Economic signals are contextual evidence—not proof that commercial outcomes were caused by market growth.</span></div>
                </div>
              </div>

              <div className="regulatory-stream panel">
                <div className="operation-heading"><span><i><BookOpenCheck size={18} /></i><span><b>Regulatory applicability stream</b><small>OSHA, EPA, and MSHA documents from the last year</small></span></span><mark className={intelligenceFeed?.regulatory.status ?? "loading"}>{intelligenceFeed?.regulatory.status ?? "loading"}</mark></div>
                <div className="regulatory-grid">{intelligenceFeed?.regulatory.records.slice(0, 8).map((record) => <a href={record.url} target="_blank" rel="noreferrer" key={record.id}><span><b>{record.title}</b><small>{record.agencies.join(" · ")} · {record.published}</small></span><div>{record.verticals.map((vertical) => <mark key={vertical}>{vertical}</mark>)}</div><footer>{record.applicabilityStatus}<ArrowUpRight size={13} /></footer></a>) ?? <div className="loading-state">Checking the official Federal Register feed…</div>}</div>
              </div>

              <div className="source-control panel">
                <div className="catalog-intro"><div><span className="panel-kicker">Source architecture</span><h2>Registered ingestion sources</h2></div><p>Every connector declares its owner, transport, history, join keys, update cadence, and caveat before data can enter an intelligence output.</p></div>
                <div className="source-control-head source-control-row"><span>Source</span><span>Domain</span><span>Transport</span><span>History / cadence</span><span>Join keys</span><span>Status</span></div>
                {sourceRegistry.map((source) => <div className="source-control-row" key={source.id}><span><b>{source.name}</b><small>{source.owner} · {source.authority}</small></span><span>{source.domain}</span><span>{source.transport}</span><span>{source.history}<small>{source.cadence}</small></span><span>{source.joinKeys.slice(0, 3).join(" · ")}</span><mark className={source.status.toLowerCase().replaceAll(" ", "-")}>{source.status}</mark></div>)}
              </div>

              <div className="schema-contract panel"><div><span className="panel-kicker">Normalized event contract</span><h2>Required before any record can publish</h2><p>Raw source fields remain intact; normalized dimensions are additive and versioned.</p></div><div>{importContract.map((field) => <span key={field.field}><code>{field.field}</code><mark className={field.required ? "required" : "optional"}>{field.required ? "Required" : "When available"}</mark><small>{field.purpose}</small></span>)}</div></div>
            </section>
          ) : active === "Injuries" ? (
            <section className="injury-navigator">
              <div className="injury-hero panel"><div><span className="panel-kicker">Injury intelligence system</span><h2>One navigator across historical and new injury evidence</h2><p>The approved All Injuries file remains the historical backbone. OSHA ITA, severe injury, fatality, inspection, and MSHA sources add refreshable evidence through separately versioned pipelines.</p></div><div className="injury-hero-status"><span><b>{intelligenceFeed?.injury.sources.length ?? 4}</b> source families mapped</span><mark>Awaiting approved historical file</mark></div></div>
              <div className="injury-filter-grid panel"><label>Event family<select><option>All event families</option><option>Recordable case</option><option>Severe injury</option><option>Fatality</option><option>Inspection / citation</option></select></label><label>Factor<select><option>All factors</option><option>Fall</option><option>Struck by</option><option>Caught in / between</option><option>Exposure</option><option>Ergonomic</option></select></label><label>Source<select><option>All sources</option>{intelligenceFeed?.injury.sources.map((source) => <option key={source.name}>{source.name}</option>)}</select></label><label>Time period<select><option>Full available history</option><option>Last 12 months</option><option>Last quarter</option></select></label></div>
              <div className="injury-source-grid">{intelligenceFeed?.injury.sources.map((source) => <a className="panel" href={source.url} target="_blank" rel="noreferrer" key={source.name}><span><HardHat size={18} /><mark>Official source</mark></span><h3>{source.name}</h3><p>{source.history}</p><footer>{source.linkage}<ArrowUpRight size={14} /></footer></a>) ?? <div className="panel loading-state">Loading mapped injury sources…</div>}</div>
              <div className="injury-workbench panel"><div><span className="panel-kicker">Normalized dimensions</span><h2>Designed for cross-sectional analysis</h2><p>Every row preserves its raw source and can be analyzed across the persistent market, segment, and geography focus.</p></div><div>{["NAICS and market hierarchy", "Establishment and parent entity", "Event and injury type", "Body part and nature", "Source and case identifier", "Inspection and citation links", "Event date and reporting period", "Reliability and retrieval history"].map((item) => <span key={item}><Check size={13} />{item}</span>)}</div></div>
              <div className="injury-empty panel"><Database size={23} /><div><b>Historical row-level analysis is intentionally gated</b><p>No private injury file has been found or imported. Once the approved file is selected in Data Operations, it will be quarantined, profiled, normalized, deduplicated, and reviewed before this navigator publishes counts or rates.</p></div><button onClick={() => setActive("Data Operations")}>Open import lane <ArrowRight size={14} /></button></div>
            </section>
          ) : active === "Corporate Activity" ? (
            <section className="corporate-monitor">
              <div className="operations-hero panel"><div><span className="panel-kicker">Corporate intelligence control plane</span><h2>Transactions and messaging changes, evidence first</h2><p>Monitors identify possible change. Primary filings and company releases establish facts. Analyst implications remain separately labeled and reviewable.</p></div><div className="operations-metrics"><span><b>{competitors.length}</b> companies</span><span><b>{monitoringJobs.length}</b> monitor jobs</span><span><b>{messagingTaxonomy.length}</b> message themes</span></div></div>
              <div className="monitor-grid"><div className="panel monitor-jobs"><div className="operation-heading"><span><i><RefreshCw size={18} /></i><span><b>Collection jobs</b><small>Discovery never publishes a transaction fact</small></span></span><mark>Source-gated</mark></div>{monitoringJobs.map((job) => <article key={job.name}><span><b>{job.name}</b><small>{job.coverage}</small></span><span>{job.cadence}<small>{job.method}</small></span><mark className={job.status.toLowerCase()}>{job.status}</mark></article>)}</div><div className="panel messaging-monitor"><div className="operation-heading"><span><i><Radar size={18} /></i><span><b>Messaging-change taxonomy</b><small>Tags explain what changed—not why</small></span></span><mark>Versioned</mark></div><div>{messagingTaxonomy.map((tag) => <span key={tag}>{tag}</span>)}</div><p>Page snapshots retain URL, timestamp, content hash, changed terms, source excerpt, and human-review state.</p></div></div>
              <div className="source-hierarchy panel"><div className="catalog-intro"><div><span className="panel-kicker">Evidence hierarchy</span><h2>Corporate activity publication rules</h2></div><p>Trade coverage such as EHS Today is valuable for discovery, but acquisition facts are confirmed against a filing or official company release.</p></div>{corporateSourceHierarchy.map((source) => <article key={source.level}><strong>{source.level}</strong><span><b>{source.label}</b><small>{source.examples}</small></span><p>{source.use}</p></article>)}</div>
              <div className="change-contract panel"><div><span className="panel-kicker">Messaging snapshot contract</span><h2>Reproducible change records</h2></div><div>{changeContract.map((field) => <code key={field}>{field}</code>)}</div></div>
            </section>
          ) : active === "Sources" ? (
            <section className="source-catalog panel">
              <div className="catalog-intro"><div><span className="panel-kicker">System of record</span><h2>Source catalog & coverage</h2></div><p>Connectors will fail quietly into the last successful snapshot, while freshness and coverage gaps remain visible here.</p></div>
              <div className="catalog-table">
                <div className="catalog-row catalog-head"><span>Source</span><span>Type</span><span>Method</span><span>Coverage</span><span>Cadence</span><span>Status</span></div>
                {sources.map((source) => <div className="catalog-row" key={source.name}><span><i><Database size={15} /></i><b>{source.name}</b><small>{source.owner}</small></span><span>{source.type}</span><span>{source.method}</span><span>{source.coverage}</span><span>{source.cadence}</span><span><mark className={source.status === "Ready" ? "ready" : source.status === "Mapped" ? "mapped" : "progress"}>{source.status}</mark></span></div>)}
              </div>
              <div className="coverage-policy"><ShieldCheck size={20} /><div><strong>Publication rule</strong><p>No unsourced claim is eligible for an executive brief, market view, competitor profile, or exported battlecard.</p></div><button>View quality rules <ArrowUpRight size={14} /></button></div>
            </section>
          ) : (
            <>
              {active === "Data Catalog" && <section className="data-catalog-home">
                <div className="catalog-summary panel"><div><span className="panel-kicker">Cross-index architecture</span><h2>One evidence system, joined through governed dimensions</h2><p>The interface follows the data: every domain declares its record grain, stable keys, source authority, update cadence, and coverage boundary before analysis is allowed.</p></div><div className="index-state"><span><b>{domainCatalog.length}</b> governed domains</span><span><b>{sharedDimensions.length}</b> shared dimensions</span><span><b>{sourceRegistry.length}</b> source contracts</span></div></div>
                <div className="catalog-table panel"><div className="catalog-table-row catalog-table-head"><span>Domain</span><span>Record grain</span><span>Join keys</span><span>Primary source layer</span><span>Cadence</span><span>Coverage</span></div>{domainCatalog.map((item) => <button className="catalog-table-row" key={item.domain} onClick={() => selectNavigation(item.domain)}><span><b>{item.domain}</b></span><span>{item.grain}</span><span><code>{item.keys}</code></span><span>{item.sources}</span><span>{item.cadence}</span><span>{item.coverage}<ChevronRight size={13} /></span></button>)}</div>
                <div className="dimension-register panel"><div className="dimension-register-heading"><span className="panel-kicker">Conformed dimensions</span><h2>Shared keys make every cross-section reproducible</h2><p>These hierarchies persist across tabs. Unknown mappings remain null and visible; they are never guessed into a category.</p></div><div className="dimension-register-list">{sharedDimensions.map((dimension) => <div key={dimension.name}><b>{dimension.name}</b><code>{dimension.hierarchy}</code><span>{dimension.use}</span></div>)}</div></div>
                <div className="catalog-governance"><span><ShieldCheck size={14} /><b>Provenance required</b> source ID · source record ID · published/effective date · retrieved timestamp</span><span><RefreshCw size={14} /><b>Freshness explicit</b> cadence · last success · lag · revision status</span><span><Network size={14} /><b>Joins governed</b> exact · concordance · entity-resolved · unmatched</span><span><Info size={14} /><b>Denominators preserved</b> population and coverage shown with every rate</span></div>
              </section>}
              {active === "Markets" && <section className="market-navigator">
                <div className="market-entry-grid">
                  {verticals.map((vertical) => {
                    const segments = marketSegments.filter((segment) => segment.vertical === vertical);
                    const agencies = new Set(segments.flatMap((segment) => segment.agencies));
                    return <button key={vertical} className={selectedVertical === vertical ? "market-entry selected" : "market-entry"} onClick={() => openMarket(vertical)}><span><i><Factory size={17} /></i><small>{segments.length} mapped segments</small></span><h2>{vertical}</h2><p>{segments.slice(0, 3).map((segment) => segment.segment).join(" · ")}</p><footer><span>{agencies.size} agency families</span><ChevronRight size={15} /></footer></button>;
                  })}
                </div>
                <div className="segment-explorer panel">
                  <div className="segment-heading"><div><span className="panel-kicker">Market hierarchy</span><h2>{selectedVertical === "All markets" ? "Priority EHS segments" : selectedVertical}</h2></div><p>Open a segment to carry its NAICS, geography, workforce, agency, obligation, exposure, and module context across the application.</p></div>
                  <div className="segment-table"><div className="segment-row segment-head"><span>Segment</span><span>NAICS</span><span>Workforce</span><span>Agency coverage</span><span>Product workflows</span></div>{focusedSegments.map((segment) => <button className={selectedSegment === segment.id ? "segment-row selected" : "segment-row"} key={segment.id} onClick={() => openMarket(segment.vertical, segment.id)}><span><b>{segment.segment}</b><small>{segment.vertical}</small></span><span>{segment.naics.join(", ")}</span><span>{segment.workforce.slice(0, 2).join(" · ")}</span><span>{segment.agencies.slice(0, 2).join(" · ")}</span><span>{segment.productWorkflows.slice(0, 2).join(" · ")}<ChevronRight size={13} /></span></button>)}</div>
                </div>
                {activeSegment && intensity && <div className="intensity-workbench panel">
                  <div className="intensity-summary"><div><span className="panel-kicker">Explainable compliance intensity</span><h2>{activeSegment.segment}</h2><p>This is a structural signal, not a market ranking. Missing enforcement and injury evidence is excluded and shown explicitly.</p></div><div className="intensity-score"><small>Structural signal</small><strong>{intensity.structuralSignal}</strong><span>/ 100</span><mark>{intensity.evidenceCoverage}% evidence coverage</mark></div></div>
                  <div className="formula-note"><Calculator size={16} /><div><b>Current calculation</b><span>Regulatory breadth 25% + environmental obligations 15% + contractor complexity 10% + operational complexity 10%. Enforcement pressure 20% and injury exposure 20% remain unscored until source-backed denominators are available.</span></div></div>
                  <div className="factor-grid">{intensity.factors.map((factor) => <article className={factor.value === null ? "factor-card pending" : "factor-card"} key={factor.label}><header><span>{factor.label}<small>{factor.weight}% weight</small></span>{factor.value === null ? <mark>Not scored</mark> : <strong>{factor.value}</strong>}</header>{factor.value !== null && <div className="factor-bar"><i style={{ width: `${factor.value}%` }} /></div>}<p>{factor.evidence}</p><footer>{factor.value === null ? <Info size={12} /> : <Check size={12} />}{factor.status}</footer></article>)}</div>
                  <div className="intensity-policy"><ShieldCheck size={17} /><span><b>Trust rule</b> A full compliance-intensity score cannot publish until required sources, denominators, periods, and geography coverage are recorded for every weighted factor.</span></div>
                </div>}
                {activeSegment && intensity && comparisonSegment && comparisonIntensity && <div className="segment-comparison panel"><div className="comparison-heading"><div><span className="panel-kicker">Cross-segment comparison</span><h2>{activeSegment.segment} versus</h2></div><label>Comparison segment<select value={comparisonSegmentId} onChange={(event) => setComparisonSegmentId(event.target.value)}>{marketSegments.map((segment) => <option value={segment.id} key={segment.id}>{segment.segment}</option>)}</select></label></div><div className="comparison-table"><div className="comparison-row comparison-head"><span>Factor</span><span>{activeSegment.segment}</span><span>{comparisonSegment.segment}</span><span>Evidence state</span></div>{intensity.factors.map((factor, index) => { const comparisonFactor = comparisonIntensity.factors[index]; return <div className="comparison-row" key={factor.label}><span><b>{factor.label}</b><small>{factor.weight}% model weight</small></span><span>{factor.value === null ? <mark>Not scored</mark> : <strong>{factor.value}</strong>}</span><span>{comparisonFactor.value === null ? <mark>Not scored</mark> : <strong>{comparisonFactor.value}</strong>}</span><span>{factor.value === null || comparisonFactor.value === null ? "Denominator-backed source required" : "Mapped structural evidence"}</span></div>; })}</div><div className="comparison-footer"><span><b>{activeSegment.segment}</b><strong>{intensity.structuralSignal}</strong><small>{intensity.evidenceCoverage}% evidence coverage</small></span><span><b>{comparisonSegment.segment}</b><strong>{comparisonIntensity.structuralSignal}</strong><small>{comparisonIntensity.evidenceCoverage}% evidence coverage</small></span><p><Info size={13} /> Structural signals can be compared; enforcement and injury density remain blocked until both segments use matched periods, geographies, populations, and source coverage.</p></div></div>}
                {activeSegment && comparisonSegment && <div className="comparison-contract panel"><div className="contract-heading"><div><span className="panel-kicker">Publication eligibility</span><h2>Matched evidence contract</h2><p>Every analytical rate must declare its numerator, denominator, period, geography, ownership scope, and source coverage.</p></div><span><b>{comparisonChecks.filter((check) => check.status === "Eligible").length}</b> of {comparisonChecks.length} rates eligible</span></div><div className="contract-table"><div className="contract-row contract-head"><span>Measure</span><span>Numerator / denominator</span><span>Source & period</span><span>Coverage decision</span></div>{comparisonChecks.map((check) => <div className="contract-row" key={check.factor}><span><b>{check.factor}</b><small>{check.geography}</small></span><span><b>{check.numerator}</b><small>÷ {check.denominator}</small></span><span><b>{check.source}</b><small>{check.period}</small></span><span><mark className={check.status.toLowerCase()}>{check.status}</mark><small>{check.reason}</small></span></div>)}</div><div className="contract-rule"><ShieldCheck size={14} /><span><b>No silent substitution.</b> A broader NAICS proxy can provide directional context, but it cannot publish as an exact subsegment rate.</span></div></div>}
              </section>}
              {activeProductDomain && <section className="product-domain">
                <div className="domain-brief panel"><div><span className="panel-kicker">Independent product intelligence domain</span><h2>{active}</h2><p>This workspace has its own buyers, regulations, workflows, specialist competitors, evidence sources, and market signals. It is connected to core EHS intelligence without being collapsed into it.</p></div><div className="domain-status"><span><b>Mapped</b> domain model</span><span><b>Next</b> live connectors</span></div></div>
                <div className="domain-grid"><div className="panel"><span className="section-label">Questions this domain must answer</span>{activeProductDomain.questions.map((question) => <button key={question}>{question}<ArrowRight size={13} /></button>)}</div><div className="panel"><span className="section-label">Specialist competitor set</span><div className="domain-tags">{activeProductDomain.competitors.map((competitor) => <button key={competitor} onClick={() => { const profile = competitors.find((item) => item.name === competitor); if (profile) openCompetitor(profile.id); }}>{competitor}<ChevronRight size={12} /></button>)}</div></div><div className="panel"><span className="section-label">Required evidence layers</span>{activeProductDomain.evidence.map((item) => <span className="evidence-line" key={item}><CircleDot size={11} />{item}</span>)}</div></div>
                <div className="domain-roadmap panel"><ShieldCheck size={16} /><span><b>Trust boundary</b> No market-strength, capability-depth, or regulatory-coverage claim will publish from marketing copy alone. Every claim requires an identified source, retrieval date, evidence class, and review status.</span></div>
              </section>}
              {active === "Enforcement" && <section className="enforcement-overview">
                <div className="domain-brief panel"><div><span className="panel-kicker">Agency action intelligence</span><h2>Inspections, citations, penalties, and repeat activity</h2><p>Enforcement records remain distinct from injury cases and regulations. The shared keys are establishment, company, NAICS, geography, agency, standard, and time.</p></div><div className="domain-status"><span><b>Federal</b> OSHA · EPA · MSHA</span><span><b>State</b> connector matrix</span></div></div>
                <div className="enforcement-dimensions">{["Agency and jurisdiction", "Inspection and case", "Standard and violation", "Initial and final penalty", "Repeat or willful status", "Return visits and related sites", "Establishment and parent", "NAICS and geography"].map((item) => <div className="panel" key={item}><Check size={13} /><span>{item}</span></div>)}</div>
                <div className="jurisdiction-workbench panel"><div className="jurisdiction-summary"><div><span className="panel-kicker">OSHA jurisdiction register</span><h2>Coverage is a dimension, not an assumption</h2><p>The register distinguishes private- and public-sector authority for every state, the District of Columbia, Puerto Rico, and the U.S. Virgin Islands.</p></div><div className="jurisdiction-counts"><span><b>{jurisdictionCounts.full}</b> full plans</span><span><b>{jurisdictionCounts.publicOnly}</b> public-only</span><span><b>{jurisdictionCounts.federal}</b> federal jurisdictions</span></div></div><div className="jurisdiction-detail"><label>Jurisdiction<select value={selectedJurisdictionCode} onChange={(event) => setSelectedJurisdictionCode(event.target.value)}>{jurisdictions.map((jurisdiction) => <option value={jurisdiction.code} key={jurisdiction.code}>{jurisdiction.name}</option>)}</select></label><div><span>Plan type</span><b>{selectedJurisdiction.planType}</b></div><div><span>Private sector</span><b>{selectedJurisdiction.privateSectorAuthority}</b></div><div><span>Public sector</span><b>{selectedJurisdiction.publicSectorAuthority}</b></div><div><span>Connector</span><mark className={selectedJurisdiction.connectorStatus === "Federal dataset mapped" ? "mapped" : "required"}>{selectedJurisdiction.connectorStatus}</mark></div></div><div className="jurisdiction-groups"><div><b>Full State Plans</b><p>{jurisdictions.filter((item) => item.planType === "Full State Plan").map((item) => item.code).join(" · ")}</p></div><div><b>Public-sector-only plans</b><p>{jurisdictions.filter((item) => item.planType === "Public Sector Only").map((item) => item.code).join(" · ")}</p></div><div><b>Federal OSHA private-sector coverage</b><p>{jurisdictions.filter((item) => item.privateSectorAuthority === "Federal OSHA").map((item) => item.code).join(" · ")}</p></div></div></div>
                <div className="domain-roadmap panel"><Info size={16} /><span><b>Coverage rule</b> State Plan coverage is shown independently. A missing state connector cannot be interpreted as zero enforcement.</span></div>
              </section>}
              {active === "Signals" && <section className="signals-workspace">
                <div className="domain-brief panel"><div><span className="panel-kicker">Material change detection</span><h2>What changed—and which strategic question does it affect?</h2><p>Signals route users to evidence-backed investigations. They do not become facts or recommendations until their source, scope, and implications are reviewed.</p></div><div className="domain-status"><span><b>Live</b> regulation · economics</span><span><b>Planned</b> jobs · publications</span></div></div>
                <div className="signal-grid">{[{ title: "EHS hiring demand", status: "Requires licensed API", detail: "Open roles, employer, occupation, skills, geography, industry and posting velocity" }, { title: "Market momentum", status: "Live foundation", detail: "Employment, establishments, wages, payroll, output and concentration" }, { title: "Regulatory change", status: "Live foundation", detail: "Federal Register documents, lifecycle, applicability and effective dates" }, { title: "Industry publications", status: "Connector design", detail: "EHS and vertical publications classified by market, company, topic and materiality" }, { title: "Competitor change", status: "Snapshot model", detail: "Messaging, modules, case studies, releases, leadership and ownership" }, { title: "Enforcement movement", status: "Source expansion", detail: "Inspection, citation, penalty and repeat-action patterns by jurisdiction" }].map((signal) => <article className="panel" key={signal.title}><span><Radar size={14} /><mark>{signal.status}</mark></span><h3>{signal.title}</h3><p>{signal.detail}</p><footer>Review source plan <ArrowRight size={12} /></footer></article>)}</div>
              </section>}
              {active === "Competitors" && <CompetitorWorkspace selectedCompetitorId={selectedCompetitor.id} onSelectCompetitor={openCompetitor} onOpenMarket={(market) => openMarket(market)} />}
              {active === "Regulations" && <section className={`feed-bar ${feedStatus}`}><div><RefreshCw size={15} /><span><b>Federal Register connector</b><small>{feedStatus === "live" ? `${regulatoryDocuments.length} live EHS rulemaking documents normalized with primary-source links` : feedStatus === "degraded" ? "Live feed unavailable; trusted static records remain available without an error screen" : "Checking the official public feed"}</small></span></div><mark>{feedStatus}</mark></section>}
              {active === "Regulations" && <section className="regulation-library"><div className="regulation-summary panel"><div><span className="panel-kicker">Regulatory applicability library</span><h2>Rulemaking events, codified text, and applicability stay separate</h2><p>Federal Register documents identify proposed rules, final rules, notices, dockets, and dates. eCFR is the codified-text layer. Neither becomes an industry obligation until applicability is reviewed.</p></div><div><span><b>{regulatoryDocuments.length}</b> live documents</span><span><b>{visibleRegulations.length}</b> in current cross-section</span><span><b>0</b> auto-approved obligations</span></div></div><div className="regulation-controls panel"><label>Lifecycle<select value={regulationStage} onChange={(event) => setRegulationStage(event.target.value)}>{regulationStages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><span><b>Market scope</b>{selectedVertical}</span><span><b>Jurisdiction</b>Federal rulemaking</span><span><b>Review gate</b>Human applicability required</span></div><div className="regulation-workbench panel"><div className="regulation-list"><div className="regulation-list-head"><span>Document</span><span>Lifecycle</span><span>Published</span></div>{visibleRegulations.length ? visibleRegulations.map((document) => <button className={selectedRegulation?.documentNumber === document.documentNumber ? "selected" : ""} key={document.documentNumber} onClick={() => setSelectedRegulationNumber(document.documentNumber)}><span><b>{document.title}</b><small>{document.agencies.join(" · ") || "Agency unavailable"}</small></span><span><mark>{document.lifecycleStage}</mark><small>{document.documentType}</small></span><span>{document.publicationDate}<ChevronRight size={13} /></span></button>) : <div className="regulation-empty"><Search size={20} /><b>No documents match this cross-section</b><span>Broaden the market, lifecycle, or global search filter.</span></div>}</div>{selectedRegulation && <aside className="regulation-detail"><header><div><mark>{selectedRegulation.lifecycleStage}</mark><span>{selectedRegulation.applicabilityStatus}</span></div><a href={selectedRegulation.htmlUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Primary document</a></header><h2>{selectedRegulation.title}</h2><p>{selectedRegulation.abstract || "The primary document is available, but the API did not supply an abstract."}</p><div className="regulation-facts"><span><b>Publication</b>{selectedRegulation.publicationDate}</span><span><b>Next milestone</b>{selectedRegulation.lifecycleMilestone}</span><span><b>CFR references</b>{selectedRegulation.cfrReferences.join(" · ") || "Not supplied"}</span><span><b>Docket / RIN</b>{[...selectedRegulation.docketIds, ...selectedRegulation.regulationIdNumbers].join(" · ") || "Not supplied"}</span></div><div className="regulation-tags"><span><b>Affected-market candidates</b><i>{selectedRegulation.markets.map((market) => <mark key={market}>{market}</mark>)}</i></span><span><b>Obligation-topic candidates</b><i>{selectedRegulation.topics.map((topic) => <mark key={topic}>{topic}</mark>)}</i></span></div><div className="regulation-source-chain"><b>Required source chain</b><span><i>1</i> Federal Register event</span><span><i>2</i> Docket and RIN continuity</span><span><i>3</i> eCFR codified-text check</span><span><i>4</i> Jurisdiction and market applicability review</span></div><footer><ShieldCheck size={14} /><span><b>Publication boundary</b> Market and topic tags are machine-generated review candidates. They are not legal advice or confirmed applicability.</span></footer></aside>}</div><div className="regulation-coverage-note"><Info size={14} /><span><b>State coverage remains independent.</b> A federal document feed cannot represent State Plan rules, environmental agency requirements, fire codes, utility regulation, or local obligations. Those require jurisdiction-specific connectors and freshness records.</span></div></section>}
              {!(["Data Catalog", "Markets", "Competitors", "Sustainability", "Contractor Management", "Enforcement", "Signals"].includes(active)) && <section className="filter-bar">
                <span><Filter size={14} /> Refine</span>
                <label>Industry<select value={industry} onChange={(event) => setIndustry(event.target.value)}><option>All industries</option><option>Construction</option><option>Manufacturing</option><option>Energy & Utilities</option></select></label>
                <label>Reliability<select value={reliability} onChange={(event) => setReliability(event.target.value)}><option>All reliability</option><option>Verified Fact</option><option>Company Statement</option><option>Source Structure</option></select></label>
                <button onClick={() => { setIndustry("All industries"); setReliability("All reliability"); setQuery(""); }}>Clear filters</button>
              </section>}

              {!(["Data Catalog", "Markets", "Competitors", "Sustainability", "Contractor Management", "Enforcement", "Signals"].includes(active)) && <section className="evidence-layout">
                <div className="record-browser panel">
                  <div className="record-header"><span>Intelligence record</span><span>Domain</span><span>Reliability</span><span>Retrieved</span></div>
                  <div className="record-list">
                    {filtered.length ? filtered.map((record) => <button className={selected.id === record.id ? "record-row selected" : "record-row"} key={record.id} onClick={() => setSelectedId(record.id)}><span><i className="record-icon"><FileCheck2 size={16} /></i><span><b>{record.title}</b><small>{record.summary}</small></span></span><span>{record.domain}</span><ReliabilityBadge value={record.reliability} /><span>{record.retrieved}<ChevronRight size={14} /></span></button>) : <div className="empty-state"><Search size={24} /><h3>No records match these filters</h3><p>Clear one or more filters to broaden the evidence set.</p></div>}
                  </div>
                </div>

                <aside className="evidence-drawer panel">
                  <div className="drawer-top"><div><span className="record-id">{selected.id}</span><ReliabilityBadge value={selected.reliability} /></div><button onClick={exportRecord} aria-label="Download selected record"><Download size={16} /></button></div>
                  <h2>{selected.title}</h2><p className="drawer-summary">{selected.summary}</p>
                  <div className="drawer-section"><span className="section-label">Primary source</span><a href={selected.sourceUrl} target="_blank" rel="noreferrer"><i><ExternalLink size={15} /></i><span><strong>{selected.sourceName}</strong><small>{selected.sourceType}</small></span><ArrowUpRight size={14} /></a><dl><div><dt>Published</dt><dd>{selected.published}</dd></div><div><dt>Retrieved</dt><dd>{selected.retrieved}</dd></div></dl></div>
                  <div className="drawer-section"><span className="section-label">Evidence</span><p>{selected.evidence}</p></div>
                  <div className="drawer-section"><span className="section-label">Method & caveat</span><p>{selected.methodology}</p></div>
                  <div className="drawer-section"><span className="section-label">Connected dimensions</span><div className="dimension-group"><b>Industries</b><div>{selected.industries.map((item) => <span key={item}>{item}</span>)}</div></div><div className="dimension-group"><b>Geography</b><div>{selected.geographies.map((item) => <span key={item}>{item}</span>)}</div></div>{selected.agencies.length > 0 && <div className="dimension-group"><b>Agencies</b><div>{selected.agencies.map((item) => <span key={item}>{item}</span>)}</div></div>}</div>
                  <div className="drawer-section related-section"><span className="section-label">Related intelligence</span>{selected.related.map((item) => <button key={item}>{item}<ArrowRight size={13} /></button>)}</div>
                </aside>
              </section>}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
