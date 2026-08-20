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
  type CompetitorIntelligence,
} from "./competitor-intelligence";
import { marketSegments } from "./market-data";

type WorkspaceTab = "Overview" | "Product depth" | "Messaging & change" | "Customers & reviews" | "Corporate" | "Sales brief" | "Compare" | "Intelligence inbox";
type IntakeRecord = { id: string; competitorId: string; title: string; sourceType: string; sourceUrl: string; excerpt: string; tags: string[]; markets: string[]; modules: string[]; createdAt: string; status: "Needs review" };
type ContextBrief = { subject: string; markets: string[]; modules: string[]; competitors: CompetitorProfile[]; caveat: string };
type UploadDraft = { name: string; text: string; characters: number; error?: string };
type SourceScan = { scannedAt: string; pages: Array<{ url: string; title?: string; description?: string; headings?: string[]; signals?: string[]; observedAt?: string; error?: string }> };
type PublicationFeed = { refreshedAt: string; sources: Array<{ name: string; url: string; tier: string; status: string; error?: string; articles: Array<{ title: string; url: string; themes: string[] }> }> };

const tabs: Array<{ label: WorkspaceTab; description: string }> = [
  { label: "Overview", description: "Position, strengths and markets" },
  { label: "Product depth", description: "Workflows, depth and watchouts" },
  { label: "Messaging & change", description: "Message house and movement" },
  { label: "Customers & reviews", description: "Outcomes and user patterns" },
  { label: "Corporate", description: "Strategy, deals and hiring" },
  { label: "Sales brief", description: "Why they win and how to compete" },
  { label: "Compare", description: "Cross-competitor capability matrix" },
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

export function CompetitorWorkspace({ selectedCompetitorId, onSelectCompetitor }: { selectedCompetitorId: string; onSelectCompetitor: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("Overview");
  const [showAllCompetitors, setShowAllCompetitors] = useState(false);
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
  const [industryFocus, setIndustryFocus] = useState("All industries");

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
  const competitorPublicationFeed = useMemo(() => {
    if (!publicationFeed) return null;
    const terms = unique([selectedCompetitor.name, selectedCompetitor.platform])
      .flatMap((value) => value.toLowerCase().split(/\s+/))
      .filter((value) => value.length > 3 && !["software", "platform", "management"].includes(value));
    return publicationFeed.sources.map((source) => ({
      ...source,
      articles: source.articles.filter((article) => terms.some((term) => article.title.toLowerCase().includes(term))),
    })).filter((source) => source.articles.length);
  }, [publicationFeed, selectedCompetitor.name, selectedCompetitor.platform]);

  const resetView = () => {
    setActiveTab("Overview");
    setShowAllCompetitors(false);
    setArchetype("All archetypes");
    setDomain("All capabilities");
    setCompetitorQuery("");
    setIndustryFocus("All industries");
    setCompareIds(["velocityehs", "cority", "benchmark-gensuite"]);
    setSourceScan(null);
    setPublicationFeed(null);
    setScanStatus("");
    setFeedStatus("");
  };

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

  useEffect(() => {
    setSourceScan(null); setScanStatus("");
    if (activeTab !== "Messaging & change") return;
    void refreshOfficialSources();
    void refreshPublicationFeed();
    const timer = window.setInterval(() => { void refreshOfficialSources(); void refreshPublicationFeed(); }, 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [activeTab, selectedCompetitor.id]);

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
      <div className="ci-suite-title"><b>Competitors</b><span>{researchCount} researched companies</span></div>
      <label><Search size={13} /><input value={competitorQuery} onChange={(event) => setCompetitorQuery(event.target.value)} placeholder="Company, module, market, message" /></label>
      <select value={archetype} onChange={(event) => setArchetype(event.target.value)}>{competitorArchetypes.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Selected competitor" value={selectedCompetitor.id} onChange={(event) => onSelectCompetitor(event.target.value)}>{selectorCompetitors.map((competitor) => <option value={competitor.id} key={competitor.id}>{competitor.name}</option>)}</select>
      <button className="ci-all-button" onClick={() => setShowAllCompetitors((current) => !current)}>{showAllCompetitors ? "Close roster" : `All competitors (${visibleCompetitors.length})`}</button>
    </div>

    <div className="ci-domain-rail" aria-label="Competitor capability filters">
      {competitorDomains.map((item) => <button className={domain === item ? "active" : ""} onClick={() => setDomain(item)} key={item}>{item}<small>{item === "All capabilities" ? competitors.length : competitors.filter((competitor) => (deepCompetitorIntelligence[competitor.id]?.domains ?? inferDomains(competitor.modules, competitor.messagingTags)).includes(item)).length}</small></button>)}
    </div>

    <div className={showAllCompetitors ? "ci-company-strip expanded" : "ci-company-strip"} aria-label="Competitors in scope">
      {visibleCompetitors.map((competitor) => {
        const deep = deepCompetitorIntelligence[competitor.id];
        return <button className={selectedCompetitor.id === competitor.id ? "selected" : ""} onClick={() => { onSelectCompetitor(competitor.id); setShowAllCompetitors(false); }} key={competitor.id}>
          <span className="ci-mini-logo"><img src={faviconFor(competitor.officialUrl)} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />{competitor.name.slice(0, 2).toUpperCase()}</span>
          <span><b>{competitor.name}</b><small>{deep?.buyingMotion ?? competitor.archetype}</small></span>
          <ChevronRight size={12} />
        </button>;
      })}
    </div>

    <div className="ci-profile-header panel">
      <div className="ci-company-mark"><img src={faviconFor(selectedCompetitor.officialUrl)} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><Building2 size={18} /></div>
      <div><span className="panel-kicker">{selectedCompetitor.archetype}</span><h2>{selectedCompetitor.name}</h2><p>{intelligence?.buyingMotion ?? selectedCompetitor.statedPositioning}</p></div>
      <div className="ci-profile-actions"><button onClick={resetView}><RefreshCw size={12} /> Reset view</button><button onClick={() => setShowAllCompetitors(true)}>Switch competitor</button><button onClick={() => setActiveTab("Intelligence inbox")}><UploadCloud size={12} /> Add intelligence</button><a href={selectedCompetitor.officialUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Official site</a></div>
    </div>

    <nav className="ci-tabs" aria-label="Competitor workspace sections">
      {tabs.map((tab) => <button className={activeTab === tab.label ? "active" : ""} key={tab.label} onClick={() => setActiveTab(tab.label)}><b>{tab.label}</b><small>{tab.description}</small></button>)}
    </nav>

    {activeTab === "Overview" && <div className="ci-command-grid">
      <article className="panel ci-decision-room">
        <header><div><span className="section-label">Decision view</span><h2>Why {selectedCompetitor.name} matters</h2></div><mark>{intelligence ? `Reviewed ${intelligence.sources[0]?.observedAt ?? selectedCompetitor.retrieved}` : "Research required"}</mark></header>
        <div className="ci-decision-columns">
          <section><span className="ci-section-icon"><Radar size={14} /></span><b>Why they win</b>{(intelligence?.whyTheyWin ?? [{ claim: selectedCompetitor.statedPositioning, basis: "Official company positioning; deeper corroboration required.", sourceUrl: selectedCompetitor.officialUrl }]).map((item) => <details key={item.claim}><summary>{item.claim}</summary><p>{item.basis}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">View evidence <ArrowUpRight size={11} /></a></details>)}</section>
          <section><span className="ci-section-icon"><AlertTriangle size={14} /></span><b>Pressure points to test</b>{(intelligence?.pressurePoints ?? [{ signal: "Pricing, implementation, module depth and customer outcomes have not been researched.", boundary: "Unknown, not a verified weakness." }]).map((item) => <details key={item.signal}><summary>{item.signal}</summary><p>{item.boundary}</p></details>)}</section>
          <section><span className="ci-section-icon"><ShieldCheck size={14} /></span><b>Why Novara can win</b><div className="ci-win-list">{novaraBaseline.strengths.slice(0, 4).map((item) => <span key={item}><ArrowRight size={11} />Lead with evidence of {item.toLowerCase()} when it matches the buyer’s requirements.</span>)}</div><small className="ci-claim-boundary">Public Novara strengths, not approved comparative claims.</small></section>
          <section><span className="ci-section-icon"><Bot size={14} /></span><b>AI posture</b><div className="ci-ai-card"><strong>{intelligence?.ai.label ?? (selectedDomains.includes("AI") ? "AI referenced" : "No researched AI position")}</strong><p>{intelligence?.ai.summary ?? "A source-specific AI research pass is required before comparison."}</p>{intelligence?.ai.capabilities.map((capability) => <mark key={capability}>{capability}</mark>)}{intelligence?.ai.sourceUrl && <a href={intelligence.ai.sourceUrl} target="_blank" rel="noreferrer">Open AI source <ArrowUpRight size={11} /></a>}</div></section>
        </div>
      </article>

      <aside className="panel ci-company-facts"><span className="section-label">Company and market</span><div><span><small>Motion</small><b>{posture.motion}</b></span><span><small>Headquarters</small><b>{intelligence?.headquarters ?? "Research required"}</b></span><span><small>Founded</small><b>{intelligence?.founded ?? "Research required"}</b></span><span><small>Strong contexts</small><b>{posture.strength}</b></span></div><span className="section-label">Capability domains</span><div className="ci-tag-cloud">{selectedDomains.map((item) => <button key={item} onClick={() => setDomain(item)}>{item}</button>)}</div></aside>

      <aside className="panel ci-market-map"><span className="section-label">Industries with evidence</span>{industryFocus !== "All industries" && <button className="ci-industry-reset" onClick={() => setIndustryFocus("All industries")}><RefreshCw size={12} /> Show all industries</button>}{(intelligence?.industries ?? selectedCompetitor.marketRelevance).map((market) => { const matchedVertical = marketSegments.find((segment) => segment.vertical.toLowerCase().includes(market.toLowerCase()) || market.toLowerCase().includes(segment.vertical.toLowerCase()))?.vertical; const segments = matchedVertical ? marketSegments.filter((segment) => segment.vertical === matchedVertical) : []; return <button className={industryFocus === market ? "selected" : ""} onClick={() => setIndustryFocus(market)} key={market}><Factory size={14} /><span><b>{market}</b><small>{segments.length ? `${segments.length} related segments · stay in competitor view` : "Customer or product evidence mapped"}</small></span><ChevronRight size={13} /></button>; })}</aside>

      <article className="panel ci-workflow-map"><header><div><span className="section-label">Workflow footprint</span><h2>Where this competitor is relevant</h2></div></header><div>{(intelligence?.productDepth ?? selectedCompetitor.modules.map((module) => ({ family: module, depth: "Baseline only" as const, buyerUse: moduleGroup(module) }))).map((item) => <button key={item.family} onClick={() => setActiveTab("Product depth")}><span><b>{item.family}</b><small>{item.depth}</small></span><p>{item.buyerUse}</p><ArrowRight size={12} /></button>)}</div></article>
    </div>}

    {activeTab === "Product depth" && <div className="ci-product-layout">
      <article className="panel ci-depth-review"><header><div><span className="panel-kicker">Product depth</span><h2>What the product actually supports</h2></div><mark>{intelligence?.productDepth?.length ?? selectedCompetitor.modules.length} product areas</mark></header><div>{(intelligence?.productDepth ?? selectedCompetitor.modules.map((module) => ({ family: module, depth: "Baseline only" as const, workflows: [module], buyerUse: `Supports ${module.toLowerCase()} workflows.`, assessment: "Official product naming is mapped; workflow depth has not yet completed the pilot-level research pass.", watchouts: ["Validate workflow depth", "Confirm packaging and implementation"], sourceUrl: selectedCompetitor.officialUrl }))).map((item) => <article key={item.family}><header><span><small>{moduleGroup(item.family)}</small><h3>{item.family}</h3></span><mark>{item.depth}</mark></header><p>{item.assessment}</p><div className="ci-depth-columns"><section><b>Key workflows</b>{item.workflows.map((workflow) => <span key={workflow}><Check size={11} />{workflow}</span>)}</section><section><b>Buyer use</b><p>{item.buyerUse}</p></section><section><b>Sales discovery — validate</b>{item.watchouts.map((watchout) => <span key={watchout}><Search size={11} />{watchout}</span>)}</section></div><a href={item.sourceUrl} target="_blank" rel="noreferrer">Primary product source <ArrowUpRight size={11} /></a></article>)}</div></article>
      <aside className="panel ci-overlap-card"><span className="section-label">Competitive overlap</span><h2>Relevant Novara conversations</h2><p>{overlap.length} product areas share public naming. Use the detailed workflow evidence—not module names—to prepare a comparison.</p><div>{overlap.map((item) => <span key={item}><CircleDot size={10} />{item}</span>)}</div><button onClick={() => setActiveTab("Sales brief")}>Open sales brief <ArrowRight size={11} /></button></aside>
    </div>}

    {activeTab === "Customers & reviews" && <div className="ci-evidence-workspace">
      <article className="panel ci-proof-panel"><header><div><span className="section-label">Customer outcomes</span><h2>Where customers use it and what changed</h2></div><mark>{intelligence?.customerProof.length ?? 0} case studies</mark></header>{intelligence?.customerProof.length ? intelligence.customerProof.map((proof) => <details open key={proof.customer}><summary><span><b>{proof.customer}</b><small>{proof.industry}</small></span><ArrowUpRight size={12} /></summary><p>{proof.outcome}</p><small>{proof.caveat}</small><a href={proof.sourceUrl} target="_blank" rel="noreferrer">Read the case study <ArrowUpRight size={10} /></a></details>) : <div className="ci-empty"><FileSearch size={18} /><b>No named customer study mapped yet</b><span>This competitor is queued for the same case-study research used in the VelocityEHS pilot.</span></div>}</article>
      <article className="panel ci-review-panel"><header><div><span className="section-label">Customer review pattern</span><h2>What users consistently praise and question</h2></div><mark>{intelligence?.reviewSignals.length ?? 0} review sets</mark></header>{intelligence?.reviewSignals.length ? intelligence.reviewSignals.map((review) => <div key={review.platform}><span><b>{review.platform}</b><strong>{review.score}</strong><small>{review.sample}</small></span><div className="ci-review-themes">{review.themes.map((theme) => <span key={theme}><CircleDot size={10} />{theme}</span>)}</div><small>{review.caveat}</small><a href={review.sourceUrl} target="_blank" rel="noreferrer">Inspect the review set <ArrowUpRight size={11} /></a></div>) : <div className="ci-empty"><Search size={18} /><b>No review pattern mapped yet</b><span>Reviews will appear here as synthesized themes with sample and collection caveats—not as a source registry.</span></div>}</article>
      <article className="panel ci-forum-panel"><header><div><span className="section-label">Practitioner forums</span><h2>Recent friction and fit signals</h2></div><mark>{intelligence?.forumSignals?.length ?? 0} observations</mark></header>{intelligence?.forumSignals?.length ? intelligence.forumSignals.map((signal) => <section key={`${signal.platform}-${signal.theme}`}><span><b>{signal.theme}</b><small>{signal.platform} · observed {signal.observedAt}</small></span><p>{signal.summary}</p><small>{signal.caveat}</small><a href={signal.sourceUrl} target="_blank" rel="noreferrer">Open discussion <ArrowUpRight size={11} /></a></section>) : <div className="ci-empty"><Search size={18} /><b>No attributable forum signal mapped</b><span>Only competitor-specific discussions with a date and caveat will appear here.</span></div>}</article>
    </div>}

    {activeTab === "Messaging & change" && <div className="ci-activity-layout">
      <article className="panel ci-message-analysis"><header><div><span className="section-label">Current message house</span><h2>{intelligence?.messaging?.headline ?? selectedCompetitor.platform}</h2></div><a href={intelligence?.messaging?.sourceUrl ?? selectedCompetitor.officialUrl} target="_blank" rel="noreferrer">Current source <ArrowUpRight size={11} /></a></header><p className="ci-message-promise">{intelligence?.messaging?.promise ?? selectedCompetitor.statedPositioning}</p><div>{(intelligence?.messaging?.pillars ?? currentTags.map((tag) => ({ label: tag, evidence: "Current official messaging tag; detailed evidence is queued for the next research pass." }))).map((pillar) => <section key={pillar.label}><b>{pillar.label}</b><p>{pillar.evidence}</p></section>)}</div><footer><b>What changed</b><p>{intelligence?.messaging?.changeSummary ?? "A dated message-change baseline has not yet completed the pilot-level research pass."}</p></footer></article>
      <article className="panel ci-activity-stream"><header><div><span className="section-label">Change timeline</span><h2>Material product and company movement</h2></div><mark>{intelligence?.activity.length ?? 0} researched events</mark></header>{intelligence?.activity.length ? intelligence.activity.map((event) => <div key={`${event.date}-${event.title}`}><i /><span><small>{event.date} · {event.type}</small><b>{event.title}</b><p>{event.summary}</p></span><a href={event.sourceUrl} target="_blank" rel="noreferrer">Evidence <ArrowUpRight size={11} /></a></div>) : <div className="ci-empty"><Radar size={18} /><b>Baseline only</b><span>Newsroom, release-note and help-center monitoring has not completed its first research pass.</span></div>}{selectedIntake.map((record) => <div className="pending" key={record.id}><i /><span><small>{record.createdAt.slice(0, 10)} · {record.sourceType}</small><b>{record.title}</b><p>{record.tags.length ? `Detected frames: ${record.tags.join(", ")}` : "No controlled linguistic frame detected."}</p></span><mark>{record.status}</mark></div>)}</article>
      <aside className="panel ci-monitor-plan"><span className="section-label">Official-source refresh</span><button onClick={refreshOfficialSources} disabled={scanStatus.startsWith("Refreshing")}><RefreshCw size={12} /> Refresh {selectedCompetitor.name}</button><small className="ci-live-status">{scanStatus || `${selectedCompetitor.monitoredSurfaces.length + (intelligence?.sources.length ?? 1)} approved surfaces ready`}</small>{sourceScan ? sourceScan.pages.map((page) => <a className={page.error ? "unavailable" : ""} href={page.url} target="_blank" rel="noreferrer" key={page.url}><Radar size={13} /><span><b>{page.title || new URL(page.url).hostname}</b><small>{page.error || page.signals?.join(" · ") || "Official source refreshed"}</small></span><ArrowUpRight size={11} /></a>) : selectedCompetitor.monitoredSurfaces.map((surface) => <a href={surface.url} target="_blank" rel="noreferrer" key={surface.label}><Radar size={13} /><span><b>{surface.label}</b><small>Approved official website</small></span><ArrowUpRight size={11} /></a>)}<div><ShieldCheck size={13} /><p>Only the competitor’s approved official domains are scanned. Results are live observations—not independent proof.</p></div></aside>
      <article className="panel ci-publication-feed"><header><div><span className="section-label">Competitor publication mentions</span><h2>Relevant EHS publication coverage</h2></div><button onClick={refreshPublicationFeed} disabled={feedStatus.startsWith("Refreshing")}><FileSearch size={12} /> Refresh mentions</button></header><small className="ci-live-status">{feedStatus || "Major EHS publications ready for competitor-specific matching"}</small>{publicationFeed ? competitorPublicationFeed?.length ? <div>{competitorPublicationFeed.map((source) => <section key={source.name}><span><b>{source.name}</b><small>{source.tier} · {source.status}</small></span>{source.articles.slice(0, 5).map((article) => <a href={article.url} target="_blank" rel="noreferrer" key={article.url}><b>{article.title}</b><small>{article.themes.join(" · ") || selectedCompetitor.name}</small><ArrowUpRight size={11} /></a>)}</section>)}</div> : <div className="ci-feed-ready"><FileSearch size={18} /><b>No current publication mention found</b><span>The feed returned no headline that specifically names {selectedCompetitor.name}; unrelated industry articles are intentionally hidden.</span></div> : <div className="ci-feed-ready"><FileSearch size={18} /><b>Live mention refresh is ready</b><span>Only articles that name this competitor will appear here.</span></div>}</article>
    </div>}

    {activeTab === "Corporate" && <div className="ci-corporate-layout">
      <article className="panel ci-corporate-signals"><header><div><span className="section-label">Corporate movement</span><h2>Strategy, transactions and ecosystem</h2></div></header>{(intelligence?.corporateSignals ?? intelligence?.activity ?? []).map((signal) => <section key={`${signal.date}-${signal.title}`}><small>{signal.date} · {signal.type}</small><h3>{signal.title}</h3><p>{signal.summary}</p><a href={signal.sourceUrl} target="_blank" rel="noreferrer">Source <ArrowUpRight size={10} /></a></section>)}{!intelligence?.corporateSignals?.length && !intelligence?.activity.length && <div className="ci-empty"><Building2 size={18} /><b>No corporate signal set mapped yet</b><span>This company is queued for ownership, transaction, leadership and partnership research.</span></div>}</article>
      <article className="panel ci-hiring-signals"><header><div><span className="section-label">Hiring signals</span><h2>Where the organization is adding capacity</h2></div></header>{intelligence?.hiringSignals?.length ? intelligence.hiringSignals.map((signal) => <section key={`${signal.function}-${signal.signal}`}><small>{signal.function} · observed {signal.observedAt}</small><h3>{signal.signal}</h3><p>{signal.interpretation}</p><a href={signal.sourceUrl} target="_blank" rel="noreferrer">Official careers source <ArrowUpRight size={10} /></a></section>) : <div className="ci-empty"><Search size={18} /><b>No current hiring signal mapped</b><span>Only dated, official career pages will appear here; isolated postings will not be treated as proof of strategy.</span></div>}</article>
    </div>}

    {activeTab === "Compare" && <div className="ci-compare-workspace">
      <aside className="panel ci-compare-picker"><span className="section-label">Comparison set</span><h2>Select up to four</h2><p>Use filters above to narrow the market, then add companies to the matrix.</p>{visibleCompetitors.map((competitor) => <label key={competitor.id}><input type="checkbox" checked={compareIds.includes(competitor.id)} onChange={() => toggleCompare(competitor.id)} /><span className="ci-mini-logo"><img src={faviconFor(competitor.officialUrl)} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />{competitor.name.slice(0, 2).toUpperCase()}</span><span><b>{competitor.name}</b><small>{deepCompetitorIntelligence[competitor.id]?.researchStatus ?? "Source map only"}</small></span></label>)}</aside>
      <article className="panel ci-compare-matrix"><header><div><span className="section-label">Capability landscape</span><h2>Cross-competitor public evidence</h2></div><mark>{comparisonCompetitors.length} selected</mark></header><div className="ci-matrix-row head"><span>Capability</span>{comparisonCompetitors.map((competitor) => <span key={competitor.id}>{competitor.name}</span>)}</div>{comparisonDomains.map((capability) => <div className="ci-matrix-row" key={capability}><b>{capability}</b>{comparisonCompetitors.map((competitor) => { const domains = deepCompetitorIntelligence[competitor.id]?.domains ?? inferDomains(competitor.modules, competitor.messagingTags); return <span className={domains.includes(capability) ? "mapped" : "unknown"} key={competitor.id}>{domains.includes(capability) ? <><Check size={11} /> Mapped</> : "Not mapped"}</span>; })}</div>)}<footer><ShieldCheck size={13} /> “Mapped” means public evidence exists for the domain. It does not establish feature parity, quality, packaging or customer adoption.</footer></article>
    </div>}

    {activeTab === "Sales brief" && <div className="ci-battlecard-layout">
      <article className="panel ci-battlecard-main"><header><div><span className="section-label">Sales brief</span><h2>{selectedCompetitor.name}</h2></div><button onClick={exportBattlecard}><Download size={13} /> Export battle card</button></header><div className="ci-battlecard-grid"><section><b>Why they win</b>{(intelligence?.whyTheyWin ?? []).map((item) => <span key={item.claim}><Check size={11} />{item.claim}</span>)}{!intelligence && <span><Info size={11} />Research pass required.</span>}</section><section><b>How Novara can compete</b>{novaraBaseline.strengths.slice(0, 4).map((item) => <span key={item}><ArrowRight size={11} />Lead with proof of {item.toLowerCase()} when relevant.</span>)}</section><section><b>Questions to expose fit</b>{(intelligence?.questionsToTest ?? ["Which workflows, integrations and services are non-negotiable?", "What must work offline and across sites?", "What is included in the current package?"]).map((item) => <span key={item}><Search size={11} />{item}</span>)}</section><section><b>Pressure points to validate</b>{(intelligence?.pressurePoints ?? []).map((item) => <span key={item.signal}><AlertTriangle size={11} />{item.signal}</span>)}<small>Use these as discovery questions until corroborated; do not present them as proven weaknesses.</small></section></div></article>
      <aside className="panel ci-message-house"><span className="section-label">Fast positioning read</span><h2>{intelligence?.messaging?.headline ?? selectedCompetitor.platform}</h2><p>{intelligence?.messaging?.promise ?? selectedCompetitor.statedPositioning}</p><div className="message-tags">{currentTags.map((tag) => <span key={tag}>{tag}</span>)}</div><button onClick={() => setActiveTab("Messaging & change")}>Open messaging analysis <ArrowRight size={11} /></button></aside>
    </div>}

    {activeTab === "Intelligence inbox" && <div className="ci-intake-layout">
      <article className="panel ci-intake-form"><span className="panel-kicker">Supplemental evidence lane</span><h2>Analyze records and route the intelligence</h2><p className="ci-intake-priority">Official websites and publications are the primary feed. Uploads add field notes, quotes, transcripts and historical evidence.</p><div className="ci-input-row"><label>Evidence type<select value={intakeSourceType} onChange={(event) => setIntakeSourceType(event.target.value)}>{sourceTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Title<input value={intakeTitle} onChange={(event) => setIntakeTitle(event.target.value)} placeholder="Event brief, pricing quote, customer observation…" /></label></div><label className="ci-file-input"><UploadCloud size={16} /><span><b>Choose one or many records</b><small>TXT, CSV, JSON, HTML, DOCX, PPTX, XLSX and readable PDFs are extracted and analyzed.</small></span><input type="file" multiple accept=".txt,.md,.csv,.tsv,.json,.html,.htm,.xml,.docx,.pptx,.xlsx,.pdf" onChange={(event) => inspectFiles(event.target.files)} /></label>{uploadStatus && <small className="ci-live-status">{uploadStatus}</small>}{uploadDrafts.length > 0 && <div className="ci-upload-drafts">{uploadDrafts.map((draft) => <span className={draft.error ? "error" : ""} key={draft.name}><b>{draft.name}</b><small>{draft.error || `${draft.characters.toLocaleString()} readable characters · ready to route`}</small></span>)}<button onClick={routeUploadDrafts} disabled={!uploadDrafts.some((draft) => draft.text)}><Sparkles size={13} /> Analyze and route {uploadDrafts.filter((draft) => draft.text).length} records</button></div>}<label>Source URL or reference<input value={intakeSourceUrl} onChange={(event) => setIntakeSourceUrl(event.target.value)} placeholder="Optional public URL or controlled reference" /></label><label>Paste a single evidence record<textarea value={intakeText} onChange={(event) => setIntakeText(event.target.value)} placeholder="Paste a transcript excerpt, comparative quote, pricing discussion, field note, or public-source passage." /></label><button onClick={saveIntake} disabled={!intakeText.trim()}><Sparkles size={14} /> Analyze and route pasted evidence</button><footer><ShieldCheck size={13} /> Records are classified by competitor, messaging frame, market and module. They remain reviewable evidence—not automatically verified fact.</footer></article>
      <article className="panel ci-context-brief"><span className="panel-kicker">Account and website context</span><h2>Map a prospect to likely EHS priorities</h2><p>Paste a company description, profile, website text, or notes. The system routes market, workflow, and competitor candidates.</p><textarea value={contextInput} onChange={(event) => setContextInput(event.target.value)} placeholder="Example: A concrete contractor operating large data-center construction sites with a mobile field workforce…" /><button onClick={buildContextBrief} disabled={!contextInput.trim()}><Sparkles size={14} /> Build routing brief</button>{contextBrief && <div className="ci-brief-result"><span><b>Market candidates</b>{contextBrief.markets.map((item) => <mark key={item}>{item}</mark>)}</span><span><b>Likely workflow priorities</b>{contextBrief.modules.map((item) => <mark key={item}>{item}</mark>)}</span><span><b>Likely competitive set</b>{contextBrief.competitors.map((item) => <button key={item.id} onClick={() => onSelectCompetitor(item.id)}>{item.name}<ChevronRight size={11} /></button>)}</span><small><Info size={11} /> {contextBrief.caveat}</small></div>}</article>
      <article className="panel ci-review-queue"><header><div><span className="panel-kicker">Local review queue</span><h2>{selectedCompetitor.name} contributions</h2></div><mark>{selectedIntake.length} pending</mark></header>{selectedIntake.length ? selectedIntake.map((record) => <div key={record.id}><span><small>{record.createdAt.slice(0, 10)} · {record.sourceType}</small><b>{record.title}</b><p>{record.excerpt}</p><i>{unique([...record.tags, ...record.markets, ...record.modules]).map((tag) => <mark key={tag}>{tag}</mark>)}</i></span><mark>{record.status}</mark></div>) : <div className="ci-empty"><UploadCloud size={18} /><b>No contributed intelligence yet</b><span>Uploads stay in this browser only until authenticated shared evidence storage is connected.</span></div>}</article>
    </div>}

  </section>;
}
