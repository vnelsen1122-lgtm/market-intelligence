"use client";

import { useMemo, useState } from "react";
import { BarChart3, Building2, ChevronRight, Filter, Globe2, RefreshCw, ShieldCheck } from "lucide-react";
import { enforcementDataset } from "./enforcement-data";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, notation: value >= 1_000_000 ? "compact" : "standard" }).format(value);

export function EnforcementWorkspace() {
  const [state, setState] = useState("All states");
  const [sector, setSector] = useState("All sectors");
  const [year, setYear] = useState("All years");
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const cases = useMemo(() => enforcementDataset.cases.filter((item) => (state === "All states" || item.state === state) && (sector === "All sectors" || item.sector === sector) && (year === "All years" || item.issuanceDate.startsWith(year))), [sector, state, year]);
  const selectedCase = cases.find((item) => item.activityNumber === selectedActivity) ?? cases[0];
  const selected = selectedCase ? { ...selectedCase, inspectionNumber: String(selectedCase.inspectionNumber).replace(/\..*$/, "") } : undefined;
  const totalPenalty = cases.reduce((sum, item) => sum + item.initialPenalty, 0);
  const violationEvents = cases.reduce((sum, item) => sum + item.violationEvents, 0);
  const matched = cases.filter((item) => item.matchedInspection).length;
  const stateRows = useMemo(() => {
    const values = new Map<string, { cases: number; penalty: number }>();
    cases.forEach((item) => { const current = values.get(item.state) ?? { cases: 0, penalty: 0 }; current.cases += 1; current.penalty += item.initialPenalty; values.set(item.state, current); });
    return [...values.entries()].map(([label, value]) => ({ label, ...value })).sort((left, right) => right.penalty - left.penalty);
  }, [cases]);
  const sectorRows = useMemo(() => {
    const values = new Map<string, { title: string; cases: number; penalty: number }>();
    cases.forEach((item) => { const title = enforcementDataset.sectors.find((entry) => entry.code === item.sector)?.title ?? item.sector; const current = values.get(item.sector) ?? { title, cases: 0, penalty: 0 }; current.cases += 1; current.penalty += item.initialPenalty; values.set(item.sector, current); });
    return [...values.entries()].map(([code, value]) => ({ code, ...value })).sort((left, right) => right.penalty - left.penalty);
  }, [cases]);
  const yearRows = useMemo(() => {
    const values = new Map<string, { cases: number; penalty: number }>();
    cases.forEach((item) => { const key = item.issuanceDate.slice(0, 4); const current = values.get(key) ?? { cases: 0, penalty: 0 }; current.cases += 1; current.penalty += item.initialPenalty; values.set(key, current); });
    return [...values.entries()].map(([label, value]) => ({ label, ...value })).sort((left, right) => left.label.localeCompare(right.label));
  }, [cases]);
  const penaltyBands = useMemo(() => [
    { label: "Under $25K", min: 0, max: 25_000 },
    { label: "$25K–$75K", min: 25_000, max: 75_000 },
    { label: "$75K–$150K", min: 75_000, max: 150_000 },
    { label: "$150K–$300K", min: 150_000, max: 300_000 },
    { label: "$300K+", min: 300_000, max: Infinity },
  ].map((band) => ({ ...band, count: cases.filter((item) => item.initialPenalty >= band.min && item.initialPenalty < band.max).length })), [cases]);
  const maxStatePenalty = Math.max(...stateRows.map((item) => item.penalty), 1);
  const maxSectorPenalty = Math.max(...sectorRows.map((item) => item.penalty), 1);
  const maxYearCases = Math.max(...yearRows.map((item) => item.cases), 1);
  const maxBand = Math.max(...penaltyBands.map((item) => item.count), 1);
  const activeFilters = [state, sector, year].filter((item) => !item.startsWith("All ")).length;
  const reset = () => { setState("All states"); setSector("All sectors"); setYear("All years"); setSelectedActivity(null); };

  return <section className="enforcement-intelligence">
    <div className="enforcement-command panel"><div><ShieldCheck size={18} /><span><b>OSHA Enforcement Cases</b><small>{formatNumber(enforcementDataset.meta.cases)} cases preserved by inspection number</small></span></div><mark>{formatNumber(enforcementDataset.meta.matchedInspections)} bulk record matches</mark></div>
    <div className="enforcement-kpis">
      <article className="panel"><Building2 size={16} /><span>Cases in view</span><strong>{formatNumber(cases.length)}</strong><small>{formatNumber(new Set(cases.map((item) => item.employer)).size)} employers</small></article>
      <article className="panel"><BarChart3 size={16} /><span>Initial penalties</span><strong>{formatCurrency(totalPenalty)}</strong><small>Workbook field, not final penalty</small></article>
      <article className="panel"><ShieldCheck size={16} /><span>Violation events</span><strong>{formatNumber(violationEvents)}</strong><small>Matched OSHA history rows</small></article>
      <article className="panel"><Globe2 size={16} /><span>Geographic coverage</span><strong>{formatNumber(new Set(cases.map((item) => item.state)).size)}</strong><small>States and territories</small></article>
      <article className="panel"><Filter size={16} /><span>Bulk match coverage</span><strong>{cases.length ? `${(matched / cases.length * 100).toFixed(1)}%` : "0.0%"}</strong><small>Unmatched never means zero activity</small></article>
    </div>
    <div className="enforcement-dashboard-grid">
      <article className="panel enforcement-trend"><header><div><span className="section-label">Time profile</span><h3>Cases by issuance year</h3></div><mark>Counts and initial penalties</mark></header><div>{yearRows.map((item) => <button onClick={() => setYear(year === item.label ? "All years" : item.label)} className={year === item.label ? "selected" : ""} key={item.label}><i><em style={{ height: `${Math.max(5, item.cases / maxYearCases * 100)}%` }} /></i><b>{item.label}</b><strong>{formatNumber(item.cases)}</strong><small>{formatCurrency(item.penalty)}</small></button>)}</div></article>
      <article className="panel enforcement-ranked"><header><div><span className="section-label">Geographic pressure</span><h3>Initial penalties by state</h3></div><Globe2 size={17} /></header><div>{stateRows.slice(0, 10).map((item) => <button onClick={() => setState(state === item.label ? "All states" : item.label)} className={state === item.label ? "selected" : ""} key={item.label}><span><b>{item.label}</b><small>{item.cases} cases</small></span><i><em style={{ width: `${Math.max(3, item.penalty / maxStatePenalty * 100)}%` }} /></i><strong>{formatCurrency(item.penalty)}</strong></button>)}</div></article>
      <article className="panel enforcement-ranked"><header><div><span className="section-label">Industry pressure</span><h3>Initial penalties by NAICS sector</h3></div><Building2 size={17} /></header><div>{sectorRows.slice(0, 10).map((item) => <button onClick={() => setSector(sector === item.code ? "All sectors" : item.code)} className={sector === item.code ? "selected" : ""} key={item.code}><span><b>{item.title}</b><small>NAICS {item.code} · {item.cases} cases</small></span><i><em style={{ width: `${Math.max(3, item.penalty / maxSectorPenalty * 100)}%` }} /></i><strong>{formatCurrency(item.penalty)}</strong></button>)}</div></article>
      <article className="panel enforcement-bands"><header><div><span className="section-label">Penalty distribution</span><h3>Case concentration by initial penalty</h3></div><BarChart3 size={17} /></header><div>{penaltyBands.map((item) => <span key={item.label}><i><em style={{ height: `${Math.max(4, item.count / maxBand * 100)}%` }} /></i><b>{item.label}</b><strong>{item.count}</strong></span>)}</div><footer>Penalty bands show case distribution, not severity or final disposition.</footer></article>
    </div>
    <div className="enforcement-controls panel"><span><Filter size={13} /> Refine</span><label>State<select value={state} onChange={(event) => setState(event.target.value)}><option>All states</option>{enforcementDataset.states.map((item) => <option key={item.state}>{item.state}</option>)}</select></label><label>NAICS sector<select value={sector} onChange={(event) => setSector(event.target.value)}><option>All sectors</option>{enforcementDataset.sectors.map((item) => <option value={item.code} key={item.code}>{item.code} · {item.title}</option>)}</select></label><label>Issuance year<select value={year} onChange={(event) => setYear(event.target.value)}><option>All years</option>{enforcementDataset.years.map((item) => <option key={item.year}>{item.year}</option>)}</select></label><button onClick={reset} disabled={!activeFilters}><RefreshCw size={12} /> Reset{activeFilters ? ` (${activeFilters})` : ""}</button></div>
    <div className="enforcement-case-workbench panel"><div className="enforcement-case-list"><header><span>Employer / place</span><span>NAICS</span><span>Issued</span><span>Initial penalty</span></header>{cases.slice(0, 120).map((item) => <button className={selected?.activityNumber === item.activityNumber ? "selected" : ""} onClick={() => setSelectedActivity(item.activityNumber)} key={`${item.activityNumber}-${item.issuanceDate}-${item.employer}`}><span><b>{item.employer}</b><small>{item.city}, {item.state}</small></span><span>{item.naics || "Not supplied"}<small>{item.matchedInspection ? "Bulk record linked" : "Join pending"}</small></span><span>{item.issuanceDate}</span><span>{formatCurrency(item.initialPenalty)}<ChevronRight size={12} /></span></button>)}</div>{selected && <aside><mark>{selected.matchedInspection ? "Bulk linked" : "Join pending"}</mark><h3>{selected.employer}</h3><p>{selected.city}, {selected.state} · Inspection {selected.inspectionNumber}</p><div><span><b>NAICS</b>{selected.naics || "Not supplied in linked record"}</span><span><b>Establishment size</b>{selected.establishmentSize ? formatNumber(selected.establishmentSize) : "Not supplied"}</span><span><b>Inspection type</b>{selected.inspectionType || "Not linked"}</span><span><b>Violation events</b>{selected.violationEvents}</span><span><b>Initial penalty</b>{formatCurrency(selected.initialPenalty)}</span><span><b>Issuance</b>{selected.issuanceDate}</span></div><footer><ShieldCheck size={13} /><span>Inspection number is preserved as the governing join key. Zero-filled NAICS remains unknown; final penalties and citation standards require the citation/violation layer.</span></footer></aside>}</div>
  </section>;
}
