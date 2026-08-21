"use client";

import {
  ArrowRight, ArrowUpRight, BarChart3, Building2, ChevronRight, Factory,
  FileSearch, Filter, GitCompareArrows, Globe2, Layers3, Network, RefreshCw, ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  brandLineages, corporateEvents, corporateWorkflows, ownershipGroups,
  type CorporateEvent,
} from "./corporate-data";

const referenceDate = new Date("2026-08-20T00:00:00Z");
type View = "Market activity" | "Brand lineage" | "Ownership map" | "Research workflows";

function cutoff(months: number) {
  const date = new Date(referenceDate);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function quarter(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return `${date.getUTCFullYear()} Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
}

function ActivityView({ filtered, selected, onSelect, domain, onDomain }: {
  filtered: CorporateEvent[];
  selected?: CorporateEvent;
  onSelect: (id: string) => void;
  domain: string;
  onDomain: (domain: string) => void;
}) {
  const quarters = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((event) => counts.set(quarter(event.announcedAt), (counts.get(quarter(event.announcedAt)) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);
  const maxQuarter = Math.max(...quarters.map((item) => item[1]), 1);
  const domainCounts = useMemo(() => Array.from(new Set(filtered.map((event) => event.domain))).map((name) => ({
    name,
    count: filtered.filter((event) => event.domain === name).length,
  })).sort((a, b) => b.count - a.count), [filtered]);
  const maxDomain = Math.max(...domainCounts.map((item) => item.count), 1);
  const buyerCounts = useMemo(() => Array.from(new Set(filtered.map((event) => event.company))).map((name) => ({
    name,
    events: filtered.filter((event) => event.company === name),
  })).sort((a, b) => b.events.length - a.events.length), [filtered]);

  return <>
    <div className="corporate-visual-grid">
      <article className="panel corporate-quarter-chart"><header><div><span className="section-label">Market tempo</span><h3>Strategic events by quarter</h3></div><mark>Announcement date</mark></header><div>{quarters.map(([label, count]) => <button key={label}><i><em style={{ height: `${Math.max(12, count / maxQuarter * 100)}%` }} /></i><strong>{count}</strong><b>{label}</b></button>)}</div></article>
      <article className="panel corporate-domain-chart"><header><div><span className="section-label">Capability direction</span><h3>Where portfolios are expanding</h3></div><mark>{domain === "All domains" ? `${domainCounts.length} domains` : domain}</mark></header><div>{domainCounts.map((item) => <button className={domain === item.name ? "selected" : ""} onClick={() => onDomain(item.name)} key={item.name}><span><b>{item.name}</b><small>{item.count} move{item.count === 1 ? "" : "s"}</small></span><i><em style={{ width: `${item.count / maxDomain * 100}%` }} /></i><ChevronRight size={12} /></button>)}</div></article>
    </div>

    <div className="corporate-executive-grid">
      <article className="panel corporate-board-signals"><header><div><span className="section-label">Executive synthesis</span><h3>What the pattern says</h3></div><mark>Analyst inference</mark></header>
        <section><i data-color="purple" /><span><b>Category definitions are being rewritten</b><p>Mitti now frames the former SafetyCulture business as frontline operations; identity shifts can change the apparent competitive set overnight.</p></span></section>
        <section><i data-color="green" /><span><b>Carve-outs create focused challengers</b><p>PureEHS and Evotix emerged as standalone businesses with dedicated ownership, making investment pace and customer retention immediate watch items.</p></span></section>
        <section><i data-color="blue" /><span><b>Networks are consolidating</b><p>Veriforce, Alcumus, and Highwire point toward contractor and supplier risk platforms competing through coverage, data, and interoperability.</p></span></section>
        <section><i data-color="red" /><span><b>Integration evidence matters more than deal count</b><p>A renamed or acquired product is not automatically unified. Packaging, shared workflows, migration, and customer adoption are the proof points.</p></span></section>
      </article>
      <article className="panel corporate-buyer-table"><header><div><span className="section-label">Strategic posture</span><h3>Most active organizations</h3></div><mark>Selected window</mark></header>{buyerCounts.slice(0, 7).map((buyer) => <button onClick={() => onSelect(buyer.events[0].id)} key={buyer.name}><span><b>{buyer.name}</b><small>{Array.from(new Set(buyer.events.map((event) => event.domain))).join(" · ")}</small></span><strong>{buyer.events.length}</strong><ChevronRight size={12} /></button>)}</article>
    </div>

    <div className="corporate-event-workbench panel">
      <div className="corporate-event-list"><header><span>Announcement</span><span>Strategic move</span><span>Domain</span><span>Status</span></header>{filtered.map((event) => <button className={selected?.id === event.id ? "selected" : ""} onClick={() => onSelect(event.id)} key={event.id}><span><b>{monthLabel(event.announcedAt)}</b><small>{event.type}</small></span><span><b>{event.company} → {event.counterparty}</b><small>{event.headline}</small></span><span>{event.domain}</span><span><mark>{event.status}</mark><ChevronRight size={12} /></span></button>)}</div>
      {selected ? <aside><div className="corporate-detail-top"><mark>{selected.type}</mark><small>{selected.announcedAt} · {selected.geography}</small></div><h2>{selected.headline}</h2><p>{selected.fact}</p>{selected.formerName && <div className="corporate-identity-shift"><span>{selected.formerName}</span><ArrowRight size={14} /><b>{selected.currentIdentity}</b></div>}<div className="corporate-thesis"><span><b>Strategic thesis</b>{selected.strategicThesis}</span><span><b>Board implication</b>{selected.boardImplication}<small>Analyst synthesis—not a transaction fact.</small></span></div>{selected.integrationState && <div className="corporate-detail-meta"><span><b>Integration state</b>{selected.integrationState}</span>{selected.owner && <span><b>Owner</b>{selected.owner}</span>}</div>}<footer><span><ShieldCheck size={13} /><b>{selected.sourceTier}</b></span><a href={selected.sourceUrl} target="_blank" rel="noreferrer">{selected.sourceName}<ArrowUpRight size={12} /></a></footer></aside> : <aside className="corporate-empty">No events match this view.</aside>}
    </div>
  </>;
}

function LineageView() {
  return <div className="corporate-lineage-grid">{brandLineages.map((lineage) => <article className="panel corporate-lineage-card" key={lineage.id}><header><mark>{lineage.state}</mark><small>{lineage.effective}</small></header><div><span>{lineage.from}</span><ArrowRight size={18} /><strong>{lineage.to}</strong></div><p>{lineage.transition}</p><a href={lineage.sourceUrl} target="_blank" rel="noreferrer">Verify transition <ArrowUpRight size={12} /></a></article>)}</div>;
}

function OwnershipView() {
  return <div className="corporate-ownership-grid">{ownershipGroups.map((group) => <article className="panel corporate-owner-card" key={group.sponsor}><header><Building2 size={15} /><span><small>Owner / sponsor</small><h3>{group.sponsor}</h3></span></header><div>{group.platforms.map((platform) => <b key={platform}>{platform}</b>)}</div><dl><dt>Relationship</dt><dd>{group.relationship}</dd><dt>Diligence watch</dt><dd>{group.watch}</dd></dl><a href={group.sourceUrl} target="_blank" rel="noreferrer">Primary ownership evidence <ArrowUpRight size={12} /></a></article>)}</div>;
}

function WorkflowView() {
  return <div className="corporate-workflow-grid">{corporateWorkflows.map((workflow, index) => <article className="panel corporate-workflow-card" key={workflow.name}><header><span>{String(index + 1).padStart(2, "0")}</span><mark>{workflow.status}</mark></header><h3>{workflow.name}</h3><p>{workflow.coverage}</p><div><small>Cadence</small><b>{workflow.cadence}</b><small>Evidence path</small><b>{workflow.process}</b><small>Output</small><b>{workflow.output}</b></div></article>)}</div>;
}

export function CorporateWorkspace() {
  const [view, setView] = useState<View>("Market activity");
  const [windowMonths, setWindowMonths] = useState(36);
  const [eventType, setEventType] = useState("All events");
  const [domain, setDomain] = useState("All domains");
  const [selectedId, setSelectedId] = useState(corporateEvents[0].id);

  const filtered = useMemo(() => corporateEvents.filter((event) => {
    const inWindow = new Date(`${event.announcedAt}T00:00:00Z`) >= cutoff(windowMonths);
    return inWindow && (eventType === "All events" || event.type === eventType) && (domain === "All domains" || event.domain === domain);
  }), [domain, eventType, windowMonths]);
  const selected = filtered.find((event) => event.id === selectedId) ?? filtered[0];
  const domains = Array.from(new Set(corporateEvents.map((event) => event.domain)));
  const eventTypes = Array.from(new Set(corporateEvents.map((event) => event.type)));
  const acquisitions = filtered.filter((event) => event.type === "Acquisition" || event.type === "Merger").length;
  const identityMoves = filtered.filter((event) => ["Rebrand", "Divestiture", "Separation", "Integration"].includes(event.type)).length;
  const activeDomains = new Set(filtered.map((event) => event.domain)).size;
  const companies = new Set(filtered.flatMap((event) => [event.company, event.counterparty])).size;

  const reset = () => {
    setWindowMonths(36);
    setEventType("All events");
    setDomain("All domains");
    setSelectedId(corporateEvents[0].id);
  };

  return <section className="corporate-atlas">
    <div className="corporate-command panel">
      <div><Network size={17} /><span><b>Corporate activity</b><small>Transactions, ownership, identity, and integration</small></span></div>
      {view === "Market activity" && <div className="corporate-window" aria-label="Time window">{[12, 24, 36, 60].map((months) => <button className={windowMonths === months ? "selected" : ""} onClick={() => setWindowMonths(months)} key={months}>{months}m</button>)}</div>}
      <button className="corporate-reset" onClick={reset}><RefreshCw size={13} /> Reset</button>
    </div>

    <nav className="corporate-subnav panel" aria-label="Corporate intelligence views">
      {(["Market activity", "Brand lineage", "Ownership map", "Research workflows"] as View[]).map((item) => <button className={view === item ? "selected" : ""} onClick={() => setView(item)} key={item}>{item === "Market activity" ? <BarChart3 size={13} /> : item === "Brand lineage" ? <GitCompareArrows size={13} /> : item === "Ownership map" ? <Building2 size={13} /> : <Layers3 size={13} />}{item}</button>)}
    </nav>

    {view === "Market activity" && <>
      <div className="corporate-kpis">
        <article className="panel"><BarChart3 size={15} /><span>Verified moves</span><strong>{filtered.length}</strong><small>primary-source records</small></article>
        <article className="panel"><Building2 size={15} /><span>Deals and mergers</span><strong>{acquisitions}</strong><small>acquisitions or combinations</small></article>
        <article className="panel"><GitCompareArrows size={15} /><span>Identity shifts</span><strong>{identityMoves}</strong><small>rebrands, carve-outs, integrations</small></article>
        <article className="panel"><Factory size={15} /><span>Domains in motion</span><strong>{activeDomains}</strong><small>product adjacencies affected</small></article>
        <article className="panel"><Globe2 size={15} /><span>Organizations</span><strong>{companies}</strong><small>buyers, targets, and sponsors</small></article>
      </div>
      <div className="corporate-controls panel"><span><Filter size={13} /> Refine</span><label>Event type<select value={eventType} onChange={(event) => setEventType(event.target.value)}><option>All events</option>{eventTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Capability domain<select value={domain} onChange={(event) => setDomain(event.target.value)}><option>All domains</option>{domains.map((item) => <option key={item}>{item}</option>)}</select></label><mark>{filtered.length} verified records</mark></div>
      <ActivityView filtered={filtered} selected={selected} onSelect={setSelectedId} domain={domain} onDomain={setDomain} />
    </>}
    {view === "Brand lineage" && <LineageView />}
    {view === "Ownership map" && <OwnershipView />}
    {view === "Research workflows" && <WorkflowView />}

    <div className="corporate-evidence-note panel"><FileSearch size={15} /><span><b>Evidence boundary</b> Facts are linked to primary company, investor, or filing sources. Shared ownership is not treated as product integration. Workflows are research designs—not claims that automated monitors are already running.</span></div>
  </section>;
}
