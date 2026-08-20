export type CompetitorArchetype = "Enterprise EHS" | "Construction Safety" | "Contractor Risk" | "EHSQ & Operational Risk";

export type CompetitorProfile = {
  id: string;
  name: string;
  platform: string;
  archetype: CompetitorArchetype;
  officialUrl: string;
  retrieved: string;
  sourceType: "Official company website";
  reliability: "Company Statement";
  statedPositioning: string;
  modules: string[];
  messagingTags: string[];
  monitoredSurfaces: Array<{ label: string; url: string }>;
  marketRelevance: string[];
  evidenceStatus: "Official source mapped";
};

const allMarkets = ["Construction", "Manufacturing", "Energy & Utilities", "Waste & Water"];

export const competitors: CompetitorProfile[] = [
  {
    id: "velocityehs", name: "VelocityEHS", platform: "Accelerate Platform", archetype: "Enterprise EHS", officialUrl: "https://www.ehs.com/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "VelocityEHS describes Accelerate as a connected platform for managing environmental, health, safety, and sustainability work.",
    modules: ["Safety", "Ergonomics", "Chemical Management", "Contractor Safety", "Operational Risk", "Sustainability", "Environmental Compliance", "Industrial Hygiene"],
    messagingTags: ["connected platform", "operational risk", "sustainability", "enterprise EHS"],
    monitoredSurfaces: [{ label: "Platform", url: "https://www.ehs.com/solutions/" }, { label: "Resources", url: "https://www.ehs.com/resources/" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "cority", name: "Cority", platform: "CorityOne", archetype: "Enterprise EHS", officialUrl: "https://www.cority.com/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Cority describes CorityOne as a converged EHS+ platform spanning environmental, health, safety, sustainability, and quality workflows.",
    modules: ["Risk Management", "Incident Management", "Occupational Health", "Industrial Hygiene", "Audits", "Compliance", "Sustainability", "Waste", "Chemical Management"],
    messagingTags: ["converged EHS+", "quality", "sustainability", "enterprise platform"],
    monitoredSurfaces: [{ label: "Platform", url: "https://www.cority.com/corityone/" }, { label: "Resources", url: "https://www.cority.com/resources/" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "benchmark-gensuite", name: "Benchmark Gensuite", platform: "Benchmark Gensuite", archetype: "Enterprise EHS", officialUrl: "https://benchmarkgensuite.com/solutions/environmental-health-safety-software/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Benchmark Gensuite describes a unified EHS platform for safety, environmental compliance, and operational risk management.",
    modules: ["Corrective Actions", "Obligation Management", "Incident Management", "Inspections", "Concern Reporting", "Environmental", "Sustainability"],
    messagingTags: ["unified EHS", "operational risk", "AI", "environmental compliance"],
    monitoredSurfaces: [{ label: "EHS suite", url: "https://benchmarkgensuite.com/solutions/environmental-health-safety-software/" }, { label: "News", url: "https://benchmarkgensuite.com/news/" }], marketRelevance: ["Construction", "Manufacturing", "Energy & Utilities"], evidenceStatus: "Official source mapped",
  },
  {
    id: "sphera", name: "Sphera", platform: "SpheraCloud", archetype: "EHSQ & Operational Risk", officialUrl: "https://sphera.com/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Sphera describes its Operational Intelligence approach as connecting risk, safety, sustainability, product stewardship, supply-chain risk, and operational risk.",
    modules: ["EHS&S", "Product Stewardship", "Supply Chain Risk", "Operational Risk", "Sustainability"],
    messagingTags: ["operational intelligence", "product stewardship", "supply-chain risk", "sustainability"],
    monitoredSurfaces: [{ label: "Solutions", url: "https://sphera.com/solutions/" }, { label: "News", url: "https://sphera.com/company/news/" }], marketRelevance: ["Manufacturing", "Energy & Utilities", "Waste & Water"], evidenceStatus: "Official source mapped",
  },
  {
    id: "vector-solutions", name: "Vector Solutions", platform: "Vector EHS Management Software", archetype: "Enterprise EHS", officialUrl: "https://www.vectorsolutions.com/solutions/vector-ehs-management-software/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Vector Solutions describes EHS software connecting safety, compliance, and workforce readiness.",
    modules: ["Safety Training", "Incident Management", "Hazard Management", "Environmental Inspections", "Claims", "Reporting"],
    messagingTags: ["workforce readiness", "safety training", "connected compliance", "frontline"],
    monitoredSurfaces: [{ label: "EHS product", url: "https://www.vectorsolutions.com/solutions/vector-ehs-management-software/" }, { label: "News", url: "https://www.vectorsolutions.com/resources/press-releases/" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "ehs-insight", name: "EHS Insight", platform: "EHS Insight", archetype: "Enterprise EHS", officialUrl: "https://www.ehsinsight.com/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "EHS Insight presents a configurable EHS platform with more than 30 modules across safety, compliance, environmental, ESG, and workforce processes.",
    modules: ["Audits", "Incidents", "Inspections", "Training", "Compliance", "ESG", "Chemical", "CAPA", "Industrial Hygiene", "Legal Register", "MOC", "SDS", "Waste"],
    messagingTags: ["configurable platform", "30+ modules", "compliance automation", "mobile"],
    monitoredSurfaces: [{ label: "Modules", url: "https://www.ehsinsight.com/modules" }, { label: "Resources", url: "https://www.ehsinsight.com/resources" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "hammertech", name: "HammerTech", platform: "HammerTech Platform", archetype: "Construction Safety", officialUrl: "https://www.hammertech.com/en-us/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "HammerTech describes a construction safety platform connecting field workflows and safety data.",
    modules: ["Inductions", "Pre-starts", "Incidents", "Inspections", "Permits", "Equipment", "Reporting"],
    messagingTags: ["construction safety", "connected workflows", "field operations", "frontline"],
    monitoredSurfaces: [{ label: "Platform", url: "https://www.hammertech.com/en-us/product/platform" }, { label: "Resources", url: "https://www.hammertech.com/en-us/resources" }], marketRelevance: ["Construction", "Energy & Utilities"], evidenceStatus: "Official source mapped",
  },
  {
    id: "salus", name: "SALUS", platform: "SALUS Construction Safety Software", archetype: "Construction Safety", officialUrl: "https://www.salussafety.io/us/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "SALUS describes digital construction safety workflows for documentation, compliance, and field reporting.",
    modules: ["Documents", "Forms", "Certificates", "Assets", "Compliance Checks", "Incident Reporting"],
    messagingTags: ["construction safety", "digital forms", "field compliance", "mobile"],
    monitoredSurfaces: [{ label: "Product", url: "https://www.salussafety.io/us/" }, { label: "Help center", url: "https://support.salussafety.io/" }], marketRelevance: ["Construction"], evidenceStatus: "Official source mapped",
  },
  {
    id: "donesafe", name: "HSI Donesafe", platform: "Donesafe", archetype: "Enterprise EHS", officialUrl: "https://www.donesafe.com/uk/resources/data-sheets/module-overview/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "HSI Donesafe describes a configurable platform with more than 60 modules spanning EHS, risk, compliance, quality, suppliers, and workforce competency.",
    modules: ["Incident Management", "Risk", "Compliance", "Quality", "Supplier Management", "Training", "Assets", "Audits", "Chemical", "Environmental"],
    messagingTags: ["60+ modules", "configurable", "workforce competency", "risk and compliance"],
    monitoredSurfaces: [{ label: "Module overview", url: "https://www.donesafe.com/uk/resources/data-sheets/module-overview/" }, { label: "Resources", url: "https://www.donesafe.com/uk/resources/" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "intelex", name: "Intelex", platform: "Intelex EHS Platform", archetype: "Enterprise EHS", officialUrl: "https://www.intelex.com/ehs-platform/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Intelex describes a native platform spanning EHS, quality, ESG, operational risk, and connected workflows.",
    modules: ["Incident Management", "Audits", "Compliance", "PHA", "Root Cause", "Inspections", "Permits", "Training", "Quality", "ESG"],
    messagingTags: ["native platform", "EHSQ", "ESG", "operational risk"],
    monitoredSurfaces: [{ label: "EHS platform", url: "https://www.intelex.com/ehs-platform/" }, { label: "Resources", url: "https://www.intelex.com/resources/" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "enablon", name: "Enablon", platform: "Enablon Vision Platform", archetype: "EHSQ & Operational Risk", officialUrl: "https://www.wolterskluwer.com/en/solutions/enablon", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Wolters Kluwer describes Enablon as an integrated risk platform spanning EHSQ, operational risk, ESG, control of work, and process safety.",
    modules: ["EHSQ", "Operational Risk", "ESG", "Control of Work", "Process Safety", "Health & Safety", "Environmental"],
    messagingTags: ["integrated risk", "control of work", "process safety", "ESG"],
    monitoredSurfaces: [{ label: "Solutions", url: "https://www.wolterskluwer.com/en/solutions/enablon" }, { label: "Insights", url: "https://www.wolterskluwer.com/en/solutions/enablon/resources" }], marketRelevance: ["Manufacturing", "Energy & Utilities", "Waste & Water"], evidenceStatus: "Official source mapped",
  },
  {
    id: "ecoonline", name: "EcoOnline", platform: "EcoOnline EHS Software", archetype: "Enterprise EHS", officialUrl: "https://www.ecoonline.com/en-us/ehs-software/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "EcoOnline describes EHS software for incidents, inspections, risk assessments, chemicals, and contractor management across multi-site operations.",
    modules: ["Incidents", "Inspections", "Risk Assessments", "Chemical Approvals", "Contractor Management", "Training"],
    messagingTags: ["multi-site", "chemical safety", "contractor management", "frontline"],
    monitoredSurfaces: [{ label: "EHS software", url: "https://www.ecoonline.com/en-us/ehs-software/" }, { label: "Resources", url: "https://www.ecoonline.com/en-us/resources/" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "evotix", name: "Evotix", platform: "Evotix Safety Management", archetype: "Enterprise EHS", officialUrl: "https://www.evotix.com/solutions/safety-management-overview", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Evotix describes safety management software connecting risk, incidents, audits, compliance obligations, workforce observations, and mobile workflows.",
    modules: ["Incidents", "Audits", "Inspections", "Contractor Safety", "Compliance", "Risk", "Observations", "Training", "Mobile", "Dashboards"],
    messagingTags: ["safety management", "mobile", "compliance obligations", "workforce engagement"],
    monitoredSurfaces: [{ label: "Solutions", url: "https://www.evotix.com/solutions/safety-management-overview" }, { label: "Resources", url: "https://www.evotix.com/resources" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "highwire", name: "Highwire", platform: "Highwire Partner Elevation Platform", archetype: "Contractor Risk", officialUrl: "https://www.highwire.com/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Highwire describes a contractor risk platform covering prequalification, safety, finance, insurance, and partner performance.",
    modules: ["Contractor Prequalification", "Safety", "Financial Risk", "Insurance", "Partner Performance"],
    messagingTags: ["contractor risk", "prequalification", "partner performance", "risk visibility"],
    monitoredSurfaces: [{ label: "Safety", url: "https://www.highwire.com/platform/safety" }, { label: "Resources", url: "https://www.highwire.com/resources" }], marketRelevance: ["Construction", "Manufacturing", "Energy & Utilities"], evidenceStatus: "Official source mapped",
  },
  {
    id: "isnetworld", name: "ISNetworld", platform: "ISNetworld", archetype: "Contractor Risk", officialUrl: "https://www.isnetworld.com/en/about-isn", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "ISN describes ISNetworld as a contractor and supplier information-management platform covering safety, quality, insurance, training, cybersecurity, and sustainability.",
    modules: ["Contractor Management", "Health & Safety", "Quality", "Insurance", "Training", "Cybersecurity", "Sustainability"],
    messagingTags: ["contractor management", "supplier risk", "network", "sustainability"],
    monitoredSurfaces: [{ label: "About", url: "https://www.isnetworld.com/en/about-isn" }, { label: "News", url: "https://www.isnetworld.com/en/newsroom" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
  {
    id: "avetta", name: "Avetta", platform: "Avetta One", archetype: "Contractor Risk", officialUrl: "https://www.avetta.com/", retrieved: "2026-08-19", sourceType: "Official company website", reliability: "Company Statement",
    statedPositioning: "Avetta describes a contractor and supplier risk platform focused on safety, compliance, sustainability, and workforce qualification.",
    modules: ["Contractor Management", "Supplier Risk", "Safety", "Compliance", "Sustainability", "Worker Qualification"],
    messagingTags: ["supply-chain risk", "contractor management", "worker qualification", "sustainability"],
    monitoredSurfaces: [{ label: "Solutions", url: "https://www.avetta.com/clients/solutions" }, { label: "News", url: "https://www.avetta.com/en-us/newsroom" }], marketRelevance: allMarkets, evidenceStatus: "Official source mapped",
  },
];

export const competitorArchetypes: Array<"All archetypes" | CompetitorArchetype> = ["All archetypes", "Enterprise EHS", "Construction Safety", "Contractor Risk", "EHSQ & Operational Risk"];
