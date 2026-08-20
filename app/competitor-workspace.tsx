"use client";

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  Check,
  ChevronRight,
  CircleDot,
  Download,
  ExternalLink,
  Factory,
  FileSearch,
  Info,
  LockKeyhole,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { competitorArchetypes, competitors, type CompetitorProfile } from "./competitor-data";
import {
  competitorDomains,
  deepCompetitorIntelligence,
  inferDomains,
  novaraBaseline,
  sourcePolicies,
  type CompetitorIntelligence,
} from "./competitor-intelligence";
import { marketSegments } from "./market-data";

type WorkspaceTab = "Command center" | "Products" | "Evidence" | "Activity" | "Compare" | "Battle card" | "Intelligence inbox";
type IntakeRecord = { id: string; competitorId: string; title: string; sourceType: string; sourceUrl: string; excerpt: string; tags: string[]; markets: string[]; modules: string[]; createdAt: string; status: "Needs review" };
type ContextBrief = { subject: string; markets: string[]; modules: string[]; competitors: CompetitorProfile[]; caveat: string };
type UploadDraft = { name: string; text: string; characters: number; error?: string };
type SourceScan = { scannedAt: string; pages: Array<{ url: string; title?: string; description?: string; headings?: string[]; signals?: string[]; observedAt?: string; error?: string }> };
type PublicationFeed = { refreshedAt: string; sources: Array<{ name: string; url: string; tier: string; status: string; error?: string; articles: Array<{ title: string; url: string; themes: string[] }> }> };

const tabs: Array<{ label: WorkspaceTab; description: string }> = [
  { label: "Command center", description: "Position, strengths and pressure points" },
  { label: "Products", description: "Modules, domains and proof gaps" },
  { label: "Evidence", description: "Customers, reviews and sources" },
  { label: "Activity", description: "Product, AI and corporate changes" },
  { label: "Compare", description: "Cross-competitor capability matrix" },
  { label: "Battle card", description: "Sales-ready evidence and questions" },
  { label: "Intelligence inbox", description: "Upload and route new evidence" },
];
const sourceTypes = ["Field note", "Call or event transcript", "Comparative quote", "Pricing evidence", "Analyst briefing", "Public website", "Review or forum observation"];
const languageFrames: Array<[string, string[]]> = [
  ["AI & automation", ["ai", "artificial intelligence", "automation", "assistant", "predictive"]],
  ["Platform consolidation", ["platform", "all-in-one", "connected", "unified", "suite"]],
  ["Service & expertise", ["consulting", "expertise", "support", "implementation", "regulatory"]],
  ["Cost & value", ["price", "pricing", "cost", "expensive", "discount", "quote", "value"]],
  ["Frontline usability", ["mobile", "offline", "frontline", "easy to use", "adoption"]],
  ["Risk & trust", ["risk", "compliance", "audit", "verified", "security", "governance"]],
];
const marketTerms: Array<[string, string[]]> = [
  ["Construction", ["construction", "contractor", "concrete", "data center", "infrastructure"]],
  ["Manufacturing", ["manufacturing", "factory", "plant", "chemical", "automotive", "food and beverage"]],
  ["Energy & Utilities", ["energy", "utility", "utilities", "renewable", "solar", "wind", "oil", "gas", "mining"]],
  ["Waste & Water", ["waste", "water", "wastewater", "recycling", "environmental services"]],
];
const moduleTerms: Array<[string, string[]]> = [
  ["Incident Management", ["incident", "injury", "near miss", "corrective action"]],
  ["Training", ["training", "lms", "learning", "course"]],
  ["Contractor Management", ["contractor", "prequalification", "supplier", "insurance"]],
  ["Sustainability", ["sustainability", "esg", "carbon", "emissions", "ghg"]],
  ["Chemical & SDS", ["chemical", "sds", "safety data sheet", "hazardous material"]],
  ["Audits & Inspections", ["audit", "inspection", "observation", "checklist"]],
  ["Environmental Compliance", ["environmental", "air permit", "water permit", "waste", "epa"]],
  ["Analytics & Reporting", ["analytics", "dashboard", "reporting", "benchmark"]],
];

function unique<T>(items: T[]) { return [...new Set(items)]; }
function findMatches(text: string, dictionary: Array<[string, string[]]>) { const normalized = text.toLowerCase(); return dictionary.filter(([, terms]) => terms.some((term) => normalized.includes(term))).map(([label]) => label); }
function download(name: string, content: string) { const url = URL.createObjectURL(new Blob([content], { type: "text/markdown" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); }
function faviconFor(url: string) { try { return `${new URL(url).origin}/favicon.ico`; } catch { return ""; } }
function postureFor(competitor: CompetitorProfile, intelligence?: CompetitorIntelligence) {
  if (intelligence) return { motion: intelligence.buyingMotion, tier: intelligence.marketTier, strength: intelligence.industries.slice(0, 3).join(" · ") };
  if (competitor.archetype === "Construction Safety") return { motion: "Vertical specialist", tier: "Mid-market to enterprise", strength: "Construction and field workflows" };
  if (competitor.archetype === "Contractor Risk") return { motion: "Network and risk specialist", tier: "Enterprise", strength: "Contractor and supplier governance" };
  if (competitor.archetype === "EHSQ & Operational Risk") return { motion: "Broad risk suite", tier: "Enterprise and global", strength: "Complex operational-risk environments" };
  return { motion: "EHS platform", tier: "Mid-market to enterprise", strength: "Multi-module EHS operations" };
}
function moduleGroup(module: string) {
  const text = module.toLowerCase();
  if (/training|learning/.test(text)) return "Safety & Training";
  if (/sustain|esg|carbon|emission/.test(text)) return "Sustainability";
  if (/contractor|supplier|insurance|prequal/.test(text)) return "Contractor Management";
  if (/chemical|sds|hazardous/.test(text)) return "Chemical & SDS";
  if (/operational|process|control of work|permit|moc|risk/.test(text)) return "Operational Risk";
  return "Core EHS";
}

export function CompetitorWorkspace({ selectedCompetitorId, onSelectCompetitor, onOpenMarket }: { selectedCompetitorId: string; onSelectCompetitor: (id: string) => void; onOpenMarket: (market: string) => void }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("Command center");
  const [archetype, setArchetype] = useState("All archetypes");
  const [domain, setDomain] = useState("All capabilities");
  const [competitorQuery, setCompetitorQuery] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>(["velocityehs", "cority", "benchmark-gensuite"]);
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>([]);
  const [intakeText, setIntakeText] = useState("");
  const [intakeTitle, setIntakeTitle] = useState("");
  const [intakeSourceType, setIntakeSourceType] = useState(sourceTypes[0]);
  const [intakeSourceUrl, setIntakeSourceUrl] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [contextBrief, setContextBrief] = useState<ContextBrief | null>(null);
  const [uploadDrafts, setUploadDrafts] = useState<UploadDraft[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [sourceScan, setSourceScan] = useState<SourceScan | null>(null);
  const [scanStatus, setScanStatus] = useState("");
  const [publicationFeed, setPublicationFeed] = useState<PublicationFeed | null>(null);
  const [feedStatus, setFeedStatus] = useState("");

  const selectedCompetitor = competitors.find((competitor) => competitor.id === selectedCompetitorId) ?? competitors[0];
  const intelligence = deepCompetitorIntelligence[selectedCompetitor.id];
  const selectedDomains = intelligence?.domains ?? inferDomains(selectedCompetitor.modules, selectedCompetitor.messagingTags);
  const posture = postureFor(selectedCompetitor, intelligence);

  useEffect(() => { const stored = window.localStorage.getItem("market-intelligence-competitor-intake"); if (stored) { try { setIntakeRecords(JSON.parse(stored) as IntakeRecord[]); } catch { setIntakeRecords([]); } } }, []);

  const visibleCompetitors = useMemo(() => competitors.filter((competitor) => {
    const competitorIntelligence = deepCompetitorIntelligence[competitor.id];
    const domains = competitorIntelligence?.domains ?? inferDomains(competitor.modules, competitor.messagingTags);
    const archetypeMatch = archetype === "All archetypes" || competitor.archetype === archetype;
    const domainMatch = domain === "All capabilities" || domains.includes(domain);
    const query = competitorQuery.toLowerCase().trim();
    return archetypeMatch && domainMatch && (!query || [competitor.name, competitor.platform, competitor.archetype, ...competitor.modules, ...competitor.messagingTags, ...domains].join(" ").toLowerCase().includes(query));
  }), [archetype, competitorQuery, domain]);

  const selectedIntake = intakeRecords.filter((record) => record.competitorId === selectedCompetitor.id);
  const currentTags = unique([...selectedCompetitor.messagingTags, ...selectedIntake.flatMap((record) => record.tags)]);
  const overlap = selectedCompetitor.modules.filter((module) => novaraBaseline.modules.some((baselineModule) => baselineModule.toLowerCase().includes(module.toLowerCase().split(" ")[0]) || module.toLowerCase().includes(baselineModule.toLowerCase().split(" ")[0])));
  const comparisonCompetitors = compareIds.map((id) => competitors.find((competitor) => competitor.id === id)).filter((competitor): competitor is CompetitorProfile => Boolean(competitor));
  const selectorCompetitors = visibleCompetitors.some((competitor) => competitor.id === selectedCompetitor.id) ? visibleCompetitors : [selectedCompetitor, ...visibleCompetitors];
  const comparisonDomains = competitorDomains.filter((item) => item !== "All capabilities");
  const researchCount = Object.keys(deepCompetitorIntelligence).length;

  const toggleCompare = (id: string) => {
    setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : [...current.slice(1), id]);
  };

  const saveIntake = () => {
    const text = intakeText.trim(); if (!text) return;
    const record: IntakeRecord = { id: `intake-${Date.now()}`, competitorId: selectedCompetitor.id, title: intakeTitle.trim() || `${intakeSourceType} — ${selectedCompetitor.name}`, sourceType: intakeSourceType, sourceUrl: intakeSourceUrl.trim(), excerpt: text.slice(0, 800), tags: findMatches(text, languageFrames), markets: findMatches(text, marketTerms), modules: findMatches(text, moduleTerms), createdAt: new Date().toISOString(), status: "Needs review" };
    const next = [record, ...intakeRecords]; setIntakeRecords(next); window.localStorage.setItem("market-intelligence-competitor-intake", JSON.stringify(next)); setIntakeText(""); setIntakeTitle(""); setIntakeSourceUrl("");
  };

  const inspectFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadStatus(`Extracting ${files.length} record${files.length === 1 ? "" : "s"}…`);
    const drafts = await Promise.all([...files].map(async (file): Promise<UploadDraft> => {
      const body = new FormData(); body.append("file", file);
      try {
        const response = await fetch("/api/competitors/extract", { method: "POST", body });
        const result = await response.json() as { text?: string; characters?: number; error?: string };
        return result.text ? { name: file.name, text: result.text, characters: result.characters ?? result.text.length } : { name: file.name, text: "", characters: 0, error: result.error ?? "No readable text extracted." };
      } catch { return { name: file.name, text: "", characters: 0, error: "Extraction service could not be reached." }; }
    }));
    setUploadDrafts(drafts); setUploadStatus(`${drafts.filter((draft) => draft.text).length} of ${drafts.length} records ready for intelligence routing.`);
  };

  const routeUploadDrafts = () => {
    const ready = uploadDrafts.filter((draft) => draft.text);
    if (!ready.length) return;
    const now = new Date().toISOString();
    const records = ready.map((draft, index): IntakeRecord => {
      const namedCompetitor = competitors.find((competitor) => draft.text.toLowerCase().includes(competitor.name.toLowerCase()) || draft.text.toLowerCase().includes(competitor.platform.toLowerCase()));
      const competitorId = namedCompetitor?.id ?? selectedCompetitor.id;
      const novaraContext = /\bkpa\b/i.test(draft.text) ? ["Novara context"] : [];
      return { id: `intake-${Date.now()}-${index}`, competitorId, title: draft.name, sourceType: intakeSourceType, sourceUrl: intakeSourceUrl.trim(), excerpt: draft.text.slice(0, 1200), tags: unique([...findMatches(draft.text, languageFrames), ...novaraContext]), markets: findMatches(draft.text, marketTerms), modules: findMatches(draft.text, moduleTerms), createdAt: now, status: "Needs review" };
    });
    const next = [...records, ...intakeRecords]; setIntakeRecords(next); window.localStorage.setItem("market-intelligence-competitor-intake", JSON.stringify(next)); setUploadDrafts([]); setUploadStatus(`${records.length} records analyzed and routed to competitor review queues.`);
  };

  const refreshOfficialSources = async () => {
    setScanStatus("Refreshing approved official sources…"); setSourceScan(null);
    try {
      const response = await fetch("/api/competitors/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ competitorId: selectedCompetitor.id }) });
      const result = await response.json() as SourceScan & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Source refresh failed.");
      setSourceScan(result); setScanStatus(`${result.pages.filter((page) => !page.error).length} approved sources refreshed.`);
    } catch (error) { setScanStatus(error instanceof Error ? error.message : "Source refresh failed."); }
  };

  const refreshPublicationFeed = async () => {
    setFeedStatus("Refreshing EHS publications and agencies…"); setPublicationFeed(null);
    try {
      const response = await fetch("/api/competitors/feed", { cache: "no-store" });
      const result = await response.json() as PublicationFeed;
      setPublicationFeed(result); setFeedStatus(`${result.sources.filter((source) => source.status === "live").length} market sources live.`);
    } catch { setFeedStatus("Publication refresh could not complete."); }
  };

  const buildContextBrief = () => {
    const source = contextInput.trim(); if (!source) return;
    const markets = findMatches(source, marketTerms); const modules = findMatches(source, moduleTerms);
    const fallbackMarkets = markets.length ? markets : ["Requires market classification"]; const fallbackModules = modules.length ? modules : ["Incident Management", "Audits & Inspections", "Training"];
    const likelyCompetitors = competitors.filter((competitor) => competitor.marketRelevance.some((market) => markets.includes(market)) && competitor.modules.some((module) => fallbackModules.some((candidate) => module.toLowerCase().includes(candidate.split(" ")[0].toLowerCase())))).slice(0, 6);
    setContextBrief({ subject: source.slice(0, 120), markets: fallbackMarkets, modules: fallbackModules, competitors: likelyCompetitors.length ? likelyCompetitors : competitors.filter((competitor) => competitor.marketRelevance.some((market) => markets.includes(market))).slice(0, 6), caveat: "Keyword routing only. Company identity, NAICS, installed systems, requirements and buying intent require verification." });
  };

  const exportBattlecard = () => {
    const why = intelligence?.whyTheyWin.map((item) => `- ${item.claim}\n  - Basis: ${item.basis}\n  - Source: ${item.sourceUrl}`).join("\n") || `- ${selectedCompetitor.statedPositioning}\n  - Source: ${selectedCompetitor.officialUrl}`;
    const pressure = intelligence?.pressurePoints.map((item) => `- ${item.signal}\n  - Boundary: ${item.boundary}`).join("\n") || "- Module depth, pricing, implementation and customer proof require research.";
    const questions = intelligence?.questionsToTest.map((item) => `- ${item}`).join("\n") || "- Which workflows are native, packaged and proven in the target industry?";
    const sources = (intelligence?.sources ?? selectedCompetitor.monitoredSurfaces.map((surface) => ({ label: surface.label, url: surface.url }))).map((source) => `- ${source.label}: ${source.url}`).join("\n");
    download(`${selectedCompetitor.id}-battle-card.md`, `# ${selectedCompetitor.name} — Evidence-Gated Battle Card\n\n**Exported:** ${new Date().toISOString()}\n**Research status:** ${intelligence?.researchStatus ?? "Source map only"}\n**Confidential layer:** Excluded from this public-safe export\n\n## Market posture\n- Motion: ${posture.motion}\n- Tier: ${posture.tier}\n- Strongest context: ${posture.strength}\n\n## Why they win\n${why}\n\n## Pressure points to validate\n${pressure}\n\n## Public Novara comparison basis\n${novaraBaseline.strengths.map((item) => `- ${item}`).join("\n")}\n\nThese are Novara company statements, not approved comparative claims.\n\n## Questions to test\n${questions}\n\n## Sources\n${sources}\n`);
  };

  return <section className="ci-suite">
    <div className="ci-scope-rail panel">
      <div className="ci-suite-title"><span className="panel-kicker">Competitor suite</span><b>{competitors.length} companies · {researchCount} priority research passes</b></div>
      <label><Search size={13} /><input value={competitorQuery} onChange={(event) => setCompetitorQuery(event.target.value)} placeholder="Company, module, market, message" /></label>
      <select value={archetype} onChange={(event) => setArchetype(event.target.value)}>{competitorArchetypes.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Selected competitor" value={selectedCompetitor.id} onChange={(event) => onSelectCompetitor(event.target.value)}>{selectorCompetitors.map((competitor) => <option value={competitor.id} key={competitor.id}>{competitor.name}</option>)}</select>
      <span className="ci-result-count"><b>{visibleCompetitors.length}</b> in scope</span>
    </div>

    <div className="ci-domain-rail" aria-label="Competitor capability filters">
      {competitorDomains.map((item) => <button className={domain === item ? "active" : ""} onClick={() => setDomain(item)} key={item}>{item}<small>{item === "All capabilities" ? competitors.length : competitors.filter((competitor) => (deepCompetitorIntelligence[competitor.id]?.domains ?? inferDomains(competitor.modules, competitor.messagingTags)).includes(item)).length}</small></button>)}
    </div>

    <div className="ci-company-strip" aria-label="Competitors in scope">
      {visibleCompetitors.slice(0, 12).map((competitor) => {
        const deep = deepCompetitorIntelligence[competitor.id];
        return <button className={selectedCompetitor.id === competitor.id ? "selected" : ""} onClick={() => onSelectCompetitor(competitor.id)} key={competitor.id}>
          <span className="ci-mini-logo"><img src={faviconFor(competitor.officialUrl)} alt="" />{competitor.name.slice(0, 2).toUpperCase()}</span>
          <span><b>{competitor.name}</b><small>{deep ? "Researched" : "Source map"} · {competitor.modules.length} modules</small></span>
          <ChevronRight size={12} />
        </button>;
      })}
      {visibleCompetitors.length > 12 && <span className="ci-more-companies">+{visibleCompetitors.length - 12} available in selector</span>}
    </div>

    <div className="ci-profile-header panel">
      <div className="ci-company-mark"><img src={faviconFor(selectedCompetitor.officialUrl)} alt="" /><Building2 size={18} /></div>
      <div><span className="panel-kicker">{selectedCompetitor.archetype} · {intelligence?.researchStatus ?? "Source map only"}</span><h2>{selectedCompetitor.name}</h2><p>{selectedCompetitor.statedPositioning}</p></div>
      <div className="ci-profile-facts">
        <span><b>{posture.tier}</b><small>Market tier</small></span>
        <span><b>{selectedCompetitor.modules.length}</b><small>Mapped modules</small></span>
        <span><b>{intelligence?.sources.length ?? selectedCompetitor.monitoredSurfaces.length + 1}</b><small>Sourced surfaces</small></span>
        <a href={selectedCompetitor.officialUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Official site</a>
      </div>
    </div>

    <nav className="ci-tabs" aria-label="Competitor workspace sections">
      {tabs.map((tab) => <button className={activeTab === tab.label ? "active" : ""} key={tab.label} onClick={() => setActiveTab(tab.label)}><b>{tab.label}</b><small>{tab.description}</small>{tab.label === "Intelligence inbox" && selectedIntake.length > 0 && <mark>{selectedIntake.length}</mark>}</button>)}
    </nav>

    {activeTab === "Command center" && <div className="ci-command-grid">
      <article className="panel ci-decision-room">
        <header><div><span className="section-label">Decision view</span><h2>Why {selectedCompetitor.name} matters</h2></div><mark>{intelligence ? "Public research current" : "Research required"}</mark></header>
        <div className="ci-decision-columns">
          <section><span className="ci-section-icon"><Radar size={14} /></span><b>Why they win</b>{(intelligence?.whyTheyWin ?? [{ claim: selectedCompetitor.statedPositioning, basis: "Official company positioning; deeper corroboration required.", sourceUrl: selectedCompetitor.officialUrl }]).map((item) => <details key={item.claim}><summary>{item.claim}</summary><p>{item.basis}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">View evidence <ArrowUpRight size={11} /></a></details>)}</section>
          <section><span className="ci-section-icon"><AlertTriangle size={14} /></span><b>Pressure points to test</b>{(intelligence?.pressurePoints ?? [{ signal: "Pricing, implementation, module depth and customer outcomes have not been researched.", boundary: "Unknown, not a verified weakness." }]).map((item) => <details key={item.signal}><summary>{item.signal}</summary><p>{item.boundary}</p></details>)}</section>
          <section><span className="ci-section-icon"><Bot size={14} /></span><b>AI posture</b><div className="ci-ai-card"><strong>{intelligence?.ai.label ?? (selectedDomains.includes("AI") ? "AI referenced" : "No researched AI position")}</strong><p>{intelligence?.ai.summary ?? "A source-specific AI research pass is required before comparison."}</p>{intelligence?.ai.capabilities.map((capability) => <mark key={capability}>{capability}</mark>)}{intelligence?.ai.sourceUrl && <a href={intelligence.ai.sourceUrl} target="_blank" rel="noreferrer">Open AI source <ArrowUpRight size={11} /></a>}</div></section>
        </div>
        <footer><ShieldCheck size={14} /><span><b>Evidence rule:</b> weakness claims remain questions until corroborated. Company statements, vendor case studies, reviews and internal evidence stay visibly separate.</span></footer>
      </article>

      <aside className="panel ci-company-facts"><span className="section-label">Company and market</span><div><span><small>Motion</small><b>{posture.motion}</b></span><span><small>Headquarters</small><b>{intelligence?.headquarters ?? "Research required"}</b></span><span><small>Founded</small><b>{intelligence?.founded ?? "Research required"}</b></span><span><small>Strong contexts</small><b>{posture.strength}</b></span></div><span className="section-label">Capability domains</span><div className="ci-tag-cloud">{selectedDomains.map((item) => <button key={item} onClick={() => setDomain(item)}>{item}</button>)}</div></aside>

      <aside className="panel ci-market-map"><span className="section-label">Market intersections</span>{selectedCompetitor.marketRelevance.map((market) => { const segments = marketSegments.filter((segment) => segment.vertical === market); return <button onClick={() => onOpenMarket(market)} key={market}><Factory size={14} /><span><b>{market}</b><small>{segments.length} mapped segments</small></span><ChevronRight size={13} /></button>; })}</aside>

      <article className="panel ci-source-gate"><header><div><span className="section-label">Source governance</span><h2>What can enter the system</h2></div><button onClick={() => setActiveTab("Evidence")}>View evidence <ArrowRight size={12} /></button></header><div>{sourcePolicies.slice(0, 5).map((policy) => <span key={policy.source}><i className={policy.decision.includes("Approved") ? "approved" : "conditional"} /><b>{policy.source}</b><small>{policy.decision}</small></span>)}</div><footer><LockKeyhole size={13} /> Internal battle cards are intentionally excluded from the public deployment bundle.</footer></article>
    </div>}

    {activeTab === "Products" && <div className="ci-product-layout">
      <article className="panel ci-module-map"><header><div><span className="panel-kicker">Product map</span><h2>Module → domain → proof status</h2></div><mark>Company-stated baseline</mark></header><div className="ci-module-table"><div><span>Module</span><span>Capability domain</span><span>Evidence</span><span>Next diligence</span></div>{selectedCompetitor.modules.map((module) => <article key={module}><b>{module}</b><span>{moduleGroup(module)}</span><span><Check size={11} /> Official source mapped</span><button onClick={() => { setActiveTab("Intelligence inbox"); setIntakeTitle(`${module} workflow evidence`); }}>Add proof <ArrowRight size={11} /></button></article>)}</div><footer><Info size={14} /> A module name does not prove workflow depth, packaging, offline availability, integration quality or customer adoption.</footer></article>
      <aside className="panel ci-overlap-card"><span className="section-label">Public comparison basis</span><h2>Novara overlap</h2><p>{overlap.length} likely module intersections based on public naming. This is routing—not a feature-parity claim.</p><div>{overlap.map((item) => <span key={item}><CircleDot size={10} />{item}</span>)}</div><a href={novaraBaseline.sourceUrl} target="_blank" rel="noreferrer">Open Novara baseline <ArrowUpRight size={11} /></a></aside>
    </div>}

    {activeTab === "Evidence" && <div className="ci-evidence-workspace">
      <article className="panel ci-proof-panel"><header><div><span className="section-label">Named customer proof</span><h2>Outcomes with attribution boundaries</h2></div><mark>{intelligence?.customerProof.length ?? 0} mapped</mark></header>{intelligence?.customerProof.length ? intelligence.customerProof.map((proof) => <details open key={proof.customer}><summary><span><b>{proof.customer}</b><small>{proof.industry}</small></span><ArrowUpRight size={12} /></summary><p>{proof.outcome}</p><small>{proof.caveat}</small><a href={proof.sourceUrl} target="_blank" rel="noreferrer">Open case study</a></details>) : <div className="ci-empty"><FileSearch size={18} /><b>No named proof mapped yet</b><span>Official case studies and outcome attribution require a research pass.</span></div>}</article>
      <article className="panel ci-review-panel"><header><div><span className="section-label">Review signals</span><h2>Directional—not dispositive</h2></div><mark>{intelligence?.reviewSignals.length ?? 0} sources</mark></header>{intelligence?.reviewSignals.length ? intelligence.reviewSignals.map((review) => <div key={review.platform}><span><b>{review.platform}</b><strong>{review.score}</strong><small>{review.sample}</small></span><p>{review.themes.map((theme) => <mark key={theme}>{theme}</mark>)}</p><small>{review.caveat}</small><a href={review.sourceUrl} target="_blank" rel="noreferrer">Open review source <ArrowUpRight size={11} /></a></div>) : <div className="ci-empty"><Search size={18} /><b>No governed review sample yet</b><span>Review collection remains link-only until platform licensing and sampling rules are approved.</span></div>}</article>
      <article className="panel ci-source-register"><header><div><span className="section-label">Evidence register</span><h2>Current public source chain</h2></div><mark>{intelligence?.sources.length ?? selectedCompetitor.monitoredSurfaces.length + 1} sources</mark></header>{(intelligence?.sources ?? selectedCompetitor.monitoredSurfaces.map((surface) => ({ label: surface.label, url: surface.url, tier: "Primary" as const, purpose: "Official source monitoring", observedAt: selectedCompetitor.retrieved, caveat: "Company statement." }))).map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.label}><span className={`ci-tier ${source.tier.toLowerCase().replace(" ", "-")}`}>{source.tier}</span><span><b>{source.label}</b><small>{source.purpose}</small></span><span><small>Observed</small><b>{source.observedAt}</b></span><p>{source.caveat}</p><ArrowUpRight size={12} /></a>)}</article>
      <article className="panel ci-policy-table"><header><span className="section-label">Collection decisions requiring approval</span><h2>Source policy</h2></header>{sourcePolicies.map((policy) => <details key={policy.source}><summary><span><b>{policy.source}</b><small>{policy.decision}</small></span><ChevronRight size={12} /></summary><p><b>Use:</b> {policy.use}</p><p><b>Boundary:</b> {policy.boundary}</p></details>)}</article>
    </div>}

    {activeTab === "Activity" && <div className="ci-activity-layout">
      <article className="panel ci-activity-stream"><header><div><span className="section-label">Change timeline</span><h2>Material product and company movement</h2></div><mark>{intelligence?.activity.length ?? 0} researched events</mark></header>{intelligence?.activity.length ? intelligence.activity.map((event) => <div key={`${event.date}-${event.title}`}><i /><span><small>{event.date} · {event.type}</small><b>{event.title}</b><p>{event.summary}</p></span><a href={event.sourceUrl} target="_blank" rel="noreferrer">Evidence <ArrowUpRight size={11} /></a></div>) : <div className="ci-empty"><Radar size={18} /><b>Baseline only</b><span>Newsroom, release-note and help-center monitoring has not completed its first research pass.</span></div>}{selectedIntake.map((record) => <div className="pending" key={record.id}><i /><span><small>{record.createdAt.slice(0, 10)} · {record.sourceType}</small><b>{record.title}</b><p>{record.tags.length ? `Detected frames: ${record.tags.join(", ")}` : "No controlled linguistic frame detected."}</p></span><mark>{record.status}</mark></div>)}</article>
      <aside className="panel ci-monitor-plan"><span className="section-label">Official-source refresh</span><button onClick={refreshOfficialSources} disabled={scanStatus.startsWith("Refreshing")}><RefreshCw size={12} /> Refresh {selectedCompetitor.name}</button><small className="ci-live-status">{scanStatus || `${selectedCompetitor.monitoredSurfaces.length + (intelligence?.sources.length ?? 1)} approved surfaces ready`}</small>{sourceScan ? sourceScan.pages.map((page) => <a className={page.error ? "unavailable" : ""} href={page.url} target="_blank" rel="noreferrer" key={page.url}><Radar size={13} /><span><b>{page.title || new URL(page.url).hostname}</b><small>{page.error || page.signals?.join(" · ") || "Official source refreshed"}</small></span><ArrowUpRight size={11} /></a>) : selectedCompetitor.monitoredSurfaces.map((surface) => <a href={surface.url} target="_blank" rel="noreferrer" key={surface.label}><Radar size={13} /><span><b>{surface.label}</b><small>Approved official website</small></span><ArrowUpRight size={11} /></a>)}<div><ShieldCheck size={13} /><p>Only the competitor’s approved official domains are scanned. Results are live observations—not independent proof.</p></div></aside>
      <article className="panel ci-publication-feed"><header><div><span className="section-label">External EHS signal layer</span><h2>Agencies and major industry publications</h2></div><button onClick={refreshPublicationFeed} disabled={feedStatus.startsWith("Refreshing")}><FileSearch size={12} /> Refresh market watch</button></header><small className="ci-live-status">{feedStatus || "OSHA, MSHA, EHS Today, Safety+Health and EHS Daily Advisor ready"}</small>{publicationFeed ? <div>{publicationFeed.sources.map((source) => <section key={source.name}><span><b>{source.name}</b><small>{source.tier} · {source.status}</small></span>{source.articles.slice(0, 5).map((article) => <a href={article.url} target="_blank" rel="noreferrer" key={article.url}><b>{article.title}</b><small>{article.themes.join(" · ") || "EHS market signal"}</small><ArrowUpRight size={11} /></a>)}{!source.articles.length && <small>{source.error || "No current article links detected."}</small>}</section>)}</div> : <div className="ci-feed-ready"><FileSearch size={18} /><b>Live web refresh is ready</b><span>Pull current headlines directly into the intelligence workspace instead of waiting for uploads.</span></div>}</article>
    </div>}

    {activeTab === "Compare" && <div className="ci-compare-workspace">
      <aside className="panel ci-compare-picker"><span className="section-label">Comparison set</span><h2>Select up to four</h2><p>Use filters above to narrow the market, then add companies to the matrix.</p>{visibleCompetitors.map((competitor) => <label key={competitor.id}><input type="checkbox" checked={compareIds.includes(competitor.id)} onChange={() => toggleCompare(competitor.id)} /><span className="ci-mini-logo"><img src={faviconFor(competitor.officialUrl)} alt="" />{competitor.name.slice(0, 2).toUpperCase()}</span><span><b>{competitor.name}</b><small>{deepCompetitorIntelligence[competitor.id]?.researchStatus ?? "Source map only"}</small></span></label>)}</aside>
      <article className="panel ci-compare-matrix"><header><div><span className="section-label">Capability landscape</span><h2>Cross-competitor public evidence</h2></div><mark>{comparisonCompetitors.length} selected</mark></header><div className="ci-matrix-row head"><span>Capability</span>{comparisonCompetitors.map((competitor) => <span key={competitor.id}>{competitor.name}</span>)}</div>{comparisonDomains.map((capability) => <div className="ci-matrix-row" key={capability}><b>{capability}</b>{comparisonCompetitors.map((competitor) => { const domains = deepCompetitorIntelligence[competitor.id]?.domains ?? inferDomains(competitor.modules, competitor.messagingTags); return <span className={domains.includes(capability) ? "mapped" : "unknown"} key={competitor.id}>{domains.includes(capability) ? <><Check size={11} /> Mapped</> : "Not mapped"}</span>; })}</div>)}<footer><ShieldCheck size={13} /> “Mapped” means public evidence exists for the domain. It does not establish feature parity, quality, packaging or customer adoption.</footer></article>
    </div>}

    {activeTab === "Battle card" && <div className="ci-battlecard-layout">
      <article className="panel ci-battlecard-main"><header><div><span className="section-label">Evidence-gated battle card</span><h2>{selectedCompetitor.name}</h2></div><button onClick={exportBattlecard}><Download size={13} /> Export Markdown</button></header><div className="ci-battlecard-grid"><section><b>Why they win</b>{(intelligence?.whyTheyWin ?? []).map((item) => <span key={item.claim}><Check size={11} />{item.claim}</span>)}{!intelligence && <span><Info size={11} />Research pass required.</span>}</section><section><b>How Novara can compete</b>{novaraBaseline.strengths.slice(0, 4).map((item) => <span key={item}><ArrowRight size={11} />Lead with proof of {item.toLowerCase()} when relevant.</span>)}</section><section><b>Questions to expose fit</b>{(intelligence?.questionsToTest ?? ["Which workflows, integrations and services are non-negotiable?", "What must work offline and across sites?", "What is included in the current package?"]).map((item) => <span key={item}><Search size={11} />{item}</span>)}</section><section><b>Claims not approved</b>{(intelligence?.pressurePoints ?? []).map((item) => <span key={item.signal}><AlertTriangle size={11} />{item.signal}</span>)}<small>Pressure points remain questions until public, review, field or product evidence is approved.</small></section></div><footer><LockKeyhole size={13} /> Internal battle-card claims are not included because the current deployment is public. Connect authenticated storage before publishing confidential positioning.</footer></article>
      <aside className="panel ci-message-house"><span className="section-label">Current message house</span><h2>{selectedCompetitor.platform}</h2><p>{selectedCompetitor.statedPositioning}</p><div className="message-tags">{currentTags.map((tag) => <span key={tag}>{tag}</span>)}</div><span className="section-label">Novara public baseline</span><p>{novaraBaseline.boundary}</p><a href={novaraBaseline.sourceUrl} target="_blank" rel="noreferrer">Review baseline <ArrowUpRight size={11} /></a></aside>
    </div>}

    {activeTab === "Intelligence inbox" && <div className="ci-intake-layout">
      <article className="panel ci-intake-form"><span className="panel-kicker">Supplemental evidence lane</span><h2>Analyze records and route the intelligence</h2><p className="ci-intake-priority">Official websites and publications are the primary feed. Uploads add field notes, quotes, transcripts and historical evidence.</p><div className="ci-input-row"><label>Evidence type<select value={intakeSourceType} onChange={(event) => setIntakeSourceType(event.target.value)}>{sourceTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Title<input value={intakeTitle} onChange={(event) => setIntakeTitle(event.target.value)} placeholder="Event brief, pricing quote, customer observation…" /></label></div><label className="ci-file-input"><UploadCloud size={16} /><span><b>Choose one or many records</b><small>TXT, CSV, JSON, HTML, DOCX, PPTX, XLSX and readable PDFs are extracted and analyzed.</small></span><input type="file" multiple accept=".txt,.md,.csv,.tsv,.json,.html,.htm,.xml,.docx,.pptx,.xlsx,.pdf" onChange={(event) => inspectFiles(event.target.files)} /></label>{uploadStatus && <small className="ci-live-status">{uploadStatus}</small>}{uploadDrafts.length > 0 && <div className="ci-upload-drafts">{uploadDrafts.map((draft) => <span className={draft.error ? "error" : ""} key={draft.name}><b>{draft.name}</b><small>{draft.error || `${draft.characters.toLocaleString()} readable characters · ready to route`}</small></span>)}<button onClick={routeUploadDrafts} disabled={!uploadDrafts.some((draft) => draft.text)}><Sparkles size={13} /> Analyze and route {uploadDrafts.filter((draft) => draft.text).length} records</button></div>}<label>Source URL or reference<input value={intakeSourceUrl} onChange={(event) => setIntakeSourceUrl(event.target.value)} placeholder="Optional public URL or controlled reference" /></label><label>Paste a single evidence record<textarea value={intakeText} onChange={(event) => setIntakeText(event.target.value)} placeholder="Paste a transcript excerpt, comparative quote, pricing discussion, field note, or public-source passage." /></label><button onClick={saveIntake} disabled={!intakeText.trim()}><Sparkles size={14} /> Analyze and route pasted evidence</button><footer><ShieldCheck size={13} /> Records are classified by competitor, messaging frame, market and module. They remain reviewable evidence—not automatically verified fact.</footer></article>
      <article className="panel ci-context-brief"><span className="panel-kicker">Account and website context</span><h2>Map a prospect to likely EHS priorities</h2><p>Paste a company description, profile, website text, or notes. The system routes market, workflow, and competitor candidates.</p><textarea value={contextInput} onChange={(event) => setContextInput(event.target.value)} placeholder="Example: A concrete contractor operating large data-center construction sites with a mobile field workforce…" /><button onClick={buildContextBrief} disabled={!contextInput.trim()}><Sparkles size={14} /> Build routing brief</button>{contextBrief && <div className="ci-brief-result"><span><b>Market candidates</b>{contextBrief.markets.map((item) => <mark key={item}>{item}</mark>)}</span><span><b>Likely workflow priorities</b>{contextBrief.modules.map((item) => <mark key={item}>{item}</mark>)}</span><span><b>Likely competitive set</b>{contextBrief.competitors.map((item) => <button key={item.id} onClick={() => onSelectCompetitor(item.id)}>{item.name}<ChevronRight size={11} /></button>)}</span><small><Info size={11} /> {contextBrief.caveat}</small></div>}</article>
      <article className="panel ci-review-queue"><header><div><span className="panel-kicker">Local review queue</span><h2>{selectedCompetitor.name} contributions</h2></div><mark>{selectedIntake.length} pending</mark></header>{selectedIntake.length ? selectedIntake.map((record) => <div key={record.id}><span><small>{record.createdAt.slice(0, 10)} · {record.sourceType}</small><b>{record.title}</b><p>{record.excerpt}</p><i>{unique([...record.tags, ...record.markets, ...record.modules]).map((tag) => <mark key={tag}>{tag}</mark>)}</i></span><mark>{record.status}</mark></div>) : <div className="ci-empty"><UploadCloud size={18} /><b>No contributed intelligence yet</b><span>Uploads stay in this browser only until authenticated shared evidence storage is connected.</span></div>}</article>
    </div>}

    <div className="ci-status-rail">
      <span><small>Scope</small><b>{domain}</b></span>
      <span><small>Selected</small><b>{selectedCompetitor.name}</b></span>
      <span><small>Research</small><b>{intelligence?.researchStatus ?? "Source map only"}</b></span>
      <span><small>Evidence</small><b>{intelligence?.sources.length ?? selectedCompetitor.monitoredSurfaces.length + 1} public sources</b></span>
      <span className="locked"><LockKeyhole size={12} /><small>Internal layer</small><b>Locked pending authentication</b></span>
      <button onClick={exportBattlecard}><Download size={12} /> Export public-safe card</button>
    </div>
  </section>;
}
