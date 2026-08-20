"use client";

import { ArrowRight, ArrowUpRight, Building2, Check, ChevronRight, Download, ExternalLink, Factory, FileSearch, Globe2, Info, Radar, Search, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { competitorArchetypes, competitors, type CompetitorProfile } from "./competitor-data";
import { marketSegments } from "./market-data";

type WorkspaceTab = "Overview" | "Product" | "Messaging & change" | "Customer evidence" | "Corporate" | "Sales enablement" | "Intelligence intake";
type IntakeRecord = { id: string; competitorId: string; title: string; sourceType: string; sourceUrl: string; excerpt: string; tags: string[]; markets: string[]; modules: string[]; createdAt: string; status: "Needs review" };
type ContextBrief = { subject: string; markets: string[]; modules: string[]; competitors: CompetitorProfile[]; caveat: string };

const tabs: WorkspaceTab[] = ["Overview", "Product", "Messaging & change", "Customer evidence", "Corporate", "Sales enablement", "Intelligence intake"];
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
function postureFor(competitor: CompetitorProfile) {
  if (competitor.archetype === "Construction Safety") return { motion: "Vertical specialist", tier: "Mid-market to enterprise", strength: "Construction and field workflows" };
  if (competitor.archetype === "Contractor Risk") return { motion: "Network and risk specialist", tier: "Enterprise", strength: "Contractor and supplier governance" };
  if (competitor.archetype === "EHSQ & Operational Risk") return { motion: "Broad risk suite", tier: "Enterprise and global", strength: "Complex operational-risk environments" };
  return { motion: "EHS platform", tier: "Mid-market to enterprise", strength: "Multi-module EHS operations" };
}

export function CompetitorWorkspace({ selectedCompetitorId, onSelectCompetitor, onOpenMarket }: { selectedCompetitorId: string; onSelectCompetitor: (id: string) => void; onOpenMarket: (market: string) => void }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("Overview");
  const [archetype, setArchetype] = useState("All archetypes");
  const [competitorQuery, setCompetitorQuery] = useState("");
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>([]);
  const [intakeText, setIntakeText] = useState("");
  const [intakeTitle, setIntakeTitle] = useState("");
  const [intakeSourceType, setIntakeSourceType] = useState(sourceTypes[0]);
  const [intakeSourceUrl, setIntakeSourceUrl] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [contextBrief, setContextBrief] = useState<ContextBrief | null>(null);
  const selectedCompetitor = competitors.find((competitor) => competitor.id === selectedCompetitorId) ?? competitors[0];
  const posture = postureFor(selectedCompetitor);

  useEffect(() => { const stored = window.localStorage.getItem("market-intelligence-competitor-intake"); if (stored) { try { setIntakeRecords(JSON.parse(stored) as IntakeRecord[]); } catch { setIntakeRecords([]); } } }, []);

  const visibleCompetitors = useMemo(() => competitors.filter((competitor) => {
    const archetypeMatch = archetype === "All archetypes" || competitor.archetype === archetype;
    const query = competitorQuery.toLowerCase().trim();
    return archetypeMatch && (!query || [competitor.name, competitor.platform, competitor.archetype, ...competitor.modules, ...competitor.messagingTags].join(" ").toLowerCase().includes(query));
  }), [archetype, competitorQuery]);
  const selectedIntake = intakeRecords.filter((record) => record.competitorId === selectedCompetitor.id);
  const currentTags = unique([...selectedCompetitor.messagingTags, ...selectedIntake.flatMap((record) => record.tags)]);

  const saveIntake = () => {
    const text = intakeText.trim(); if (!text) return;
    const record: IntakeRecord = { id: `intake-${Date.now()}`, competitorId: selectedCompetitor.id, title: intakeTitle.trim() || `${intakeSourceType} — ${selectedCompetitor.name}`, sourceType: intakeSourceType, sourceUrl: intakeSourceUrl.trim(), excerpt: text.slice(0, 800), tags: findMatches(text, languageFrames), markets: findMatches(text, marketTerms), modules: findMatches(text, moduleTerms), createdAt: new Date().toISOString(), status: "Needs review" };
    const next = [record, ...intakeRecords]; setIntakeRecords(next); window.localStorage.setItem("market-intelligence-competitor-intake", JSON.stringify(next)); setIntakeText(""); setIntakeTitle(""); setIntakeSourceUrl("");
  };

  const inspectFile = async (file: File | undefined) => {
    if (!file) return; setIntakeTitle(file.name);
    if (/text|csv|markdown|json/.test(file.type) || /\.(txt|md|csv|json)$/i.test(file.name)) setIntakeText((await file.text()).slice(0, 30000));
    else setIntakeText(`File queued for document extraction: ${file.name}. Content extraction for this file type requires the server-side document pipeline before publication.`);
  };

  const buildContextBrief = () => {
    const source = contextInput.trim(); if (!source) return;
    const markets = findMatches(source, marketTerms); const modules = findMatches(source, moduleTerms);
    const fallbackMarkets = markets.length ? markets : ["Requires market classification"]; const fallbackModules = modules.length ? modules : ["Incident Management", "Audits & Inspections", "Training"];
    const likelyCompetitors = competitors.filter((competitor) => competitor.marketRelevance.some((market) => markets.includes(market)) && competitor.modules.some((module) => fallbackModules.some((candidate) => module.toLowerCase().includes(candidate.split(" ")[0].toLowerCase())))).slice(0, 6);
    setContextBrief({ subject: source.slice(0, 120), markets: fallbackMarkets, modules: fallbackModules, competitors: likelyCompetitors.length ? likelyCompetitors : competitors.filter((competitor) => competitor.marketRelevance.some((market) => markets.includes(market))).slice(0, 6), caveat: "This is a keyword-based routing brief. Company identity, NAICS, actual requirements, installed systems, and buying intent require verification." });
  };

  const exportBattlecard = () => {
    const evidence = selectedIntake.map((record) => `- ${record.title} — ${record.sourceType} — ${record.status} — ${record.createdAt.slice(0, 10)}`).join("\n") || "- No reviewed field evidence stored";
    download(`${selectedCompetitor.id}-battle-card.md`, `# ${selectedCompetitor.name} — Evidence-Gated Battle Card\n\n**Exported:** ${new Date().toISOString()}\n**Status:** Draft; comparative claims require review\n\n## Market posture\n- Motion: ${posture.motion}\n- Tier: ${posture.tier}\n- Strongest evidenced context: ${posture.strength}\n\n## Company-stated positioning\n${selectedCompetitor.statedPositioning}\n\n## Company-stated modules\n${selectedCompetitor.modules.map((module) => `- ${module}`).join("\n")}\n\n## Current messaging frames\n${currentTags.map((tag) => `- ${tag}`).join("\n")}\n\n## Market intersections\n${selectedCompetitor.marketRelevance.map((market) => `- ${market}`).join("\n")}\n\n## Intelligence awaiting review\n${evidence}\n\n## Sales preparation\n- Ask which workflows must work offline or at the frontline.\n- Ask which modules must share reporting, corrective actions, and permissions.\n- Ask what regulatory expertise and implementation support are required.\n- Confirm packaging, feature depth, pricing, and availability from current evidence before comparing.\n\n## Primary source\n${selectedCompetitor.officialUrl}\nRetrieved ${selectedCompetitor.retrieved}\n`);
  };
  const exportContextBrief = () => { if (contextBrief) download("account-context-brief.md", `# Account Context Brief\n\n**Input:** ${contextBrief.subject}\n\n## Market candidates\n${contextBrief.markets.map((item) => `- ${item}`).join("\n")}\n\n## Likely workflow priorities\n${contextBrief.modules.map((item) => `- ${item}`).join("\n")}\n\n## Likely competitive set\n${contextBrief.competitors.map((item) => `- ${item.name} — ${item.archetype}`).join("\n") || "- Requires competitor review"}\n\n## Review boundary\n${contextBrief.caveat}\n`); };

  return <section className="ci-command-center">
    <div className="ci-toolbar panel"><div><span className="panel-kicker">Competitive intelligence command center</span><b>{competitors.length} monitored company profiles</b></div><div className="ci-toolbar-controls"><label><Search size={13} /><input value={competitorQuery} onChange={(event) => setCompetitorQuery(event.target.value)} placeholder="Find competitor, module, or message" /></label><select value={archetype} onChange={(event) => setArchetype(event.target.value)}>{competitorArchetypes.map((item) => <option key={item}>{item}</option>)}</select><select value={selectedCompetitor.id} onChange={(event) => onSelectCompetitor(event.target.value)}>{visibleCompetitors.map((competitor) => <option value={competitor.id} key={competitor.id}>{competitor.name}</option>)}</select></div></div>
    <div className="ci-profile-header panel"><div className="ci-company-mark"><Building2 size={19} /></div><div><span className="panel-kicker">{selectedCompetitor.archetype}</span><h2>{selectedCompetitor.name}</h2><p>{selectedCompetitor.statedPositioning}</p></div><div className="ci-profile-facts"><span><b>{posture.tier}</b><small>Market tier</small></span><span><b>{selectedCompetitor.modules.length}</b><small>Mapped modules</small></span><span><b>{selectedIntake.length}</b><small>Review items</small></span><a href={selectedCompetitor.officialUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Official site</a></div></div>
    <nav className="ci-tabs" aria-label="Competitor workspace sections">{tabs.map((tab) => <button className={activeTab === tab ? "active" : ""} key={tab} onClick={() => setActiveTab(tab)}>{tab}{tab === "Intelligence intake" && selectedIntake.length > 0 && <mark>{selectedIntake.length}</mark>}</button>)}</nav>

    {activeTab === "Overview" && <div className="ci-tab-grid"><article className="panel ci-overview-main"><span className="section-label">Strategic posture</span><div className="ci-posture-grid"><span><small>Competitive motion</small><b>{posture.motion}</b></span><span><small>Likely market tier</small><b>{posture.tier}</b></span><span><small>Strongest evidenced context</small><b>{posture.strength}</b></span></div><span className="section-label">Current messaging frames</span><div className="message-tags">{currentTags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="ci-boundary"><ShieldCheck size={15} /><span><b>Interpretation boundary</b> Market posture is an analyst classification. Product and messaging entries remain company statements until corroborated.</span></div></article><article className="panel ci-source-coverage"><span className="section-label">Monitored source registry</span>{selectedCompetitor.monitoredSurfaces.map((surface) => <a href={surface.url} target="_blank" rel="noreferrer" key={surface.label}><Radar size={14} /><span><b>{surface.label}</b><small>Snapshot and change detection</small></span><ArrowUpRight size={12} /></a>)}<a href={selectedCompetitor.officialUrl} target="_blank" rel="noreferrer"><Globe2 size={14} /><span><b>Company root</b><small>Identity and positioning baseline</small></span><ArrowUpRight size={12} /></a></article><article className="panel ci-market-map"><span className="section-label">Market intersections</span>{selectedCompetitor.marketRelevance.map((market) => { const segments = marketSegments.filter((segment) => segment.vertical === market); return <button onClick={() => onOpenMarket(market)} key={market}><Factory size={14} /><span><b>{market}</b><small>{segments.length} mapped segments</small></span><ChevronRight size={13} /></button>; })}</article></div>}
    {activeTab === "Product" && <div className="panel ci-product-workbench"><header><div><span className="panel-kicker">Product evidence model</span><h2>Module → workflow → capability → proof</h2></div><mark>Company-stated baseline</mark></header><div className="ci-module-table"><div><span>Module</span><span>Current evidence</span><span>Depth review</span><span>Action</span></div>{selectedCompetitor.modules.map((module) => <article key={module}><b>{module}</b><span><Check size={11} /> Official surface mapped</span><mark>Workflow proof required</mark><button onClick={() => { setActiveTab("Intelligence intake"); setIntakeTitle(`${module} capability evidence`); }}>Add evidence<ArrowRight size={11} /></button></article>)}</div><footer><Info size={14} /> A module name does not prove workflow depth, packaging, mobile availability, integration quality, or customer adoption.</footer></div>}
    {activeTab === "Messaging & change" && <div className="ci-change-layout"><article className="panel ci-message-house"><span className="section-label">Current message house</span><h2>{selectedCompetitor.platform}</h2><p>{selectedCompetitor.statedPositioning}</p><div className="message-tags">{currentTags.map((tag) => <span key={tag}>{tag}</span>)}</div></article><article className="panel ci-timeline"><span className="section-label">Change timeline</span><div><i /><span><small>{selectedCompetitor.retrieved}</small><b>Official-source baseline established</b><p>{selectedCompetitor.monitoredSurfaces.length + 1} surfaces registered for future comparison.</p></span><mark>Baseline</mark></div>{selectedIntake.map((record) => <div key={record.id}><i /><span><small>{record.createdAt.slice(0, 10)} · {record.sourceType}</small><b>{record.title}</b><p>{record.tags.length ? `Detected frames: ${record.tags.join(", ")}` : "No controlled linguistic frame detected."}</p></span><mark>{record.status}</mark></div>)}</article></div>}
    {activeTab === "Customer evidence" && <div className="ci-evidence-lanes">{[["Case studies", "Customer, industry, module, problem, outcome and named proof"], ["Reviews", "Theme, date window, reviewer context, product area and sample size"], ["Forums and Reddit", "Directional language and recurring questions; never treated as verified fact"], ["Uploaded field intelligence", `${selectedIntake.length} item${selectedIntake.length === 1 ? "" : "s"} awaiting evidence review`]].map(([title, detail]) => <article className="panel" key={title}><FileSearch size={17} /><span><b>{title}</b><p>{detail}</p></span><button onClick={() => setActiveTab("Intelligence intake")}>Add or review <ArrowRight size={11} /></button></article>)}</div>}
    {activeTab === "Corporate" && <div className="ci-evidence-lanes">{[["Ownership and M&A", "Official announcements, filings, acquired capabilities and transaction rationale"], ["Leadership", "Executive appointments, departures and role changes"], ["Hiring signals", "Function, geography, product area and hiring velocity"], ["Partnerships and expansion", "Integrations, channels, regions and vertical-market entry"]].map(([title, detail]) => <article className="panel" key={title}><Radar size={17} /><span><b>{title}</b><p>{detail}</p></span><mark>Source connector</mark></article>)}</div>}
    {activeTab === "Sales enablement" && <div className="ci-sales-layout"><article className="panel"><span className="section-label">Prepare the conversation</span><h2>Ask · Know · Show</h2><div className="ci-sales-columns"><span><b>Ask</b><p>Which frontline workflows, modules, reporting chains, integrations and services are non-negotiable?</p></span><span><b>Know</b><p>{selectedCompetitor.name} presents {selectedCompetitor.platform} across {selectedCompetitor.modules.length} mapped modules. Depth and packaging require confirmation.</p></span><span><b>Show</b><p>Use approved product proof tied to the buyer’s industry and workflow—not generic feature claims.</p></span></div></article><aside className="panel"><span className="section-label">Scoped output</span><p>Exports the selected competitor, current market posture, messaging, source boundary and review queue.</p><button onClick={exportBattlecard}><Download size={14} /> Export battle card</button></aside></div>}
    {activeTab === "Intelligence intake" && <div className="ci-intake-layout"><article className="panel ci-intake-form"><span className="panel-kicker">Contribution lane</span><h2>Add intelligence without publishing it as fact</h2><div className="ci-input-row"><label>Evidence type<select value={intakeSourceType} onChange={(event) => setIntakeSourceType(event.target.value)}>{sourceTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Title<input value={intakeTitle} onChange={(event) => setIntakeTitle(event.target.value)} placeholder="Event brief, pricing quote, customer observation…" /></label></div><label className="ci-file-input"><UploadCloud size={16} /><span><b>Choose a source file</b><small>TXT, Markdown, CSV and JSON analyze immediately. Office files enter the extraction queue.</small></span><input type="file" onChange={(event) => inspectFile(event.target.files?.[0])} /></label><label>Source URL or reference<input value={intakeSourceUrl} onChange={(event) => setIntakeSourceUrl(event.target.value)} placeholder="Optional public URL or controlled reference" /></label><label>Evidence text<textarea value={intakeText} onChange={(event) => setIntakeText(event.target.value)} placeholder="Paste a transcript excerpt, comparative quote, pricing discussion, field note, or public-source passage." /></label><button onClick={saveIntake} disabled={!intakeText.trim()}><Sparkles size={14} /> Analyze and add to review queue</button><footer><ShieldCheck size={13} /> Linguistic tags route information; they do not verify the underlying claim.</footer></article><article className="panel ci-context-brief"><span className="panel-kicker">Account and website context</span><h2>Map a prospect to likely EHS priorities</h2><p>Paste a company description, profile, website text, or notes. The system routes market, workflow, and competitor candidates.</p><textarea value={contextInput} onChange={(event) => setContextInput(event.target.value)} placeholder="Example: A concrete contractor operating large data-center construction sites with a mobile field workforce…" /><button onClick={buildContextBrief} disabled={!contextInput.trim()}><Sparkles size={14} /> Build routing brief</button>{contextBrief && <div className="ci-brief-result"><span><b>Market candidates</b>{contextBrief.markets.map((item) => <mark key={item}>{item}</mark>)}</span><span><b>Likely workflow priorities</b>{contextBrief.modules.map((item) => <mark key={item}>{item}</mark>)}</span><span><b>Likely competitive set</b>{contextBrief.competitors.map((item) => <button key={item.id} onClick={() => onSelectCompetitor(item.id)}>{item.name}<ChevronRight size={11} /></button>)}</span><small><Info size={11} /> {contextBrief.caveat}</small><button onClick={exportContextBrief}><Download size={13} /> Export context brief</button></div>}</article><article className="panel ci-review-queue"><header><div><span className="panel-kicker">Review queue</span><h2>{selectedCompetitor.name} contributions</h2></div><mark>{selectedIntake.length} pending</mark></header>{selectedIntake.length ? selectedIntake.map((record) => <div key={record.id}><span><small>{record.createdAt.slice(0, 10)} · {record.sourceType}</small><b>{record.title}</b><p>{record.excerpt}</p><i>{unique([...record.tags, ...record.markets, ...record.modules]).map((tag) => <mark key={tag}>{tag}</mark>)}</i></span><mark>{record.status}</mark></div>) : <div className="ci-empty"><UploadCloud size={18} /><b>No contributed intelligence yet</b><span>Uploads remain local review drafts until a shared, access-controlled evidence service is connected.</span></div>}</article></div>}
  </section>;
}
