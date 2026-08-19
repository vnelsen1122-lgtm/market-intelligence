"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  Calculator,
  Check,
  ChevronDown,
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
  Menu,
  Network,
  PanelsTopLeft,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { competitors } from "./competitor-data";
import { marketSegments, verticals } from "./market-data";
import { importContract, sourceRegistry } from "./source-registry";

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
  }>;
};

type FocusMode = "market" | "competitor";

type IntelligenceFeed = {
  retrievedAt: string;
  economic: {
    status: "live" | "degraded";
    source: string;
    records: Array<{ id: string; label: string; naics: string; employment: number | null; establishments: number | null; employmentGrowth: number | null; establishmentGrowth: number | null; averageWeeklyWage: number | null; period: string; status: "live" | "unavailable" }>;
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
  { label: "Navigator", icon: Radar },
  { label: "Industries", icon: Factory },
  { label: "Enforcement & Injuries", icon: HardHat },
  { label: "Regulations", icon: BookOpenCheck },
  { label: "Competitors", icon: Building2 },
  { label: "Sustainability", icon: Leaf },
  { label: "Corporate Activity", icon: Network },
  { label: "Data Operations", icon: UploadCloud },
  { label: "Sources", icon: Database },
];

const records: IntelligenceRecord[] = [
  {
    id: "reg-heat-001",
    domain: "Regulations",
    title: "Heat Injury and Illness Prevention rulemaking",
    summary: "A source-traceable regulatory record designed to connect rulemaking activity to affected industries, operating conditions, and applicable Novara capabilities.",
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
    summary: "A market record structure for comparing employment, wages, establishment counts, and location quotients across Novara-priority segments.",
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
  return <div className="product-mark" aria-label="Novara Intelligence"><span className="mark-glyph"><i /><i /><i /></span><span className="mark-copy"><strong>NOVARA</strong><small>INTELLIGENCE</small></span></div>;
}

function ReliabilityBadge({ value }: { value: Reliability }) {
  return <span className={`reliability ${reliabilityClass[value]}`}><ShieldCheck size={12} />{value}</span>;
}

export default function Home() {
  const [active, setActive] = useState("Navigator");
  const [selectedId, setSelectedId] = useState(records[0].id);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [reliability, setReliability] = useState("All reliability");
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveRecords, setLiveRecords] = useState<IntelligenceRecord[]>([]);
  const [feedStatus, setFeedStatus] = useState<"loading" | "live" | "degraded">("loading");
  const [selectedVertical, setSelectedVertical] = useState("All markets");
  const [selectedSegment, setSelectedSegment] = useState("All segments");
  const [selectedGeography, setSelectedGeography] = useState("North America");
  const [focusMode, setFocusMode] = useState<FocusMode>("market");
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(competitors[0].id);
  const [intelligenceFeed, setIntelligenceFeed] = useState<IntelligenceFeed | null>(null);
  const [dataFeedStatus, setDataFeedStatus] = useState<"loading" | "live" | "degraded">("loading");
  const [importCandidate, setImportCandidate] = useState<{ name: string; size: number; type: string; header: string[] } | null>(null);

  useEffect(() => {
    let activeRequest = true;
    fetch("/api/regulations")
      .then((response) => response.json())
      .then((payload: FeedResponse) => {
        if (!activeRequest) return;
        setFeedStatus(payload.status);
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
  const focusedSegments = useMemo(() => marketSegments.filter((segment) => {
    const verticalMatch = selectedVertical === "All markets" || segment.vertical === selectedVertical;
    const segmentMatch = selectedSegment === "All segments" || segment.id === selectedSegment;
    return verticalMatch && segmentMatch;
  }), [selectedSegment, selectedVertical]);
  const activeSegment = useMemo(() => marketSegments.find((segment) => segment.id === selectedSegment), [selectedSegment]);
  const intensity = useMemo(() => {
    if (!activeSegment) return null;
    const environmentTerms = ["environment", "air", "water", "waste", "permit", "emissions", "discharge"];
    const contractorTerms = ["contractor", "subcontractor", "temporary", "service"];
    const regulatoryValue = Math.min(100, activeSegment.agencies.length * 14 + activeSegment.obligations.length * 10);
    const environmentalMatches = activeSegment.obligations.filter((item) => environmentTerms.some((term) => item.toLowerCase().includes(term))).length;
    const environmentalValue = Math.min(100, environmentalMatches * 28 + (activeSegment.agencies.some((agency) => agency.includes("EPA") || agency.toLowerCase().includes("environment")) ? 24 : 0));
    const contractorMatches = activeSegment.workforce.filter((item) => contractorTerms.some((term) => item.toLowerCase().includes(term))).length;
    const contractorValue = Math.min(100, contractorMatches * 35 + (activeSegment.operationalExposure.some((item) => item.toLowerCase().includes("contractor")) ? 30 : 0));
    const operationalValue = Math.min(100, activeSegment.operationalExposure.length * 20);
    const measuredWeight = 60;
    const measuredPoints = regulatoryValue * .25 + environmentalValue * .15 + contractorValue * .10 + operationalValue * .10;
    const structuralSignal = Math.round(measuredPoints / measuredWeight * 100);
    return {
      structuralSignal,
      evidenceCoverage: measuredWeight,
      factors: [
        { label: "Regulatory breadth", weight: 25, value: regulatoryValue, status: "Mapped structure", evidence: `${activeSegment.agencies.length} agency families and ${activeSegment.obligations.length} obligation groups mapped` },
        { label: "Enforcement pressure", weight: 20, value: null, status: "Data required", evidence: "Requires normalized inspection, citation, penalty, repeat-visit, and establishment denominators" },
        { label: "Injury exposure", weight: 20, value: null, status: "Data required", evidence: "Requires injury, severe-injury, fatality, hours-worked, and occupation denominators" },
        { label: "Environmental obligations", weight: 15, value: environmentalValue, status: "Mapped structure", evidence: `${environmentalMatches} environmental obligation signals plus agency coverage` },
        { label: "Contractor complexity", weight: 10, value: contractorValue, status: "Mapped structure", evidence: `${contractorMatches} contractor-dependent workforce groups identified` },
        { label: "Operational complexity", weight: 10, value: operationalValue, status: "Mapped structure", evidence: `${activeSegment.operationalExposure.length} operating exposure groups identified` },
      ],
    };
  }, [activeSegment]);

  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim();
    return allRecords.filter((record) => {
      const domainMatch = ["Navigator", "Sources"].includes(active) || record.domain === active;
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
    setMenuOpen(false);
    if (label !== "Sources") {
      const first = allRecords.find((record) => label === "Navigator" || record.domain === label);
      if (first) setSelectedId(first.id);
    }
  };

  const openMarket = (vertical: string, segmentId?: string) => {
    setFocusMode("market");
    setSelectedVertical(vertical);
    setSelectedSegment(segmentId ?? "All segments");
    setActive("Industries");
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

  const exportBattlecard = () => {
    const markdown = `# ${selectedCompetitor.name} Evidence-Backed Battlecard\n\n**Status:** Draft — source review required\n**Evidence class:** ${selectedCompetitor.reliability}\n**Exported:** ${new Date().toISOString()}\n\n## Company-stated positioning\n${selectedCompetitor.statedPositioning}\n\n## Company-stated platform\n${selectedCompetitor.platform}\n\n## Company-stated modules\n${selectedCompetitor.modules.map((item) => `- ${item}`).join("\n")}\n\n## Official source\n- ${selectedCompetitor.officialUrl}\n- Retrieved: ${selectedCompetitor.retrieved}\n\n## Market intersections for review\n${selectedCompetitor.marketRelevance.map((item) => `- ${item}`).join("\n")}\n\n## Evidence gaps before sales use\n- Confirm current packaging, editions, and availability\n- Add source-level evidence for feature depth and workflows\n- Add customer evidence and approved analyst research\n- Add dated Novara comparison and approved objection handling\n- Review every claim with product and competitive-intelligence owners\n`;
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedCompetitor.id}-evidence-backed-battlecard.md`;
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
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top"><ProductMark /><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>
        <nav className="primary-nav" aria-label="Primary">
          {navigation.map(({ label, icon: Icon }) => <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => selectNavigation(label)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === "Sources" && <span className="nav-count">7</span>}</button>)}
        </nav>
        <div className="sidebar-brief"><span className="eyebrow inverse"><Sparkles size={13} /> TRUST MODEL</span><p>Every claim retains its source, retrieval date, method, and reliability class.</p><button onClick={() => selectNavigation("Sources")}>Review source policy <ArrowRight size={14} /></button></div>
        <div className="sidebar-footer"><div className="avatar">VN</div><div><strong>Vanessa Nelsen</strong><span>Strategy workspace</span></div><ChevronDown size={15} /></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="search-wrap"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search claims, agencies, companies, NAICS, or geography" /><kbd>⌘ K</kbd></div>
          <div className="topbar-actions"><span className={`system-pill ${feedStatus}`}><span /> {feedStatus === "live" ? "Federal Register live" : feedStatus === "degraded" ? "Using source snapshot" : "Checking sources"}</span><button className="export-button" onClick={exportRecord}><Download size={16} /> Export record</button></div>
        </header>

        <div className="content intelligence-content">
          <div className="demo-banner"><CircleDot size={14} /> Architecture preview — source structures and selected public records only. No Ocean data or uploaded private records are included.</div>
          {active !== "Sources" && <section className={`focus-context ${focusMode}`}>
            <div className="focus-mode"><span><PanelsTopLeft size={14} /> Current focus</span><button className={focusMode === "market" ? "active" : ""} onClick={() => setFocusMode("market")}>Market</button><button className={focusMode === "competitor" ? "active" : ""} onClick={() => openCompetitor(selectedCompetitorId)}>Competitor</button></div>
            {focusMode === "competitor" && <label>Competitor<select value={selectedCompetitorId} onChange={(event) => openCompetitor(event.target.value)}>{competitors.map((competitor) => <option value={competitor.id} key={competitor.id}>{competitor.name}</option>)}</select></label>}
            <label>Market<select value={selectedVertical} onChange={(event) => { setSelectedVertical(event.target.value); setSelectedSegment("All segments"); }}><option>All markets</option>{(focusMode === "competitor" ? verticals.filter((vertical) => selectedCompetitor.marketRelevance.includes(vertical)) : verticals).map((vertical) => <option key={vertical}>{vertical}</option>)}</select></label>
            <label>Segment<select value={selectedSegment} onChange={(event) => setSelectedSegment(event.target.value)}><option value="All segments">All segments</option>{marketSegments.filter((segment) => selectedVertical === "All markets" || segment.vertical === selectedVertical).map((segment) => <option value={segment.id} key={segment.id}>{segment.segment}</option>)}</select></label>
            <label>Geography<select value={selectedGeography} onChange={(event) => setSelectedGeography(event.target.value)}><option>North America</option><option>United States</option><option>State</option><option>Metro</option><option>Facility / project</option></select></label>
            <div className="focus-path"><small>Persistent cross-section</small><b>{focusMode === "competitor" ? `${selectedCompetitor.name} / ` : ""}{selectedVertical}{selectedSegment !== "All segments" ? ` / ${marketSegments.find((segment) => segment.id === selectedSegment)?.segment}` : ""}</b><span>{selectedGeography} · retained across every workspace</span></div>
          </section>}
          <section className="workspace-heading">
            <div><span className="eyebrow"><FileSearch size={14} /> INTELLIGENCE WORKSPACE</span><h1>{active}</h1><p>{active === "Sources" ? "Inspect coverage, ownership, update method, and source health before trusting an output." : active === "Data Operations" ? "Control bulk imports, live connectors, schema contracts, freshness, and publication gates from one place." : "Navigate evidence as connected records—not disconnected dashboard tiles."}</p></div>
            <div className="workspace-meta"><span><b>{active === "Sources" ? sources.length : active === "Data Operations" ? sourceRegistry.length : filtered.length}</b> {active === "Data Operations" ? "registered sources" : "records in view"}</span><button><RefreshCw size={14} /> Last structured today</button></div>
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
                  <div className="pipeline-note"><ShieldCheck size={15} /><span>Economic signals are contextual evidence—not proof that Novara wins or losses were caused by market growth.</span></div>
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
              {["Navigator", "Industries"].includes(active) && <section className="market-navigator">
                <div className="market-entry-grid">
                  {verticals.map((vertical) => {
                    const segments = marketSegments.filter((segment) => segment.vertical === vertical);
                    const agencies = new Set(segments.flatMap((segment) => segment.agencies));
                    return <button key={vertical} className={selectedVertical === vertical ? "market-entry selected" : "market-entry"} onClick={() => openMarket(vertical)}><span><i><Factory size={17} /></i><small>{segments.length} mapped segments</small></span><h2>{vertical}</h2><p>{segments.slice(0, 3).map((segment) => segment.segment).join(" · ")}</p><footer><span>{agencies.size} agency families</span><ChevronRight size={15} /></footer></button>;
                  })}
                </div>
                <div className="segment-explorer panel">
                  <div className="segment-heading"><div><span className="panel-kicker">Market hierarchy</span><h2>{selectedVertical === "All markets" ? "Priority EHS segments" : selectedVertical}</h2></div><p>Open a segment to carry its NAICS, geography, workforce, agency, obligation, exposure, and module context across the application.</p></div>
                  <div className="segment-table"><div className="segment-row segment-head"><span>Segment</span><span>NAICS</span><span>Workforce</span><span>Agency coverage</span><span>Novara modules</span></div>{focusedSegments.map((segment) => <button className={selectedSegment === segment.id ? "segment-row selected" : "segment-row"} key={segment.id} onClick={() => openMarket(segment.vertical, segment.id)}><span><b>{segment.segment}</b><small>{segment.vertical}</small></span><span>{segment.naics.join(", ")}</span><span>{segment.workforce.slice(0, 2).join(" · ")}</span><span>{segment.agencies.slice(0, 2).join(" · ")}</span><span>{segment.novaraModules.slice(0, 2).join(" · ")}<ChevronRight size={13} /></span></button>)}</div>
                </div>
                {activeSegment && intensity && <div className="intensity-workbench panel">
                  <div className="intensity-summary"><div><span className="panel-kicker">Explainable compliance intensity</span><h2>{activeSegment.segment}</h2><p>This is a structural signal, not a market ranking. Missing enforcement and injury evidence is excluded and shown explicitly.</p></div><div className="intensity-score"><small>Structural signal</small><strong>{intensity.structuralSignal}</strong><span>/ 100</span><mark>{intensity.evidenceCoverage}% evidence coverage</mark></div></div>
                  <div className="formula-note"><Calculator size={16} /><div><b>Current calculation</b><span>Regulatory breadth 25% + environmental obligations 15% + contractor complexity 10% + operational complexity 10%. Enforcement pressure 20% and injury exposure 20% remain unscored until source-backed denominators are available.</span></div></div>
                  <div className="factor-grid">{intensity.factors.map((factor) => <article className={factor.value === null ? "factor-card pending" : "factor-card"} key={factor.label}><header><span>{factor.label}<small>{factor.weight}% weight</small></span>{factor.value === null ? <mark>Not scored</mark> : <strong>{factor.value}</strong>}</header>{factor.value !== null && <div className="factor-bar"><i style={{ width: `${factor.value}%` }} /></div>}<p>{factor.evidence}</p><footer>{factor.value === null ? <Info size={12} /> : <Check size={12} />}{factor.status}</footer></article>)}</div>
                  <div className="intensity-policy"><ShieldCheck size={17} /><span><b>Trust rule</b> A full compliance-intensity score cannot publish until required sources, denominators, periods, and geography coverage are recorded for every weighted factor.</span></div>
                </div>}
              </section>}
              {active === "Competitors" && <>
                <section className="competitor-workspace">
                  <div className="competitor-entry-grid">
                    {competitors.map((competitor) => <button className={selectedCompetitor.id === competitor.id ? "competitor-entry selected" : "competitor-entry"} key={competitor.id} onClick={() => openCompetitor(competitor.id)}><span><i><Building2 size={16} /></i><ReliabilityBadge value={competitor.reliability} /></span><h2>{competitor.name}</h2><p>{competitor.platform}</p><footer>{competitor.marketRelevance.length} mapped market intersections<ChevronRight size={14} /></footer></button>)}
                  </div>
                  <div className="competitor-dossier panel">
                    <div className="dossier-summary"><div><span className="panel-kicker">Official-source competitor dossier</span><h2>{selectedCompetitor.name}</h2><p>{selectedCompetitor.statedPositioning}</p></div><a href={selectedCompetitor.officialUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /><span><b>{selectedCompetitor.sourceType}</b><small>Retrieved {selectedCompetitor.retrieved}</small></span><ArrowUpRight size={14} /></a></div>
                    <div className="dossier-grid"><div><span className="section-label">Company-stated platform</span><strong>{selectedCompetitor.platform}</strong><ReliabilityBadge value={selectedCompetitor.reliability} /></div><div><span className="section-label">Company-stated modules</span><div className="module-list">{selectedCompetitor.modules.map((module) => <span key={module}>{module}</span>)}</div></div></div>
                    <div className="intersection-section"><div className="segment-heading"><div><span className="panel-kicker">Cross-sectional navigation</span><h2>Market intersections</h2></div><p>Open any market to carry the intersection into the market hierarchy, its segments, and the explainable compliance-intensity workbench.</p></div><div className="intersection-grid">{selectedCompetitor.marketRelevance.map((vertical) => { const segments = marketSegments.filter((segment) => segment.vertical === vertical); return <button key={vertical} onClick={() => openMarket(vertical)}><span><Factory size={15} /></span><div><b>{vertical}</b><small>{segments.length} mapped segments · {new Set(segments.flatMap((segment) => segment.agencies)).size} agency families</small></div><ChevronRight size={14} /></button>; })}</div></div>
                    <div className="competitor-policy"><ShieldCheck size={17} /><span><b>Evidence boundary</b> These are company statements from official sources—not independently verified feature-depth, packaging, adoption, or comparative-performance claims.</span></div>
                  </div>
                </section>
                <section className="battlecard-bar"><div><span className="panel-kicker">Evidence-gated output</span><h2>{selectedCompetitor.name} battlecard assembly</h2><p>Exports include sourced company statements and explicit evidence gaps. Unsupported comparisons remain blocked.</p></div><div className="gate-list"><span><Check size={12} /> Official source</span><span><Check size={12} /> Reliability labeled</span><span className="pending">Feature depth review required</span></div><button onClick={exportBattlecard}><Download size={14} /> Export draft battlecard</button></section>
              </>}
              {active === "Regulations" && <section className={`feed-bar ${feedStatus}`}><div><RefreshCw size={15} /><span><b>Federal Register connector</b><small>{feedStatus === "live" ? `${liveRecords.length} live OSHA documents normalized with primary-source links` : feedStatus === "degraded" ? "Live feed unavailable; trusted static records remain available without an error screen" : "Checking the official public feed"}</small></span></div><mark>{feedStatus}</mark></section>}
              <section className="filter-bar">
                <span><Filter size={14} /> Refine</span>
                <label>Industry<select value={industry} onChange={(event) => setIndustry(event.target.value)}><option>All industries</option><option>Construction</option><option>Manufacturing</option><option>Energy & Utilities</option></select></label>
                <label>Reliability<select value={reliability} onChange={(event) => setReliability(event.target.value)}><option>All reliability</option><option>Verified Fact</option><option>Company Statement</option><option>Source Structure</option></select></label>
                <button onClick={() => { setIndustry("All industries"); setReliability("All reliability"); setQuery(""); }}>Clear filters</button>
              </section>

              <section className="evidence-layout">
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
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
