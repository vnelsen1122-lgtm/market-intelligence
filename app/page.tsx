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

const InjuryWorkspace = dynamic(
  () => import("./injury-workspace").then((module) => module.InjuryWorkspace),
  {
    ssr: false,
    loading: () => <section className="panel loading-state">Loading workplace risk intelligence…</section>,
  },
);

const MarketWorkspace = dynamic(
  () => import("./market-workspace").then((module) => module.MarketWorkspace),
  {
    ssr: false,
    loading: () => <section className="panel loading-state">Loading market intelligence…</section>,
  },
);

const EnforcementWorkspace = dynamic(
  () => import("./enforcement-workspace").then((module) => module.EnforcementWorkspace),
  {
    ssr: false,
    loading: () => <section className="panel loading-state">Loading enforcement intelligence…</section>,
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
  { label: "Data", icon: Database },
  { label: "Competitors", icon: Building2 },
  { label: "Markets", icon: Factory },
  { label: "Injuries", icon: HardHat },
  { label: "Products", icon: Network },
  { label: "Regulations", icon: BookOpenCheck },
  { label: "Enforcement", icon: ShieldCheck },
  { label: "Corporate Activity", icon: Network },
];

const dataNavigation = [
  { label: "Data Catalog", shortLabel: "Catalog" },
  { label: "Data Operations", shortLabel: "Operations" },
  { label: "Sources", shortLabel: "Sources" },
  { label: "Signals", shortLabel: "Signals" },
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
  return <div className="product-mark" aria-label="Market Intelligence"><span className="system-monogram">MI</span><span className="mark-copy"><strong>MARKET INTELLIGENCE</strong></span></div>;
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
  const [contextOpen, setContextOpen] = useState(false);
  const [selectedProductDomain, setSelectedProductDomain] = useState<keyof typeof productDomains>("Sustainability");

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
  const activeProductDomain = active === "Products" ? productDomains[selectedProductDomain] : null;
  const isDataSection = dataNavigation.some((item) => item.label === active);
  const supportsHeaderSearch = ["Data Catalog", "Regulations", "Sources"].includes(active);
  const searchPlaceholder = active === "Regulations" ? "Search regulations, agencies or CFR references" : active === "Sources" ? "Search sources or coverage" : "Search data domains or source layers";
  const visibleCatalogDomains = useMemo(() => {
    const text = query.toLowerCase().trim();
    return text ? domainCatalog.filter((item) => Object.values(item).join(" ").toLowerCase().includes(text)) : domainCatalog;
  }, [query]);
  const visibleSources = useMemo(() => {
    const text = query.toLowerCase().trim();
    return text ? sources.filter((source) => Object.values(source).join(" ").toLowerCase().includes(text)) : sources;
  }, [query]);
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
    if (label === "Sustainability" || label === "Contractor Management") setSelectedProductDomain(label);
    const destination = label === "Data" ? "Data Catalog" : label === "Sustainability" || label === "Contractor Management" ? "Products" : label;
    setActive(destination);
    setQuery("");
    if (destination === "Competitors") setFocusMode("competitor");
    if (destination === "Markets") setFocusMode("market");
    if (destination !== "Sources") {
      const first = allRecords.find((record) => destination === "Data Catalog" || record.domain === destination || (destination === "Markets" && record.domain === "Industries") || (destination === "Enforcement" && record.domain === "Enforcement & Injuries"));
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

  const resetWorkspace = () => {
    setQuery("");
    setIndustry("All industries");
    setReliability("All reliability");
    setSelectedVertical("All markets");
    setSelectedSegment("All segments");
    setSelectedGeography("North America");
    setRegulationStage("All stages");
    setSelectedProductDomain("Sustainability");
    setImportCandidate(null);
    setFocusMode(active === "Competitors" ? "competitor" : "market");
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
          <div className="header-main"><ProductMark /><nav className="primary-nav" aria-label="Primary">{navigation.map(({ label, icon: Icon }, index) => <button key={label} data-accent={index % 4} className={(label === "Data" ? isDataSection : active === label) ? "nav-item active" : "nav-item"} onClick={() => selectNavigation(label)}><Icon size={14} strokeWidth={1.8} /><span>{label}</span></button>)}</nav></div>
          <div className="topbar">
            {isDataSection ? <nav className="section-nav" aria-label="Data areas">{dataNavigation.map((item) => <button className={active === item.label ? "active" : ""} onClick={() => selectNavigation(item.label)} key={item.label}>{item.shortLabel}</button>)}</nav> : <div className="active-path"><span>Active</span><b>{active}</b></div>}
            {supportsHeaderSearch && <div className="search-wrap"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} /></div>}
            <div className="source-status"><span className={`system-pill ${feedStatus}`}><i /> Rules {feedStatus}</span><span className={`system-pill ${dataFeedStatus}`}><i /> Markets {dataFeedStatus}</span><button onClick={() => selectNavigation("Sources")}>Sources <ArrowUpRight size={12} /></button></div><button className="export-button" onClick={exportRecord}><Download size={14} /> Export</button>
          </div>
        </header>

        <div className={`content intelligence-content${active === "Competitors" ? " competitor-content" : active === "Injuries" ? " injury-content" : ""}`}>
          {!["Competitors", "Injuries"].includes(active) && <section className="workspace-heading">
            <div><h1>{active}</h1></div>
            {!["Competitors", "Injuries"].includes(active) && <div className="workspace-meta"><span><b>{active === "Sources" ? sources.length : active === "Data Operations" ? sourceRegistry.length : filtered.length}</b> {active === "Data Operations" ? "registered sources" : "records in view"}</span><button onClick={resetWorkspace}><RefreshCw size={14} /> Reset view</button></div>}
          </section>}

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
            <InjuryWorkspace />
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
                {visibleSources.map((source) => <div className="catalog-row" key={source.name}><span><i><Database size={15} /></i><b>{source.name}</b><small>{source.owner}</small></span><span>{source.type}</span><span>{source.method}</span><span>{source.coverage}</span><span>{source.cadence}</span><span><mark className={source.status === "Ready" ? "ready" : source.status === "Mapped" ? "mapped" : "progress"}>{source.status}</mark></span></div>)}
              </div>
              <div className="coverage-policy"><ShieldCheck size={20} /><div><strong>Publication rule</strong><p>No unsourced claim is eligible for an executive brief, market view, competitor profile, or exported battlecard.</p></div><button>View quality rules <ArrowUpRight size={14} /></button></div>
            </section>
          ) : (
            <>
              {active === "Data Catalog" && <section className="data-catalog-home">
                <div className="catalog-summary panel"><div><span className="panel-kicker">Cross-index architecture</span><h2>One evidence system, joined through governed dimensions</h2><p>The interface follows the data: every domain declares its record grain, stable keys, source authority, update cadence, and coverage boundary before analysis is allowed.</p></div><div className="index-state"><span><b>{domainCatalog.length}</b> governed domains</span><span><b>{sharedDimensions.length}</b> shared dimensions</span><span><b>{sourceRegistry.length}</b> source contracts</span></div></div>
                <div className="catalog-table panel"><div className="catalog-table-row catalog-table-head"><span>Domain</span><span>Record grain</span><span>Join keys</span><span>Primary source layer</span><span>Cadence</span><span>Coverage</span></div>{visibleCatalogDomains.map((item) => <button className="catalog-table-row" key={item.domain} onClick={() => selectNavigation(item.domain)}><span><b>{item.domain}</b></span><span>{item.grain}</span><span><code>{item.keys}</code></span><span>{item.sources}</span><span>{item.cadence}</span><span>{item.coverage}<ChevronRight size={13} /></span></button>)}</div>
                <div className="dimension-register panel"><div className="dimension-register-heading"><span className="panel-kicker">Conformed dimensions</span><h2>Shared keys make every cross-section reproducible</h2><p>These hierarchies persist across tabs. Unknown mappings remain null and visible; they are never guessed into a category.</p></div><div className="dimension-register-list">{sharedDimensions.map((dimension) => <div key={dimension.name}><b>{dimension.name}</b><code>{dimension.hierarchy}</code><span>{dimension.use}</span></div>)}</div></div>
                <div className="catalog-governance"><span><ShieldCheck size={14} /><b>Provenance required</b> source ID · source record ID · published/effective date · retrieved timestamp</span><span><RefreshCw size={14} /><b>Freshness explicit</b> cadence · last success · lag · revision status</span><span><Network size={14} /><b>Joins governed</b> exact · concordance · entity-resolved · unmatched</span><span><Info size={14} /><b>Denominators preserved</b> population and coverage shown with every rate</span></div>
              </section>}
              {active === "Markets" && <MarketWorkspace records={intelligenceFeed?.economic.records ?? []} selectedVertical={selectedVertical} selectedSegment={selectedSegment} onOpenMarket={openMarket} />}
              {activeProductDomain && <section className="product-domain">
                <nav className="product-domain-nav" aria-label="Product intelligence areas"><button className={selectedProductDomain === "Sustainability" ? "active" : ""} onClick={() => setSelectedProductDomain("Sustainability")}><Leaf size={15} /><b>Sustainability</b></button><button className={selectedProductDomain === "Contractor Management" ? "active" : ""} onClick={() => setSelectedProductDomain("Contractor Management")}><Network size={15} /><b>Contractor Management</b></button></nav>
                <div className="domain-grid"><div className="panel"><span className="section-label">Questions this domain must answer</span>{activeProductDomain.questions.map((question) => <button key={question}>{question}<ArrowRight size={13} /></button>)}</div><div className="panel"><span className="section-label">Specialist competitor set</span><div className="domain-tags">{activeProductDomain.competitors.map((competitor) => <button key={competitor} onClick={() => { const profile = competitors.find((item) => item.name === competitor); if (profile) openCompetitor(profile.id); }}>{competitor}<ChevronRight size={12} /></button>)}</div></div><div className="panel"><span className="section-label">Required evidence layers</span>{activeProductDomain.evidence.map((item) => <span className="evidence-line" key={item}><CircleDot size={11} />{item}</span>)}</div></div>
                <div className="domain-roadmap panel"><ShieldCheck size={16} /><span><b>Trust boundary</b> No market-strength, capability-depth, or regulatory-coverage claim will publish from marketing copy alone. Every claim requires an identified source, retrieval date, evidence class, and review status.</span></div>
              </section>}
              {active === "Enforcement" && <EnforcementWorkspace />}
              {active === "Signals" && <section className="signals-workspace">
                <div className="domain-brief panel"><div><span className="panel-kicker">Material change detection</span><h2>What changed—and which strategic question does it affect?</h2><p>Signals route users to evidence-backed investigations. They do not become facts or recommendations until their source, scope, and implications are reviewed.</p></div><div className="domain-status"><span><b>Live</b> regulation · economics</span><span><b>Planned</b> jobs · publications</span></div></div>
                <div className="signal-grid">{[{ title: "EHS hiring demand", status: "Requires licensed API", detail: "Open roles, employer, occupation, skills, geography, industry and posting velocity" }, { title: "Market momentum", status: "Live foundation", detail: "Employment, establishments, wages, payroll, output and concentration" }, { title: "Regulatory change", status: "Live foundation", detail: "Federal Register documents, lifecycle, applicability and effective dates" }, { title: "Industry publications", status: "Connector design", detail: "EHS and vertical publications classified by market, company, topic and materiality" }, { title: "Competitor change", status: "Snapshot model", detail: "Messaging, modules, case studies, releases, leadership and ownership" }, { title: "Enforcement movement", status: "Source expansion", detail: "Inspection, citation, penalty and repeat-action patterns by jurisdiction" }].map((signal) => <article className="panel" key={signal.title}><span><Radar size={14} /><mark>{signal.status}</mark></span><h3>{signal.title}</h3><p>{signal.detail}</p><footer>Review source plan <ArrowRight size={12} /></footer></article>)}</div>
              </section>}
              {active === "Competitors" && <CompetitorWorkspace selectedCompetitorId={selectedCompetitor.id} onSelectCompetitor={openCompetitor} />}
              {active === "Regulations" && <section className={`feed-bar ${feedStatus}`}><div><RefreshCw size={15} /><span><b>Federal Register connector</b><small>{feedStatus === "live" ? `${regulatoryDocuments.length} live EHS rulemaking documents normalized with primary-source links` : feedStatus === "degraded" ? "Live feed unavailable; trusted static records remain available without an error screen" : "Checking the official public feed"}</small></span></div><mark>{feedStatus}</mark></section>}
              {active === "Regulations" && <section className="regulation-library"><div className="regulation-summary panel"><div><span className="panel-kicker">Regulatory applicability library</span><h2>Rulemaking events, codified text, and applicability stay separate</h2><p>Federal Register documents identify proposed rules, final rules, notices, dockets, and dates. eCFR is the codified-text layer. Neither becomes an industry obligation until applicability is reviewed.</p></div><div><span><b>{regulatoryDocuments.length}</b> live documents</span><span><b>{visibleRegulations.length}</b> in current cross-section</span><span><b>0</b> auto-approved obligations</span></div></div><div className="regulation-controls panel"><label>Lifecycle<select value={regulationStage} onChange={(event) => setRegulationStage(event.target.value)}>{regulationStages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><span><b>Market scope</b>{selectedVertical}</span><span><b>Jurisdiction</b>Federal rulemaking</span><span><b>Review gate</b>Human applicability required</span></div><div className="regulation-workbench panel"><div className="regulation-list"><div className="regulation-list-head"><span>Document</span><span>Lifecycle</span><span>Published</span></div>{visibleRegulations.length ? visibleRegulations.map((document) => <button className={selectedRegulation?.documentNumber === document.documentNumber ? "selected" : ""} key={document.documentNumber} onClick={() => setSelectedRegulationNumber(document.documentNumber)}><span><b>{document.title}</b><small>{document.agencies.join(" · ") || "Agency unavailable"}</small></span><span><mark>{document.lifecycleStage}</mark><small>{document.documentType}</small></span><span>{document.publicationDate}<ChevronRight size={13} /></span></button>) : <div className="regulation-empty"><Search size={20} /><b>No documents match this cross-section</b><span>Broaden the market, lifecycle, or global search filter.</span></div>}</div>{selectedRegulation && <aside className="regulation-detail"><header><div><mark>{selectedRegulation.lifecycleStage}</mark><span>{selectedRegulation.applicabilityStatus}</span></div><a href={selectedRegulation.htmlUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Primary document</a></header><h2>{selectedRegulation.title}</h2><p>{selectedRegulation.abstract || "The primary document is available, but the API did not supply an abstract."}</p><div className="regulation-facts"><span><b>Publication</b>{selectedRegulation.publicationDate}</span><span><b>Next milestone</b>{selectedRegulation.lifecycleMilestone}</span><span><b>CFR references</b>{selectedRegulation.cfrReferences.join(" · ") || "Not supplied"}</span><span><b>Docket / RIN</b>{[...selectedRegulation.docketIds, ...selectedRegulation.regulationIdNumbers].join(" · ") || "Not supplied"}</span></div><div className="regulation-tags"><span><b>Affected-market candidates</b><i>{selectedRegulation.markets.map((market) => <mark key={market}>{market}</mark>)}</i></span><span><b>Obligation-topic candidates</b><i>{selectedRegulation.topics.map((topic) => <mark key={topic}>{topic}</mark>)}</i></span></div><div className="regulation-source-chain"><b>Required source chain</b><span><i>1</i> Federal Register event</span><span><i>2</i> Docket and RIN continuity</span><span><i>3</i> eCFR codified-text check</span><span><i>4</i> Jurisdiction and market applicability review</span></div><footer><ShieldCheck size={14} /><span><b>Publication boundary</b> Market and topic tags are machine-generated review candidates. They are not legal advice or confirmed applicability.</span></footer></aside>}</div><div className="regulation-coverage-note"><Info size={14} /><span><b>State coverage remains independent.</b> A federal document feed cannot represent State Plan rules, environmental agency requirements, fire codes, utility regulation, or local obligations. Those require jurisdiction-specific connectors and freshness records.</span></div></section>}
              {!(["Data Catalog", "Markets", "Competitors", "Products", "Enforcement", "Signals"].includes(active)) && <section className="filter-bar">
                <span><Filter size={14} /> Refine</span>
                <label>Industry<select value={industry} onChange={(event) => setIndustry(event.target.value)}><option>All industries</option><option>Construction</option><option>Manufacturing</option><option>Energy & Utilities</option></select></label>
                <label>Reliability<select value={reliability} onChange={(event) => setReliability(event.target.value)}><option>All reliability</option><option>Verified Fact</option><option>Company Statement</option><option>Source Structure</option></select></label>
                <button onClick={() => { setIndustry("All industries"); setReliability("All reliability"); setQuery(""); }}>Clear filters</button>
              </section>}

              {!(["Data Catalog", "Markets", "Competitors", "Products", "Enforcement", "Signals"].includes(active)) && <section className="evidence-layout">
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
        <section className={`context-rail${contextOpen ? " open" : ""}${active === "Competitors" ? " competitor-context-rail" : ""}`}>
          {contextOpen && <div className="context-rail-controls">
            <label>Lens<select value={focusMode} onChange={(event) => event.target.value === "competitor" ? openCompetitor(selectedCompetitorId) : setFocusMode("market")}><option value="market">Market</option><option value="competitor">Competitor</option></select></label>
            {focusMode === "competitor" && <label>Competitor<select value={selectedCompetitorId} onChange={(event) => openCompetitor(event.target.value)}>{competitors.map((competitor) => <option value={competitor.id} key={competitor.id}>{competitor.name}</option>)}</select></label>}
            <label>Market<select value={selectedVertical} onChange={(event) => { setSelectedVertical(event.target.value); setSelectedSegment("All segments"); }}><option>All markets</option>{(focusMode === "competitor" ? verticals.filter((vertical) => selectedCompetitor.marketRelevance.includes(vertical)) : verticals).map((vertical) => <option key={vertical}>{vertical}</option>)}</select></label>
            <label>Segment<select value={selectedSegment} onChange={(event) => setSelectedSegment(event.target.value)}><option value="All segments">All segments</option>{marketSegments.filter((segment) => selectedVertical === "All markets" || segment.vertical === selectedVertical).map((segment) => <option value={segment.id} key={segment.id}>{segment.segment}</option>)}</select></label>
            {active !== "Competitors" && <label>Geography<select value={selectedGeography} onChange={(event) => setSelectedGeography(event.target.value)}><option>North America</option><option>United States</option><option>State</option><option>Metro</option><option>Facility / project</option></select></label>}
          </div>}
          <div className="context-rail-summary"><span><small>Active</small><b>{active}</b></span><span><small>{active === "Competitors" ? "Company" : "Context"}</small><b>{focusMode === "competitor" ? selectedCompetitor.name : selectedVertical}</b></span><span><small>{active === "Competitors" ? "Market" : "Detail"}</small><b>{active === "Competitors" ? selectedVertical : selectedSegment !== "All segments" ? marketSegments.find((segment) => segment.id === selectedSegment)?.segment : "All segments"}</b></span><span><small>{active === "Competitors" ? "Use case" : "Geography"}</small><b>{active === "Competitors" ? "Sales + strategy" : selectedGeography}</b></span><button className="context-rail-toggle" onClick={() => setContextOpen((current) => !current)} aria-expanded={contextOpen}><PanelsTopLeft size={13} /> Adjust <ChevronRight className={contextOpen ? "open" : ""} size={13} /></button></div>
        </section>
      </section>
    </main>
  );
}
