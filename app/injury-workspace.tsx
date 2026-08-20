"use client";

import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleDot,
  Factory,
  Filter,
  Globe2,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { injuryDataset, type InjuryCell } from "./injury-data";

type InjuryDetailView = "Industries" | "Pathways" | "Geography" | "Narrative signals";
type FilterKey = "sector" | "subsector" | "state" | "event" | "nature" | "body" | "source" | "outcome";

const detailViews: Array<{ label: InjuryDetailView; title: string }> = [
  { label: "Industries", title: "Industry detail" },
  { label: "Pathways", title: "Injury pathways" },
  { label: "Geography", title: "Geography" },
  { label: "Narrative signals", title: "Narrative signals" },
];

const dimensionPosition: Record<FilterKey, number> = {
  sector: 1,
  subsector: 2,
  state: 3,
  event: 4,
  nature: 5,
  body: 6,
  source: 7,
  outcome: 8,
};

const dimensionValues: Record<FilterKey, readonly string[]> = {
  sector: injuryDataset.dimensions.sectors,
  subsector: injuryDataset.dimensions.subsectors,
  state: injuryDataset.dimensions.states,
  event: injuryDataset.dimensions.events,
  nature: injuryDataset.dimensions.natures,
  body: injuryDataset.dimensions.bodyRegions,
  source: injuryDataset.dimensions.sources,
  outcome: injuryDataset.dimensions.outcomes,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatShare(value: number, total: number) {
  return total ? `${(value / total * 100).toFixed(1)}%` : "0.0%";
}

function summarize(cells: readonly InjuryCell[], dimension: FilterKey, metricIndex = 9) {
  const position = dimensionPosition[dimension];
  const labels = dimensionValues[dimension];
  const counts = new Map<string, number>();
  cells.forEach((cell) => {
    const label = labels[cell[position]];
    counts.set(label, (counts.get(label) ?? 0) + cell[metricIndex]);
  });
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value);
}

function RankedBars({ items, total, active, onSelect, limit = 8 }: { items: Array<{ label: string; value: number }>; total: number; active?: string; onSelect?: (label: string) => void; limit?: number }) {
  const visible = items.slice(0, limit);
  const maximum = visible[0]?.value ?? 1;
  return <div className="injury-ranked-bars">{visible.map((item) => <button className={active === item.label ? "selected" : ""} onClick={() => onSelect?.(item.label)} key={item.label}><span><b>{item.label}</b><small>{formatShare(item.value, total)}</small></span><i><em style={{ width: `${Math.max(3, item.value / maximum * 100)}%` }} /></i><strong>{formatNumber(item.value)}</strong></button>)}</div>;
}

export function InjuryWorkspace() {
  const [detailView, setDetailView] = useState<InjuryDetailView | null>(null);
  const [sector, setSector] = useState("All sectors");
  const [subsector, setSubsector] = useState("All subsectors");
  const [state, setState] = useState("All states");
  const [event, setEvent] = useState("All events");
  const [nature, setNature] = useState("All injury natures");
  const [body, setBody] = useState("All body regions");
  const [source, setSource] = useState("All sources");
  const [outcome, setOutcome] = useState("All outcomes");
  const [fromYear, setFromYear] = useState(Number(injuryDataset.dimensions.years[0]));
  const [throughYear, setThroughYear] = useState(Number(injuryDataset.dimensions.years.at(-1)));

  const filterValues = useMemo(() => ({ sector, subsector, state, event, nature, body, source, outcome }), [body, event, nature, outcome, sector, source, state, subsector]);
  const matchesCell = (cell: InjuryCell, ignored?: FilterKey) => {
    const year = Number(injuryDataset.dimensions.years[cell[0]]);
    if (year < fromYear || year > throughYear) return false;
    return (Object.keys(filterValues) as FilterKey[]).every((key) => {
      if (key === ignored) return true;
      const selected = filterValues[key];
      if (selected.startsWith("All ")) return true;
      return dimensionValues[key][cell[dimensionPosition[key]]] === selected;
    });
  };

  const cells = useMemo(() => injuryDataset.cells.filter((cell) => matchesCell(cell as InjuryCell)) as unknown as InjuryCell[], [filterValues, fromYear, throughYear]);
  const cellsIgnoring = (key: FilterKey) => injuryDataset.cells.filter((cell) => matchesCell(cell as InjuryCell, key)) as unknown as InjuryCell[];
  const totals = useMemo(() => cells.reduce((accumulator, cell) => ({ cases: accumulator.cases + cell[9], hospitalized: accumulator.hospitalized + cell[10], amputations: accumulator.amputations + cell[11], inspectionLinked: accumulator.inspectionLinked + cell[12] }), { cases: 0, hospitalized: 0, amputations: 0, inspectionLinked: 0 }), [cells]);
  const sectorCounts = useMemo(() => summarize(cellsIgnoring("sector"), "sector"), [filterValues, fromYear, throughYear]);
  const subsectorCounts = useMemo(() => summarize(cellsIgnoring("subsector"), "subsector"), [filterValues, fromYear, throughYear]);
  const stateCounts = useMemo(() => summarize(cellsIgnoring("state"), "state"), [filterValues, fromYear, throughYear]);
  const eventCounts = useMemo(() => summarize(cellsIgnoring("event"), "event"), [filterValues, fromYear, throughYear]);
  const natureCounts = useMemo(() => summarize(cellsIgnoring("nature"), "nature"), [filterValues, fromYear, throughYear]);
  const bodyCounts = useMemo(() => summarize(cellsIgnoring("body"), "body"), [filterValues, fromYear, throughYear]);
  const sourceCounts = useMemo(() => summarize(cellsIgnoring("source"), "source"), [filterValues, fromYear, throughYear]);
  const outcomeCounts = useMemo(() => summarize(cellsIgnoring("outcome"), "outcome"), [filterValues, fromYear, throughYear]);

  const trend = useMemo(() => {
    const values = new Map<number, { cases: number; hospitalized: number; amputations: number }>();
    cells.forEach((cell) => {
      const year = Number(injuryDataset.dimensions.years[cell[0]]);
      const current = values.get(year) ?? { cases: 0, hospitalized: 0, amputations: 0 };
      current.cases += cell[9]; current.hospitalized += cell[10]; current.amputations += cell[11];
      values.set(year, current);
    });
    return [...values.entries()].map(([year, value]) => ({ year, ...value })).sort((left, right) => left.year - right.year);
  }, [cells]);

  const routes = useMemo(() => {
    const values = new Map<string, number>();
    cells.forEach((cell) => {
      const key = [injuryDataset.dimensions.events[cell[4]], injuryDataset.dimensions.sources[cell[7]], injuryDataset.dimensions.natures[cell[5]], injuryDataset.dimensions.bodyRegions[cell[6]]].join("||| ");
      values.set(key, (values.get(key) ?? 0) + cell[9]);
    });
    return [...values.entries()].map(([key, value]) => ({ parts: key.split("||| "), value })).sort((left, right) => right.value - left.value).slice(0, 10);
  }, [cells]);

  const narrativeSignals = useMemo(() => {
    const selectedSector = sector === "All sectors" ? "All sectors" : sector;
    const selectedSubsector = subsector === "All subsectors" ? "All subsectors" : subsector;
    let matches = injuryDataset.signals.filter((signal) => signal.sector === selectedSector && signal.subsector === selectedSubsector);
    if (!matches.length && selectedSubsector !== "All subsectors") matches = injuryDataset.signals.filter((signal) => signal.sector === selectedSector && signal.subsector === "All subsectors");
    return matches.slice(0, 12);
  }, [sector, subsector]);

  const activeFilters = [sector, subsector, state, event, nature, body, source, outcome].filter((value) => !value.startsWith("All "));
  const clearFilters = () => { setSector("All sectors"); setSubsector("All subsectors"); setState("All states"); setEvent("All events"); setNature("All injury natures"); setBody("All body regions"); setSource("All sources"); setOutcome("All outcomes"); setFromYear(Number(injuryDataset.dimensions.years[0])); setThroughYear(Number(injuryDataset.dimensions.years.at(-1))); };
  const choose = (key: FilterKey, value: string) => {
    if (key === "sector") { setSector(value); setSubsector("All subsectors"); }
    if (key === "subsector") setSubsector(value);
    if (key === "state") setState(value);
    if (key === "event") setEvent(value);
    if (key === "nature") setNature(value);
    if (key === "body") setBody(value);
    if (key === "source") setSource(value);
    if (key === "outcome") setOutcome(value);
  };

  const maximumTrend = Math.max(...trend.map((item) => item.cases), 1);
  const sectorTotal = sectorCounts.reduce((sum, item) => sum + item.value, 0);
  const stateTotal = stateCounts.reduce((sum, item) => sum + item.value, 0);
  const eventTotal = eventCounts.reduce((sum, item) => sum + item.value, 0);

  return <section className="injury-intelligence">
    <div className="injury-command panel">
      <div><span className="injury-command-icon"><CircleDot size={19} /></span><div><h2>All Injuries · January 2015–April 2024</h2><p>Reported cases organized by industry, mechanism, geography and outcome.</p></div></div>
      <div className="injury-source-note"><ShieldCheck size={14} /><span><b>{formatNumber(injuryDataset.meta.sourceRows)}</b> de-identified records · {injuryDataset.meta.from.slice(0, 4)}–{injuryDataset.meta.through.slice(0, 4)}</span></div>
    </div>

    <div className="injury-control-panel panel">
      <div className="injury-control-title"><Filter size={14} /><span>Cross-filter</span>{activeFilters.length > 0 && <mark>{activeFilters.length} active</mark>}<button onClick={clearFilters}><RefreshCw size={12} /> Reset</button></div>
      <div className="injury-controls">
        <label>Sector<select value={sector} onChange={(event) => choose("sector", event.target.value)}><option>All sectors</option>{sectorCounts.map((item) => <option key={item.label}>{item.label}</option>)}</select></label>
        <label>Subsector<select value={subsector} onChange={(event) => choose("subsector", event.target.value)}><option>All subsectors</option>{subsectorCounts.map((item) => <option key={item.label}>{item.label}</option>)}</select></label>
        <label>State<select value={state} onChange={(event) => choose("state", event.target.value)}><option>All states</option>{stateCounts.map((item) => <option key={item.label}>{item.label}</option>)}</select></label>
        <label>Event mechanism<select value={event} onChange={(event) => choose("event", event.target.value)}><option>All events</option>{eventCounts.map((item) => <option key={item.label}>{item.label}</option>)}</select></label>
        <label>Outcome<select value={outcome} onChange={(event) => choose("outcome", event.target.value)}><option>All outcomes</option>{outcomeCounts.map((item) => <option key={item.label}>{item.label}</option>)}</select></label>
        <label>From<select value={fromYear} onChange={(event) => setFromYear(Math.min(Number(event.target.value), throughYear))}>{injuryDataset.dimensions.years.map((year) => <option key={year}>{year}</option>)}</select></label>
        <label>Through<select value={throughYear} onChange={(event) => setThroughYear(Math.max(Number(event.target.value), fromYear))}>{injuryDataset.dimensions.years.map((year) => <option key={year}>{year}</option>)}</select></label>
      </div>
      {activeFilters.length > 0 && <div className="injury-active-filters">{activeFilters.map((item) => <span key={item}>{item}</span>)}</div>}
    </div>

    <div className="injury-metrics">
      <article className="panel"><span>Reported cases</span><strong>{formatNumber(totals.cases)}</strong><small>{formatShare(totals.cases, injuryDataset.meta.cases)} of historical file</small></article>
      <article className="panel"><span>Hospitalized employees</span><strong>{formatNumber(totals.hospitalized)}</strong><small>{totals.cases ? (totals.hospitalized / totals.cases * 100).toFixed(1) : "0.0"} per 100 reported cases</small></article>
      <article className="panel"><span>Amputations reported</span><strong>{formatNumber(totals.amputations)}</strong><small>{totals.cases ? (totals.amputations / totals.cases * 100).toFixed(1) : "0.0"} per 100 reported cases</small></article>
      <article className="panel"><span>Inspection-linked</span><strong>{formatNumber(totals.inspectionLinked)}</strong><small>{formatShare(totals.inspectionLinked, Math.max(totals.cases, 1))} of filtered cases</small></article>
    </div>

    <div className="injury-overview-label"><div><span className="section-label">Visual overview</span><h3>Your current cross-section</h3></div><small>This overview stays visible while you explore details.</small></div>
    <div className="injury-view-grid landscape">
      <article className="panel injury-trend"><header><div><span className="section-label">Time profile</span><h3>Reported cases by year</h3></div><mark>Counts, not rates</mark></header><div className="injury-year-chart">{trend.map((item) => <button onClick={() => { setFromYear(item.year); setThroughYear(item.year); }} key={item.year}><span><i style={{ height: `${Math.max(5, item.cases / maximumTrend * 100)}%` }} /></span><b>{item.year}</b><small>{formatNumber(item.cases)}</small></button>)}</div></article>
      <article className="panel injury-ranked"><header><div><span className="section-label">Industry concentration</span><h3>Cases by NAICS sector</h3></div><Factory size={17} /></header><RankedBars items={sectorCounts} total={sectorTotal} active={sector} onSelect={(label) => choose("sector", label)} limit={9} /></article>
      <article className="panel injury-ranked"><header><div><span className="section-label">Mechanism profile</span><h3>How incidents happen</h3></div><BarChart3 size={17} /></header><RankedBars items={eventCounts} total={eventTotal} active={event} onSelect={(label) => choose("event", label)} limit={8} /></article>
      <article className="panel injury-signal-card"><header><div><span className="section-label">Narrative evidence</span><h3>Recurring real-world signals</h3></div><Sparkles size={17} /></header><div className="injury-signal-cloud">{narrativeSignals.map((signal, index) => <span style={{ fontSize: `${Math.max(10, 17 - index * .45)}px` }} key={signal.signal}><b>{signal.signal}</b><small>{formatNumber(signal.count)}</small></span>)}</div><footer>Terms are deterministic matches from narratives; raw text is not included in the application.</footer></article>
    </div>

    <section className="injury-detail-section">
      <div className="injury-detail-heading"><div><span className="section-label">Explore further</span><h3>{detailView ? detailViews.find((item) => item.label === detailView)?.title : "Choose a detailed view"}</h3></div>{detailView && <button onClick={() => setDetailView(null)}>Close detail</button>}</div>
      <nav className="injury-detail-nav" aria-label="Detailed injury views">{detailViews.map((item) => <button className={detailView === item.label ? "active" : ""} onClick={() => setDetailView(detailView === item.label ? null : item.label)} key={item.label}>{item.title}</button>)}</nav>
    </section>

    {detailView === "Industries" && <div className="injury-industry-view">
      <article className="panel injury-industry-list"><header><div><span className="section-label">NAICS drilldown</span><h3>{sector === "All sectors" ? "Sectors" : `${sector} subsectors`}</h3></div><mark>{formatNumber(totals.cases)} cases in view</mark></header><div className="injury-industry-table"><div className="injury-industry-row head"><span>Industry</span><span>Cases</span><span>Share</span><span>Signal</span></div>{(sector === "All sectors" ? sectorCounts : subsectorCounts).slice(0, 24).map((item) => <button className="injury-industry-row" onClick={() => choose(sector === "All sectors" ? "sector" : "subsector", item.label)} key={item.label}><span><b>{item.label}</b><small>{sector === "All sectors" ? "2-digit sector" : "3-digit subsector"}</small></span><strong>{formatNumber(item.value)}</strong><span>{formatShare(item.value, sector === "All sectors" ? sectorTotal : totals.cases)}</span><ChevronRight size={14} /></button>)}</div></article>
      <aside className="injury-industry-side">
      <article className="panel injury-ranked"><header><div><span className="section-label">Outcome mix</span><h3>What was reported</h3></div><CircleDot size={17} /></header><RankedBars items={outcomeCounts} total={outcomeCounts.reduce((sum, item) => sum + item.value, 0)} active={outcome} onSelect={(label) => choose("outcome", label)} limit={5} /></article>
        <article className="panel injury-industry-brief"><span className="section-label">Current cut</span><h3>{subsector !== "All subsectors" ? subsector : sector}</h3><p>{eventCounts[0]?.label ?? "No event pattern"} is the largest reported mechanism in this selection. {natureCounts[0]?.label ?? "No injury nature"} is the most common injury nature, with {bodyCounts[0]?.label.toLowerCase() ?? "no body-region signal"} most frequently represented.</p><button onClick={() => setDetailView("Pathways")}>Inspect pathways <ArrowRight size={13} /></button></article>
      </aside>
    </div>}

    {detailView === "Pathways" && <div className="injury-pathway-view">
      <div className="injury-pathway-columns">
        {[
          { key: "event" as const, title: "Event mechanism", items: eventCounts, active: event },
          { key: "source" as const, title: "Equipment / environment", items: sourceCounts, active: source },
          { key: "nature" as const, title: "Injury nature", items: natureCounts, active: nature },
          { key: "body" as const, title: "Body region", items: bodyCounts, active: body },
        ].map((column, index) => <article className="panel" key={column.key}><header><span>{index + 1}</span><div><small>Pathway stage</small><h3>{column.title}</h3></div></header><RankedBars items={column.items} total={column.items.reduce((sum, item) => sum + item.value, 0)} active={column.active} onSelect={(label) => choose(column.key, label)} limit={7} /></article>)}
      </div>
      <article className="panel injury-route-table"><header><div><span className="section-label">Dominant combinations</span><h3>Most common injury pathways in this cross-section</h3></div><Network size={17} /></header>{routes.map((route, index) => <div className="injury-route" key={route.parts.join("-")}><strong>{String(index + 1).padStart(2, "0")}</strong>{route.parts.map((part: string, partIndex: number) => <span key={`${part}-${partIndex}`}><b>{part}</b>{partIndex < route.parts.length - 1 && <ChevronRight size={12} />}</span>)}<mark>{formatNumber(route.value)}</mark></div>)}</article>
    </div>}

    {detailView === "Geography" && <div className="injury-geography-view">
      <article className="panel injury-state-rank"><header><div><span className="section-label">Reporting footprint</span><h3>Cases by state</h3></div><Globe2 size={17} /></header><div className="injury-state-grid">{stateCounts.slice(0, 30).map((item, index) => <button className={state === item.label ? "selected" : ""} onClick={() => choose("state", item.label)} key={item.label}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.label}</b><strong>{formatNumber(item.value)}</strong><i style={{ width: `${item.value / (stateCounts[0]?.value ?? 1) * 100}%` }} /></button>)}</div></article>
      <aside className="injury-geography-side"><article className="panel"><span className="section-label">Interpretation boundary</span><h3>Volume is not risk</h3><p>State totals reflect the source dataset’s jurisdiction and reporting coverage. They should not be treated as injury rates until matched to workforce or hours-worked denominators and State Plan coverage.</p><div><Check size={13} /> State available for virtually every record</div><div><Check size={13} /> Exact coordinates retained outside this application</div><div><ShieldCheck size={13} /> No facility dots or addresses published</div></article><article className="panel injury-ranked"><header><div><span className="section-label">Selected geography</span><h3>{state}</h3></div></header><RankedBars items={sectorCounts} total={sectorTotal} active={sector} onSelect={(label) => choose("sector", label)} limit={8} /></article></aside>
    </div>}

    {detailView === "Narrative signals" && <div className="injury-narrative-view">
      <article className="panel injury-narrative-intro"><span><Search size={18} /></span><div><span className="section-label">Language layer</span><h3>What the narratives reveal about operating conditions</h3><p>Structured codes explain what happened. Narrative signals surface equipment, environments and recurring work conditions that codes alone can obscure.</p></div><mark>Raw narratives protected</mark></article>
      <div className="injury-narrative-grid">{narrativeSignals.map((signal, index) => <article className="panel" key={signal.signal}><span>{String(index + 1).padStart(2, "0")}</span><h3>{signal.signal}</h3><strong>{formatNumber(signal.count)}</strong><small>matching narratives</small><i><em style={{ width: `${signal.count / (narrativeSignals[0]?.count ?? 1) * 100}%` }} /></i></article>)}</div>
      <article className="panel injury-narrative-policy"><ShieldCheck size={16} /><span><b>Privacy and trust boundary</b> Narrative counts use deterministic phrase matching. Employer names, record identifiers, addresses, exact dates, coordinates and narrative text are excluded from this production dataset.</span></article>
    </div>}
  </section>;
}
