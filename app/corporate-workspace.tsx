"use client";

import { ArrowUpRight, BarChart3, Building2, Calculator, ChevronRight, Factory, Filter, Globe2, Network, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { corporateEvents, type CorporateEvent } from "./corporate-data";

const referenceDate = new Date("2026-08-20T00:00:00Z");

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

export function CorporateWorkspace() {
  const [windowMonths, setWindowMonths] = useState(24);
  const [eventType, setEventType] = useState("All events");
  const [domain, setDomain] = useState("All domains");
  const [selectedId, setSelectedId] = useState(corporateEvents[0].id);

  const filtered = useMemo(() => corporateEvents.filter((event) => {
    const inWindow = new Date(`${event.announcedAt}T00:00:00Z`) >= cutoff(windowMonths);
    return inWindow && (eventType === "All events" || event.type === eventType) && (domain === "All domains" || event.domain === domain);
  }), [domain, eventType, windowMonths]);

  const selected = filtered.find((event) => event.id === selectedId) ?? filtered[0];
  const domains = Array.from(new Set(corporateEvents.map((event) => event.domain)));
  const acquisitions = filtered.filter((event) => event.type === "Acquisition").length;
  const investors = new Set(filtered.filter((event) => event.type === "Investment").map((event) => event.counterparty)).size;
  const activeDomains = new Set(filtered.map((event) => event.domain)).size;
  const companies = new Set(filtered.flatMap((event) => [event.company, event.counterparty])).size;

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

  const reset = () => {
    setWindowMonths(24);
    setEventType("All events");
    setDomain("All domains");
    setSelectedId(corporateEvents[0].id);
  };

  return <section className="corporate-atlas">
    <div className="corporate-command panel">
      <div><Network size={17} /><span><b>Corporate activity</b><small>Verified strategic moves across EHS and adjacent software</small></span></div>
      <div className="corporate-window" aria-label="Time window">{[12, 24, 36].map((months) => <button className={windowMonths === months ? "selected" : ""} onClick={() => setWindowMonths(months)} key={months}>{months} months</button>)}</div>
      <button className="corporate-reset" onClick={reset}><RefreshCw size={13} /> Reset</button>
    </div>

    <div className="corporate-kpis">
      <article className="panel"><BarChart3 size={15} /><span>Verified moves</span><strong>{filtered.length}</strong><small>within selected window</small></article>
      <article className="panel"><Building2 size={15} /><span>Acquisitions</span><strong>{acquisitions}</strong><small>closed or announced</small></article>
      <article className="panel"><Calculator size={15} /><span>Investor moves</span><strong>{investors}</strong><small>distinct capital sponsors</small></article>
      <article className="panel"><Factory size={15} /><span>Domains in motion</span><strong>{activeDomains}</strong><small>product adjacencies affected</small></article>
      <article className="panel"><Globe2 size={15} /><span>Organizations</span><strong>{companies}</strong><small>buyers, targets, and sponsors</small></article>
    </div>

    <div className="corporate-controls panel">
      <span><Filter size={13} /> Refine the market</span>
      <label>Event type<select value={eventType} onChange={(event) => setEventType(event.target.value)}><option>All events</option><option>Acquisition</option><option>Investment</option><option>Separation</option></select></label>
      <label>Capability domain<select value={domain} onChange={(event) => setDomain(event.target.value)}><option>All domains</option>{domains.map((item) => <option key={item}>{item}</option>)}</select></label>
      <mark>{filtered.length} evidence-backed records</mark>
    </div>

    <div className="corporate-visual-grid">
      <article className="panel corporate-quarter-chart"><header><div><span className="section-label">Deal tempo</span><h3>Strategic events by quarter</h3></div><mark>Announcement date</mark></header><div>{quarters.map(([label, count]) => <button key={label}><i><em style={{ height: `${Math.max(12, count / maxQuarter * 100)}%` }} /></i><strong>{count}</strong><b>{label}</b></button>)}</div></article>
      <article className="panel corporate-domain-chart"><header><div><span className="section-label">Capability direction</span><h3>Where portfolios are expanding</h3></div><mark>{activeDomains} active domains</mark></header><div>{domainCounts.map((item) => <button onClick={() => setDomain(item.name)} key={item.name}><span><b>{item.name}</b><small>{item.count} move{item.count === 1 ? "" : "s"}</small></span><i><em style={{ width: `${item.count / maxDomain * 100}%` }} /></i><ChevronRight size={12} /></button>)}</div></article>
    </div>

    <div className="corporate-executive-grid">
      <article className="panel corporate-board-signals"><header><div><span className="section-label">Executive synthesis</span><h3>What the transaction pattern says</h3></div><mark>Analyst inference</mark></header>
        <section><i data-color="purple" /><span><b>Specialist depth is being bought, not merely built</b><p>Recent acquirers added chemical compliance, environmental sensing, occupational medicine, crisis readiness, wearables, and contractor risk.</p></span></section>
        <section><i data-color="green" /><span><b>Platform boundaries are widening</b><p>EHS is converging with sustainability, supply-chain risk, business continuity, clinical systems, and real-time environmental intelligence.</p></span></section>
        <section><i data-color="blue" /><span><b>Network and data assets matter</b><p>Contractor networks, supplier graphs, clinical records, sensor data, and regulatory content create defensibility beyond workflow software.</p></span></section>
        <section><i data-color="red" /><span><b>Integration is the next diligence question</b><p>Announcements establish strategic intent. Product packaging, shared data models, migration paths, and customer adoption determine whether the thesis is delivered.</p></span></section>
      </article>
      <article className="panel corporate-buyer-table"><header><div><span className="section-label">Acquirer posture</span><h3>Most active organizations</h3></div><mark>Selected window</mark></header>{buyerCounts.slice(0, 7).map((buyer) => <button onClick={() => setSelectedId(buyer.events[0].id)} key={buyer.name}><span><b>{buyer.name}</b><small>{Array.from(new Set(buyer.events.map((event) => event.domain))).join(" · ")}</small></span><strong>{buyer.events.length}</strong><ChevronRight size={12} /></button>)}</article>
    </div>

    <div className="corporate-event-workbench panel">
      <div className="corporate-event-list"><header><span>Announcement</span><span>Strategic move</span><span>Domain</span><span>Status</span></header>{filtered.map((event) => <button className={selected?.id === event.id ? "selected" : ""} onClick={() => setSelectedId(event.id)} key={event.id}><span><b>{monthLabel(event.announcedAt)}</b><small>{event.type}</small></span><span><b>{event.company} → {event.counterparty}</b><small>{event.headline}</small></span><span>{event.domain}</span><span><mark>{event.status}</mark><ChevronRight size={12} /></span></button>)}</div>
      {selected ? <aside><div className="corporate-detail-top"><mark>{selected.type}</mark><small>{selected.announcedAt} · {selected.geography}</small></div><h2>{selected.headline}</h2><p>{selected.fact}</p><div className="corporate-thesis"><span><b>Strategic thesis</b>{selected.strategicThesis}</span><span><b>Board implication</b>{selected.boardImplication}<small>Analyst synthesis—not a transaction fact.</small></span></div><footer><span><ShieldCheck size={13} /><b>{selected.sourceTier}</b></span><a href={selected.sourceUrl} target="_blank" rel="noreferrer">{selected.sourceName}<ArrowUpRight size={12} /></a></footer></aside> : <aside className="corporate-empty">No events match this view.</aside>}
    </div>

    <div className="corporate-evidence-note panel"><ShieldCheck size={15} /><span><b>Evidence boundary</b> Dates, parties, status, and stated rationale come from the linked primary source. Board implications are labeled synthesis. No undisclosed valuation, revenue estimate, or integration claim is published.</span></div>
  </section>;
}
