"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Building2,
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
  Leaf,
  Menu,
  Network,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

const navigation = [
  { label: "Navigator", icon: Radar },
  { label: "Industries", icon: Factory },
  { label: "Enforcement & Injuries", icon: HardHat },
  { label: "Regulations", icon: BookOpenCheck },
  { label: "Competitors", icon: Building2 },
  { label: "Sustainability", icon: Leaf },
  { label: "Corporate Activity", icon: Network },
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

  const allRecords = useMemo(() => [...liveRecords, ...records], [liveRecords]);

  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim();
    return allRecords.filter((record) => {
      const domainMatch = ["Navigator", "Sources"].includes(active) || record.domain === active;
      const industryMatch = industry === "All industries" || record.industries.includes(industry);
      const reliabilityMatch = reliability === "All reliability" || record.reliability === reliability;
      const haystack = [record.title, record.summary, record.domain, ...record.industries, ...record.geographies, ...record.agencies, ...record.entities].join(" ").toLowerCase();
      return domainMatch && industryMatch && reliabilityMatch && (!text || haystack.includes(text));
    });
  }, [active, allRecords, industry, query, reliability]);

  const selected = allRecords.find((record) => record.id === selectedId) ?? filtered[0] ?? allRecords[0];

  const selectNavigation = (label: string) => {
    setActive(label);
    setMenuOpen(false);
    if (label !== "Sources") {
      const first = allRecords.find((record) => label === "Navigator" || record.domain === label);
      if (first) setSelectedId(first.id);
    }
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
    const markdown = `# Evidence-Backed Battlecard\n\n**Status:** Draft — source review required\n**Exported:** ${new Date().toISOString()}\n\n## Intelligence record\n${selected.title}\n\n## What the evidence supports\n${selected.evidence}\n\n## Source\n- ${selected.sourceName}: ${selected.sourceUrl}\n- Reliability: ${selected.reliability}\n- Published: ${selected.published}\n- Retrieved: ${selected.retrieved}\n\n## Method and caveat\n${selected.methodology}\n\n## Connected topics\n${selected.related.map((item) => `- ${item}`).join("\n")}\n\n## Required before sales use\n- Verify competitor identity and current packaging\n- Source each feature and functionality claim\n- Separate marketed capability from demonstrated capability\n- Add approved Novara positioning and objection handling\n`;
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "evidence-backed-battlecard.md";
    anchor.click();
    URL.revokeObjectURL(url);
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
          <section className="workspace-heading">
            <div><span className="eyebrow"><FileSearch size={14} /> INTELLIGENCE WORKSPACE</span><h1>{active}</h1><p>{active === "Sources" ? "Inspect coverage, ownership, update method, and source health before trusting an output." : "Navigate evidence as connected records—not disconnected dashboard tiles."}</p></div>
            <div className="workspace-meta"><span><b>{active === "Sources" ? sources.length : filtered.length}</b> records in view</span><button><RefreshCw size={14} /> Last structured today</button></div>
          </section>

          {active === "Sources" ? (
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
              {active === "Competitors" && <section className="battlecard-bar"><div><span className="panel-kicker">Evidence-gated output</span><h2>Battlecard assembly</h2><p>Exports carry source, date, reliability, and caveats. Unsupported feature claims remain blocked.</p></div><div className="gate-list"><span><Check size={12} /> Source attached</span><span><Check size={12} /> Reliability labeled</span><span className="pending">Packaging review required</span></div><button onClick={exportBattlecard}><Download size={14} /> Export draft battlecard</button></section>}
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
