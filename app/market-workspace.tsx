"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, Building2, Database, Factory, Globe2, Radar, RefreshCw, ShieldCheck } from "lucide-react";
import { enforcementDataset } from "./enforcement-data";
import { injuryDataset } from "./injury-data";
import { marketSegments, verticals, type MarketSegment } from "./market-data";

type EconomicRecord = {
  segmentId: string;
  label: string;
  naics: string;
  employment: number | null;
  establishments: number | null;
  employmentGrowth: number | null;
  establishmentGrowth: number | null;
  averageWeeklyWage: number | null;
  period: string;
  status: "live" | "unavailable";
  coverageLevel: "Exact NAICS" | "NAICS proxy";
};

type MarketDetail = {
  retrievedAt: string;
  segment: { id: string; label: string; naics: string; coverageLevel: string };
  geography: { period: string; states: Array<{ fips: string; state: string; employment: number; establishments: number; employmentGrowth: number | null; averageWeeklyWage: number | null; locationQuotient: number | null }> };
  sizes: { status: "live" | "unavailable"; period?: string; rows: Array<{ label: string; establishments: number; employment: number | null }> };
  sources: Array<{ name: string; use: string; url: string }>;
};

type Props = {
  records: EconomicRecord[];
  selectedVertical: string;
  selectedSegment: string;
  onOpenMarket: (vertical: string, segmentId?: string) => void;
};

const formatNumber = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("en-US", { notation: value >= 1_000_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
const formatCurrency = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const formatPercent = (value: number | null | undefined) => value == null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

function aggregate(records: EconomicRecord[]) {
  const live = records.filter((record) => record.status === "live");
  const employment = live.reduce((sum, record) => sum + (record.employment ?? 0), 0);
  const establishments = live.reduce((sum, record) => sum + (record.establishments ?? 0), 0);
  const weightedGrowth = employment ? live.reduce((sum, record) => sum + (record.employmentGrowth ?? 0) * (record.employment ?? 0), 0) / employment : null;
  const weightedWage = employment ? live.reduce((sum, record) => sum + (record.averageWeeklyWage ?? 0) * (record.employment ?? 0), 0) / employment : null;
  return { employment, establishments, growth: weightedGrowth, wage: weightedWage, live: live.length };
}

function rawCode(label: string) {
  return label.split(" · ")[0];
}

function matchesNaics(segment: MarketSegment, sectorLabel: string, subsectorLabel: string) {
  const sector = rawCode(sectorLabel);
  const subsector = rawCode(subsectorLabel);
  return segment.naics.some((value) => {
    if (value === "31-33" || value === "44-45" || value === "48-49") return sector === value;
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return sector === digits;
    return subsector === digits.slice(0, 3);
  });
}

function injuryFootprint(segment: MarketSegment) {
  return injuryDataset.cells.reduce((total, cell) => {
    if (!matchesNaics(segment, injuryDataset.dimensions.sectors[cell[1]], injuryDataset.dimensions.subsectors[cell[2]])) return total;
    total.cases += cell[9]; total.hospitalized += cell[10]; total.amputations += cell[11]; total.inspectionLinked += cell[12];
    return total;
  }, { cases: 0, hospitalized: 0, amputations: 0, inspectionLinked: 0 });
}

function enforcementFootprint(segment: MarketSegment) {
  const cases = enforcementDataset.cases.filter((item) => {
    const naics = item.naics.replace(/\D/g, "");
    return segment.naics.some((value) => {
      const code = value.replace(/\D/g, "");
      if (value === "31-33") return ["31", "32", "33"].includes(naics.slice(0, 2));
      if (value === "44-45") return ["44", "45"].includes(naics.slice(0, 2));
      if (value === "48-49") return ["48", "49"].includes(naics.slice(0, 2));
      return naics.startsWith(code);
    });
  });
  return {
    cases: cases.length,
    penalty: cases.reduce((sum, item) => sum + item.initialPenalty, 0),
    violations: cases.reduce((sum, item) => sum + item.violationEvents, 0),
    matched: cases.filter((item) => item.matchedInspection).length,
  };
}

export function MarketWorkspace({ records, selectedVertical, selectedSegment, onOpenMarket }: Props) {
  const activeSegment = marketSegments.find((segment) => segment.id === selectedSegment)
    ?? marketSegments.find((segment) => selectedVertical !== "All markets" && segment.vertical === selectedVertical)
    ?? marketSegments[0];
  const [detail, setDetail] = useState<MarketDetail | null>(null);
  const [detailStatus, setDetailStatus] = useState<"loading" | "live" | "degraded">("loading");
  const [selectedState, setSelectedState] = useState("All states");

  useEffect(() => {
    let active = true;
    setDetailStatus("loading");
    fetch(`/api/markets?segment=${encodeURIComponent(activeSegment.id)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Market detail unavailable")))
      .then((payload: MarketDetail) => { if (active) { setDetail(payload); setDetailStatus("live"); setSelectedState("All states"); } })
      .catch(() => { if (active) setDetailStatus("degraded"); });
    return () => { active = false; };
  }, [activeSegment.id]);

  const activeRecord = records.find((record) => record.segmentId === activeSegment.id);
  const activeInjuries = useMemo(() => injuryFootprint(activeSegment), [activeSegment]);
  const activeEnforcement = useMemo(() => enforcementFootprint(activeSegment), [activeSegment]);
  const visibleSegments = selectedVertical === "All markets" ? marketSegments : marketSegments.filter((segment) => segment.vertical === selectedVertical);
  const verticalCards = verticals.map((vertical) => {
    const segments = marketSegments.filter((segment) => segment.vertical === vertical);
    const metrics = aggregate(records.filter((record) => segments.some((segment) => segment.id === record.segmentId)));
    return { vertical, segments, metrics };
  });
  const maxStateEmployment = Math.max(...(detail?.geography.states.map((state) => state.employment) ?? [1]), 1);
  const totalSizeEstablishments = detail?.sizes.rows.reduce((sum, row) => sum + row.establishments, 0) ?? 0;
  const maxSegmentEmployment = Math.max(...visibleSegments.map((segment) => records.find((record) => record.segmentId === segment.id)?.employment ?? 0), 1);

  return <section className="market-atlas">
    <div className="market-atlas-bar panel">
      <div><span className="market-atlas-icon"><Globe2 size={18} /></span><span><b>U.S. Market Atlas</b><small>NAICS-linked economic, workforce, injury and enforcement intelligence</small></span></div>
      <div><mark className={detailStatus}>{detailStatus}</mark><button onClick={() => onOpenMarket(activeSegment.vertical, activeSegment.id)}><RefreshCw size={12} /> Refresh view</button></div>
    </div>

    <div className="market-tile-grid">
      {verticalCards.map(({ vertical, segments, metrics }, index) => <button data-accent={index % 4} className={activeSegment.vertical === vertical ? "market-tile selected" : "market-tile"} onClick={() => onOpenMarket(vertical, segments[0]?.id)} key={vertical}>
        <header><Factory size={15} /><span>{segments.length} segments</span></header><h2>{vertical}</h2>
        <div><span><b>{formatNumber(metrics.establishments)}</b><small>establishments</small></span><span><b className={(metrics.growth ?? 0) >= 0 ? "positive" : "negative"}>{formatPercent(metrics.growth)}</b><small>employment YoY</small></span></div>
        <footer><span>{metrics.live}/{segments.length} live slices</span><ArrowRight size={13} /></footer>
      </button>)}
    </div>

    <div className="market-focus-heading">
      <div><span className="section-label">Current market</span><h2>{activeSegment.segment}</h2><p>NAICS {activeSegment.naics.join(" · ")} · {activeSegment.vertical}</p></div>
      <label>Segment<select value={activeSegment.id} onChange={(event) => { const segment = marketSegments.find((item) => item.id === event.target.value); if (segment) onOpenMarket(segment.vertical, segment.id); }}>{marketSegments.map((segment) => <option value={segment.id} key={segment.id}>{segment.vertical} · {segment.segment}</option>)}</select></label>
    </div>

    <div className="market-kpis">
      <article className="panel"><Building2 size={16} /><span>Employer locations</span><strong>{formatNumber(activeRecord?.establishments)}</strong><small>BLS QCEW · {activeRecord?.period ?? "loading"}</small></article>
      <article className="panel"><Database size={16} /><span>Covered employment</span><strong>{formatNumber(activeRecord?.employment)}</strong><small>Private-sector jobs</small></article>
      <article className="panel"><BarChart3 size={16} /><span>Employment momentum</span><strong className={(activeRecord?.employmentGrowth ?? 0) >= 0 ? "positive" : "negative"}>{formatPercent(activeRecord?.employmentGrowth)}</strong><small>Year over year</small></article>
      <article className="panel"><Building2 size={16} /><span>Average weekly wage</span><strong>{formatCurrency(activeRecord?.averageWeeklyWage)}</strong><small>Current labor-cost signal</small></article>
      <article className="panel"><ShieldCheck size={16} /><span>Evidence precision</span><strong>{activeRecord?.coverageLevel === "Exact NAICS" ? "Exact" : "Proxy"}</strong><small>{activeRecord?.coverageLevel ?? "Checking source"}</small></article>
    </div>

    <div className="market-visual-grid">
      <article className="panel market-segment-shape">
        <header><div><span className="section-label">Market shape</span><h3>{selectedVertical === "All markets" ? "Priority segment scale" : `${selectedVertical} segments`}</h3></div><mark>Employment · growth · establishments</mark></header>
        <div>{visibleSegments.map((segment) => { const record = records.find((item) => item.segmentId === segment.id); return <button className={segment.id === activeSegment.id ? "selected" : ""} onClick={() => onOpenMarket(segment.vertical, segment.id)} key={segment.id}><span><b>{segment.segment}</b><small>NAICS {record?.naics ?? segment.naics[0]}</small></span><i><em style={{ width: `${Math.max(3, (record?.employment ?? 0) / maxSegmentEmployment * 100)}%` }} /></i><strong>{formatNumber(record?.employment)}</strong><mark className={(record?.employmentGrowth ?? 0) >= 0 ? "positive" : "negative"}>{formatPercent(record?.employmentGrowth)}</mark></button>; })}</div>
      </article>

      <article className="panel market-state-map">
        <header><div><span className="section-label">Geographic concentration</span><h3>Largest state employment footprints</h3></div><mark>{detail?.geography.period ?? "Loading QCEW"}</mark></header>
        <div>{detail?.geography.states.slice(0, 10).map((state) => <button className={selectedState === state.state ? "selected" : ""} onClick={() => setSelectedState(selectedState === state.state ? "All states" : state.state)} key={state.fips}><span><b>{state.state}</b><small>LQ {state.locationQuotient?.toFixed(2) ?? "—"}</small></span><i><em style={{ width: `${Math.max(4, state.employment / maxStateEmployment * 100)}%` }} /></i><strong>{formatNumber(state.employment)}</strong><mark className={(state.employmentGrowth ?? 0) >= 0 ? "positive" : "negative"}>{formatPercent(state.employmentGrowth)}</mark></button>) ?? <div className="market-loading">Loading state concentration…</div>}</div>
      </article>

      <article className="panel market-size-profile">
        <header><div><span className="section-label">Employer structure</span><h3>Establishments by employee size</h3></div><mark>{detail?.sizes.period ?? "Census CBP"}</mark></header>
        {detail?.sizes.rows.length ? <div>{detail.sizes.rows.map((row) => <span key={row.label}><b>{row.label}</b><i><em style={{ width: `${Math.max(2, row.establishments / Math.max(totalSizeEstablishments, 1) * 100)}%` }} /></i><strong>{formatNumber(row.establishments)}</strong></span>)}</div> : <div className="market-source-pending"><Building2 size={22} /><b>Size distribution is source-dependent</b><p>Exact six-digit CBP slices appear here when available; broader proxies remain labeled.</p></div>}
      </article>

      <article className="panel market-risk-intersection">
        <header><div><span className="section-label">Risk intersection</span><h3>Safety and enforcement footprint</h3></div><Radar size={17} /></header>
        <div className="market-risk-numbers"><span><small>Historical injury reports</small><b>{formatNumber(activeInjuries.cases)}</b><em>{formatNumber(activeInjuries.hospitalized)} hospitalized</em></span><span><small>Enforcement cases</small><b>{formatNumber(activeEnforcement.cases)}</b><em>{formatCurrency(activeEnforcement.penalty)} initial penalties</em></span></div>
        <div className="market-risk-lanes"><span><b>Inspection-linked injuries</b><i><em style={{ width: `${activeInjuries.cases ? activeInjuries.inspectionLinked / activeInjuries.cases * 100 : 0}%` }} /></i><strong>{formatNumber(activeInjuries.inspectionLinked)}</strong></span><span><b>Bulk-matched enforcement</b><i><em style={{ width: `${activeEnforcement.cases ? activeEnforcement.matched / activeEnforcement.cases * 100 : 0}%` }} /></i><strong>{activeEnforcement.matched}/{activeEnforcement.cases}</strong></span></div>
        <footer><ShieldCheck size={13} /><span>Counts use different reporting windows and are not presented as rates. Matched-period denominators remain a publication gate.</span></footer>
      </article>
    </div>

    <div className="market-source-lattice panel">
      <header><div><span className="section-label">Intelligence layer</span><h3>What is measured—and what is next</h3></div><mark>Source-governed</mark></header>
      <div>{(detail?.sources ?? [
        { name: "BLS QCEW", use: "Employment, establishments, wages and state concentration", url: "https://www.bls.gov/cew/" },
        { name: "Census CBP", use: "Employer size, payroll and detailed geography", url: "https://www.census.gov/programs-surveys/cbp.html" },
        { name: "Census QWI / BDS", use: "Hires, separations, job creation and business formation", url: "https://www.census.gov/topics/business-economy/dynamics/data/api.html" },
        { name: "BLS OEWS", use: "EHS role concentration and wages by industry", url: "https://www.bls.gov/oes/" },
        { name: "BEA", use: "Industry output, value added and growth", url: "https://www.bea.gov/data/gdp/gdp-industry" },
      ]).map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.name}><b>{source.name}</b><p>{source.use}</p><span>Primary source <ArrowRight size={12} /></span></a>)}</div>
      <footer><b>EHS hiring</b><span>QWI can measure total hiring flows now. Precise open EHS-role velocity requires OEWS occupational baselines plus an approved job-posting feed; the interface keeps those measures separate.</span></footer>
    </div>
  </section>;
}
