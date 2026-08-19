"use client";

import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpenCheck,
  Building2,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  CircleDot,
  Database,
  Download,
  Factory,
  FileSearch,
  Globe2,
  HardHat,
  Leaf,
  Menu,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const navigation = [
  { label: "Signal Room", icon: Radar },
  { label: "Markets", icon: ChartNoAxesCombined },
  { label: "Enforcement & Injuries", icon: HardHat },
  { label: "Compliance", icon: BookOpenCheck },
  { label: "Competitors", icon: Building2 },
  { label: "Sustainability", icon: Leaf },
  { label: "Corporate Activity", icon: Network },
  { label: "Sources", icon: Database },
];

const signals = [
  {
    type: "Regulatory",
    title: "Heat standard activity is accelerating across priority states",
    detail: "Federal and state activity indicates growing compliance complexity for outdoor and high-heat workforces.",
    source: "Federal Register + state agency scan",
    time: "Updated 2h ago",
    confidence: "High confidence",
    accent: "orange",
    icon: BookOpenCheck,
  },
  {
    type: "Market",
    title: "Data center construction remains a high-intensity growth segment",
    detail: "Employment, project activity, and multi-employer risk converge in several Novara-priority geographies.",
    source: "BLS + Census + verified public sources",
    time: "Updated today",
    confidence: "Verified inputs",
    accent: "violet",
    icon: TrendingUp,
  },
  {
    type: "Competitive",
    title: "Competitor messaging is shifting from compliance to operational risk",
    detail: "Three tracked vendors increased emphasis on AI-assisted risk prediction and connected operations.",
    source: "Official sites + press releases",
    time: "Updated yesterday",
    confidence: "Analyst inference",
    accent: "coral",
    icon: FileSearch,
  },
];

const coverage = [
  { name: "OSHA Inspections", records: "3.2M+", status: "Ready", freshness: "Daily", score: 96 },
  { name: "EPA ECHO", records: "Facilities", status: "Ready", freshness: "Weekly", score: 92 },
  { name: "State Agencies", records: "31 / 50", status: "Mapping", freshness: "Varies", score: 62 },
  { name: "Federal Register", records: "Rules", status: "Ready", freshness: "Daily", score: 98 },
];

const industries = [
  { name: "Construction", value: 88, movement: "+6.8%", icon: HardHat },
  { name: "Manufacturing", value: 82, movement: "+3.2%", icon: Factory },
  { name: "Energy & Utilities", value: 79, movement: "+5.1%", icon: Activity },
  { name: "Waste & Water", value: 71, movement: "+2.4%", icon: Globe2 },
];

function ProductMark() {
  return (
    <div className="product-mark" aria-label="Novara Intelligence">
      <span className="mark-glyph"><i /><i /><i /></span>
      <span className="mark-copy"><strong>NOVARA</strong><small>INTELLIGENCE</small></span>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState("Signal Room");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [windowLabel, setWindowLabel] = useState("Last 90 days");

  const visibleSignals = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return signals;
    return signals.filter((signal) => `${signal.type} ${signal.title} ${signal.detail}`.toLowerCase().includes(normalized));
  }, [query]);

  const selectView = (label: string) => {
    setActive(label);
    setMenuOpen(false);
  };

  return (
    <main className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top">
          <ProductMark />
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={19} /></button>
        </div>
        <nav className="primary-nav" aria-label="Primary">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => selectView(label)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === "Sources" && <span className="nav-count">8</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-brief">
          <span className="eyebrow inverse"><Sparkles size={13} /> WEEKLY BRIEF</span>
          <p>7 priority signals ready for leadership review.</p>
          <button>Open briefing <ArrowUpRight size={14} /></button>
        </div>
        <div className="sidebar-footer">
          <div className="avatar">VN</div>
          <div><strong>Vanessa Nelsen</strong><span>Strategy workspace</span></div>
          <ChevronDown size={15} />
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="search-wrap"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search markets, companies, regulations, or signals" /><kbd>⌘ K</kbd></div>
          <div className="topbar-actions">
            <span className="system-pill"><span /> Sources healthy</span>
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <button className="export-button"><Download size={16} /> Export brief</button>
          </div>
        </header>

        <div className="content">
          <div className="demo-banner"><CircleDot size={14} /> Push One preview — demonstration signals only; no Ocean content, customer data, or private source records are included.</div>
          <section className="hero-row">
            <div>
              <span className="eyebrow"><Radar size={14} /> EXECUTIVE SIGNAL ROOM</span>
              <h1>{active}</h1>
              <p>A decision layer connecting market movement, enforcement pressure, regulatory change, and competitive strategy.</p>
            </div>
            <div className="view-controls">
              <button>North America <ChevronDown size={14} /></button>
              <button onClick={() => setWindowLabel(windowLabel === "Last 90 days" ? "Last 12 months" : "Last 90 days")}>{windowLabel} <ChevronDown size={14} /></button>
            </div>
          </section>

          <section className="metric-grid" aria-label="Key metrics">
            <article className="metric-card lead">
              <div className="metric-icon"><Radar size={20} /></div><span>Priority signals</span><strong>24</strong><small><b>+7</b> since last review</small>
            </article>
            <article className="metric-card">
              <div className="metric-icon violet"><ShieldCheck size={20} /></div><span>Compliance changes</span><strong>16</strong><small>Across 9 jurisdictions</small>
            </article>
            <article className="metric-card">
              <div className="metric-icon coral"><Building2 size={20} /></div><span>Competitor moves</span><strong>11</strong><small>3 require review</small>
            </article>
            <article className="metric-card">
              <div className="metric-icon amber"><TriangleAlert size={20} /></div><span>Coverage gaps</span><strong>19</strong><small>State sources to map</small>
            </article>
          </section>

          <section className="main-grid">
            <article className="panel signals-panel">
              <div className="panel-heading">
                <div><span className="panel-kicker">What changed</span><h2>Priority intelligence</h2></div>
                <button>View all signals <ArrowUpRight size={14} /></button>
              </div>
              <div className="signal-list">
                {visibleSignals.length ? visibleSignals.map(({ type, title, detail, source, time, confidence, accent, icon: Icon }) => (
                  <div className="signal" key={title}>
                    <div className={`signal-icon ${accent}`}><Icon size={19} /></div>
                    <div className="signal-copy">
                      <div className="signal-meta"><span>{type}</span><small>{time}</small></div>
                      <h3>{title}</h3><p>{detail}</p>
                      <div className="source-line"><ShieldCheck size={13} /> {confidence}<i />{source}</div>
                    </div>
                    <button className="round-arrow" aria-label={`Open ${title}`}><ArrowUpRight size={16} /></button>
                  </div>
                )) : <div className="empty-state"><Search size={25} /><h3>No matching demonstration signals</h3><p>Try a broader market, regulation, or competitor term.</p></div>}
              </div>
            </article>

            <article className="panel intensity-panel">
              <div className="panel-heading"><div><span className="panel-kicker">Opportunity lens</span><h2>Market intensity</h2></div><button aria-label="Open market intensity"><ArrowUpRight size={15} /></button></div>
              <p className="panel-description">Composite view of growth, compliance pressure, enforcement, and workforce exposure.</p>
              <div className="industry-list">
                {industries.map(({ name, value, movement, icon: Icon }) => (
                  <div className="industry" key={name}>
                    <div className="industry-label"><span><Icon size={16} />{name}</span><b>{value}</b></div>
                    <div className="bar"><i style={{ width: `${value}%` }} /></div>
                    <small><TrendingUp size={12} /> {movement} signal velocity</small>
                  </div>
                ))}
              </div>
              <div className="legend"><span><i className="high" /> High intensity</span><span><i className="moderate" /> Moderate</span></div>
            </article>
          </section>

          <section className="lower-grid">
            <article className="panel source-panel">
              <div className="panel-heading">
                <div><span className="panel-kicker">Source operations</span><h2>Coverage & freshness</h2></div>
                <button onClick={() => selectView("Sources")}>Open source console <ArrowUpRight size={14} /></button>
              </div>
              <div className="source-table">
                <div className="source-row table-head"><span>Source</span><span>Coverage</span><span>Status</span><span>Freshness</span></div>
                {coverage.map((source) => (
                  <div className="source-row" key={source.name}>
                    <span><i className="source-logo"><Database size={14} /></i><b>{source.name}</b></span>
                    <span>{source.records}<em><i style={{ width: `${source.score}%` }} /></em></span>
                    <span><mark className={source.status === "Ready" ? "ready" : "mapping"}>{source.status === "Ready" ? <Check size={11} /> : <Activity size={11} />}{source.status}</mark></span>
                    <span>{source.freshness}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel action-panel">
              <span className="panel-kicker">Leadership action</span><h2>Briefing queue</h2>
              <div className="brief-score"><strong>7</strong><span>items ready<br />for review</span></div>
              <div className="avatar-stack"><i>VN</i><i>CS</i><i>PM</i><span>Strategy, product & marketing</span></div>
              <button>Prepare executive brief <Sparkles size={15} /></button>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
